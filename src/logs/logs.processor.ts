import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { Job } from "bullmq";

import { IProjectRepository } from "src/project/interface/project.interface";
import { PROJECT_REPOSITORY } from "src/project/repositories/project.repository";

import { WebsocketGateway } from "src/websocket/websocket.gateway";

import { ILogRepository, LOG_REPOSITORY } from "./interface/log.interface";

import { IUserRepository, USER_REPOSITORY } from "src/user/interface/user.interface";
import { ISessionRepository, SESSION_REPOSITORY } from "src/user/interface/session.interface";

import { LogLevel } from "src/generated/prisma/enums";

import { NotificationService } from "src/shared/services/notification.service";
import { RedisService } from "src/shared/services/redis.service";

@Injectable()
@Processor("logs-queue")
export class LogProcessor extends WorkerHost {

    constructor(
        @Inject(PROJECT_REPOSITORY)
        private readonly projectRepository: IProjectRepository,

        @Inject(LOG_REPOSITORY)
        private readonly logRepository: ILogRepository,

        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,

        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,

        private readonly eventGateway: WebsocketGateway,
        private readonly notificationService: NotificationService,
        private readonly redisService: RedisService,
    ) {
        super();
    }

    async process(job: Job) {
        try {
            console.log("Processing job ::", job.id);

            const { logs, api_key } = job.data;
            const projectId = api_key.project_id;

            const project = await this.projectRepository.findById(projectId);
            if (!project) return;

            // Attach project_id to logs
            const logsToInsert = logs.map((log) => ({
                ...log,
                project_id: projectId,
            }));

            // Save logs
            const logsData = await this.logRepository.createMany(logsToInsert);

            // Emit logs via websocket
            this.emitLogs(project, logsData);

            // Find first error log
            const errorLog = logsData.find((log) => log.level === LogLevel.ERROR);
            if (!errorLog) return;

            // Handle notification
            await this.handleErrorNotification(project, errorLog);

        } catch (error) {
            console.error("Error processing job ::", error);
            throw error;
        }
    }

    /**
     * Send logs to websocket
     */
    private emitLogs(project: any, logsData: any[]) {
        const room = `project_${project.id}`;

        if (this.eventGateway.checkRoomExists(room)) {
            this.eventGateway.sendToUser(
                room,
                "set_logs",
                JSON.stringify(logsData),
            );
        } else {
            this.eventGateway.sendToUser(
                String(project.user_id),
                "set_logs",
                JSON.stringify(logsData),
            );
        }
    }

    /**
     * Send notification with redis throttle
     */
    private async handleErrorNotification(project: any, errorLog: any) {

        const userId = project.user_id;

        const key = `error:${userId}:${project.id}`;

        const result = await this.redisService.set(key, "1");

        if (result !== "OK") return;

        const user = await this.userRepository.findById(userId);
        if (!user) return;

        const sessions = await this.sessionRepository.findAll({
            where: { user_id: user.id },
        });

        const tokens = sessions
            .filter((session) => session.token)
            .map((session) => session.token);

        if (!tokens.length) return;

        const payload = {
            project_id: String(project.id),
            log_id: String(errorLog.id),
        };

        const notification = await this.notificationService.sendNotification(
            tokens,
            "Alert !!",
            `Got Error in the project ${project.name} Error: ${errorLog.message}`,
            payload,
        );
        console.log(JSON.stringify(notification))
    }
}