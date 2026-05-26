import {
  Controller,
  Delete,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({
    status: 200,
    description: 'Users returned without passwords.',
  })
  findUsers() {
    return this.adminService.findUsers();
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List all jobs' })
  @ApiResponse({
    status: 200,
    description: 'Jobs returned successfully.',
  })
  findJobs() {
    return this.adminService.findJobs();
  }

  @Get('applications')
  @ApiOperation({ summary: 'List all applications' })
  @ApiResponse({
    status: 200,
    description: 'Applications returned successfully.',
  })
  findApplications() {
    return this.adminService.findApplications();
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', example: 1 })
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update a user role' })
  @ApiParam({ name: 'id', example: 1 })
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, updateUserRoleDto.role);
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Delete a job' })
  @ApiParam({ name: 'id', example: 1 })
  deleteJob(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteJob(id);
  }
}
