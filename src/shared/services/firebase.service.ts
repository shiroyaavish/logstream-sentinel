import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import serviceAccount from '../../config/firebase';

@Injectable()
export class FirebaseService {
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
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