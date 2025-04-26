import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateToken = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development", // Set to true in production
  });
  return token;
};
