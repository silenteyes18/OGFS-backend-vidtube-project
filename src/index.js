import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
});

console.log(process.env.PORT); 

const PORT = process.env.PORT || 3001;  

connectDB()
.then(()=>{
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch((err)=>{
    console.log("Connection error", err);
})
