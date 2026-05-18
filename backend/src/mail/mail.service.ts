import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createTransport,
  Transporter,
} from 'nodemailer';

interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    this.from =
      this.configService.get<string>('MAIL_FROM') ||
      'Job Portal <no-reply@job-portal.local>';

    if (!host || !port || !user || !pass) {
      this.transporter = null;
      this.logger.warn(
        'Mail credentials are not configured. Emails will be logged as console previews.',
      );
      return;
    }

    this.transporter = createTransport({
      host,
      port,
      secure:
        this.configService.get<string>('MAIL_SECURE') ===
        'true',
      auth: {
        user,
        pass,
      },
    });
  }

  async sendMail(message: MailMessage) {
    if (!this.transporter) {
      this.logger.log(
        [
          'Email preview:',
          `To: ${message.to}`,
          `From: ${this.from}`,
          `Subject: ${message.subject}`,
          message.text,
        ].join('\n'),
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        ...message,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${message.to}. Continuing without blocking the request.`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async sendApplicationSubmittedEmail(params: {
    employerEmail: string;
    seekerName: string;
    seekerEmail: string;
    jobTitle: string;
  }) {
    await this.sendMail({
      to: params.employerEmail,
      subject: `New application for ${params.jobTitle}`,
      text: `${params.seekerName} (${params.seekerEmail}) applied for ${params.jobTitle}.`,
      html: `<p><strong>${params.seekerName}</strong> (${params.seekerEmail}) applied for <strong>${params.jobTitle}</strong>.</p>`,
    });
  }

  async sendApplicationStatusUpdatedEmail(params: {
    seekerEmail: string;
    seekerName: string;
    jobTitle: string;
    status: string;
  }) {
    await this.sendMail({
      to: params.seekerEmail,
      subject: `Application status updated: ${params.jobTitle}`,
      text: `Hello ${params.seekerName}, your application for ${params.jobTitle} is now ${params.status}.`,
      html: `<p>Hello ${params.seekerName},</p><p>Your application for <strong>${params.jobTitle}</strong> is now <strong>${params.status}</strong>.</p>`,
    });
  }
}
