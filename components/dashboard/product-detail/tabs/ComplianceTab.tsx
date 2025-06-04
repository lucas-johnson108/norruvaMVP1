
"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, FileText, ShieldAlert } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  complianceStatus?: string;
  regulations?: Array<{ name: string; status: string; details?: string }>;
  certificates?: Array<{ name: string; issuer: string; expiryDate?: string; documentLink?: string }>;
}

interface ComplianceTabProps {
  product: Product | null;
}

const ComplianceTab: React.FC<ComplianceTabProps> = ({ product }) => {
  if (!product) return <p>Loading compliance information...</p>;

  const getComplianceBadge = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'compliant':
        return <Badge className="bg-accent text-accent-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Compliant</Badge>;
      case 'pending review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700"><AlertTriangle className="mr-1 h-3 w-3" />Pending Review</Badge>;
      case 'non-compliant':
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Non-Compliant</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><ShieldAlert className="mr-2 h-5 w-5 text-primary"/>Compliance Status for {product.name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">Overall:</span>
            {getComplianceBadge(product.complianceStatus)}
          </div>
        </CardHeader>
      </Card>

      {product.regulations && product.regulations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Applicable Regulations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {product.regulations.map((reg, index) => (
                <li key={index} className="p-3 border rounded-md bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{reg.name}</span>
                    {getComplianceBadge(reg.status)}
                  </div>
                  {reg.details && <p className="text-xs text-muted-foreground mt-1">{reg.details}</p>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {product.certificates && product.certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Certificates & Declarations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {product.certificates.map((cert, index) => (
                <li key={index} className="p-3 border rounded-md bg-muted/30">
                  <p className="font-medium text-foreground">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">Issuer: {cert.issuer} {cert.expiryDate ? `| Expires: ${cert.expiryDate}` : ''}</p>
                  {cert.documentLink && <a href={cert.documentLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View Document</a>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
       <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Compliance Actions (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage compliance documents, request new verifications, or view audit trails.</p>
            {/* Buttons for actions like "Upload Document", "Request Verification" */}
          </CardContent>
        </Card>
    </div>
  );
};

export default ComplianceTab;
