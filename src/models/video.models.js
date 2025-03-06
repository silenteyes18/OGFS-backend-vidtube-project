/* id string pk
  owner ObjectId users
  videoFile string
  thumbnail string
  title string
  description string
  duration number
  views number
  isPublished boolean
  createdAt Date
  updatedAt Date */

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
    {
        videoFile:{
            type: String, // cloudinary url
            required: true,
        },
        thumbnail:{
            type: String, // cloudinary url
            required: true,
        },
        title:{
            type:String,
            required: true,
        },
        discription:{
            type:String,
            required: true,
        },
        duration:{
            type:Number,
            required: true,
        },
        views:{
            type:Number,
            default:0,
        },
        isPublished:{
            type: Boolean,
            default:true,
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref: "User"
        }
    }
)

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);