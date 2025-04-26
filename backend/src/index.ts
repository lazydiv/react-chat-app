import express from "express";

import authRouter from "./routes/auth.route";
import dotenv from "dotenv";
import { connectDB } from "./lib/db";

import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("Hello TypeScript + Express!");
});

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);

  connectDB();
});
