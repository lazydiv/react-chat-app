// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/index";

import User from "../models/user.model";

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
