import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Configuration
   cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:  process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        console.log("Uploading file from path:", localFilePath);
        if (!fs.existsSync(localFilePath)) {
            console.log("File does not exist:", localFilePath);
            throw new ApiError(404, "File not found");
        }

        const fileSize = fs.statSync(localFilePath).size;
        console.log("Uploading file with size:", fileSize, "bytes");

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded to Cloudinary:", response);

        // Delete the file only after a successful upload
        fs.unlinkSync(localFilePath);

        return response.url; // Return the URL after successful upload
    } catch (error) {
        console.log(`Failed to upload the img to cloudinary ${localFilePath}, Error-info:`, error);

        // Handle file deletion on failure
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

export {uploadOnCloudinary};