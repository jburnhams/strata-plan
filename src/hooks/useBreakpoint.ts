import { useState, useEffect } from 'react';
import { BREAKPOINTS, Breakpoint } from '../styles/breakpoints';

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint | 'xs'; // 'xs' for < 640px
}

export function useBreakpoint(): BreakpointState {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < BREAKPOINTS.md; // < 768px
  const isTablet = windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg; // 768px - 1023px
  const isDesktop = windowWidth >= BREAKPOINTS.lg; // >= 1024px

  let breakpoint: Breakpoint | 'xs' = 'xs';
  if (windowWidth >= BREAKPOINTS['2xl']) breakpoint = '2xl';
  else if (windowWidth >= BREAKPOINTS.xl) breakpoint = 'xl';
  else if (windowWidth >= BREAKPOINTS.lg) breakpoint = 'lg';
  else if (windowWidth >= BREAKPOINTS.md) breakpoint = 'md';
  else if (windowWidth >= BREAKPOINTS.sm) breakpoint = 'sm';

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
  };
}
