
// src/app/dashboard/blockchain/credentials/page.tsx
"use client";
import React, { useState } from 'react'; // Added useState for dialog
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import EBSICredentialsManager from '@/components/blockchain/EBSICredentialsManager'; // Updated path
import { PlusCircle, Search, Filter, ShieldAlert, KeyRound } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import IssueCredentialForm from '@/components/dashboard/credentials/IssueCredentialForm'; // New component for the form

export default function EbsiCredentialsPage() {
  const [isIssueCredentialDialogOpen, setIsIssueCredentialDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // To trigger re-fetch in EBSICredentialsManager

  const handleCredentialIssued = () => {
    setIsIssueCredentialDialogOpen(false);
    setRefreshKey(prev => prev + 1); // Increment key to re-fetch credentials
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold text-primary flex items-center">
              <ShieldAlert className="mr-3 h-8 w-8" />EBSI Verifiable Credentials
          </h1>
          <CardDescription className="mt-1">Manage and issue EBSI-compliant Verifiable Credentials for product attestations and compliance.</CardDescription>
        </div>
        <Dialog open={isIssueCredentialDialogOpen} onOpenChange={setIsIssueCredentialDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground mt-2 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" />Issue New Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">Issue New Verifiable Credential</DialogTitle>
              <DialogDescription>
                Create and issue a new EBSI-compliant Verifiable Credential for a product or claim.
              </DialogDescription>
            </DialogHeader>
            <IssueCredentialForm onCredentialIssued={handleCredentialIssued} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Issued Credentials</CardTitle>
           <div className="mt-2 flex flex-col sm:flex-row gap-2">
             <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {/* Search input will be handled by EBSICredentialsManager */}
             </div>
             {/* Filter button will be handled by EBSICredentialsManager */}
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <EBSICredentialsManager key={refreshKey} /> {/* Pass key to trigger re-render and re-fetch */}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" />Decentralized Identity (DID) Management</CardTitle>
            <CardDescription>Configure and manage your organization's DIDs for issuing credentials.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-3 text-sm">Your organization's primary DID (mock): <span className="font-mono text-xs text-primary">did:key:zExampleOrgDID123...</span></p>
            <Button variant="outline" asChild>
                <Link href="/dashboard/blockchain/dids">Manage DIDs</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
