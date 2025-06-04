// src/components/landing/norruva-logo-icon.tsx
import { cn } from '@/lib/utils';

export const NorruvaLogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("h-8 w-8", className)} // Default size, can be overridden by className
    viewBox="0 0 100 100" // Adjusted viewBox for more detail
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Norruva Logo"
  >
    <defs>
      <linearGradient id="norruvaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        {/* Using theme colors for the gradient */}
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} /> {/* Teal/Blueish from theme */}
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} /> {/* Soft Green from theme */}
      </linearGradient>
    </defs>
    {/* Main rounded rectangle body, slightly skewed - approximation */}
    <path
      d="M20 10 Q10 10 10 20 L10 80 Q10 90 20 90 L70 90 Q80 90 90 80 L90 30 Q90 20 80 10 L20 10 Z"
      transform="skewX(-10) translate(5,0)" // Slight skew and adjustment
      fill="url(#norruvaGradient)"
    />
    {/* White stripes - simplified representation */}
    <path
      d="M30 15 L85 15 L75 25 L20 25 Z"
      fill="hsl(var(--primary-foreground))" // Using primary-foreground for white
      transform="skewX(-10) translate(5,0)"
    />
    <path
      d="M25 40 L90 40 L80 50 L15 50 Z"
      fill="hsl(var(--primary-foreground))"
      transform="skewX(-10) translate(5,0)"
    />
    <path
      d="M20 65 L85 65 L75 75 L10 75 Z"
      fill="hsl(var(--primary-foreground))"
      transform="skewX(-10) translate(5,0)"
    />
    {/* Bottom right cutout - simplified */}
     <path
      d="M90 80 Q80 90 70 90 L65 90 Q70 85 75 80 Z" // Simplified corner cutout shape
      fill="hsl(var(--background))" // Use background to simulate cutout
      transform="skewX(-10) translate(5,0)"
    />
    {/* Small detail at the bottom right (simplified) */}
    <circle cx="78" cy="78" r="5" fill="url(#norruvaGradient)" transform="skewX(-10) translate(5,0)" />
  </svg>
);
