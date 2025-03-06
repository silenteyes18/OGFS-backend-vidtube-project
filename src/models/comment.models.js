/*  id string pk
  video ObjectId videos
  owner ObjectId users
  content string
  createdAt Date
  updatedAt Date */

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose, {Schema} from "mongoose";

  const commentSchema = new Schema(
    {
        content:{
            type:String,
            required:true,
        },
        videos:{
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {timestamps:true}
  )
  
  commentSchema.plugin(mongooseAggregatePaginate);
  
  export const Comment = mongoose.model("Comment", commentSchema)