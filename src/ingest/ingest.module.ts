import { Module } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestController } from './ingest.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: "logs-queue",
    }),
  ],
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule { }
