import cloudinary from "../lib/cloudinary.js"
import { genrateToken } from "../lib/utils.js"
import User from "../models/users.model.js"
import bcrypt from "bcryptjs"

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    try {
        if (!fullName || !password || !email) {
            return  res.status(400).json({ message: "All Field are requried" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const user = await User.findOne({ email })
        if (user) {
            return res.status(401).json({ message: "User already exists" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashPassword
        })

        if (newUser) {
            genrateToken(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })

        } else {
            res.send(400).json({ message: "Invalid User data" })
        }
    } catch (error) {
        console.log("Error in Signup controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const login = async(req, res) => {
    const {email,password}=req.body

    if (!email || !password) {
        return res.status(400).json({message:"All Fields are required"})
    }
    try {
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Wrong Credentials"})
        }
        const isPasswordCorrect= await bcrypt.compare(password,user.password)
        if (!isPasswordCorrect){
            return res.status(400).json({message:"Wrong Credentials"})
        }

        genrateToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
            createdAt:user.createdAt

        })
    } catch (error) {
        console.log("Error in Login controller",error.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logout Succesfully"})
    } catch (error) {
         console.log("Error in Logout controller",error.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const updateProfile=async(req,res)=>{
    const {profilePic}=req.body
    try {
        const userId=req.user._id
        if(!profilePic){
            return res.status(400).json({message:"Profile pic is required"})
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic)
        const updatedUser=await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})
        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error in update Profile controller ",error.message)
        res.status(500).json({message:"Internal Srver Error"})
    }
}

export const checkAuth=(req,res)=>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller",error.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}