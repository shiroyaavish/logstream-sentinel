import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class NotificationService {
    constructor(private firebaseService: FirebaseService) { }

    async sendNotification(token: string[], title: string, message: string, data: Record<string, string>) {
        return this.firebaseService.sendNotification(
            token,
            title,
            message,
            data
        );
    }
}