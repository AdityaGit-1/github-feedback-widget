import { ValidationError } from "../errors/ValidationError";

export const validateFeedback = (body: any) => {
    let { name, message } = body;

    if (!name || !message) {
        throw new ValidationError("Both name and message are required.");
    }

    if (typeof name !== "string" || typeof message !== "string") {
        throw new ValidationError("Name and message must be strings.");
    }

    name = name.trim();
    message = message.trim();

    if (name.length === 0 || message.length === 0) {
        throw new ValidationError("Name and message cannot be empty.");
    }

    if (name.length < 2 || name.length > 50) {
        throw new ValidationError("Name must be between 2 and 50 characters.");
    }

    if (message.length < 10 || message.length > 500) {
        throw new ValidationError("Message must be between 10 and 500 characters.");
    }

    return { name, message };
};