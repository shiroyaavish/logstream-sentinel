import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateProjectDto, FindAllProjectsDto, GenerateApiKeyDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Request } from 'express';
import { PROJECT_REPOSITORY, ProjectRepository } from './repositories/project.repository';
import { api_key, project } from 'src/generated/prisma/client';
import { CreateProjectInput } from './types/project.types';
import { CreateApiKey } from './types/apiKey.types';
import { API_KEY_REPOSITORY } from './interface/apiKey.interface';
import { ApiKeyRepository } from './repositories/apiKey.repository';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(API_KEY_REPOSITORY) private readonly apiKeyRepository: ApiKeyRepository
  ) { }
  async create(request: Request, createProjectDto: CreateProjectDto) {
    try {
      const { name, description } = createProjectDto
      const user = request.user
      const projectDetails: CreateProjectInput = {
        name,
        description,
        user_id: user['id']
      }

      const projectData = await this.projectRepository.create(projectDetails)
      return {
        message: "Project created successfully",
        data: projectData
      }

    } catch (error) {
      throw error
    }
  }

  async generateApiKey(request: Request, generateApiKeyDto: GenerateApiKeyDto) {
    try {
      const { project_id } = generateApiKeyDto
      const user = request.user
      const projectExists = await this.projectRepository.findById(project_id, user["id"])
      if (!projectExists) {
        return {
          message: "Project not found",
          data: {}
        }
      }
      const apiKey = crypto.randomUUID()
      const apiKeyData: CreateApiKey = {
        key: apiKey,
        project_id: projectExists.id,
        status: 1,
        timestamp: new Date()
      }
      const apiKeyCreated = await this.apiKeyRepository.create(apiKeyData)

      return {
        message: "API Key generated successfully",
        data: apiKeyCreated
      }

    } catch (error) {
      throw error
    }
  }

  async findAll(request: Request, findAllProjectsDto: FindAllProjectsDto) {
    try {
      const userId = request.user?.["id"]
      const { limit, offset, search } = findAllProjectsDto

      const query = {
        user_id: userId,
      }

      if (search) {
        query["name"] = {
          contains: search,
          mode: "insensitive"
        }
      }
      const data = await this.projectRepository.findAll(query, offset, limit)
      const totalRecord = await this.projectRepository.countDocuments(query)

      return {
        status: HttpStatus.OK,
        message: "Data fetched successfully.",
        data: {
          list: data,
          totalRecord
        }
      }

    } catch (error) {
      console.error(error)
      throw error
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  async update(request: Request, id: number, updateProjectDto: UpdateProjectDto) {
    try {
      const user = request.user
      const { name, description } = updateProjectDto
      const projectExists = await this.projectRepository.findById(id, user["id"])
      if (!projectExists) {
        return {
          message: "Project not found",
          data: {}
        }
      }
      const projectData: CreateProjectInput = {
        name: name || projectExists.name,
        description: description || projectExists.description,
        user_id: user["id"]
      }

      const updatedProject = await this.projectRepository.updateOne(id, projectData)

      return {
        message: "Project updated successfully",
        data: updatedProject
      }

    } catch (error) {
      throw error
    }
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
