import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function AuthGuard(): boolean {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use the signal-based isAuthenticated computed value
  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth']);
  return false;
}
