import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Express server!");
});

app.post("/feedback", (req, res) => {
    const { name, message } = req.body;

    if (!name || !message || typeof name !== "string" || typeof message !== "string" || name.trim() === "" || message.trim() === "") {
        return res.status(400).json({
            error: "Name and message are required and cannot be empty."
        });
    }

    console.log("Feedback received:", { name, message });

    return res.status(201).json({
        message: "Feedback received successfully",
        data: { name, message }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});