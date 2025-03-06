/*  id string pk
  subscriber ObjectId users
  channel ObjectId users
  createdAt Date
  updatedAt Date */

  import mongoose, {Schema} from "mongoose";

  const subscriptionSchema = new Schema(
    {
        subscriber:{
            type: Schema.Types.ObjectId,// one who is subscribing
            ref: "User",
        },
        channel:{
            type: Schema.Types.ObjectId,// one who is getting the subcriber
            ref: "User",
        },
    },
    {timestamps:true}
)

export const Subscribe = mongoose.model("Subscribe", subscriptionSchema)