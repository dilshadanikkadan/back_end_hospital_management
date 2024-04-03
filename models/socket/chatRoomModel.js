import mongoose from "mongoose"

const chatRoom = mongoose.Schema({
    participants: {
        type: Array
    },
    lastMessage: {
        type: Array,
    },
    messageLast:{
        type:Object
    },
    unRead:{
        type:String,
        default:true
    }
}, { timestamps: true })

const ChatRoom = mongoose.model("ChatRoom", chatRoom)

export default ChatRoom