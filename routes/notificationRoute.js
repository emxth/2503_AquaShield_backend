import express from "express";
import { createNotification, deleteNotification, getUserNotifications, markAsRead } from "../controller/notificationController.js";


const notifyRouter = express.Router();

notifyRouter.get("/notify/:userId", getUserNotifications);
notifyRouter.post("/createNotify", createNotification);
notifyRouter.put("/readNotify/:id", markAsRead);
notifyRouter.delete("/deleteNotify/:id", deleteNotification);

export default notifyRouter;