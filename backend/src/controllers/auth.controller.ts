import { Request, Response } from "express";
import User from "../models/user.model";
import { generateToken } from "../lib/jwt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user: {
    _id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

export const signup = async (req: Request, res: Response) => {
  // Logic for user login
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Simulate user login logic
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

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
      return res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        image: newUser.image,
      });
    } else {
      return res.status(400).json({ message: "User not created" });
    }
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id.toString(), res);
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      image: user.image,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    generateToken(user._id.toString(), res);
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      image: user.image,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!userId || !profilePic) {
      return res.status(401).json({ message: "Invalid" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: profilePic },
      { new: true },
    );
    return res.status(200).json({
      _id: updatedUser?._id,
      username: updatedUser?.username,
      email: updatedUser?.email,
      image: updatedUser?.image,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
