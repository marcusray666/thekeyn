import React, { useEffect, useState } from "react";

/**
 * Custom hook for managing mobile bottom navigation visibility based on scroll behavior and modal state
 * Shows navigation when scrolling up, hides when scrolling down or when modals are open
 */
export function useScrollNavigation() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if any modals/dialogs are open by looking for Radix dialog overlays
      const hasOpenModal = document.querySelector('[data-radix-dialog-overlay]') !== null;
      
      // Hide navigation if modal is open
      if (hasOpenModal) {
        setIsVisible(false);
        return;
      }
      
      // Always show nav at the top of the page
      if (currentScrollY < 50) {
        setIsVisible(true);
      }
      // Show nav when scrolling up, hide when scrolling down past threshold
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Also listen for DOM mutations to detect modal state changes
    const handleModalToggle = () => {
      const hasOpenModal = document.querySelector('[data-radix-dialog-overlay]') !== null;
      if (hasOpenModal) {
        setIsVisible(false);
      } else {
        // When modal closes, use current scroll position to determine visibility
        const currentScrollY = window.scrollY;
        setIsVisible(currentScrollY < 100);
      }
    };

    const throttledScroll = throttle(handleScroll, 16); // ~60fps
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Listen for mutations to detect when modals are opened/closed
    const observer = new MutationObserver(handleModalToggle);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state']
    });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      observer.disconnect();
    };
  }, [lastScrollY]);

  return { isVisible };
}

// Simple throttle function to improve performance
function throttle(func: (...args: any[]) => void, limit: number) {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}