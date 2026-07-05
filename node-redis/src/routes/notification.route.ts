import { Router } from 'express';
import * as notificationController from "../controllers/notification.controller.js"


const notificationRouter = Router();

notificationRouter.post("/", notificationController.publishNotification);

export default notificationRouter