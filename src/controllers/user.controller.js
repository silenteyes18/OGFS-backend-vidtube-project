import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

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


export {
    registerUser
}