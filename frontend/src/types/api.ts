export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
}

export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BulkOperationResult {
  successful: number;
  failed: number;
  errors: string[];
}