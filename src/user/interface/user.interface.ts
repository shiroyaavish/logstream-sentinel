import { user } from 'src/generated/prisma/client';
import { CreateUserInput } from '../types/user.types';

export interface IUserRepository {
  create(data: CreateUserInput): Promise<user>;
  findById(id: bigint): Promise<user | null>;
  findByEmail(email: string): Promise<user | null>;
  findWithProjects(id: number): Promise<user | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
