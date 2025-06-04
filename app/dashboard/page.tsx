
"use client";

import React, { useState, useEffect } from 'react';
// Removed RoleSwitcher import as it's now in the header
import ManufacturerDashboard from '@/components/dashboard/views/manufacturer-dashboard';
import SupplierDashboard from '@/components/dashboard/views/supplier-dashboard';
import RecyclerDashboard from '@/components/dashboard/views/recycler-dashboard';
import VerifierDashboard from '@/components/dashboard/views/verifier-dashboard';
import RetailerDashboard from '@/components/dashboard/views/retailer-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

export type UserRole = 'manufacturer' | 'supplier' | 'recycler' | 'verifier' | 'retailer';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  availableRoles?: UserRole[];
  companyName: string;
  companyId: string;
}

const allDemoRoles: UserRole[] = ['manufacturer', 'supplier', 'recycler', 'verifier', 'retailer'];

const mockUsers: Record<UserRole, MockUser> = {
  manufacturer: { id: 'user-mfg-001', name: 'Alice Manufacturer', email: 'alice@greentech.com', role: 'manufacturer', availableRoles: allDemoRoles, companyName: 'GreenTech Innovations', companyId: 'gt-001' },
  supplier: { id: 'user-sup-001', name: 'Bob Supplier', email: 'bob@supplyco.com', role: 'supplier', availableRoles: allDemoRoles, companyName: 'SupplyCo Parts', companyId: 'sc-002' },
  recycler: { id: 'user-rec-001', name: 'Charlie Recycler', email: 'charlie@ecorecycle.com', role: 'recycler', availableRoles: allDemoRoles, companyName: 'EcoRecycle Solutions', companyId: 'er-003' },
  verifier: { id: 'user-ver-001', name: 'Diana Verifier', email: 'diana@certify.org', role: 'verifier', availableRoles: allDemoRoles, companyName: 'Global Certify Org', companyId: 'gc-004' },
  retailer: { id: 'user-ret-001', name: 'Eve Retailer', email: 'eve@shopgreen.com', role: 'retailer', availableRoles: allDemoRoles, companyName: 'ShopGreen Retail', companyId: 'sg-005' },
};


export default function DashboardHubPage() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('manufacturer');
  const [currentUser, setCurrentUser] = useState<MockUser>(mockUsers.manufacturer);
  const [clientOnly, setClientOnly] = useState(false);

  useEffect(() => {
    setClientOnly(true);
    
    const updateUserFromStorage = () => {
      if (typeof window !== 'undefined') {
          try {
              const storedUserJson = sessionStorage.getItem('currentMockUser');
              if (storedUserJson) {
                  const storedUser = JSON.parse(storedUserJson) as MockUser;
                  if (Object.keys(mockUsers).includes(storedUser.role)) {
                      setCurrentUserRole(storedUser.role);
                      setCurrentUser(storedUser);
                  } else {
                      // If role is invalid, default and update storage
                      const defaultUser = mockUsers.manufacturer;
                      setCurrentUserRole(defaultUser.role);
                      setCurrentUser(defaultUser);
                      sessionStorage.setItem('currentMockUser', JSON.stringify(defaultUser));
                  }
              } else {
                  // No user in storage, set default and save
                  const defaultUser = mockUsers.manufacturer;
                  setCurrentUserRole(defaultUser.role);
                  setCurrentUser(defaultUser);
                  sessionStorage.setItem('currentMockUser', JSON.stringify(defaultUser));
              }
          } catch(e) {
              console.error("Error reading user from session storage:", e);
              const defaultUser = mockUsers.manufacturer;
              setCurrentUserRole(defaultUser.role);
              setCurrentUser(defaultUser);
              sessionStorage.setItem('currentMockUser', JSON.stringify(defaultUser));
          }
      }
    };

    updateUserFromStorage(); // Initial call

    window.addEventListener('sessionStorageMockUserChanged', updateUserFromStorage);
    return () => {
        window.removeEventListener('sessionStorageMockUserChanged', updateUserFromStorage);
    };
  }, []);


  const renderDashboardByRole = () => {
    if (!clientOnly) return (
        <div className="flex flex-col justify-center items-center h-64 text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
            <p className="text-lg">Loading Dashboard...</p>
        </div>
    );

    switch (currentUser.role) { // Use currentUser.role for consistent rendering
      case 'manufacturer':
        return <ManufacturerDashboard user={currentUser} />;
      case 'supplier':
        return <SupplierDashboard user={currentUser} />;
      case 'recycler':
        return <RecyclerDashboard user={currentUser} />;
      case 'verifier':
        return <VerifierDashboard user={currentUser} />;
      case 'retailer':
        return <RetailerDashboard user={currentUser} />;
      default:
        return (
            <Card className="shadow-lg">
                <CardHeader><CardTitle className="font-headline">Loading Role...</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Please wait or select a role from the switcher if available.</p></CardContent>
            </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* RoleSwitcher component is now removed from here, as it's integrated into the header */}
      {renderDashboardByRole()}
    </div>
  );
}

// Removed the old sessionStorage.setItem override as it's not needed if the header dispatches the event correctly.
// The header's onRoleChange will handle sessionStorage updates and dispatching the event.
