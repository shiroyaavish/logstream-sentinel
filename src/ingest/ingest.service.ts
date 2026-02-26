import { Injectable } from '@nestjs/common';
import { CreateIngestDto } from './dto/create-ingest.dto';
import { UpdateIngestDto } from './dto/update-ingest.dto';
import { Request } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class IngestService {

  constructor(@InjectQueue("logs-queue") private logQueue: Queue) { }

  async create(request: Request, createIngestDto: CreateIngestDto[]) {
    try {
      const apiKeyRecord = request["api_key"];

      await this.logQueue.add("process-logs", { logs: createIngestDto || [], api_key: apiKeyRecord })
      
      return {
        message: "Ingest data received successfully",
      }

    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all ingest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingest`;
  }

  update(id: number, updateIngestDto: UpdateIngestDto) {
    return `This action updates a #${id} ingest`;
  }

  remove(id: number) {
    return `This action removes a #${id} ingest`;
  }
}
