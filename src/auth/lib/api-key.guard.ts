import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { API_KEY_REPOSITORY, IApiKeyRepository } from "src/project/interface/apiKey.interface";

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(@Inject(API_KEY_REPOSITORY) private readonly apiKeyRepository: IApiKeyRepository) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest<Request>();
            const apiKey: string = request.headers['x-api-key'] as string || request.headers["X-API-KEY"] as string;
            if (!apiKey) {
                throw new HttpException({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: "API key is missing",
                }, HttpStatus.UNAUTHORIZED)
            }

            const apiKeyRecord = await this.apiKeyRepository.findByKey(apiKey);
            if (!apiKeyRecord) {
                throw new HttpException({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: "Invalid API key",
                }, HttpStatus.UNAUTHORIZED)
            }

            if (apiKeyRecord.status === 1) {
                throw new HttpException({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: "API key is disabled",
                }, HttpStatus.UNAUTHORIZED)
            }

            request["api_key"] = apiKeyRecord;

            return true;

        } catch (error) {
            throw error;
        }
    }
}