import { Response } from "express";
import { AuthRequest } from "../types";
import Message from "../models/message.model";
import cloudinary from "../lib/cloudinary";
import User from "../models/user.model";
import { getReceiverSocketId, io } from "../lib/socket";

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { text, image } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;
  let imageUrl;

  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image, {
      upload_preset: "chat_app",
    });
    imageUrl = uploadResponse.secure_url;
  }

  try {
    if (!text && !image) {
      res.status(400).json({ message: "Text or image is required" });
      return;
    }
    const newMessage = new Message({
      text,
      image: imageUrl,
      senderId,
      receiverId,
    });
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  const { id: receiverId } = req.params;
  const senderId = req.user._id;
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const users = await User.find({
      _id: { $ne: userId },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
