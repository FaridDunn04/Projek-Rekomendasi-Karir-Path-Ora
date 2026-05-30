export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
}

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: Meta | null;
}