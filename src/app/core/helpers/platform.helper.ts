import { Capacitor } from '@capacitor/core';

export class PlatformHelper {
  /**
   * Check if the app is running on a mobile device
   */
  static isMobile(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Check if the app is running on web browser
   */
  static isWeb(): boolean {
    return Capacitor.getPlatform() === 'web';
  }

  /**
   * Check if the app is running on iOS
   */
  static isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  /**
   * Check if the app is running on Android
   */
  static isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

  /**
   * Get the current platform name
   */
  static getPlatform(): string {
    return Capacitor.getPlatform();
  }

  /**
   * Check if the app is running in a browser environment
   */
  static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}
