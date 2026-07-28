import { Request, Response } from "express";

export const submitFeedback = (req: Request, res: Response) => {
    const { name, message } = req.body;

    if (
        !name ||
        !message ||
        typeof name !== "string" ||
        typeof message !== "string" ||
        name.trim() === "" ||
        message.trim() === ""
    ) {
        return res.status(400).json({
            error: "Name and message are required and cannot be empty."
        });
    }

    console.log("Feedback received:", { name, message });

    return res.status(201).json({
        message: "Feedback received successfully",
        data: { name, message }
    });
};