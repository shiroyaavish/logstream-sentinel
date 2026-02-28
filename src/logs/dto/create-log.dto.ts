import { LogLevel } from "src/generated/prisma/enums";

export class CreateLogDto {

}

export class FindAllLogsDto {
    project_id?: number;
    offset: number;
    limit: number;
    level?: LogLevel;
    search?: string;
}