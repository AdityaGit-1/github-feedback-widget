import { Request, Response } from "express";
import { createGitHubIssue } from "../services/githubService";
import { validateFeedback } from "../validators/feedbackValidator";
import { ValidationError } from "../errors/ValidationError";

export const submitFeedback = async (req: Request, res: Response) => {
    try {
        const { name, message } = validateFeedback(req.body);

        await createGitHubIssue(name, message);

        return res.status(201).json({
            message: "Feedback submitted successfully.",
        });

    } catch (error: any) {

    if (error instanceof ValidationError) {
        return res.status(400).json({
            message: error.message,
        });
    }
    
    console.error(error);

    return res.status(500).json({
        message: "Internal Server Error",
    });
    }
};