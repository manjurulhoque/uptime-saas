export const successResponse = (data?: any) => {
    return {
        success: true,
        data,
    };
};

export const errorResponse = (error: string, code?: string) => {
    return {
        success: false,
        data: null,
        error,
        code,
    };
};