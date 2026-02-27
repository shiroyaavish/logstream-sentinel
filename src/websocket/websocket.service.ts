import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateWebsocketDto } from './dto/create-websocket.dto';
import { UpdateWebsocketDto } from './dto/update-websocket.dto';
import { Socket } from 'socket.io';
import { PROJECT_REPOSITORY } from 'src/project/repositories/project.repository';
import { IProjectRepository } from 'src/project/interface/project.interface';
import * as jwt from "jsonwebtoken";
import { ConfigService } from '@nestjs/config';
import { ISessionRepository, SESSION_REPOSITORY } from 'src/user/interface/session.interface';
import { IUserRepository, USER_REPOSITORY } from 'src/user/interface/user.interface';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WebsocketService {

  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: IProjectRepository,
    private readonly configService: ConfigService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) { }
  private logger = new Logger(WebsocketService.name);

  async joinRoom(client: Socket) {
    const user = (client as any).user;
    console.log("User details :: ", user)
    if (user) {
      const userId = user.id;
      client.join(String(userId));
      client.emit('joinedRoom', { message: `Joined room ${userId}` });
      console.log(`User Joined Room :: ${userId}`);
    } else {
      console.log('Unauthenticated user attempted to join room');
      client.disconnect();
    }
  }

  async joinProjectRoom(client: Socket, data: any) {
    try {
      const user = (client as any).user;
      const { project_id } = data;

      const project = await this.projectRepository.findById(project_id);

      if (!project) {
        client.emit('error', { message: 'Project not found' });
        return;
      }
      console.log("Project details :: ", project)

      client.join(`project_${project_id}`);
      client.emit('joinedProjectRoom', { message: `Joined project room ${project_id}` });

      console.log(`User Joined Project Room :: project_${project_id}`);

    } catch (error) {
      console.error('Error joining project room', error);
      client.emit('error', { message: 'Failed to join project room' });
    }
  }

  async leaveRoom(client: Socket, data: any) {
    try {
      const user = (client as any).user;
      const { project_id } = data;

      if (project_id) {
        client.leave(`project_${project_id}`);
        client.emit('leftRoom', { message: `Left project room ${project_id}` });

      } else {
        const userId = user.id;
        client.leave(String(userId));
        client.emit('leftRoom', { message: `Left room ${userId}` });
      }
    } catch (error) {
      console.error('Error leaving room', error);
      client.emit('error', { message: 'Failed to leave room' });
    }
  }

  async authenticate(client: Socket) {
    const authHeader: string =
      client?.handshake?.headers?.authorization ||
      client?.handshake?.headers?.Authorization as string

    if (!authHeader) {
      client.emit('error', { message: 'Authorization token is missing' });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    let payload: any;

    try {
      payload = jwt.verify(
        token,
        this.configService.get<string>("ACCESS_JWT_SEC")
      );
    } catch (error) {
      this.logger.error(`JWT verification failed: ${error.message}`);
      client.emit('error', { message: 'Authorization token is missing' });
    }

    const session = await this.sessionRepository.findBySessionId(payload.sid);

    if (!session) {
      client.emit('error', { message: 'Authorization token is missing' });
    }

    const user = await this.userRepository.findById(session.user_id);

    if (!user) {
      client.emit('error', { message: 'Authorization token is missing' });
    }

    return { user, session };
  }
  ping(client: Socket) {
    client.emit('pong', { message: 'pong' });
  }

  findAll() {
    return `This action returns all websocket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} websocket`;
  }

  update(id: number, updateWebsocketDto: UpdateWebsocketDto) {
    return `This action updates a #${id} websocket`;
  }

  remove(id: number) {
    return `This action removes a #${id} websocket`;
  }
}
