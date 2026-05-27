import { Injectable } from '@nestjs/common';

const STOP_WORDS = new Set([
  'and',
  'the',
  'for',
  'with',
  'from',
  'this',
  'that',
  'your',
  'you',
  'are',
  'will',
  'job',
  'role',
  'work',
  'team',
  'have',
  'has',
  'our',
  'can',
  'using',
  'into',
]);

const SKILL_WORDS = [
  'react',
  'javascript',
  'typescript',
  'node',
  'nestjs',
  'express',
  'postgres',
  'postgresql',
  'mysql',
  'mongodb',
  'html',
  'css',
  'tailwind',
  'api',
  'rest',
  'graphql',
  'python',
  'java',
  'php',
  'laravel',
  'testing',
  'qa',
  'seo',
  'marketing',
  'content',
  'figma',
  'ui',
  'ux',
  'git',
  'docker',
  'aws',
];

function textFrom(value: any): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(textFrom).join(' ');
  }

  if (typeof value === 'object') {
    return Object.values(value).map(textFrom).join(' ');
  }

  return String(value);
}

function tokenize(value: any): string[] {
  return textFrom(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function uniqueWords(value: any): string[] {
  return [...new Set(tokenize(value))];
}

function findOverlap(source: any, target: any): string[] {
  const sourceWords = new Set(uniqueWords(source));

  return uniqueWords(target).filter((word) =>
    sourceWords.has(word),
  );
}

function extractSkills(value: any): string[] {
  const words = new Set(tokenize(value));

  return SKILL_WORDS.filter((skill) => words.has(skill));
}

function numberFromText(value: any): number | null {
  const match = textFrom(value).match(/\d+/);

  return match ? Number(match[0]) : null;
}

function sentenceCase(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

@Injectable()
export class AiService {
  getProviderStatus() {
    return {
      provider: process.env.AI_PROVIDER || 'local',
      mode: process.env.AI_API_KEY ? 'external-ready' : 'local-fallback',
    };
  }

  createJobMatch(job: Record<string, any>, seekerProfile: Record<string, any> = {}, cvText = '') {
    const profileText = [
      seekerProfile.fullName,
      seekerProfile.skills,
      seekerProfile.experience,
      seekerProfile.location,
      seekerProfile.profileText,
      cvText,
    ].join(' ');
    const jobText = [
      job.title,
      job.description,
      job.educationRequirement,
      job.experience,
      job.skills,
      job.location,
      job.workplaceType,
    ].join(' ');
    const profileWords = uniqueWords(profileText);

    if (profileWords.length < 4) {
      return {
        score: null,
        label: 'Needs more profile data',
        message: 'Complete your profile for better AI matching.',
        factors: [],
        ...this.getProviderStatus(),
      };
    }

    const matchingSkills = findOverlap(profileText, job.skills || jobText).filter(
      (word) => extractSkills(word).length || word.length > 3,
    );
    const titleMatches = findOverlap(profileText, job.title);
    const profileExperience = numberFromText(seekerProfile.experience || profileText);
    const jobExperience = numberFromText(job.experience);
    const experienceMatch =
      profileExperience !== null &&
      jobExperience !== null &&
      profileExperience >= jobExperience;
    const locationMatch =
      seekerProfile.location &&
      job.location &&
      textFrom(job.location)
        .toLowerCase()
        .includes(textFrom(seekerProfile.location).toLowerCase());
    const remoteMatch =
      /remote/i.test(textFrom(job.workplaceType || job.location)) &&
      /remote/i.test(profileText);

    const score = Math.min(
      100,
      25 +
        Math.min(matchingSkills.length * 9, 36) +
        Math.min(titleMatches.length * 10, 20) +
        (experienceMatch ? 12 : 0) +
        (locationMatch || remoteMatch ? 7 : 0),
    );
    const factors = [
      matchingSkills.length
        ? `Matched skills: ${matchingSkills.slice(0, 6).join(', ')}`
        : 'Add more skills to improve matching.',
      titleMatches.length
        ? `Matched title keywords: ${titleMatches.join(', ')}`
        : 'No strong job title keyword match found.',
      experienceMatch
        ? 'Experience appears to meet the requirement.'
        : 'Experience match is unclear from available data.',
      locationMatch || remoteMatch
        ? 'Location or remote preference looks aligned.'
        : 'Location preference is not available or does not match.',
    ];

    return {
      score,
      label:
        score >= 80
          ? 'Strong match'
          : score >= 60
            ? 'Good match'
            : 'Potential match',
      message: 'Local AI fallback generated this score.',
      factors,
      matchingSkills: matchingSkills.slice(0, 8),
      ...this.getProviderStatus(),
    };
  }

  createJobRecommendations(
    jobs: Record<string, any>[],
    seekerProfile: Record<string, any> = {},
    cvText = '',
  ) {
    const recommendations = jobs
      .map((job) => ({
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        match: this.createJobMatch(job, seekerProfile, cvText),
      }))
      .sort((first, second) => {
        const firstScore = first.match.score ?? 0;
        const secondScore = second.match.score ?? 0;

        return secondScore - firstScore;
      })
      .slice(0, 3);

    const hasScores = recommendations.some(
      (recommendation) => recommendation.match.score !== null,
    );

    return {
      recommendations,
      message: hasScores
        ? 'Top jobs recommended by local AI fallback.'
        : 'Complete your profile for better AI recommendations.',
      ...this.getProviderStatus(),
    };
  }

  createCoverLetter(job: Record<string, any>, seekerProfile: Record<string, any> = {}) {
    const seekerName = seekerProfile.fullName || 'Candidate';
    const company = job.company || 'your company';
    const title = job.title || 'this role';
    const seekerSkills =
      seekerProfile.skills ||
      extractSkills(seekerProfile.profileText || '').join(', ') ||
      'relevant technical and communication skills';
    const jobFocus =
      job.skills ||
      uniqueWords(job.description).slice(0, 8).join(', ') ||
      'the requirements listed in the job post';

    return {
      coverLetter: [
        `Dear ${company} Hiring Team,`,
        '',
        `I am writing to express my interest in the ${title} position at ${company}. My background in ${seekerSkills} aligns well with the needs of this role, especially around ${jobFocus}.`,
        '',
        `I am confident I can contribute by learning quickly, collaborating clearly, and delivering reliable work based on the responsibilities described in your job post.`,
        '',
        `Thank you for considering my application. I would welcome the opportunity to discuss how my experience and motivation can support ${company}.`,
        '',
        `Sincerely,`,
        seekerName,
      ].join('\n'),
      message: 'Editable cover letter generated with local AI fallback.',
      ...this.getProviderStatus(),
    };
  }

  createApplicationSummary(application: Record<string, any>, job: Record<string, any>) {
    const applicant = application.applicant || {};
    const combinedText = [
      applicant.fullName,
      applicant.email,
      application.coverLetter,
      application.portfolioUrl,
      job.title,
      job.description,
      job.skills,
    ].join(' ');
    const skills = extractSkills(combinedText);
    const highlights = uniqueWords(application.coverLetter)
      .slice(0, 10)
      .map(sentenceCase);
    const jobMatches = findOverlap(combinedText, [
      job.title,
      job.description,
      job.skills,
    ].join(' ')).slice(0, 8);

    return {
      summary:
        `${applicant.fullName || 'This applicant'} applied for ${job.title || 'the role'}. ` +
        `The local AI review found ${skills.length ? `skills in ${skills.join(', ')}` : 'limited explicit skill data'} and ${jobMatches.length ? `overlap with ${jobMatches.join(', ')}` : 'limited keyword overlap'}.`,
      skills: skills.length ? skills : ['No explicit skills found'],
      highlights: highlights.length
        ? highlights
        : ['No cover letter highlights available.'],
      fit:
        jobMatches.length || skills.length
          ? 'Potential fit based on available application text.'
          : 'Ask for more profile or CV detail before making a decision.',
      message: 'Application summary generated with local AI fallback.',
      ...this.getProviderStatus(),
    };
  }
}
