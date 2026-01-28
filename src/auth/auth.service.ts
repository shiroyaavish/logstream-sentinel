import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateAuthDto, SignInDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import e, { Request } from 'express';
import { IUserRepository, USER_REPOSITORY } from 'src/user/interface/user.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { encPassword, verifyPassword } from 'src/utils/argon2';
import { SESSION_REPOSITORY } from 'src/user/interface/session.interface';
import { SessionRepository } from 'src/user/repositories/session.repository';
import { session } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepository: SessionRepository,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }
  async create(req: Request, createAuthDto: CreateAuthDto) {
    try {
      const { email, name, password } = createAuthDto;
      const emailExists = await this.userRepository.findByEmail(email);
      if (emailExists) {
        throw new HttpException({ status: HttpStatus.CONFLICT, message: "Email already exists" }, HttpStatus.CONFLICT);
      }
      const encrypted_password: string = await encPassword(password)
      await this.userRepository.create({ email, name, password: encrypted_password });
      return {
        message: 'User registered successfully', data: {}
      }
    } catch (error) {
      console.error('Error register auth :: ', error)
      throw error;
    }
  }

  async signin(req: Request, signInDto: SignInDto) {
    try {
      const { email, password } = signInDto;
      const emailExists = await this.userRepository.findByEmail(email);
      if (!emailExists) {
        throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: "Email not valid." }, HttpStatus.BAD_REQUEST);
      }
      const passwordValid = await verifyPassword(emailExists.password, password)
      if (!passwordValid) {
        throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: "Password not valid." }, HttpStatus.BAD_REQUEST);
      }
      const sessionData = {
        user_id: emailExists.id,
        session_id: crypto.randomUUID(),
        user_agent: req.headers['user-agent']
      }

      await this.sessionRepository.create(sessionData as session)
      const payload = {
        user_id: Number(emailExists.id),
        sid: sessionData.session_id
      }

      const accessToken = this.jwtService.sign(payload, { secret: this.configService.get<string>('ACCESS_JWT_SEC'), expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { secret: this.configService.get<string>('REFRESH_JWT_SEC'), expiresIn: '7d' });

      const user = {
        email: emailExists.email,
        name: emailExists.name,
        id: Number(emailExists.id),
        timestamp: emailExists.timestamp,
        accessToken,
        refreshToken
      }

      return {
        message: 'User Login successfully', data: user
      }
    } catch (error) {
      console.error('Error register auth :: ', error)
      throw error;
    }
  }

  async refreshToken(req: Request) {
    try {
      const user = req.user as any
      await this.sessionRepository.delete(user.session_id)
      const sessionData = {
        user_id: user.id,
        session_id: crypto.randomUUID(),
        user_agent: req.headers['user-agent']
      }
      await this.sessionRepository.create(sessionData as session)

      const payload = {
        user_id: Number(user.id),
        sid: sessionData.session_id
      }

      const accessToken = this.jwtService.sign(payload, { secret: this.configService.get<string>('ACCESS_JWT_SEC'), expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { secret: this.configService.get<string>('REFRESH_JWT_SEC'), expiresIn: '7h' });

      return {
        message: "Token refreshed successfully",
        data: {
          accessToken,
          refreshToken
        }
      }
    } catch (error) {
      console.error('Error refresh token auth :: ', error)
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
