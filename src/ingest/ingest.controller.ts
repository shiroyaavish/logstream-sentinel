import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { CreateIngestDto } from './dto/create-ingest.dto';
import { UpdateIngestDto } from './dto/update-ingest.dto';
import { Request } from 'express';
import { ApiKeyGuard } from 'src/auth/lib/api-key.guard';

@Controller('ingest')
@UseGuards(ApiKeyGuard)
export class IngestController {
  constructor(private readonly ingestService: IngestService) { }

  @Post()
  create(@Req() request: Request, @Body() createIngestDto: CreateIngestDto[]) {
    return this.ingestService.create(request, createIngestDto);
  }

  @Get()
  findAll() {
    return this.ingestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngestDto: UpdateIngestDto) {
    return this.ingestService.update(+id, updateIngestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingestService.remove(+id);
  }
}
