import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        requried: true,

    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        requried: true,
    },
    text: {
        type: String,

    },
    image: {
        type: String,
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    }
},
    { timestamps: true }
)

const Message = mongoose.model("Message", messageSchema)

export default Message;