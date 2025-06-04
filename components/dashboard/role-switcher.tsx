
"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { UserCog } from 'lucide-react';
// Removed Card imports as this component is now simplified for header integration

export type UserRole = 'manufacturer' | 'supplier' | 'recycler' | 'verifier' | 'retailer';

interface RoleDefinition {
  value: UserRole;
  label: string;
}

// This list can be used by the header if it needs to populate the select options
export const allPossibleRolesForSelect: RoleDefinition[] = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'recycler', label: 'Recycler' },
  { value: 'verifier', label: 'Verifier/Auditor' },
  { value: 'retailer', label: 'Retailer' },
];

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  availableRoles?: UserRole[]; // Roles the current mock user can switch to
  className?: string;
}

// This component is being simplified as its functionality will be integrated
// directly into the DashboardHeader for a more compact display.
// The props and logic here serve as a reference for what the DashboardHeader needs to implement.
export default function RoleSwitcher({ currentRole, onRoleChange, availableRoles, className }: RoleSwitcherProps) {
  
  const rolesToDisplay = availableRoles
    ? allPossibleRolesForSelect.filter(role => availableRoles.includes(role.value))
    : allPossibleRolesForSelect;

  // If only one role or no roles available for the current user, don't render the switcher.
  if (rolesToDisplay.length <= 1 && availableRoles) {
    return null; 
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Label htmlFor="header-role-select-compact" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        Viewing As:
      </Label>
      <Select value={currentRole} onValueChange={(value) => onRoleChange(value as UserRole)}>
        <SelectTrigger 
          id="header-role-select-compact" 
          className="h-8 text-xs bg-card border-input text-foreground focus:ring-primary w-auto sm:w-[150px] md:w-[180px]"
          aria-label="Switch dashboard view by role"
        >
          <SelectValue placeholder="Select role..." />
        </SelectTrigger>
        <SelectContent>
          {rolesToDisplay.map((role) => (
            <SelectItem key={role.value} value={role.value} className="text-xs capitalize">
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
