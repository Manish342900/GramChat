import express from "express"
import { protectroute } from "../middleware/auuth.middleware.js"
import { getMessages, getUsersForSideBar, sendMessage } from "../controllers/message.controller.js"

const router=express.Router()

router.get("/users",protectroute,getUsersForSideBar)
router.get("/:id",protectroute,getMessages)
router.post("/send/:id",protectroute,sendMessage)

export default router