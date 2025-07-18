import { useState, useEffect } from 'react';
import { capacitor } from '@/lib/capacitor';

export interface DeviceInfo {
  platform: string;
  model: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  webViewVersion: string;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeCapacitor = async () => {
      try {
        setIsNative(capacitor.isNative());
        
        if (capacitor.isNative()) {
          await capacitor.initializeApp();
          
          const info = await capacitor.getDeviceInfo();
          setDeviceInfo(info);
          
          const status = await capacitor.getNetworkStatus();
          setNetworkStatus(status);
          
          // Register for push notifications
          await capacitor.registerForPushNotifications();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Capacitor:', error);
        setIsInitialized(true);
      }
    };

    initializeCapacitor();
  }, []);

  const takePicture = async (): Promise<string | null> => {
    await capacitor.lightHaptic();
    return await capacitor.takePicture();
  };

  const selectFromGallery = async (): Promise<string | null> => {
    await capacitor.lightHaptic();
    return await capacitor.selectFromGallery();
  };

  const shareContent = async (title: string, text: string, url?: string): Promise<boolean> => {
    await capacitor.lightHaptic();
    return await capacitor.shareContent(title, text, url);
  };

  const saveFile = async (fileName: string, data: string): Promise<boolean> => {
    await capacitor.mediumHaptic();
    return await capacitor.saveFile(fileName, data);
  };

  const showNotification = async (title: string, body: string, delayInSeconds?: number): Promise<void> => {
    await capacitor.scheduleLocalNotification(title, body, delayInSeconds);
  };

  const hapticFeedback = {
    light: () => capacitor.lightHaptic(),
    medium: () => capacitor.mediumHaptic(),
    heavy: () => capacitor.heavyHaptic(),
  };

  return {
    isNative,
    isAndroid: capacitor.isAndroid(),
    isIOS: capacitor.isIOS(),
    deviceInfo,
    networkStatus,
    isInitialized,
    takePicture,
    selectFromGallery,
    shareContent,
    saveFile,
    showNotification,
    hapticFeedback,
  };
}