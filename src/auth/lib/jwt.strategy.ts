import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { IUserRepository, USER_REPOSITORY } from "src/user/interface/user.interface";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private logger = new Logger(JwtStrategy.name);
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('ACCESS_JWT_SEC'),
            passReqToCallback: true
        })
    }
    async validate(req: Request, payload: Record<string, any>, done: VerifiedCallback) {
        try {
            this.logger.log(`JWT Payload :: ${JSON.stringify(payload)}`);
            const user = await this.userRepository.findById(payload.id);
            if (!user) {
                throw new HttpException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "user not found",
                }, HttpStatus.UNAUTHORIZED);
            }
            // req.user = user;
            done(null, user);
        } catch (error) {
            this.logger.error('Error validate JWT :: ', error);
            done(error, false);
        }
    }
}