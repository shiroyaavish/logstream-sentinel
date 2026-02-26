import { log } from "src/generated/prisma/client"

export interface ILogRepository {
    create(data: any): Promise<log>
    findById(id: number): Promise<log | null>
    findAll(query: Record<string, any>, offset: number, limit: number): Promise<log[]>
    updateOne(id: number, data: Partial<any>): Promise<log>
    deleteOne(id: number): Promise<any>
    countDocuments(query: Record<string, any>): Promise<number>
    createMany(data: any[]): Promise<log[]>
}

export const LOG_REPOSITORY = Symbol("LOG_REPOSITORY")