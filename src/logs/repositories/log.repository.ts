import { PrismaService } from "src/prisma/prisma.service"
import { ILogRepository } from "../interface/log.interface"
import { log } from "src/generated/prisma/client"
import { Injectable } from "@nestjs/common"

@Injectable()
export class LogRepository implements ILogRepository {
    constructor(
        private prisma: PrismaService
    ) { }
    async create(data: any): Promise<log> {
        return this.prisma.log.create({ data })
    }
    async findById(id: number): Promise<log | null> {
        return this.prisma.log.findUnique({ where: { id } })
    }
    async findAll(query: Record<string, any>, offset: number, limit: number): Promise<log[]> {
        return this.prisma.log.findMany({ where: query, skip: offset, take: limit })
    }
    async updateOne(id: number, data: Partial<any>): Promise<log> {
        return this.prisma.log.update({ where: { id }, data })
    }
    async deleteOne(id: number): Promise<any> {
        return this.prisma.log.delete({ where: { id } })
    }
    async countDocuments(query: Record<string, any>): Promise<number> {
        return await this.prisma.log.count({ where: query }) || 0
    }
    async createMany(data: any[]): Promise<log[]> {
        return await this.prisma.log.createManyAndReturn({ data })
    }
}