export const BREAKPOINTS = {
  sm: 640,    // Small phones
  md: 768,    // Large phones, small tablets
  lg: 1024,   // Tablets, small laptops
  xl: 1280,   // Desktops
  '2xl': 1536 // Large desktops
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
