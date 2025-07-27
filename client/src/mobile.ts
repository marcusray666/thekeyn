import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export class MobileUtils {
  static async initializeMobileFeatures() {
    try {
      // Get device info
      const info = await Device.getInfo();
      console.log('Device:', info);

      // Set status bar style for mobile apps
      if (info.platform === 'ios' || info.platform === 'android') {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#1a1a2e' });
        
        // Hide splash screen after initialization
        setTimeout(() => {
          SplashScreen.hide();
        }, 2000);
      }

      return info;
    } catch (error) {
      console.warn('Mobile features not available:', error);
      return null;
    }
  }

  static async triggerHaptic(style: ImpactStyle = ImpactStyle.Medium) {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      // Haptics not available in web
    }
  }

  static isMobile(): boolean {
    return window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
  }

  static isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  }

  static async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}