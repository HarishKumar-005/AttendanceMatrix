export type ApiResponse<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: {
        code: string;
        message: string;
        fields?: Record<string, string>;
    };
};
export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}
