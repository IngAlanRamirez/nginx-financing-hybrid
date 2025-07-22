import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  personOutline,
  mailOutline,
  calendarOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService, User } from '../core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonToast,
  ],
})
export class HomePage implements OnInit {
  // Signals for reactive state management
  private readonly _currentUser = signal<User | null>(null);
  private readonly _showToast = signal(false);
  private readonly _toastMessage = signal('');
  private readonly _toastColor = signal<'success' | 'danger'>('success');

  // Computed signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly showToast = this._showToast.asReadonly();
  readonly toastMessage = this._toastMessage.asReadonly();
  readonly toastColor = this._toastColor.asReadonly();

  constructor(private authService: AuthService, private router: Router) {
    addIcons({
      logOutOutline,
      personOutline,
      mailOutline,
      calendarOutline,
    });

    // Effect to sync user data with auth service
    effect(() => {
      const user = this.authService.currentUser();
      this._currentUser.set(user);
    });
  }

  ngOnInit() {
    this._currentUser.set(this.authService.currentUser());
  }

  logout() {
    this.authService.logout();
    this.showSuccessToast('Sesión cerrada exitosamente');
    setTimeout(() => {
      this.router.navigate(['/auth']);
    }, 1000);
  }

  private showSuccessToast(message: string) {
    this._toastMessage.set(message);
    this._toastColor.set('success');
    this._showToast.set(true);
  }

  onToastDismiss() {
    this._showToast.set(false);
  }
}
