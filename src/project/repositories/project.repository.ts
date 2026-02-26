import { PrismaService } from "src/prisma/prisma.service";
import { IProjectRepository } from "../interface/project.interface";
import { project } from "src/generated/prisma/client";
import { CreateProjectInput } from "../types/project.types";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProjectRepository implements IProjectRepository {
    constructor(private prisma: PrismaService
    ) { }

    async create(data: CreateProjectInput): Promise<project> {
        return this.prisma.project.create({ data })
    }

    async findById(id: number): Promise<project | null> {
        return this.prisma.project.findUnique({ where: { id } })
    }

    async findAll(query: Record<string, any>, offset: number, limit: number): Promise<project[]> {
        return this.prisma.project.findMany({ where: query, skip: offset, take: limit })
    }

    async updateOne(id: number, data: Partial<project>): Promise<project> {
        return this.prisma.project.update({ where: { id }, data })
    }

    async deleteOne(id: number): Promise<project> {
        return this.prisma.project.delete({ where: { id } })
    }
    async countDocuments(query: Record<string, any>): Promise<number> {
        return await this.prisma.project.count({ where: query }) || 0
    }
}

export const PROJECT_REPOSITORY = Symbol("PROJECT_REPOSITORY")