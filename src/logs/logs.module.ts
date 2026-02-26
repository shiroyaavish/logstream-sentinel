import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { BullModule } from '@nestjs/bullmq';
import { LogProcessor } from './logs.processor';
import { LOG_REPOSITORY } from './interface/log.interface';
import { LogRepository } from './repositories/log.repository';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { WebsocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: "logs-queue",
    }),
    WebsocketModule
  ],
  controllers: [LogsController],
  providers: [LogsService, LogProcessor,
  ],
})
export class LogsModule { }
