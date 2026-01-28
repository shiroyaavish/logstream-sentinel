import { HttpException, HttpStatus, Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy, VerifiedCallback } from "passport-jwt";
import { ISessionRepository, SESSION_REPOSITORY } from "src/user/interface/session.interface";
import { IUserRepository, USER_REPOSITORY } from "src/user/interface/user.interface";

export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    private logger = new Logger(RefreshStrategy.name);
    constructor(
        private configService: ConfigService,
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField("refresh_token"),
            secretOrKey: configService.get<string>('REFRESH_JWT_SEC'),
            passReqToCallback: true,
            ignoreExpiration: false
        })
    }
    async validate(req: Request, payload: Record<string, any>, done: VerifiedCallback) {
        try {
            this.logger.log(`JWT Payload :: ${JSON.stringify(payload)}`);
            const session = await this.sessionRepository.findBySessionId(payload.sid);
            if (!session) {
                throw new HttpException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "session not found",
                }, HttpStatus.UNAUTHORIZED);
            }
            const user = await this.userRepository.findById(session.user_id);
            if (!user) {
                throw new HttpException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "user not found",
                }, HttpStatus.UNAUTHORIZED);
            }
            done(null, { ...user, session_id: session.id });
        } catch (error) {
            this.logger.error('Error validate JWT :: ', error);
            done(error, false);
        }
    }
}