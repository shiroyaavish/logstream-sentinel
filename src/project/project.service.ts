import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ProjectService.name);
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
      this.logger.error('Error creating project :: ', error)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "An error occurred while creating project",
        data: {}
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async generateApiKey(request: Request, generateApiKeyDto: GenerateApiKeyDto) {
    try {
      const { project_id } = generateApiKeyDto
      const user = request.user
      const projectExists = await this.projectRepository.findById(project_id, user["id"])
      if (!projectExists) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          message: "Project not found",
          data: {}
        }, HttpStatus.NOT_FOUND)
      }

      const existingApiKey = await this.apiKeyRepository.findByProjectId(project_id, user["id"])
      if (existingApiKey) {
        throw new HttpException({
          status: HttpStatus.CONFLICT,
          message: "API Key already exists for this project",
          data: {}
        }, HttpStatus.CONFLICT)
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
      this.logger.error('Error generating API Key :: ', error)
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
      const data = await this.projectRepository.findAll(query, Number(offset) || 0, Number(limit) || 15)
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
      this.logger.error('Error Find all projects:: ', error)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "An error occurred while finding all projects",
        data: {}
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async findOne(request: Request, id: number) {
    try {
      const userId = request.user?.["id"]

      const projectDetails = await this.projectRepository.findById(id, userId)
      if (!projectDetails) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          message: "Project not found",
          data: {}
        }, HttpStatus.NOT_FOUND)
      }

      const apiKeyDetails = await this.apiKeyRepository.findByProjectId(projectDetails.id, userId)

      const data = {
        ...projectDetails,
        api_key_exists: apiKeyDetails?.key ? true : false,
        api_key_active: apiKeyDetails?.status === 0 ? true : false
      }

      return {
        status: HttpStatus.OK,
        message: "Project details fetched successfully",
        data
      }

    } catch (error) {
      console.error('Error finding project :: ', error)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "An error occurred while finding project",
        data: {}
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async update(request: Request, id: number, updateProjectDto: UpdateProjectDto) {
    try {
      const user = request.user
      const { name, description } = updateProjectDto
      const projectExists = await this.projectRepository.findById(id, user["id"])
      if (!projectExists) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          message: "Project not found",
          data: {}
        }, HttpStatus.NOT_FOUND)
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
      this.logger.error('Error updating project :: ', error)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "An error occurred while updating project",
        data: {}
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async activeInactiveApiKey(request: Request, id: number) {
    try {
      const user = request.user
      const apiKeyDetails = await this.apiKeyRepository.findById(id, user["id"])
      if (!apiKeyDetails) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          message: "API Key not found",
          data: {}
        }, HttpStatus.NOT_FOUND)
      }

      const updatedStatus = apiKeyDetails.status === 1 ? 0 : 1
      await this.apiKeyRepository.updateStatus(id, updatedStatus)

      return {
        message: `API Key ${updatedStatus === 0 ? "activated" : "deactivated"} successfully`
      }

    } catch (error) {
      console.error('Error active inactive API Key :: ', error)
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "An error occurred while active inactive API Key",
        data: {}
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
