import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { IProjectRepository } from "src/project/interface/project.interface";
import { PROJECT_REPOSITORY } from "src/project/repositories/project.repository";
import { WebsocketGateway } from "src/websocket/websocket.gateway";
import { ILogRepository, LOG_REPOSITORY } from "./interface/log.interface";

@Injectable()
@Processor('logs-queue')
export class LogProcessor extends WorkerHost {
    constructor(
        @Inject(PROJECT_REPOSITORY) private readonly projectRepository: IProjectRepository,
        @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
        private eventGateway: WebsocketGateway
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
            console.log(project.user_id)
            if (this.eventGateway.checkRoomExists(`project_${String(project.id)}`)) {
                this.eventGateway.sendToUser(`project_${String(project.id)}`, "set_logs", JSON.stringify(logsData))
            } else {
                this.eventGateway.sendToUser(String(project.user_id), "set_logs", JSON.stringify(logsData))
            }

            return;

        } catch (error) {
            console.error("Error processing job :: ", error)
            throw error;
        }
    }
}