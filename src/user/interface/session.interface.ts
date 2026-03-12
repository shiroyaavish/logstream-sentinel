import { session } from "src/generated/prisma/client";

export interface ISessionRepository {
    create(data: session): Promise<session>
    findBySessionId(session_id: string): Promise<session | null>
    delete(id: number): Promise<session>
    findAll(query:any): Promise<session[]>
}

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');