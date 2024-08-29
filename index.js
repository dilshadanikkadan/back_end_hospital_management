import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";
import doctorRoute from "./routes/doctorRoute.js";
import chatRoute from "./routes/chatRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import NotificationContoller from "./controller/chatController/notificationController.js";
import path from "path";
import { fileURLToPath } from "node:url";

const _dirname = path.dirname("");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const builtPath = path.join(__dirname, "../client_hospital/dist");
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: [
    "https://client-hospital-f5xm.vercel.app",
    "http://localhost:5173",
    "https://back-end-hospital-management.onrender.com" ,
  ],

  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/chat", chatRoute);
app.use(express.static(builtPath));

// Error middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

// Serving React
app.get("/*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../client_hospital/dist/index.html"),
    (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file");
      }
    }
  );
});

// HTTP setup for socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://client-hospital-f5xm.vercel.app",
      "http://localhost:5173",
      "https://back-end-hospital-management.onrender.com" ,
    ],
  },
});

// Append as argument
NotificationContoller(io);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {}, (err) => {
  if (err) throw err;
  console.log("Connected to MongoDB");
});

// Listening
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
