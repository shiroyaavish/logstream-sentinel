import { User } from 'src/generated/prisma/client';
import { CreateUserInput } from '../types/user.types';

export interface IUserRepository {
  create(data: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findWithProjects(id: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
