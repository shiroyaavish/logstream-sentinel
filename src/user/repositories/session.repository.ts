import { session } from "src/generated/prisma/client";
import { ISessionRepository } from "../interface/session.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SessionRepository implements ISessionRepository {
    constructor(private prisma: PrismaService) { }
    async create(data: session): Promise<session> {
        return this.prisma.session.create({ data })
    }
    async delete(id: number): Promise<session> {
        return this.prisma.session.delete({ where: { id: id } })
    }
    async findBySessionId(session_id: string): Promise<session | null> {
        return this.prisma.session.findFirst({
            where: { session_id }
        })
    }
    async findAll(query: any): Promise<session[]> {
        return this.prisma.session.findMany(query)
    }
}