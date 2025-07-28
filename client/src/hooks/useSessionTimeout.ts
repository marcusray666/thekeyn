import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  checkInterval?: number;
}

export function useSessionTimeout({
  timeoutMinutes = 60, // 1 hour
  warningMinutes = 5, // Warn 5 minutes before timeout
  checkInterval = 60000, // Check every minute
}: UseSessionTimeoutOptions = {}) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const checkIntervalIdRef = useRef<NodeJS.Timeout>();

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all query cache
      queryClient.clear();
      
      toast({
        title: "Session Expired",
        description: "You've been logged out due to inactivity.",
        variant: "destructive",
      });
      
      setLocation('/login');
    }
  }, [setLocation, toast]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      toast({
        title: "Session Expiring Soon",
        description: `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
        variant: "default",
      });
    }
  }, [warningMinutes, toast]);

  const checkActivity = useCallback(async () => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    if (timeSinceActivity >= timeoutMs) {
      // Session expired - logout
      logout();
    } else if (timeSinceActivity >= warningMs && !warningShownRef.current) {
      // Show warning
      showWarning();
    } else if (timeSinceActivity < warningMs) {
      // Send heartbeat to keep session alive
      try {
        await fetch('/api/auth/heartbeat', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }
  }, [timeoutMinutes, warningMinutes, logout, showWarning]);

  useEffect(() => {
    // Activity event listeners
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Start activity checking interval
    checkIntervalIdRef.current = setInterval(checkActivity, checkInterval);

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (checkIntervalIdRef.current) {
        clearInterval(checkIntervalIdRef.current);
      }
      
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [updateActivity, checkActivity, checkInterval]);

  // Handle page visibility change (when user closes laptop/switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - record current time
        lastActivityRef.current = Date.now();
      } else {
        // Page is visible again - check if session should expire
        checkActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkActivity]);

  return {
    updateActivity,
    logout,
  };
}