import express from "express";// nmp i express
import cors from "cors";// nmp i cors
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
//cookie
app.use(cookieParser());

// Import routes
import healthchekRouter from "./routes/healthCheck.routs.js";
import UserRouter from "./routes/user.routes.js";

// Router setup
app.use("/api/v1/healthcheck", healthchekRouter);
app.use("/api/v1/users", UserRouter);

export {app};