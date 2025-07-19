export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: any;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  url: string;
}

export interface HttpError {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  data?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
