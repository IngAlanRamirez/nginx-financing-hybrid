import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOffOutline,
  eyeOutline,
  mailOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonToast,
  ],
})
export class AuthPage implements OnInit {
  // Signals for reactive state management
  private readonly _showPassword = signal(false);
  private readonly _isLoading = signal(false);
  private readonly _showToast = signal(false);
  private readonly _toastMessage = signal('');
  private readonly _toastColor = signal<'success' | 'danger'>('success');

  // Computed signals
  readonly showPassword = this._showPassword.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly showToast = this._showToast.asReadonly();
  readonly toastMessage = this._toastMessage.asReadonly();
  readonly toastColor = this._toastColor.asReadonly();

  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      eyeOffOutline,
      eyeOutline,
      mailOutline,
      lockClosedOutline,
    });

    this.initializeForm();

    // Effect to handle authentication state changes
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnInit() {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword() {
    this._showPassword.update((current) => !current);
  }

  onLogin() {
    if (this.loginForm.valid) {
      this._isLoading.set(true);

      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this._isLoading.set(false);
          if (response.success) {
            this.showSuccessToast('Inicio de sesión exitoso');
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1000);
          } else {
            this.showErrorToast(
              response.message || 'Error en el inicio de sesión'
            );
          }
        },
        error: (error) => {
          this._isLoading.set(false);
          console.error('Login failed:', error);
          this.showErrorToast('Credenciales inválidas');
        },
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private showSuccessToast(message: string) {
    this._toastMessage.set(message);
    this._toastColor.set('success');
    this._showToast.set(true);
  }

  private showErrorToast(message: string) {
    this._toastMessage.set(message);
    this._toastColor.set('danger');
    this._showToast.set(true);
  }

  onToastDismiss() {
    this._showToast.set(false);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Login form getters
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
