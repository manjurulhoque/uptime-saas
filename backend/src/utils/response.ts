export const successResponse = (data?: any) => {
    return {
        success: true,
        data,
    };
};

export const errorResponse = (message: string, code?: string, errors?: any[]) => {
    return {
        success: false,
        error: message,
        errors,
        code,
    };
};