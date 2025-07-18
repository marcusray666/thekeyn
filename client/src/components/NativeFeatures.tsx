import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCapacitor } from '@/hooks/useCapacitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Share, 
  Smartphone, 
  Wifi, 
  Bell, 
  Vibrate, 
  Save,
  Download,
  Images,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function NativeFeatures() {
  const { 
    isNative, 
    isAndroid, 
    isIOS, 
    deviceInfo, 
    networkStatus,
    isInitialized,
    takePicture,
    selectFromGallery,
    shareContent,
    saveFile,
    showNotification,
    hapticFeedback
  } = useCapacitor();
  
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleTakePicture = async () => {
    setIsLoading(true);
    try {
      const imageData = await takePicture();
      if (imageData) {
        setCapturedImage(imageData);
        await hapticFeedback.medium();
        toast({
          title: "Photo captured!",
          description: "Your photo has been successfully captured.",
        });
      } else {
        toast({
          title: "Camera unavailable",
          description: "Unable to access the camera.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera error",
        description: "Failed to capture photo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromGallery = async () => {
    setIsLoading(true);
    try {
      const imageData = await selectFromGallery();
      if (imageData) {
        setCapturedImage(imageData);
        await hapticFeedback.medium();
        toast({
          title: "Photo selected!",
          description: "Your photo has been successfully selected.",
        });
      } else {
        toast({
          title: "Gallery unavailable",
          description: "Unable to access the photo gallery.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Gallery error:', error);
      toast({
        title: "Gallery error",
        description: "Failed to select photo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    await hapticFeedback.light();
    const success = await shareContent(
      "Check out Loggin'!",
      "I'm using Loggin' to protect my digital artwork with blockchain certificates. Join me!",
      "https://loggin.app"
    );
    
    if (success) {
      toast({
        title: "Shared successfully!",
        description: "Thanks for sharing Loggin' with others.",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Unable to share content.",
        variant: "destructive",
      });
    }
  };

  const handleSaveFile = async () => {
    await hapticFeedback.medium();
    const success = await saveFile('loggin-test.txt', 'This is a test file from Loggin\' app!');
    
    if (success) {
      toast({
        title: "File saved!",
        description: "Test file saved to device storage.",
      });
    } else {
      toast({
        title: "Save failed",
        description: "Unable to save file.",
        variant: "destructive",
      });
    }
  };

  const handleNotification = async () => {
    await hapticFeedback.light();
    await showNotification(
      "Loggin' Notification",
      "This is a test notification from your Loggin' app!",
      3 // Show in 3 seconds
    );
    
    toast({
      title: "Notification scheduled!",
      description: "You'll receive a notification in 3 seconds.",
    });
  };

  const handleHapticTest = async () => {
    await hapticFeedback.light();
    setTimeout(() => hapticFeedback.medium(), 300);
    setTimeout(() => hapticFeedback.heavy(), 600);
    
    toast({
      title: "Haptic feedback test",
      description: "You should feel three different vibration patterns.",
    });
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing native features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Platform Information
          </CardTitle>
          <CardDescription>
            Your app is running on {isNative ? 'a native mobile device' : 'the web'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge variant={isNative ? "default" : "secondary"}>
              {isNative ? 'Native App' : 'Web App'}
            </Badge>
            {isAndroid && <Badge variant="outline">Android</Badge>}
            {isIOS && <Badge variant="outline">iOS</Badge>}
          </div>
          
          {deviceInfo && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Model:</p>
                <p className="text-gray-400">{deviceInfo.model}</p>
              </div>
              <div>
                <p className="font-medium">OS:</p>
                <p className="text-gray-400">{deviceInfo.operatingSystem} {deviceInfo.osVersion}</p>
              </div>
            </div>
          )}
          
          {networkStatus && (
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">
                Network: {networkStatus.connected ? 'Connected' : 'Disconnected'}
                {networkStatus.connected && (
                  <span className="text-gray-400 ml-1">({networkStatus.connectionType})</span>
                )}
              </span>
              {networkStatus.connected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Features */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Features
          </CardTitle>
          <CardDescription>
            Capture and select photos using native camera features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleTakePicture}
              disabled={isLoading || !isNative}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            <Button 
              onClick={handleSelectFromGallery}
              disabled={isLoading || !isNative}
              variant="outline"
              className="flex-1"
            >
              <Images className="h-4 w-4 mr-2" />
              Select Photo
            </Button>
          </div>
          
          {capturedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4"
            >
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Native Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Native Actions</CardTitle>
          <CardDescription>
            Test native device capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleShare}
              disabled={!isNative}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share className="h-4 w-4" />
              Share App
            </Button>
            
            <Button 
              onClick={handleSaveFile}
              disabled={!isNative}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save File
            </Button>
            
            <Button 
              onClick={handleNotification}
              disabled={!isNative}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Test Notification
            </Button>
            
            <Button 
              onClick={handleHapticTest}
              disabled={!isNative}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Vibrate className="h-4 w-4" />
              Haptic Test
            </Button>
          </div>
          
          {!isNative && (
            <p className="text-sm text-gray-500 text-center">
              Native features are only available in the mobile app
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}