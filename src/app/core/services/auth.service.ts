import { Injectable, signal, computed, effect } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpAdapter } from '../adapters/http.adapter';
import { HttpResponse, ApiResponse } from '../interfaces/http.interface';
import {
  User,
  LoginRequest,
  LoginResponse,
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Signals for reactive state management
  private readonly _currentUser = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);

  // Computed signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => {
    return !!this._token() && !!this._currentUser();
  });

  // Legacy observables for backward compatibility
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private httpAdapter: HttpAdapter) {
    this.loadStoredAuth();

    // Effects to sync signals with legacy observables
    effect(() => {
      this.currentUserSubject.next(this._currentUser());
    });

    effect(() => {
      this.tokenSubject.next(this._token());
    });
  }

  /**
   * Login user - connects to /auth/login endpoint
   */
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.httpAdapter
      .post<ApiResponse<LoginResponse>>('/auth/login', credentials)
      .pipe(
        map(
          (response: HttpResponse<ApiResponse<LoginResponse>>) => response.data
        ),
        tap((response) => {
          if (response.success && response.data) {
            this.setAuth(response.data.user, response.data.token);
          }
        })
      );
  }

  /**
   * Get user profile - connects to /auth/profile endpoint
   */
  getProfile(): Observable<ApiResponse<User>> {
    return this.httpAdapter.get<ApiResponse<User>>('/auth/profile').pipe(
      map((response: HttpResponse<ApiResponse<User>>) => response.data),
      tap((response) => {
        if (response.success && response.data) {
          this._currentUser.set(response.data);
          this.storeUser(response.data);
        }
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuth();
  }

  /**
   * Set authentication data
   */
  private setAuth(user: User, token: string): void {
    this._currentUser.set(user);
    this._token.set(token);
    this.storeAuth(user, token);
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    this._currentUser.set(null);
    this._token.set(null);
    this.removeStoredAuth();
  }

  /**
   * Store auth data in localStorage
   */
  private storeAuth(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  }

  /**
   * Store user data in localStorage
   */
  private storeUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Load stored auth data
   */
  private loadStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this._currentUser.set(user);
        this._token.set(storedToken);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        this.removeStoredAuth();
      }
    }
  }

  /**
   * Remove stored auth data
   */
  private removeStoredAuth(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }
}
