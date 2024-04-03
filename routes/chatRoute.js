import express from 'express';

import { verifyAdmin, verifyDoctor, verifyToken, verifyUser } from '../utils/verifyToken.js';
import {createRoom,getRoom,deleteChat,readMessage,deleteForMe,getMessages,createMessage,deleteEveryOne} from '../controller/chatController/chatRoomcontroller.js';

const router = express.Router();


router.post("/createRoom",createRoom)
router.get("/getRoom/:id",getRoom)  ;



router.post('/createMessage',createMessage);
router.delete('/delete_everyOne/:id',deleteEveryOne);
router.post('/delete_forMe/:id',deleteForMe)
router.get('/getMessages/:id',getMessages);
router.delete('/delete_chat/:id',deleteChat);
router.post('/read_message',readMessage)
export default router; 