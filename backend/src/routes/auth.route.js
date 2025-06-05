import express from "express"
import { login,logout,signup, updateProfile,checkAuth } from "../controllers/auth.controller.js"
import { protectroute } from "../middleware/auuth.middleware.js"

const router =express.Router()

router.post('/signup',signup)

router.post('/login',login)

router.post('/logout',logout)

router.put("/update-profile",protectroute,updateProfile)

router.get("/check",protectroute,checkAuth)

export default router;