import { user } from 'src/generated/prisma/client';
import { CreateUserInput } from '../types/user.types';

export interface IUserRepository {
  create(data: CreateUserInput): Promise<user>;
  findById(id: number): Promise<user | null>;
  findByEmail(email: string): Promise<user | null>;
  findWithProjects(id: number): Promise<user | null>;
  findByIdWithSelection(id: number, selection: any): Promise<Partial<user> | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
