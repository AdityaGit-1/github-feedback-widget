import { Request, Response } from "express";
import { createGitHubIssue } from "../services/githubService";
import { validateFeedback } from "../validators/feedbackValidator";
import { ValidationError } from "../errors/ValidationError";
import { NextFunction } from "express";

export const submitFeedback = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, message } = validateFeedback(req.body);

        await createGitHubIssue(name, message);

        return res.status(201).json({
            message: "Feedback submitted successfully.",
        });

    } catch (error) {
    next(error);
    }
};