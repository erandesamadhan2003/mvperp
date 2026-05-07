export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
}

export interface PaginationConfig {
    defaultPageSize?: number;
    pageSizeOption?: number[];
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}