import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import { connectDB } from './lib/db.js';

import authRoutes from './routes/auth.route.js';
dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/out")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "out", "index.html"));
    });
  }

app.get('/', (req, res) => {
  res.send('Test!')
});

app.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});