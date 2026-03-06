import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, RefreshTokenDto, SignInDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Request } from 'express';
import { RefreshGuard } from './lib/refresh.guard';
import { JwtAuthGuard } from './lib/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("/register")
  create(@Req() req: Request, @Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(req, createAuthDto);
  }

  @Post("/signin")
  signin(@Req() req: Request, @Body() signInDto: SignInDto) {
    return this.authService.signin(req, signInDto);
  }

  @UseGuards(RefreshGuard)
  @Post("/refresh-token")
  refreshToken(@Req() req: Request, @Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(req);
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  findOne(@Req() req: Request) {
    return this.authService.logout(req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

}
