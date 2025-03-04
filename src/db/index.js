import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}?retryWrites=true&w=majority`);
        console.log(`MongoDB connected! ${connectionInstance}`);
        console.log(`Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);// to exit after the error
    }
}

export default connectDB;