
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User, Settings, LogOut, KeyRound, Briefcase, HelpCircle, Menu, X, UserCircle as UserCircleIcon, Home, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MockUser, UserRole } from '@/app/dashboard/page.tsx';

// Norruva Logo (SVG adapted from sidebar - kept here if needed for other parts, but not used in header directly anymore)
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
      strokeWidth="3.5"
    />
    <path
      d="M32 12L19.65 32L32 52L44.35 32L32 12Z"
      fill="hsl(var(--accent))"
      stroke="hsl(var(--accent-foreground))"
      strokeWidth="2"
    />
    <circle cx="32" cy="32" r="5.5" fill="hsl(var(--primary-foreground))" stroke="hsl(var(--primary))" strokeWidth="2"/>
  </svg>
);

const defaultFallbackUser: MockUser & { avatarUrl?: string } = {
  id: 'fallback-user-id',
  name: 'Partner User',
  email: 'partner@example.com',
  role: 'manufacturer' as UserRole,
  availableRoles: ['manufacturer', 'supplier', 'recycler', 'verifier', 'retailer'],
  companyName: 'Your Organization',
  companyId: 'fallback-company-id',
  avatarUrl: '',
};

const allPossibleRolesForSwitcher: { value: UserRole; label: string }[] = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'recycler', label: 'Recycler' },
  { value: 'verifier', label: 'Verifier/Auditor' },
  { value: 'retailer', label: 'Retailer' },
];
const mockUsersForSwitcher: Record<UserRole, MockUser> = {
  manufacturer: { id: 'user-mfg-001', name: 'Alice Manufacturer', email: 'alice@greentech.com', role: 'manufacturer', availableRoles: allPossibleRolesForSwitcher.map(r=>r.value), companyName: 'GreenTech Innovations', companyId: 'gt-001' },
  supplier: { id: 'user-sup-001', name: 'Bob Supplier', email: 'bob@supplyco.com', role: 'supplier', availableRoles: allPossibleRolesForSwitcher.map(r=>r.value), companyName: 'SupplyCo Parts', companyId: 'sc-002' },
  recycler: { id: 'user-rec-001', name: 'Charlie Recycler', email: 'charlie@ecorecycle.com', role: 'recycler', availableRoles: allPossibleRolesForSwitcher.map(r=>r.value), companyName: 'EcoRecycle Solutions', companyId: 'er-003' },
  verifier: { id: 'user-ver-001', name: 'Diana Verifier', email: 'diana@certify.org', role: 'verifier', availableRoles: allPossibleRolesForSwitcher.map(r=>r.value), companyName: 'Global Certify Org', companyId: 'gc-004' },
  retailer: { id: 'user-ret-001', name: 'Eve Retailer', email: 'eve@shopgreen.com', role: 'retailer', availableRoles: allPossibleRolesForSwitcher.map(r=>r.value), companyName: 'ShopGreen Retail', companyId: 'sg-005' },
};


