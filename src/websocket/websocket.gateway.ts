import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
import { CreateWebsocketDto } from './dto/create-websocket.dto';
import { UpdateWebsocketDto } from './dto/update-websocket.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WebsocketGateway {
  constructor(private readonly websocketService: WebsocketService) { }

  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    const userId = client.handshake.query.user_id as string
    if (!userId) {
      client.disconnect()
      return;
    }
    client.join(userId)

    client.emit("setConnected", { message: "connected" })

    console.log(`User Connected :: ${userId}`)
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    console.log(`User disconnected: ${userId}`);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.removeAllListeners(event)
    this.server.to(userId).emit(event, data);
  }
}
