export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = "INTERNAL_ERROR",
        isOperational: boolean = true,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}

// Predefined error classes for common scenarios
export class ValidationError extends AppError {
    constructor(message: string = "Validation failed") {
        super(message, 400, "VALIDATION_ERROR");
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401, "UNAUTHORIZED");
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, 403, "FORBIDDEN");
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, 404, "NOT_FOUND");
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Resource already exists") {
        super(message, 409, "CONFLICT");
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = "Internal server error") {
        super(message, 500, "INTERNAL_SERVER_ERROR");
    }
}

// Monitor specific errors
export class MonitorExistsError extends AppError {
    constructor(message: string = "Monitor already exists") {
        super(message, 409, "MONITOR_EXISTS");
    }
}

export class MonitorNotFoundError extends AppError {
    constructor(message: string = "Monitor not found") {
        super(message, 404, "MONITOR_NOT_FOUND");
    }
}

export class UserExistsError extends AppError {
    constructor(message: string = "User already exists") {
        super(message, 409, "USER_EXISTS");
    }
}

export class UserNotFoundError extends AppError {
    constructor(message: string = "User not found") {
        super(message, 404, "USER_NOT_FOUND");
    }
}

