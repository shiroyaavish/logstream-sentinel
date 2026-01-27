import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateAuthDto, SignInDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import e, { Request } from 'express';
import { IUserRepository, USER_REPOSITORY } from 'src/user/interface/user.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
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
      const user = await this.userRepository.create({ email, name, password });
      return {
        message: 'User registered successfully', data: user
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
      if (password !== emailExists.password) {
        throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: "Password not valid." }, HttpStatus.BAD_REQUEST);
      }
      const payload = {
        email: emailExists.email,
        id: emailExists.id
      }
      const accessToken = this.jwtService.sign(payload, { secret: this.configService.get<string>('ACCESS_JWT_SEC'), expiresIn: '1h' });
      const refreshToken = this.jwtService.sign(payload, { secret: this.configService.get<string>('REFRESH_JWT_SEC'), expiresIn: '7d' });
      const user = {
        email: emailExists.email,
        name: emailExists.name,
        id: emailExists.id,
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

  findAll() {
    return `This action returns all auth`;
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
