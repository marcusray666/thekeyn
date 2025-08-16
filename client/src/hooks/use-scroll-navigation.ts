import { useEffect, useState } from "react";

/**
 * Custom hook for managing mobile bottom navigation visibility based on scroll behavior and modal state
 * Shows navigation when scrolling up, hides when scrolling down or when modals are open
 */
export function useScrollNavigation() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide navigation if modal is open
      if (modalOpen) {
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

    const throttledScroll = throttle(handleScroll, 16); // ~60fps
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [lastScrollY, modalOpen]);

  // Separate effect for modal state changes
  useEffect(() => {
    const handleModalStateChange = (event: CustomEvent) => {
      const { isOpen } = event.detail;
      setModalOpen(isOpen);
      
      if (isOpen) {
        setIsVisible(false);
      } else {
        // When modal closes, use current scroll position to determine visibility
        const currentScrollY = window.scrollY;
        setIsVisible(currentScrollY < 100);
      }
    };

    window.addEventListener('modal-state-change', handleModalStateChange as EventListener);
    
    return () => {
      window.removeEventListener('modal-state-change', handleModalStateChange as EventListener);
    };
  }, []);

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