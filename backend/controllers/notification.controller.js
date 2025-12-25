import Notification from "../model/notification.model.js"
import mongoose from "mongoose";
export const getNotifications =async (req,res) => {
    try{
        const userId = req.user._id.toString();
        const notifications=await Notification.find({ to: userId })
      .sort({ createdAt: -1 }) // optional: newest first
      .populate({
        path: "from",
        select: "username profileImg"
      });
        await Notification.updateMany({to:userId},{read:true})
        res.status(200).json(notifications)
    }
    catch (err) {
    console.error("Error getting notifications:", err);
    return res.status(500).json({ error: "Internal server error while getting notifications" });
  }
}
export const deleteNotifications =async (req,res) => {
    try{
        const userId = req.user._id.toString();
        await Notification.deleteMany({to:userId})
        res.status(200).json({message:"notification deleted"});
    }
    catch (err) {
    console.error("Error deleting notification:", err);
    return res.status(500).json({ error: "Internal server error while deleting notification" });
  }
}

export const deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.params; // notification ID
    const userId = req.user._id.toString();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const notification = await Notification.findOneAndDelete({ _id: id, to: userId });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    return res.status(500).json({ error: "Internal server error while deleting notification" });
  }
};

