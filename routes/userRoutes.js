import { Router } from "express";
import { changeKey, deleteImage, getAllImages, getOneImages, getUser, login, singup, updateUserImage, updateUserName, upload } from "../controllers/user.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadMiddleware from '../middleware/multer.js'; // Adjust the import path as needed
import keyCheckmiddleware from "../middleware/keyCheckmiddleware.js";

const router=Router()

router.post("/userLogin",login)

router.post("/userSingup",singup)

router.post("/upload",uploadMiddleware.upload.single('image'),authMiddleware,upload)

router.get("/getAllImages",authMiddleware,getAllImages)

router.get("/getUser",authMiddleware,getUser)

router.put("/changeApi",authMiddleware,changeKey)

router.delete("/deleteImage/:imageId",authMiddleware,deleteImage)

router.get("/getOneImages/:imageId",getOneImages)

router.delete("/:key/deleteImage/:imageId",keyCheckmiddleware,deleteImage)

router.post("/:key/upload",uploadMiddleware.upload.single('image'),keyCheckmiddleware,upload)

router.post("/guestUser",uploadMiddleware.upload.single('image'),upload)

router.put("/updateUserImage",uploadMiddleware.upload.single('image'),authMiddleware,updateUserImage)

router.put("/updateUserName",authMiddleware,updateUserName)



export default router;