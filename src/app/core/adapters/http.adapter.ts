import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { PlatformHelper } from '../helpers/platform.helper';
import {
  HttpRequestOptions,
  HttpResponse,
  HttpError,
} from '../interfaces/http.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpAdapter {
  // Signals for reactive state management
  private readonly _baseUrl = signal(environment.apiUrl);
  private readonly _isOnline = signal(navigator.onLine);
  private readonly _pendingRequests = signal(0);

  // Computed signals
  readonly baseUrl = this._baseUrl.asReadonly();
  readonly isOnline = this._isOnline.asReadonly();
  readonly pendingRequests = this._pendingRequests.asReadonly();
  readonly hasPendingRequests = computed(() => this._pendingRequests() > 0);

  constructor(private http: HttpClient) {
    // Listen for online/offline events
    window.addEventListener('online', () => this._isOnline.set(true));
    window.addEventListener('offline', () => this._isOnline.set(false));
  }

  /**
   * Make HTTP request using the appropriate method based on platform
   */
  request<T = any>(options: HttpRequestOptions): Observable<HttpResponse<T>> {
    this._pendingRequests.update((count) => count + 1);

    const request$ = PlatformHelper.isWeb()
      ? this.webRequest<T>(options)
      : this.mobileRequest<T>(options);

    return request$.pipe(
      map((response) => {
        this._pendingRequests.update((count) => count - 1);
        return response;
      }),
      catchError((error) => {
        this._pendingRequests.update((count) => count - 1);
        return throwError(() => error);
      })
    );
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
    let url = path.startsWith('http') ? path : `${this._baseUrl()}${path}`;

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
