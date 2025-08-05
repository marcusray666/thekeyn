import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function RegisterClean() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Welcome to Loggin'!",
      });
      
      // Check if user was trying to upload before registration
      const pendingUpload = localStorage.getItem('pendingUpload');
      if (pendingUpload) {
        setLocation('/authenticated-upload');
      } else {
        setLocation('/');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Register Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <span className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}