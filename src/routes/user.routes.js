import { Router } from "express";
import {registerUser, logoutUser} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },{
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

// Logout Secure route
router.route("/logout").post(verifyJWT, logoutUser);// verifyJwt is a middleware the next() in verifyJWT will move the execution to logoutUser controller

export default router;