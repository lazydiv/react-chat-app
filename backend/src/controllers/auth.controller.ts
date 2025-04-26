import { Request, Response } from "express";
import User from "../models/user.model";
import { generateToken } from "../lib/jwt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/index";
import cloudinary from "../lib/cloudinary";

export const signup = async (req: Request, res: Response) => {
  // Logic for user login
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Simulate user login logic
    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
      return;
    }
    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateToken(newUser._id.toString(), res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        image: newUser.image,
      });
    } else {
      res.status(400).json({ message: "User not created" });
    }
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "User Not Found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user!.password);

    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    generateToken(user!._id.toString(), res);
    res.status(200).json({
      _id: user!._id,
      username: user!.username,
      email: user!.email,
      image: user!.image,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    generateToken(user!._id.toString(), res);
    res.status(200).json({
      _id: user!._id,
      username: user!.username,
      email: user!.email,
      image: user!.image,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!userId || !profilePic) {
      res.status(401).json({ message: "Invalid" });
      return;
    }
    const uploadedImage = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: uploadedImage.secure_url },
      { new: true },
    );
    res.status(201).json({
      _id: updatedUser?._id,
      username: updatedUser?.username,
      email: updatedUser?.email,
      image: updatedUser?.image,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req: AuthRequest, res: Response) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error checking auth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
