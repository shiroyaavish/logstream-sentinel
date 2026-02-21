import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, FindAllProjectsDto, GenerateApiKeyDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/lib/jwt-auth.guard';
import { Request } from 'express';
import { generate } from 'rxjs';
import { request } from 'node:http';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() request: Request, @Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(request, createProjectDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async generateApiKey(@Req() request: Request, @Body() generateApiKeyDto: GenerateApiKeyDto) {
    return this.projectService.generateApiKey(request, generateApiKeyDto)
  }

  @Get()
  findAll(@Req() request: Request,@Query() findAllProjectsDto:FindAllProjectsDto) {
    return this.projectService.findAll(request,findAllProjectsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Patch(':id')
  update(@Req() request: Request, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(request, + id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
