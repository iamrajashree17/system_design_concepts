import { Request, Response, NextFunction } from "express";
import { publishNotificationSer } from "../subscribers/notification.subscriber.js";

export async function publishNotification(req: Request, res: Response, next: NextFunction) {
    try {
        const {title, message} = req.body;
        const notification = {
            id: Date.now().toString(),
            title, message, createdAt: new Date().toISOString()
        }

        // Publish a notification
        await publishNotificationSer(notification);

        res.status(201).json({
            success: true,
            message: "notification published successfully",
            data: {
                id: notification.id
            }
        })
    } catch(error) {
        next(error);
    }
}