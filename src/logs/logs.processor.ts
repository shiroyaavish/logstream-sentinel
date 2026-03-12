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

@Injectable()
@Processor('logs-queue')
export class LogProcessor extends WorkerHost {
    constructor(
        @Inject(PROJECT_REPOSITORY) private readonly projectRepository: IProjectRepository,
        @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository,
        private eventGateway: WebsocketGateway,
        private notificationService: NotificationService
    ) { super() }

    async process(job: Job) {
        try {
            console.log("Processing job :: ", job.id)
            const { logs, api_key } = job.data;

            const project = await this.projectRepository.findById(api_key.project_id);

            const data = logs.map(log => ({
                ...log,
                project_id: api_key.project_id,
            }))

            // console.log("Logs data :: ", data)
            const logsData = await this.logRepository.createMany(data)
            // console.log("Logs data :: ", logsData)
            // console.log(project.user_id)
            if (this.eventGateway.checkRoomExists(`project_${String(project.id)}`)) {
                this.eventGateway.sendToUser(`project_${String(project.id)}`, "set_logs", JSON.stringify(logsData))
            } else {
                this.eventGateway.sendToUser(String(project.user_id), "set_logs", JSON.stringify(logsData))
            }
            const user = await this.userRepository.findById(project.user_id)
            const sessions = await this.sessionRepository.findAll({ where: { user_id: user.id } })
            const tokens = sessions.filter((ele) => ele.token).map((ele) => ele.token)
            for (let log of logsData) {
                if (log.level === LogLevel.ERROR) {
                    const data = {
                        project_id: String(project.id),
                        log_id: String(log.id)
                    }
                    await this.notificationService.sendNotification(tokens, "Alert !!", `Got Error in the project ${project.name} Error: ${log.message}`, data)
                }
            }
            return;

        } catch (error) {
            console.error("Error processing job :: ", error)
            throw error;
        }
    }
}