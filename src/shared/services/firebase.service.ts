import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    constructor(private configService: ConfigService) {
    }
    onModuleInit() {

        const privateKey = this.configService
            .get<string>("FIREBASE_PRIVATE_KEY")
            ?.replace(/\\n/g, "\n");

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: this.configService.get<string>("FIREBASE_PROJECT_ID"),
                    clientEmail: this.configService.get<string>("FIREBASE_CLIENT_EMAIL"),
                    privateKey,
                }),
            });
        }

    }

    async sendNotification(tokens: string[], title: string, message: string, data: Record<string, any>) {
        const notificationData: admin.messaging.MulticastMessage = {
            notification: {
                title,
                body: message,
            },
            tokens,
            data
        };

        return admin.messaging().sendEachForMulticast(notificationData);
    }
}