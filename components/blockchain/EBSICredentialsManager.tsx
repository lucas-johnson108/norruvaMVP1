
// src/components/blockchain/EBSICredentialsManager.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, PlusCircle, ExternalLink, Loader2, Info, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import crypto from 'crypto'; // For generating mock IDs

interface VerifiableCredential {
  id: string;
  type: string;
  issuer: string;
  subjectDppId: string;
  issuanceDate: string;
  status: 'Valid' | 'Revoked' | 'Pending';
  credentialDataPreview?: string;
}

const initialMockCredentialsList: VerifiableCredential[] = [
  { id: 'VC_001', type: 'ProductOriginAttestation', issuer: 'did:ebsi:zabc123...', subjectDppId: 'DPP-XYZ-001 (EcoWidget)', issuanceDate: '2024-07-15', status: 'Valid', credentialDataPreview: '{"compliant": true, "substances": {"Pb": "<0.1%"}}'},
  { id: 'VC_002', type: 'RecycledContentClaim', issuer: 'did:ebsi:zdef456...', subjectDppId: 'DPP-ABC-002 (GreenFrame)', issuanceDate: '2024-06-20', status: 'Valid', credentialDataPreview: '{"recycled_plastic_percent": 30}'},
  { id: 'VC_003', type: 'BatteryComplianceCredential', issuer: 'did:ebsi:zghi789...', subjectDppId: 'DPP-BAT-003 (PowerCell Max)', issuanceDate: '2024-05-10', status: 'Revoked', credentialDataPreview: '{"battery_capacity": "5000mAh"}'},
];


export default function EBSICredentialsManager() {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCredentials = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      // To simulate a new credential appearing after "issuance", we add one if this is a "refresh"
      // This is a bit of a hack for demo purposes. In a real app, this would fetch from a DB.
      let currentData = [...initialMockCredentialsList]; // Start with a fresh copy of initial mocks
      
      // Check if we should add a "newly issued" mock credential.
      // This condition needs to be more robust in a real app.
      // For this demo, if total credentials equal initial, we'll assume a new one was just "issued".
      // A better way would be to pass a flag or check a timestamp.
      if (credentials.length === initialMockCredentialsList.length && credentials.length > 0) { 
         // Only add if the current list is exactly the initial list, indicating a possible refresh after add.
         // This check is imperfect.
      }
      
      // If this useEffect is running due to a refreshKey change (parent page logic),
      // and it's not the initial load, we add a new mock credential.
      // We can use a flag or compare if credentials length is still same as initialMockCredentialsList.
      // This is a simplified simulation:
      const shouldAddNewMock = Math.random() < 0.3; // Randomly add a new mock credential on "refresh"
      if (initialMockCredentialsList.length > 0 && credentials.length > 0 && credentials.length <= initialMockCredentialsList.length && shouldAddNewMock) {
         // To make it clearly a new item, we'll give it a distinct ID and type
         const newMockId = `VC_NEW_${crypto.randomBytes(3).toString('hex')}`;
         const newMockCredential: VerifiableCredential = {
            id: newMockId,
            type: 'MockIssuedAttestation',
            issuer: 'did:ebsi:mock-issuer-002',
            subjectDppId: `DPP-MOCK-${Date.now().toString().slice(-4)} (Newly Added)`,
            issuanceDate: new Date().toISOString(),
            status: 'Pending',
            credentialDataPreview: '{"mock_data": true, "reason": "Added on refresh simulation"}'
         };
         currentData = [newMockCredential, ...initialMockCredentialsList];
      }


      setCredentials(currentData);
      setIsLoading(false);
    }, 500);
  }, [credentials.length]); // Add credentials.length to dependencies for the logic above

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]); // fetchCredentials is stable due to useCallback


  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = cred.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cred.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cred.subjectDppId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cred.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading credentials...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-6 py-4 border-b">
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                type="search" 
                placeholder="Search by Credential ID, Type, or Subject..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
            />
            </div>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-auto"
            >
                <option value="all">All Statuses</option>
                <option value="Valid">Valid</option>
                <option value="Pending">Pending</option>
                <option value="Revoked">Revoked</option>
            </select>
        </div>
      </div>
      {filteredCredentials.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Credential ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject (DPP)</TableHead>
              <TableHead>Issuer DID</TableHead>
              <TableHead>Issuance Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCredentials.map((cred) => (
              <TableRow key={cred.id}>
                <TableCell className="font-mono text-xs truncate max-w-[100px]" title={cred.id}>{cred.id}</TableCell>
                <TableCell>{cred.type}</TableCell>
                <TableCell className="text-xs">{cred.subjectDppId}</TableCell>
                <TableCell className="font-mono text-xs truncate max-w-[100px]" title={cred.issuer}>{cred.issuer}</TableCell>
                <TableCell>{new Date(cred.issuanceDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={cred.status === 'Valid' ? 'default' : cred.status === 'Pending' ? 'secondary' : 'destructive'}
                         className={cred.status === 'Valid' ? 'bg-accent text-accent-foreground' : cred.status === 'Pending' ? 'bg-yellow-400/80 text-yellow-900' : ''}>
                    {cred.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="xs" onClick={() => alert(`View details for ${cred.id} (Placeholder). Data: ${cred.credentialDataPreview}`)}>
                    View Details <ExternalLink className="ml-1 h-3 w-3"/>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground text-center py-10">No credentials found matching your criteria.</p>
      )}
    </div>
  );
}
