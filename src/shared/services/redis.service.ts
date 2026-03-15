import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redis: Redis
    constructor(private configService: ConfigService) { }
    onModuleInit() {
        this.redis = new Redis({
            host: this.configService.get<string>("REDIS_HOST"),
            port: Number(this.configService.get<string>("REDIS_PORT")),
            password: this.configService.get<string>("REDIS_PASSWORD")
        })

        this.redis.on('connect', () => {
            console.log('Redis Connected');
        });

        this.redis.on('error', (err) => {
            console.error('Redis Error', err);
        });
    }
    getClient(): Redis {
        return this.redis;
    }

    async get(key: string): Promise<string | null> {
        return await this.redis.get(key)
    }

    async set(key: string, data: string): Promise<string> {
        /**
         * Redis atomic check
         * EX = expire in seconds
         */
        return await this.redis.set(key, data, 'EX', 300)
    }

    async onModuleDestroy() {
        await this.redis.quit();
    }
}