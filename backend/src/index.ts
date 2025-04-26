import express, { Application } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import { connectDB } from "./lib/db"; // Assuming you have a MongoDB connection file
import cors from "cors";
import path from "path";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

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

// Default route
app.get("/", (_req, res) => {
  res.send("API is running...");
});

// Error handling middleware (optional)
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
