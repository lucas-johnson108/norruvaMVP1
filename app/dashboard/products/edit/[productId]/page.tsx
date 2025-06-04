
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, BarChart3, FileText, ShieldCheck, Leaf, Network, Folder, QrCode as QrCodeIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Import the new separated components
import ProductHeader from '@/components/dashboard/product-detail/ProductHeader';
import TabNavigation from '@/components/dashboard/product-detail/TabNavigation';

// Import tab content components
import OverviewTab from '@/components/dashboard/product-detail/tabs/OverviewTab';
import DetailsTab from '@/components/dashboard/product-detail/tabs/DetailsTab';
import ComplianceTab from '@/components/dashboard/product-detail/tabs/ComplianceTab';
import SustainabilityTab from '@/components/dashboard/product-detail/tabs/SustainabilityTab';
import SupplyChainTab from '@/components/dashboard/product-detail/tabs/SupplyChainTab';
import DocumentsTab from '@/components/dashboard/product-detail/tabs/DocumentsTab';
import VerificationTab from '@/components/dashboard/product-detail/tabs/VerificationTab';
import QRCodeTab from '@/components/dashboard/product-detail/tabs/QRCodeTab';

// Import the full MockProduct type and listProductsAction from actions to ensure consistency
import { listProductsAction, type MockProduct as Product, type QRCodeData } from '@/app/actions/products';

// Re-define UserRole type similar to dashboard/page.tsx or import from a shared types file if available
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

const defaultUser: MockUser = {
  id: 'unknown-user',
  name: 'Unknown User',
  email: 'unknown@example.com',
  role: 'manufacturer', // Default role if nothing found
  companyName: 'Unknown Company',
  companyId: 'unknown-comp-id',
};


// This function now fetches from the central mock database via listProductsAction
async function getProduct(productId: string): Promise<Product | null> {
    return new Promise(async (resolve) => { 
        // Simulate network delay
        await new Promise(r => setTimeout(r, 300));
        try {
            // In a real app, this might be a direct fetch: getProductByIdAction(productId)
            // For this mock, we simulate by filtering the list from listProductsAction
            const result = await listProductsAction('admin-view-all-for-mock'); 
            if (result.success && result.data) {
                const product = result.data.find(p => p.id === productId);
                resolve(product ? JSON.parse(JSON.stringify(product)) : null); 
            } else {
                console.error("Failed to list products in getProduct:", result.message);
                resolve(null);
            }
        } catch (error) {
            console.error("Error in getProduct fetching list:", error);
            resolve(null);
        }
    });
}


const tabsConfig = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'sustainability', label: 'Sustainability', icon: Leaf },
  { id: 'supply-chain', label: 'Supply Chain', icon: Network },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'qr-code', label: 'QR Code', icon: QrCodeIcon },
  { id: 'documents', label: 'Documents', icon: Folder }
];


export default function ProductEditPage() {
  const params = useParams();
  const searchParams = useSearchParams(); // For reading query parameters
  const productId = params.productId as string;

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<MockUser>(defaultUser);
  const [clientOnly, setClientOnly] = useState(false);


  useEffect(() => {
    setClientOnly(true);
    if (typeof window !== 'undefined') {
      try {
        const storedUserJson = sessionStorage.getItem('currentMockUser');
        if (storedUserJson) {
          const parsedUser = JSON.parse(storedUserJson) as MockUser;
          // Ensure role is one of the valid UserRole types, defaulting if not
          const validRoles: UserRole[] = ['manufacturer', 'supplier', 'recycler', 'verifier', 'retailer'];
          if (parsedUser.role && validRoles.includes(parsedUser.role.toLowerCase() as UserRole)) {
            setCurrentUser({...parsedUser, role: parsedUser.role.toLowerCase() as UserRole });
          } else {
            setCurrentUser({ ...parsedUser, role: 'manufacturer' }); // Default to manufacturer if role is invalid
          }
        } else {
            setCurrentUser(defaultUser);
        }
      } catch (e) {
        console.error("Error reading user from session storage for ProductEditPage:", e);
        setCurrentUser(defaultUser);
      }
    }
  }, []);

  // Effect to set active tab from URL query parameter
  useEffect(() => {
    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery && tabsConfig.some(t => t.id === tabFromQuery)) {
      setActiveTab(tabFromQuery);
    }
  }, [searchParams]);


  const fetchProductData = async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const productData = await getProduct(id); 
        if (productData) {
          setProduct(productData);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (productId && clientOnly) { // Ensure clientOnly is true before fetching
      fetchProductData(productId);
    }
  }, [productId, clientOnly]); // Add clientOnly as a dependency

  const refreshProduct = async () => {
    if (productId) {
      await fetchProductData(productId);
    }
  };

  const renderTabContent = () => {
    if (!product || !clientOnly) return <div className="flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Initializing...</p></div>;
    
    switch (activeTab) {
      case 'overview': return <OverviewTab product={product} />;
      case 'details': return <DetailsTab product={product} />;
      case 'compliance': return <ComplianceTab product={product} />;
      case 'sustainability': return <SustainabilityTab product={product} />;
      case 'supply-chain': return <SupplyChainTab product={product} />;
      case 'verification': return <VerificationTab product={product} currentUserRole={currentUser.role} refreshProductData={refreshProduct} />;
      case 'qr-code': return <QRCodeTab product={product} refreshProductData={refreshProduct} />;
      case 'documents': return <DocumentsTab product={product} />;
      default: return <OverviewTab product={product} />;
    }
  };


  if ((loading || !clientOnly) && !product) { // Show main loader if still initializing clientOnly state or fetching initial product
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading product details...</p></div>;
  }

  if (error) {
    return <div className="text-center text-destructive py-10">{error}</div>;
  }

  if (!product && !loading) { // Ensure product is truly not found after loading and client is ready
    return <div className="text-center text-muted-foreground py-10">Product with ID '{productId}' not found.</div>;
  }
  
  if (!product && clientOnly) { // Case where product might still be loading on client after clientOnly true
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Fetching product data...</p></div>;
  }


  return (
    <div className="space-y-6">
      <ProductHeader product={product} />
      <TabNavigation tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="tab-content mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
}

    
