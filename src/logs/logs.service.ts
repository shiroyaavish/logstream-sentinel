import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateLogDto, FindAllLogsDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Request } from 'express';
import { PROJECT_REPOSITORY } from 'src/project/repositories/project.repository';
import { IProjectRepository } from 'src/project/interface/project.interface';
import { ILogRepository, LOG_REPOSITORY } from './interface/log.interface';

@Injectable()
export class LogsService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: IProjectRepository,
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository
  ) { }
  create(createLogDto: CreateLogDto) {
    return 'This action adds a new log';
  }

  async findAll(request: Request, findAllLogsDto: FindAllLogsDto) {
    try {
      const { project_id, limit, offset, level, search } = findAllLogsDto;

      const user = request.user;

      const project = await this.projectRepository.findById(project_id);

      if (!project || project.user_id !== user["id"]) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          message: "Project not found or you don't have access to this project",
        }, HttpStatus.NOT_FOUND)
      }
      const query: any = {
        project_id,
      }
      if (level) {
        query.level = level
      }
      if (search) {
        query.message = { contains: search }
      }
      const data = await this.logRepository.findAll(query, offset, limit)
      const total = await this.logRepository.countDocuments(query)
      return {
        message: "Logs fetched successfully",
        status: HttpStatus.OK,
        data: {
          list: data,
          totalRecord: total
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }
}
