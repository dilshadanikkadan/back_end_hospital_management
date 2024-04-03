
import express from 'express';
const app = express();
const port = 3000; 
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); 
import userRoute from './routes/userRoute.js';
import adminRoute from './routes/adminRoute.js'
import doctorRoute from './routes/doctorRoute.js'
import chatRoute from './routes/chatRoute.js'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import http from "http" 
import { Server } from 'socket.io';
import NotificationContoller from './controller/chatController/notificationController.js';

// http set up for socket 
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
})
 
//appendig as argument  
NotificationContoller(io)

//managing the cors
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

//middlewires
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/doctor', doctorRoute)
app.use('/api/chat',chatRoute)


// error middleware
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



/// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {}, (err) => {
  if (err) throw err;
  console.log('Connected to MongoDB');
}) 

//listening 
server.listen(3000, () => {
  console.log(`Server is running on port ${port}`);
})

