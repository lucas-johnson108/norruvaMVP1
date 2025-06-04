
"use client";
import Link from 'next/link';
import { LayoutDashboard, Layers, ShoppingCart, BookOpen } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation'; // Removed useParams
import { cn } from '@/lib/utils';
// Removed Locale import

const NorruvaLogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("h-7 w-7", className)}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M32 4C16.4317 4 4 16.4317 4 32C4 47.5683 16.4317 60 32 60C47.5683 60 60 47.5683 60 32C60 26.2437 58.1179 20.9291 54.8819 16.5M32 4L16.5 54.8819C20.9291 58.1179 26.2437 60 32 60C37.7563 60 43.0709 58.1179 47.5 54.8819L32 4Z"
      stroke="hsl(var(--primary))"
      strokeWidth="3"
    />
    <path
      d="M32 12L19.65 32L32 52L44.35 32L32 12Z"
      fill="hsl(var(--accent))"
      stroke="hsl(var(--accent-foreground))"
      strokeWidth="1.5"
    />
    <circle cx="32" cy="32" r="6" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
  </svg>
);

export default function AppHeader() {
  const pathname = usePathname();
  // Removed params and locale

  const navItems = [
    { href: `/product/prod_mfg_001`, label: 'Sample DPP', icon: BookOpen }, // Reverted link
    { href: '/dashboard', label: 'Partner Dashboard', icon: LayoutDashboard }, 
    { href: '/studio', label: 'Dev Portal', icon: Layers }, 
    { href: '/api-docs', label: 'API Docs', icon: Layers }, 
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/`} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors" aria-label="Go to Norruva Homepage"> {/* Reverted link */}
          <NorruvaLogoIcon />
          <span className="text-2xl font-space-grotesk font-semibold text-foreground">Norruva</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button key={item.href} variant="ghost" asChild
              className={cn(
                "text-sm text-foreground hover:bg-muted hover:text-primary",
                pathname === item.href && "bg-secondary text-primary font-semibold"
              )}
            >
              <Link href={item.href} className="flex items-center gap-2 px-3 py-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
