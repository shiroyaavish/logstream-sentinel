import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { USER_REPOSITORY } from 'src/user/interface/user.interface';
import { UserRepository } from 'src/user/repositories/user.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SESSION_REPOSITORY } from 'src/user/interface/session.interface';
import { SessionRepository } from 'src/user/repositories/session.repository';
import { JwtAuthGuard } from './lib/jwt-auth.guard';
import { RefreshGuard } from './lib/refresh.guard';
import { JwtStrategy } from './lib/jwt.strategy';
import { RefreshStrategy } from './lib/refresh.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_JWT_SEC'),
        signOptions: { expiresIn: '1h' },
      })
    }),
    PassportModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtService,
    RefreshStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: SessionRepository
    }
  ],
})
export class AuthModule { }
