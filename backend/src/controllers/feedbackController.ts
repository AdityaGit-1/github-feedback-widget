import { Request, Response } from "express";
import { createGitHubIssue } from "../services/githubService";

export const submitFeedback = async (req: Request, res: Response) => {
    try {
        let { name, message } = req.body;

        if (!name || !message) {
            return res.status(400).json({
                message: "Both name and message are required.",
            });
        }

        if (typeof name !== "string" || typeof message !== "string") {
            return res.status(400).json({
                message: "Name and message must be strings.",
            });
        }

        name = name.trim();
        message = message.trim();

        if (name.length === 0 || message.length === 0) {
            return res.status(400).json({
                message: "Name and message cannot be empty.",
            });
        }

        if (name.length < 2 || name.length > 50) {
            return res.status(400).json({
                message: "Name must be between 2 and 50 characters.",
            });
        }

        if (message.length < 10 || message.length > 500) {
            return res.status(400).json({
                message: "Message must be between 10 and 500 characters.",
            });
        }

        const issue = await createGitHubIssue(name, message);

        return res.status(201).json({
            message: "Feedback submitted successfully.",
            issue,
        });

    } catch (error) {
        console.error("Error creating GitHub issue:", error);

        return res.status(500).json({
            message: "Failed to create GitHub issue.",
        });
    }
};