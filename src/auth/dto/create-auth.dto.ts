import { IsEmail, IsString } from "class-validator";

export class CreateAuthDto {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    password: string;
}

export class SignInDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class RefreshTokenDto {
    @IsString()
    refresh_token: string
}