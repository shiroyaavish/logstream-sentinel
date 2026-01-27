import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { USER_REPOSITORY } from './interface/user.interface';
import { UserRepository } from './repositories/user.repository';

@Module({
  controllers: [UserController],
  providers: [UserService,{
    provide:USER_REPOSITORY,
    useClass:UserRepository
  }],
  exports:[USER_REPOSITORY]
})
export class UserModule {}
