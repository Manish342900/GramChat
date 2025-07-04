import { getReceiverSocketId, io } from "../index.js"
import cloudinary from "../lib/cloudinary.js"

import Message from "../models/message.model.js"
import User from "../models/users.model.js"

export const getUsersForSideBar=async(req,res)=>{
    try {
        const loggedInUserId=req.user._id
        const filterUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password")

        res.status(200).json(filterUsers)
    } catch (error) {
        console.log("Error in getUserForsiderbar",error.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const getMessages=async(req,res)=>{
    try {
        const {id:userToChatId}=req.params
        const senderId=req.user._id

        const messages= await Message.find({
            $or:[
                {senderId:senderId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:senderId},

            ]

        })
        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessage Controller",error.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const sendMessage=async(req,res)=>{
    try {
        // console.log(req)
        const{text,image,replyTo}=req.body
        const {id:receiverId}=req.params
        const senderId=req.user._id

        let imageUrl;

        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image)
            imageUrl=uploadResponse.secure_url
        }

        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
            replyTo: replyTo || null,
        })
        await newMessage.save()

       

        const receiverSocketId=getReceiverSocketId(receiverId)
        if(receiverSocketId){
            console.log(receiverSocketId)
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }
        res.status(200).json({newMessage})
    } catch (error) {
        console.log("Error in sendMessge Controller",error.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}