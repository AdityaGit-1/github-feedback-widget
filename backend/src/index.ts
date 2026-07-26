import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Express server!");
});

app.post("/feedback", (req, res) => {
    const feedback = req.body;

    console.log("Feedback received is", feedback);

    res.status(201).json({
        message: "Feedback received successfully",
        data: feedback,
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});