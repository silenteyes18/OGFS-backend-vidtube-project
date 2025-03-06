/*
id string pk
username string
email string
fullName string
avatar string
coverImage string
watchHistory ObjectId[] videos
password string
refreshToken string
createdAt Date
updatedAt Date */


import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true,
        },
        email:{
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
        },
        avatar:{
            type: String, //cloudinary url
            required: true,
        },
        coverImage:{
            type: String, //cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
        },
        refreshToken: {
            type: String,
        }
    },
    {timestamps: true}
)

// password encryption and pre hook

userSchema.pre("save", async function(next){//never use the arrow function here
    
    if (!this.isModified("password")) {// this work fine for the first time adding pass as well(will return true )
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return bcrypt.compare(password, this.password);
}

// JWT -Json web token -for access token and refresh token

userSchema.methods.genAccessToken = function(){
    return jwt.sign(
        {    _id: this._id,
            username: this.username,
            email: this.email,
         }, 
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
    );
}

userSchema.methods.genRefreshToken = function(){
    return jwt.sign(
        {    _id: this._id
         }, 
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );
}

export const User = mongoose.model("User", userSchema);