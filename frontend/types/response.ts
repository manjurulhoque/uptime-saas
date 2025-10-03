// Common API response types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Loading states
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

// Error handling
export interface ApiError {
    status: number;
    data: {
        success: boolean;
        message: string;
        error?: string;
    };
}

// Query parameters
export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: Record<string, any>;
}

// File upload types
export interface FileUploadResponse {
    success: boolean;
    message: string;
    data: {
        url: string;
        filename: string;
        size: number;
        mime_type: string;
    };
}

// Notification types
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

// Form validation
export interface ValidationError {
    field: string;
    message: string;
}

export interface FormErrors {
    [key: string]: string;
} 