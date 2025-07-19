import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { PlatformHelper } from '../helpers/platform.helper';
import {
  HttpRequestOptions,
  HttpResponse,
  HttpError,
} from '../interfaces/http.interface';

@Injectable({
  providedIn: 'root',
})
export class HttpAdapter {
  private baseUrl = 'http://localhost:3000'; // Cambiar según tu API de NestJS

  constructor(private http: HttpClient) {}

  /**
   * Make HTTP request using the appropriate method based on platform
   */
  request<T = any>(options: HttpRequestOptions): Observable<HttpResponse<T>> {
    if (PlatformHelper.isWeb()) {
      return this.webRequest<T>(options);
    } else {
      return this.mobileRequest<T>(options);
    }
  }

  /**
   * HTTP request for web platform using Angular HttpClient
   */
  private webRequest<T>(
    options: HttpRequestOptions
  ): Observable<HttpResponse<T>> {
    const url = this.buildUrl(options.url, options.params);
    const headers = new HttpHeaders(options.headers);

    let request$: Observable<any>;

    switch (options.method) {
      case 'GET':
        request$ = this.http.get<T>(url, { headers });
        break;
      case 'POST':
        request$ = this.http.post<T>(url, options.data, { headers });
        break;
      case 'PUT':
        request$ = this.http.put<T>(url, options.data, { headers });
        break;
      case 'DELETE':
        request$ = this.http.delete<T>(url, { headers });
        break;
      case 'PATCH':
        request$ = this.http.patch<T>(url, options.data, { headers });
        break;
      default:
        return throwError(
          () => new Error(`Unsupported HTTP method: ${options.method}`)
        );
    }

    return request$.pipe(
      map((data) => ({
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        url,
      })),
      catchError((error) => this.handleError(error, url))
    );
  }

  /**
   * HTTP request for mobile platform using native fetch
   */
  private mobileRequest<T>(
    options: HttpRequestOptions
  ): Observable<HttpResponse<T>> {
    const url = this.buildUrl(options.url, options.params);

    const fetchOptions: RequestInit = {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      fetchOptions.body = JSON.stringify(options.data);
    }

    if (options.timeout) {
      fetchOptions.signal = AbortSignal.timeout(options.timeout);
    }

    return from(fetch(url, fetchOptions)).pipe(
      switchMap((response) => this.handleFetchResponse<T>(response)),
      catchError((error) => this.handleError(error, url))
    );
  }

  /**
   * Handle fetch response and convert to our standard format
   */
  private handleFetchResponse<T>(
    response: Response
  ): Observable<HttpResponse<T>> {
    return from(response.json()).pipe(
      map((data) => ({
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.convertHeadersToObject(response.headers),
        url: response.url,
      }))
    );
  }

  /**
   * Convert Headers object to plain object
   */
  private convertHeadersToObject(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Build full URL with base URL and query parameters
   */
  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean>
  ): string {
    let url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    return url;
  }

  /**
   * Handle HTTP errors consistently
   */
  private handleError(error: any, url: string): Observable<never> {
    const httpError: HttpError = {
      message: error.message || 'An error occurred',
      status: error.status,
      statusText: error.statusText,
      url,
      data: error.error,
    };

    return throwError(() => httpError);
  }

  // Convenience methods
  get<T = any>(
    url: string,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>
  ): Observable<HttpResponse<T>> {
    return this.request<T>({ method: 'GET', url, params, headers });
  }

  post<T = any>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Observable<HttpResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, headers });
  }

  put<T = any>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Observable<HttpResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data, headers });
  }

  delete<T = any>(
    url: string,
    headers?: Record<string, string>
  ): Observable<HttpResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, headers });
  }

  patch<T = any>(
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Observable<HttpResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data, headers });
  }
}
