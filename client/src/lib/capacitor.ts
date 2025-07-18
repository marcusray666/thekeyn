import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export class CapacitorService {
  private static instance: CapacitorService;
  
  static getInstance(): CapacitorService {
    if (!CapacitorService.instance) {
      CapacitorService.instance = new CapacitorService();
    }
    return CapacitorService.instance;
  }

  // Platform detection
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

  isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  // App lifecycle
  async initializeApp(): Promise<void> {
    if (!this.isNative()) return;

    try {
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#1a1a2e' });

      // Hide splash screen
      await SplashScreen.hide();

      // Request permissions
      await this.requestPermissions();

      // Set up app listeners
      this.setupAppListeners();

      console.log('Capacitor app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Capacitor app:', error);
    }
  }

  private async requestPermissions(): Promise<void> {
    try {
      // Request camera permissions
      await Camera.requestPermissions();
      
      // Request push notification permissions
      await PushNotifications.requestPermissions();
      
      // Request local notification permissions
      await LocalNotifications.requestPermissions();
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  }

  private setupAppListeners(): void {
    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
    });

    // Handle app URL opens
    App.addListener('appUrlOpen', (event) => {
      console.log('App opened with URL:', event.url);
    });

    // Handle back button (Android)
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    // Handle keyboard events
    Keyboard.addListener('keyboardWillShow', (info) => {
      console.log('Keyboard will show with height:', info.keyboardHeight);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      console.log('Keyboard will hide');
    });

    // Handle network changes
    Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed:', status);
    });
  }

  // Camera functionality
  async takePicture(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Failed to take picture:', error);
      return null;
    }
  }

  async selectFromGallery(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Failed to select from gallery:', error);
      return null;
    }
  }

  // File system operations
  async saveFile(fileName: string, data: string): Promise<boolean> {
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: Directory.Documents,
      });
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  }

  async readFile(fileName: string): Promise<string | null> {
    try {
      const result = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
      });
      return result.data as string;
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }

  // Share functionality
  async shareContent(title: string, text: string, url?: string): Promise<boolean> {
    try {
      await Share.share({
        title,
        text,
        url,
      });
      return true;
    } catch (error) {
      console.error('Failed to share content:', error);
      return false;
    }
  }

  // Haptic feedback
  async lightHaptic(): Promise<void> {
    if (this.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        console.error('Failed to trigger haptic:', error);
      }
    }
  }

  async mediumHaptic(): Promise<void> {
    if (this.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        console.error('Failed to trigger haptic:', error);
      }
    }
  }

  async heavyHaptic(): Promise<void> {
    if (this.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        console.error('Failed to trigger haptic:', error);
      }
    }
  }

  // Device information
  async getDeviceInfo(): Promise<any> {
    try {
      const info = await Device.getInfo();
      return info;
    } catch (error) {
      console.error('Failed to get device info:', error);
      return null;
    }
  }

  // Network status
  async getNetworkStatus(): Promise<any> {
    try {
      const status = await Network.getStatus();
      return status;
    } catch (error) {
      console.error('Failed to get network status:', error);
      return null;
    }
  }

  // Push notifications
  async registerForPushNotifications(): Promise<void> {
    try {
      await PushNotifications.register();
      
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token:', token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
      });
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  }

  // Local notifications
  async scheduleLocalNotification(title: string, body: string, delayInSeconds?: number): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: delayInSeconds ? { at: new Date(Date.now() + delayInSeconds * 1000) } : undefined,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
    }
  }
}

// Export singleton instance
export const capacitor = CapacitorService.getInstance();