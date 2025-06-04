
"use client";

import React, { useEffect, useState } from 'react';
import AppHeader from '@/components/layout/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, ShieldCheck, Loader2, FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock verification data structure and fetching
interface VerificationDetails {
  id: string;
  productId: string;
  productName?: string;
  status: 'Verified' | 'Pending' | 'Failed' | 'Not Found';
  verifiedBy?: string;
  verificationDate?: string; // ISO String
  details?: string;
  reportUrl?: string;
}

async function fetchVerificationDetails(id: string): Promise<VerificationDetails> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (id === "dpp-sample-verified") {
    return { 
      id, 
      productId: "prod_mfg_001", 
      productName: "EcoSmart Refrigerator X1000",
      status: 'Verified', 
      verifiedBy: "EcoCert Inc.", 
      verificationDate: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
      details: "All compliance checks passed successfully. EBSI Verifiable Credential issued.",
      reportUrl: "#"
    };
  } else if (id === "dpp-sample-pending") {
     return { 
      id, 
      productId: "prod_mfg_002", 
      productName: "Sustainable Cotton T-Shirt",
      status: 'Pending', 
      details: "Verification process initiated. Awaiting auditor review."
    };
  }
  return { id, productId: id, status: 'Not Found', details: "No verification record found for this ID." };
}


export default function VerifyProductPage() {
  const params = useParams();
  const verificationId = params.id as string;
  const [details, setDetails] = useState<VerificationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (verificationId) {
      setLoading(true);
      fetchVerificationDetails(verificationId)
        .then(setDetails)
        .finally(() => setLoading(false));
    }
  }, [verificationId]);

  const StatusIcon = () => {
    if (!details) return null;
    switch (details.status) {
      case 'Verified': return <CheckCircle className="h-10 w-10 text-accent" />;
      case 'Pending': return <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />;
      case 'Failed': return <AlertTriangle className="h-10 w-10 text-destructive" />;
      case 'Not Found': return <FileText className="h-10 w-10 text-muted-foreground" />;
      default: return <Info className="h-10 w-10 text-muted-foreground" />;
    }
  };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Card className="w-full max-w-xl shadow-xl">
          <CardHeader className="text-center">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="font-headline text-2xl">DPP Verification Status</CardTitle>
            <CardDescription>
              Results for verification ID: <span className="font-mono">{verificationId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                <p>Loading verification details...</p>
              </div>
            )}
            {!loading && details && (
              <div className="text-center space-y-3">
                <div className="mx-auto w-fit"><StatusIcon /></div>
                <h3 className={`text-xl font-semibold ${
                  details.status === 'Verified' ? 'text-accent' : 
                  details.status === 'Failed' || details.status === 'Not Found' ? 'text-destructive' : 
                  details.status === 'Pending' ? 'text-yellow-600' : 'text-foreground'
                }`}>
                  {details.status}
                </h3>
                {details.productName && <p className="text-muted-foreground">Product: {details.productName}</p>}
                {details.verifiedBy && <p className="text-sm">Verified by: <span className="font-medium">{details.verifiedBy}</span></p>}
                {details.verificationDate && <p className="text-sm">Date: {new Date(details.verificationDate).toLocaleDateString()}</p>}
                <p className="text-sm text-muted-foreground pt-2">{details.details}</p>
                {details.reportUrl && (
                  <Button variant="outline" asChild className="mt-4">
                    <a href={details.reportUrl} target="_blank" rel="noopener noreferrer">View Full Report (PDF)</a>
                  </Button>
                )}
                {details.status !== 'Not Found' && details.productId && (
                     <Button variant="link" asChild className="mt-2">
                        <Link href={`/product/${encodeURIComponent(details.productId)}`}>View Product Passport</Link>
                    </Button>
                )}
              </div>
            )}
            {!loading && !details && (
                 <p className="text-center text-muted-foreground py-10">Could not load verification details.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
