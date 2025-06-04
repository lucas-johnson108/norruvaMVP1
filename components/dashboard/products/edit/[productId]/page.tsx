
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
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

// Import the full MockProduct type from actions to ensure consistency
import type { MockProduct as Product, QRCodeData } from '@/app/actions/products';


// Local mock database for the edit page, should align with `mockProductDatabase` in actions.ts
// We'll fetch from actions.ts mock for more consistency, but keep a small local one for fallback/structure example.
const mockProductDatabaseForEdit: Product[] = [
  {
    id: "prod_mfg_001",
    gtin: "01234567890123",
    serialNumber: "SN001XYZ",
    name: "EcoSmart Refrigerator X1000",
    brand: "GreenTech",
    model: "X1000",
    category: 'appliances',
    manufacturingDate: "2023-10-01T00:00:00.000Z",
    countryOfOrigin: "DE",
    description: "A top-tier eco-friendly refrigerator with advanced cooling and smart energy management. Features include an inverter compressor, multi-zone temperature control, and IoT connectivity for remote monitoring. Made with 60% recycled steel and designed for easy disassembly and repair.",
    dppStatus: 'Complete',
    dppCompletion: 100,
    complianceStatus: 'Compliant',
    carbonFootprint: 350,
    recyclability: 75,
    lastAuditDate: '2024-03-15T00:00:00.000Z',
    lastUpdated: new Date().toISOString(), // Make it recent
    imageUrl: 'https://placehold.co/600x400.png',
    companyId: 'mockCompany123',
    regulations: [{name: 'EU ESPR', status: 'Compliant'}, {name: 'Energy Labeling', status: 'Compliant'}],
    verificationLog: [
        {event: 'Initial Verification', date: '2024-03-10T00:00:00.000Z', verifier: 'EcoCert Inc.', notes: 'All checks passed.'},
        {event: 'DPP Marked Complete', date: '2024-03-15T00:00:00.000Z', verifier: 'System'}
    ],
    materialSummary: "Main body: Recycled Steel (60%), ABS Plastic (20%); Shelves: Tempered Glass (15%); Cooling System: Copper, Aluminum (5%)",
    energyConsumption: "150 kWh/year",
    waterUsage: "N/A",
    renewableMaterialContent: 60,
    repairabilityIndex: 8,
    suppliers: [{id: "SUP001", name: "CoolParts GmbH", role: "Compressor Supplier", location: "Germany", certification: "ISO 9001"}],
    componentOrigins: [{componentName: "Compressor", originCountry: "DE", supplierName: "CoolParts GmbH"}],
    manufacturingSite: { name: "GreenTech Factory One", location: "Berlin, Germany", certifications: ["ISO 14001", "ISO 50001"] },
    documents: [{ id: 'DOC001-FRIDGE', name: 'CE Declaration - X1000', type: 'Declaration', uploadDate: '2023-09-01', fileUrl: '#', version: '1.1'}],
    certificates: [{name: "Energy Star", issuer: "EPA"}, {name: "TCO Certified", issuer: "TCO Development"}],
    qrCode: undefined,
  },
  // Add prod_mfg_002, prod_mfg_003 here with full details if direct mock is needed for some reason
  // For now, relying on listProductsAction and then filtering.
];

// This function would ideally call a server action that fetches a single product
// For mock purposes, we'll filter from a list (simulating what listProductsAction does)
async function getProduct(productId: string): Promise<Product | null> {
    // In a real app, this would be:
    // import { listProductsAction } from '@/app/actions/products';
    // const result = await listProductsAction('mockCompany123'); // Assuming current user's company
    // if (result.success && result.data) {
    //   return result.data.find(p => p.id === productId) || null;
    // }
    // return null;

    // For mock, we use the local `mockProductDatabaseForEdit` or ideally, could make a server action for single product get
    return new Promise(resolve => {
        setTimeout(() => {
            const product = mockProductDatabaseForEdit.find(p => p.id === productId);
            resolve(product ? JSON.parse(JSON.stringify(product)) : null); // Return a copy
        }, 300);
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
  const productId = params.productId as string;

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductData = async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const productData = await getProduct(id); // Using the refined mock fetch
        if (productData) {
          setProduct(productData);
        } else {
          // Fallback to the more comprehensive mock list if single fetch fails (for demo robustness)
          const fallbackProduct = mockProductDatabaseForEdit.find(p => p.id === id);
          if(fallbackProduct){
            setProduct(fallbackProduct);
          } else {
            setError('Product not found.');
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (productId) {
      fetchProductData(productId);
    }
  }, [productId]);

  const refreshProduct = () => {
    if (productId) {
      fetchProductData(productId);
    }
  };

  const renderTabContent = () => {
    if (!product) return null;
    switch (activeTab) {
      case 'overview': return <OverviewTab product={product} />;
      case 'details': return <DetailsTab product={product} />;
      case 'compliance': return <ComplianceTab product={product} />;
      case 'sustainability': return <SustainabilityTab product={product} />;
      case 'supply-chain': return <SupplyChainTab product={product} />;
      case 'verification': return <VerificationTab product={product} refreshProductData={refreshProduct} />;
      case 'qr-code': return <QRCodeTab product={product} refreshProductData={refreshProduct} />;
      case 'documents': return <DocumentsTab product={product} />;
      default: return <OverviewTab product={product} />;
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Loading product details...</p></div>;
  }

  if (error) {
    return <div className="text-center text-destructive py-10">{error}</div>;
  }

  if (!product) {
    return <div className="text-center text-muted-foreground py-10">Product with ID '{productId}' not found.</div>;
  }

  return (
    <div className="space-y-6">
      <ProductHeader product={product} />
      <TabNavigation tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}
