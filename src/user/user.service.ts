import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { IUserRepository, USER_REPOSITORY } from './interface/user.interface';
import { timestamp } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository
  ) { }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async userDetails(request: Request) {
    try {
      const user = request.user;
      const userDetails = await this.userRepository.findByIdWithSelection(user['id'], { id: true, email: true, name: true, timestamp: true });
      return {
        status: HttpStatus.OK,
        message: "User details fetched successfully",
        data: userDetails
      }
    } catch (error) {
      console.error('Error fetch user details :: ', error)
      throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: "Internal server error" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
