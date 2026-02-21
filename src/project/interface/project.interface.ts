import { project } from "src/generated/prisma/client";

export interface IProjectRepository {
    create(data: project): Promise<project>
    findById(id: number, userId: number): Promise<project | null>
    findAll(query: Record<string, any>, offset: number, limit: number): Promise<project[]>
    updateOne(id: number, data: Partial<project>): Promise<project>
    deleteOne(id: number): Promise<project>
    countDocuments(query: Record<string, any>): Promise<number>
}