export default function DashboardHeader() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser>(defaultFallbackUser);
  const [hasMounted, setHasMounted] = useState(false);

  const updateUserStateFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUserJson = sessionStorage.getItem('currentMockUser');
        if (storedUserJson) {
          const parsedUser = JSON.parse(storedUserJson) as MockUser;
          const validRoles: UserRole[] = ['manufacturer', 'supplier', 'recycler', 'verifier', 'retailer'];
          const lowerCaseRole = parsedUser.role?.toLowerCase() as UserRole;
          parsedUser.role = validRoles.includes(lowerCaseRole) ? lowerCaseRole : 'manufacturer';
          if (!parsedUser.availableRoles || parsedUser.availableRoles.length === 0) {
            parsedUser.availableRoles = allPossibleRolesForSwitcher.map(r => r.value);
          }
          setCurrentUser(parsedUser);
        } else {
          setCurrentUser(defaultFallbackUser);
          sessionStorage.setItem('currentMockUser', JSON.stringify(defaultFallbackUser));
        }
      } catch (e) {
        console.error("Could not parse mock user from session storage in Header:", e);
        setCurrentUser(defaultFallbackUser);
      }
    }
  }, []);

  useEffect(() => {
    setHasMounted(true);
    updateUserStateFromStorage(); 
    window.addEventListener('sessionStorageMockUserChanged', updateUserStateFromStorage);
    return () => {
      window.removeEventListener('sessionStorageMockUserChanged', updateUserStateFromStorage);
    };
  }, [updateUserStateFromStorage]);


  const dashboardTitle = currentUser.role
    ? `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard`
    : "Partner Dashboard";

  const userNameToDisplay = currentUser.name || "Partner User";
  const userRoleToDisplay = currentUser.role || "manufacturer";
  const userCompanyToDisplay = currentUser.companyName || "Your Organization";
  const initials = userNameToDisplay?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'P';

  const handleSignOut = () => {
    console.log("User signed out (placeholder)");
    alert("Sign out clicked (Placeholder - this would redirect to login page)");
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentMockUser');
      setCurrentUser(defaultFallbackUser);
      window.dispatchEvent(new Event('sessionStorageMockUserChanged')); 
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    const newUserForRole = mockUsersForSwitcher[newRole] || defaultFallbackUser;
    const userToStore = {
      ...newUserForRole,
      availableRoles: newUserForRole.availableRoles && newUserForRole.availableRoles.length > 0 
                      ? newUserForRole.availableRoles 
                      : allPossibleRolesForSwitcher.map(r => r.value)
    };
    sessionStorage.setItem('currentMockUser', JSON.stringify(userToStore));
    window.dispatchEvent(new Event('sessionStorageMockUserChanged'));
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
    document.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
  };

  const rolesForSwitcher = currentUser.availableRoles
    ? allPossibleRolesForSwitcher.filter(role => currentUser.availableRoles?.includes(role.value))
    : allPossibleRolesForSwitcher;


  return (
    <header className="bg-card border-b border-border sticky top-0 z-30 h-[72px] flex items-center px-4 sm:px-6 justify-between shadow-lg">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-primary hover:bg-muted/50"
          onClick={toggleMobileNav}
          aria-label="Toggle navigation menu"
        >
          {mobileNavOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
        </Button>

        <Link href="/dashboard" className="flex items-center gap-2.5 group" aria-label="Go to Dashboard Overview">
          {/* NorruvaLogoIcon removed from here */}
          <span className="text-xl md:text-2xl font-space-grotesk font-bold text-foreground group-hover:text-primary transition-colors">
            {hasMounted ? dashboardTitle : "Loading..."}
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {hasMounted && rolesForSwitcher.length > 1 && (
          <div className="flex items-center gap-2 border-l border-border pl-3 sm:pl-4">
            <Label htmlFor="header-role-select" className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden md:inline">
              Viewing As:
            </Label>
            <Select value={currentUser.role} onValueChange={(value) => handleRoleChange(value as UserRole)}>
              <SelectTrigger
                id="header-role-select"
                className="h-9 text-xs bg-card border-input text-foreground focus:ring-primary w-auto sm:w-[150px] md:w-[180px]"
                aria-label="Switch dashboard view by role"
              >
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                {rolesForSwitcher.map((role) => (
                  <SelectItem key={role.value} value={role.value} className="text-xs capitalize">
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="text-right">
          {hasMounted ? (
            <>
              <p className="text-sm font-semibold text-foreground leading-tight">{userNameToDisplay}</p>
              <p className="text-xs text-muted-foreground capitalize leading-tight">
                {userRoleToDisplay} <span className="text-muted-foreground/70">@</span> {userCompanyToDisplay.length > 20 ? userCompanyToDisplay.substring(0,18) + '…' : userCompanyToDisplay}
              </p>
            </>
          ) : (
            <>
              <div className="animate-pulse bg-muted rounded w-24 h-4 mb-1"></div>
              <div className="animate-pulse bg-muted rounded w-32 h-3"></div>
            </>
          )}
        </div>
        <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" aria-label="User menu">
              {(currentUser as any).avatarUrl ? (
                <Image
                    src={(currentUser as any).avatarUrl}
                    alt={hasMounted ? (userNameToDisplay || "User Avatar") : "Loading user avatar"}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-border h-9 w-9"
                    data-ai-hint="user avatar"
                />
              ) : (
                 <div className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 border-border",
                    userRoleToDisplay === 'manufacturer' ? "bg-primary/20 text-primary border-primary/40" :
                    userRoleToDisplay === 'verifier' ? "bg-purple-500/20 text-purple-700 border-purple-500/40" :
                    "bg-accent/20 text-accent border-accent/40"
                )}>
                    {initials}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 shadow-xl border-border" align="end" forceMount>
            <DropdownMenuLabel className="font-normal py-2.5 px-3">
              {hasMounted ? (
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold leading-none text-foreground">{userNameToDisplay}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email || 'N/A'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize pt-0.5">
                    Role: {userRoleToDisplay}
                  </p>
                   <p className="text-xs leading-none text-muted-foreground">
                    Company: {userCompanyToDisplay}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="animate-pulse bg-muted rounded w-20 h-4 mb-1"></div>
                  <div className="animate-pulse bg-muted rounded w-28 h-3"></div>
                </div>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted/50">
              <Link href="/dashboard/settings" className="flex items-center text-sm py-2">
                <UserCircleIcon className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted/50">
              <Link href="/dashboard/settings" className="flex items-center text-sm py-2">
                <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted/50">
              <Link href="/dashboard/integrations" className="flex items-center text-sm py-2">
                <KeyRound className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span>API & Integrations</span>
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => alert("Manage Company clicked (Placeholder)")} className="flex items-center text-sm cursor-pointer hover:bg-muted/50 py-2">
                <Briefcase className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span>Manage Company</span>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => alert("Help & Support clicked (Placeholder)")} className="flex items-center text-sm cursor-pointer hover:bg-muted/50 py-2">
                <HelpCircle className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-destructive focus:text-destructive focus:bg-destructive/10 text-sm cursor-pointer py-2">
              <LogOut className="mr-2.5 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
