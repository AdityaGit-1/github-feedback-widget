import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/ValidationError";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (err instanceof ValidationError) {
        return res.status(400).json({
            message: err.message,
        });
    }

    console.error(err);

    return res.status(500).json({
        message: "Internal Server Error",
    });
};