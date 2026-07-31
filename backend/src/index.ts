import dotenv from "dotenv";
dotenv.config();

import express from "express";
import feedbackRoutes from "./routes/feedbackRoutes";

import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Express server!");
});

app.use("/feedback", feedbackRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});