import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto, FindAllLogsDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/lib/jwt-auth.guard';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) { }

  @Post("/findAll")
  async findAll(@Req() request: Request, @Body() findAllLogsDto: FindAllLogsDto) {
    return await this.logsService.findAll(request, findAllLogsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogDto: UpdateLogDto) {
    return this.logsService.update(+id, updateLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logsService.remove(+id);
  }
}
