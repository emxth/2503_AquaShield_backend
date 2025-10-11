import Notification from "../models/notification.js";

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params; // Use the parameter from request
        // Remove this line: const userID = "68ce9ce7fcece28d887e4cf4";

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.json({ message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createNotification = async (req, res) => {
    try {
        const userId = "68ce9ce7fcece28d887e4cf4";
        const { title, message } = req.body;

        if (!title || !message) {
            console.log('Validation failed - missing fields');
            return res.status(400).json({
                success: false,
                message: 'Title and message are required fields',
                receivedData: req.body // Send back what was actually received
            });
        }

        const newNotification = new Notification({
            userId, title: title.trim(),
            message: message.trim()
        });

        await newNotification.save();
        res.status(201).json({
            success: true,
            data: newNotification
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};