import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { USER_REPOSITORY } from './interface/user.interface';
import { UserRepository } from './repositories/user.repository';
import { SESSION_REPOSITORY } from './interface/session.interface';
import { SessionRepository } from './repositories/session.repository';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: SessionRepository
    }
  ],
  exports: [USER_REPOSITORY,SESSION_REPOSITORY]
})
export class UserModule { }
