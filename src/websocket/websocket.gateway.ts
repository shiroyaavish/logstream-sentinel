import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from './websocket.service';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/auth/lib/ws.guard';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private websocketService: WebsocketService) { }

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const { user, session } = await this.websocketService.authenticate(client);

    if (!user) {
      client.disconnect();
      return;
    }

    client.data.user = user;
    client.join(String(user.id));

    client.emit('setConnected', { message: 'connected' });
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;

    if (user) {
      console.log(`User Disconnected :: ${user.id}`);
    }
  }

  @SubscribeMessage('ping')
  async handlePing(
    @ConnectedSocket() client: Socket,
  ) {
    return this.websocketService.ping(client);
  }
  @SubscribeMessage('joinRoom')
  @UseGuards(WsGuard)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
  ) {
    return this.websocketService.joinRoom(client);
  }

  @SubscribeMessage('joinProjectRoom')
  @UseGuards(WsGuard)
  async handleJoinProjectRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    await this.websocketService.joinProjectRoom(client, data);
  }

  @SubscribeMessage('leaveRoom')
  @UseGuards(WsGuard)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    await this.websocketService.leaveRoom(client, data);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }

  checkRoomExists(room: string): boolean {
    const rooms = this.server.sockets.adapter.rooms;
    return rooms.has(room);
  }
}