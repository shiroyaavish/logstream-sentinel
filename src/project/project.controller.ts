import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, FindAllProjectsDto, GenerateApiKeyDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/lib/jwt-auth.guard';
import { Request } from 'express';
import { generate } from 'rxjs';
import { request } from 'node:http';

@Controller('project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  async create(@Req() request: Request, @Body() createProjectDto: CreateProjectDto) {
    return await this.projectService.create(request, createProjectDto);
  }

  @Post("generate-api-key")
  async generateApiKey(@Req() request: Request, @Body() generateApiKeyDto: GenerateApiKeyDto) {
    return await this.projectService.generateApiKey(request, generateApiKeyDto)
  }

  @Get()
  async findAll(@Req() request: Request, @Query() findAllProjectsDto: FindAllProjectsDto) {
    return await this.projectService.findAll(request, findAllProjectsDto);
  }

  @Patch("api-key/:id/active-inactive")
  async activeInactiveApiKey(@Req() request: Request, @Param("id") id: number) {
    return await this.projectService.activeInactiveApiKey(request, +id)
  }

  @Get(':id')
  async findOne(@Req() request: Request, @Param('id') id: string) {
    return await this.projectService.findOne(request, +id);
  }

  @Patch(':id')
  async update(@Req() request: Request, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return await this.projectService.update(request, + id, updateProjectDto);
  }
}
