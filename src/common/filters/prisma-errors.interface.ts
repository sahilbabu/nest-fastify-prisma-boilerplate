
export interface PrismaErrorDetails {
    code: string;
    message: string;
    httpStatus: number;
    userMessage: string;
    meta?: any;
}

export interface ErrorResponse {
    statusCode: number;
    timestamp: string;
    message: string;
    errors?: Record<string, string[] | undefined>;
    path?: string;
    code?: string;
    details?: any;
}

export interface PrismaErrorResult {
    status: number;
    message: string;
    errors: Record<string, string[] | undefined>;
    code?: string;
    details?: any;
}
