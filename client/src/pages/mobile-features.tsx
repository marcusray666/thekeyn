import { motion } from 'framer-motion';
import { NativeFeatures } from '@/components/NativeFeatures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, AppWindow, Zap } from 'lucide-react';

export default function MobileFeatures() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 pt-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 gradient-text">
              Native Mobile App
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience Loggin' as a native iOS and Android app with enhanced features
            </p>
            
            <div className="flex justify-center gap-4 mb-8">
              <Badge variant="outline" className="px-4 py-2">
                <AppWindow className="h-4 w-4 mr-2" />
                PWA Ready
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Smartphone className="h-4 w-4 mr-2" />
                Native Features
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Capacitor Powered
              </Badge>
            </div>
          </motion.div>

          {/* App Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Mobile App Features
                </CardTitle>
                <CardDescription>
                  Your Loggin' app now includes native mobile capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">iOS App Store</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Native iOS interface with system integration</li>
                      <li>• Camera access for artwork capture</li>
                      <li>• Push notifications for community updates</li>
                      <li>• Haptic feedback for enhanced UX</li>
                      <li>• File system access for certificate storage</li>
                      <li>• Share sheet integration</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Google Play Store</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Material Design components</li>
                      <li>• Android camera and gallery access</li>
                      <li>• Local notifications and alerts</li>
                      <li>• Vibration patterns for feedback</li>
                      <li>• External storage for large files</li>
                      <li>• Android share intents</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Native Features Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <NativeFeatures />
          </motion.div>

          {/* Build Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Build & Deploy</CardTitle>
                <CardDescription>
                  How to build and deploy your native mobile apps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Build Commands:</h4>
                  <div className="font-mono text-sm text-gray-300 space-y-1">
                    <p># Build the web app</p>
                    <p className="text-purple-400">npm run build</p>
                    <p></p>
                    <p># Sync with native projects</p>
                    <p className="text-purple-400">npx cap sync</p>
                    <p></p>
                    <p># Open in Xcode (iOS)</p>
                    <p className="text-purple-400">npx cap open ios</p>
                    <p></p>
                    <p># Open in Android Studio</p>
                    <p className="text-purple-400">npx cap open android</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">iOS Deployment:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>1. Open project in Xcode</li>
                      <li>2. Configure signing & capabilities</li>
                      <li>3. Set up App Store Connect</li>
                      <li>4. Archive and upload to App Store</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Android Deployment:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>1. Open project in Android Studio</li>
                      <li>2. Generate signed APK/AAB</li>
                      <li>3. Set up Google Play Console</li>
                      <li>4. Upload to Play Store</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}