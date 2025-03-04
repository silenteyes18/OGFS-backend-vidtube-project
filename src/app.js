import express from "express";// nmp i express
import cors from "cors";// nmp i cors

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));

// Import routes
import healthchekRouter from "./routes/healthCheck.routs.js";

// Router setup
app.use("/api/v1/healthcheck", healthchekRouter);

export {app};