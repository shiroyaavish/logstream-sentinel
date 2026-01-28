import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from '../interface/user.interface';
import { CreateUserInput } from '../types/user.types';
import { user } from 'src/generated/prisma/client';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateUserInput): Promise<user> {
        return this.prisma.user.create({ data });
    }

    async findById(id: bigint): Promise<user | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findByEmail(email: string): Promise<user | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findWithProjects(id: number): Promise<user | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: { projects: true },
        });
    }
}
