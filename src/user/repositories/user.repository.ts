import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from '../interface/user.interface';
import { CreateUserInput } from '../types/user.types';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateUserInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findWithProjects(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: { projects: true },
        });
    }
}
