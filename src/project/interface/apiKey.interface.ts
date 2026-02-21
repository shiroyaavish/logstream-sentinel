import { api_key } from "src/generated/prisma/client";
import { CreateApiKey } from "../types/apiKey.types";

export interface IApiKeyRepository {
    create(data: CreateApiKey): Promise<api_key>
    findById(id: number, project_id: number, userId: number): Promise<api_key | null>
    findAll(query?: Record<string, any>): Promise<api_key[]>
    updateOne(id: number, data: Partial<api_key>): Promise<api_key>
    deleteOne(id: number): Promise<api_key>
    findByKey(key: string): Promise<api_key | null>
}

export const API_KEY_REPOSITORY = Symbol("API_KEY_REPOSITORY")