/*   id string pk
  owner ObjectId users
  content string
  createdAt Date
  updatedAt Date   */

import mongoose, {Schema} from "mongoose";

const tweetSchema = new Schema(
    {
        content:{
            type:String,
            required:true,
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    }
)

export const Tweet = mongoose.model("Comment", tweetSchema)