import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (Object.keys(req.body).length === 0) {
        throw new ApiError(400, "JSON body is empty");
    }

    if ([username, email, password, fullName].some((field) => !field || field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

// Check if the user already exists
const existingUser = await User.findOne({ $or: [{ email }, { username }] });

if (existingUser) {
    throw new ApiError(401, "User already exists");
}


    // Files
    console.log(req.files);
    const { avatar, coverImage } = req.files;
    const avatarLocalPath = avatar?.[0]?.path;
    const coverImageLocalPath = coverImage?.[0]?.path;

    if (!avatarLocalPath || avatarLocalPath?.trim() === "") {
        throw new ApiError(404, "Avatar file not found");
    }

    // Upload files to Cloudinary
    let avatarUrl, coverImageUrl;
    try {
        avatarUrl = await uploadOnCloudinary(avatarLocalPath);
        console.log("Uploaded avatar:", avatarUrl);
    } catch (error) {
        console.log(`Failed to upload the Avatar image to Cloudinary: ${avatarLocalPath}, Error-info:`, error);
        throw new ApiError(404, "Failed to upload Avatar");
    }

    try {
        coverImageUrl = await uploadOnCloudinary(coverImageLocalPath);
        console.log("Uploaded cover image:", coverImageUrl);
    } catch (error) {
        console.log(`Failed to upload the cover image to Cloudinary: ${coverImageLocalPath}, Error-info:`, error);
        throw new ApiError(404, "Failed to upload cover");
    }

    console.log("avatar url: ",avatarUrl);
    console.log("cover url: ",coverImageUrl);
    

    // Create user in the database
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatarUrl,
        coverImage: coverImageUrl || "",
    });

    const createUser = await User.findById(user._id).select("-password -refreshToken -watchHistory");

    if (!createUser) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(201).json(new ApiResponse("201", createUser, "User created successfully"));
});

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId).select("-password -firstName");
        if (!user) {
            throw new ApiError(404, "User mot found");
            return null;
        }
        const accessToken = user.genAccessToken();
        const refreshToken = user.genRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validatebeforeSave:false});
    
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generatimg access token and refresh token");
        
    }
}

const loginUser = asyncHandler(async (req,res)=>{
    //get data from body
    const {username, email, password}=req.body;
    if(!username || !email || !password){
        throw new ApiError(400, "Missing user credentials");
    }
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const passwordVerified = await  user.isPasswordCorrect(password);
    if (!passwordVerified) {
        throw new ApiError(401, "Invalid user credentials");
    }
    const {accessToken, refreshToken} = generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id);
    
    const option = {
        httpOnly: true,
        secure:process.env.NODE_ENV === "production",
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(new ApiResponse(
        200,
        loggedInUser,//{user:loggedInUser,accessToken,refreshToken}
        "User login Successful"
    ))
})

const refreshTheAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookie?.refreshToken || req.body.refreshToken;// for WEB | for Mobile
    if(!incomingRefreshToken){
        throw new ApiError(400, "Missing user credentials");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(404, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const option = {
            httpOnly: true,
            secure:process.env.NODE_ENV === "production",
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);
        return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", newRefreshToken, option)
        .json(new ApiResponse(200, {accessToken,newRefreshToken},"User login Successful"));
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
}
)

const logoutUser = asyncHandler(async (req, res) => {
    // res
    // .clearCookie("accessToken")
    // .clearCookie("refreshToken")
    // .status(200)
    // .json(new ApiResponse(200, null, "User logged out successfully"));
});

export {
    registerUser,
    loginUser,
    refreshTheAccessToken,
    logoutUser
}