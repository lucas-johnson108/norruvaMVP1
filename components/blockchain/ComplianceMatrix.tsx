
// src/components/blockchain/ComplianceMatrix.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ComplianceItem {
  regulation: string;
  productCategory: string;
  status: 'Compliant' | 'Non-Compliant' | 'Partially Compliant' | 'N/A';
  detailsLink?: string; // Link to evidence or detailed report
  lastChecked: string;
}

const mockMatrixData: ComplianceItem[] = [
  { regulation: 'EU ESPR - General', productCategory: 'All Applicable', status: 'Partially Compliant', detailsLink: '#', lastChecked: '2024-07-20' },
  { regulation: 'EU Battery Regulation', productCategory: 'Batteries', status: 'Compliant', detailsLink: '#', lastChecked: '2024-07-15' },
  { regulation: 'RoHS Directive', productCategory: 'Electronics', status: 'Compliant', detailsLink: '#', lastChecked: '2024-07-18' },
  { regulation: 'REACH Regulation', productCategory: 'All Applicable', status: 'Non-Compliant', detailsLink: '#', lastChecked: '2024-07-22' },
  { regulation: 'Ecodesign Textiles', productCategory: 'Textiles', status: 'N/A', lastChecked: '2024-07-01' },
];

export default function ComplianceMatrix() {

  const getStatusIcon = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'Compliant': return <CheckCircle2 className="h-5 w-5 text-accent" />;
      case 'Non-Compliant': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'Partially Compliant': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <span className="text-xs text-muted-foreground">N/A</span>;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-primary"/>Compliance Matrix Overview (Mock)</CardTitle>
        <CardDescription>
          High-level view of product category compliance against key regulations.
          This is a conceptual component placeholder.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {mockMatrixData.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Regulation</TableHead>
              <TableHead>Product Category</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Last Checked</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMatrixData.map((item) => (
              <TableRow key={item.regulation + item.productCategory}>
                <TableCell className="font-medium">{item.regulation}</TableCell>
                <TableCell>{item.productCategory}</TableCell>
                <TableCell className="text-center">{getStatusIcon(item.status)}</TableCell>
                <TableCell>{item.lastChecked}</TableCell>
                <TableCell className="text-right">
                  {item.detailsLink ? (
                    <a href={item.detailsLink} className="text-primary hover:underline text-xs">View</a>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        ) : (
             <p className="text-muted-foreground text-center py-10">No compliance matrix data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
