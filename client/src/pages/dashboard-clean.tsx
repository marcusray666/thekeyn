import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Shield, FileText, CheckCircle, Settings } from "lucide-react";

export default function DashboardClean() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.username}
            </h1>
            <p className="text-muted-foreground">
              Protect and manage your creative works
            </p>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/protect" className="block">
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">🔒 Protect New Work</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and secure your creative content
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/studio?tab=certificates" className="block">
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">📄 My Certificates</h3>
                  <p className="text-sm text-muted-foreground">
                    View and download your protection certificates
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/verify" className="block">
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">🧪 Verify Authenticity</h3>
                  <p className="text-sm text-muted-foreground">
                    Check if content is protected
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity Preview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">Protected "Screen Recording 2025-07-15"</span>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-secondary" />
                  <span className="text-sm">Downloaded certificate #ABC123</span>
                </div>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">Verified blockchain anchor</span>
                </div>
                <span className="text-xs text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}