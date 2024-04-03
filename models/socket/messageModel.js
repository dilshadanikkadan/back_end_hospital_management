import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true,

  },
  text: {
    type: String, required: true
  },
  typeOfMessage: {
    type: String,
    default: "message"
  },
  deleteForMe: {
    type: String,
    default: "false"
  },
  unRead: {
    type: Boolean,
    default: true,
    required: true
  },
}, { timestamps: true });

const MessageModel = mongoose.model("messageModel", messageSchema)

export default MessageModel