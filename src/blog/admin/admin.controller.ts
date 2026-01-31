import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { AdminService } from './admin.service';
import { CreateMissionDto, UpdateMissionDto } from './dto/mission.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Dashboard')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get stats & list tasks for panel' })
  @ApiResponse({ status: 200 })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Post('missions')
  @ApiOperation({ summary: 'Create new task' })
  @ApiResponse({ status: 201 })
  createMission(@Body() dto: CreateMissionDto) {
    return this.adminService.createMission(dto);
  }

  @Patch('missions/:id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200 })
  updateMission(@Param('id') id: string, @Body() dto: UpdateMissionDto) {
    return this.adminService.updateMission(id, dto);
  }

  @Delete('missions/:id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200 })
  deleteMission(@Param('id') id: string) {
    return this.adminService.deleteMission(id);
  }
}
