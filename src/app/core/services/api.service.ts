import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpAdapter } from '../adapters/http.adapter';
import { HttpResponse, ApiResponse } from '../interfaces/http.interface';

// Example interfaces for your API
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpAdapter: HttpAdapter) {}

  /**
   * Example: Login user
   */
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.httpAdapter
      .post<ApiResponse<LoginResponse>>('/auth/login', credentials)
      .pipe(
        map(
          (response: HttpResponse<ApiResponse<LoginResponse>>) => response.data
        )
      );
  }

  /**
   * Example: Get user profile
   */
  getUserProfile(): Observable<ApiResponse<User>> {
    return this.httpAdapter
      .get<ApiResponse<User>>('/auth/profile')
      .pipe(map((response: HttpResponse<ApiResponse<User>>) => response.data));
  }

  /**
   * Example: Update user profile
   */
  updateUserProfile(userData: Partial<User>): Observable<ApiResponse<User>> {
    return this.httpAdapter
      .put<ApiResponse<User>>('/auth/profile', userData)
      .pipe(map((response: HttpResponse<ApiResponse<User>>) => response.data));
  }

  /**
   * Example: Get users with pagination
   */
  getUsers(
    page: number = 1,
    limit: number = 10
  ): Observable<ApiResponse<User[]>> {
    return this.httpAdapter
      .get<ApiResponse<User[]>>('/users', { page, limit })
      .pipe(
        map((response: HttpResponse<ApiResponse<User[]>>) => response.data)
      );
  }

  /**
   * Example: Delete user
   */
  deleteUser(userId: number): Observable<ApiResponse<void>> {
    return this.httpAdapter
      .delete<ApiResponse<void>>(`/users/${userId}`)
      .pipe(map((response: HttpResponse<ApiResponse<void>>) => response.data));
  }
}
