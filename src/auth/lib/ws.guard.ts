import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WsException } from "@nestjs/websockets";
import * as jwt from "jsonwebtoken";
import {
    ISessionRepository,
    SESSION_REPOSITORY,
} from "src/user/interface/session.interface";
import {
    IUserRepository,
    USER_REPOSITORY,
} from "src/user/interface/user.interface";

@Injectable()
export class WsGuard implements CanActivate {
    logger = new Logger(WsGuard.name);
    constructor(
        private readonly configService: ConfigService,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: ISessionRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log("WebSocket connection attempt");
        const client = context.switchToWs().getClient();
        const authToken = client?.handshake?.headers.authorization || client?.handshake?.headers.Authorization;
        this.logger.log(`WebSocket JWT Token :: ${authToken}`);

        if (!authToken) {
            client.emit('error', { message: 'Authorization token is missing' });
            throw new WsException("Authorization token is missing");
        }

        const token = authToken.startsWith("Bearer ")
            ? authToken.split(" ")[1]
            : authToken;

        let payload: any;

        try {
            payload = jwt.verify(
                token,
                this.configService.get<string>('ACCESS_JWT_SEC')
            );
        } catch (error) {
            this.logger.error(`WebSocket JWT Verification Failed :: ${error.message}`);
            client.emit('error', { message: 'Invalid or expired token' });
            throw new WsException("Invalid or expired token");
        }
        const session = await this.sessionRepository.findBySessionId(payload.sid);

        if (!session) {
            client.emit('error', { message: 'Session not found' });
            throw new WsException("Session not found");
        }

        const user = await this.userRepository.findById(session.user_id);

        if (!user) {
            client.emit('error', { message: 'User not found' });
            throw new WsException("User not found");
        }

        // Attach user to socket
        client.user = user;
        client.session = session;
        console.log(`User Connected :: ${user.id}`);
        return true;
    }
}