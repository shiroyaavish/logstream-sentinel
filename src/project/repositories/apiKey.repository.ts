import { PrismaService } from "src/prisma/prisma.service";
import { IApiKeyRepository } from "../interface/apiKey.interface";
import { api_key } from "src/generated/prisma/client";
import { CreateApiKey } from "../types/apiKey.types";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ApiKeyRepository implements IApiKeyRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateApiKey): Promise<api_key> {
        return await this.prisma.api_key.create({ data })
    }
    async deleteOne(id: number): Promise<api_key> {
        return await this.prisma.api_key.delete({ where: { id } })
    }

    async findById(id: number, userId: number): Promise<api_key | null> {
        return await this.prisma.api_key.findFirst({ where: { id, project: { user_id: userId } } })
    }
    async findByProjectId(project_id: number, userId: number): Promise<api_key | null> {
        return await this.prisma.api_key.findFirst({ where: { project_id, project: { user_id: userId }, status: { in: [0, 1] } } })
    }
    async findAll(query?: Record<string, any>): Promise<api_key[]> {
        return await this.prisma.api_key.findMany({ where: query })
    }
    async updateOne(id: number, data: Partial<api_key>): Promise<api_key> {
        return await this.prisma.api_key.update({ where: { id }, data })
    }
    async findByKey(key: string): Promise<api_key | null> {
        return await this.prisma.api_key.findUnique({ where: { key } })
    }
    async updateStatus(id: number, status: number): Promise<api_key> {
        return await this.prisma.api_key.update({ where: { id }, data: { status } })
    }
}