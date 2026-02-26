import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { SharedModule } from './shared/shared.module';
import { WebsocketModule } from './websocket/websocket.module';
import { LogsModule } from './logs/logs.module';
import { IngestModule } from './ingest/ingest.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost', // Default to localhost
        port: Number(process.env.REDIS_PORT) || 6379, // Default to 6379
        password: process.env.REDIS_PASSWORD || undefined, // Default to no password
      },
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    ProjectModule,
    SharedModule,
    WebsocketModule,
    LogsModule,
    IngestModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
