import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import messageRoutes from "./routes/message.route";
import { connectDB } from "./lib/db";
import cors from "cors";

import { app, server } from "./lib/socket";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL, // e.g., frontend URL
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
// Default route
app.get("/", (_req, res) => {
  res.send("API is running...");
});

if (process.env.NODE_ENV === "production") {
  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Catch-all route to serve the React app for SPA routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
} else {
  // You can also add a fallback for dev mode if you like.
  // For example, serve frontend from a dev server or not at all.
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
