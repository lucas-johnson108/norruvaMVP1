
"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Search, Info, FileText, CheckCircle2, AlertTriangle, Clock, ExternalLink, MessageSquare, CheckSquare, XSquare, Eye, History, Download } from 'lucide-react';
// Assuming MockUser is defined elsewhere, e.g., in dashboard/page.tsx or a shared types file.
// For this standalone component context, we might need a simplified user prop or context if user-specific data is needed.

interface VerificationItem {
  id: string;
  productId: string;
  productName: string;
  manufacturerName: string;
  itemToVerify: string; // e.g., "ISO 14001 Certificate", "Material Composition Report"
  documentUrl?: string; // Link to the document if any
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Information Requested';
  submittedDate: string;
  notes?: string; // Notes from verifier or previous review cycles
}

const mockInitialVerificationQueue: VerificationItem[] = [
  { id: 'VER001', productId: 'PROD004', productName: 'High-Efficiency Solar Panel V2', manufacturerName: 'GreenTech Innovations', itemToVerify: 'Energy Efficiency Test Report (IEC 61215)', documentUrl: '#doc-placeholder-1', status: 'Pending Review', submittedDate: '2024-06-08' },
  { id: 'VER002', productId: 'PROD002', productName: 'Sustainable Cotton T-Shirt', manufacturerName: 'FashionForward Inc.', itemToVerify: 'Organic Cotton Certification (GOTS)', documentUrl: '#doc-placeholder-2', status: 'Approved', submittedDate: '2024-05-25', notes: 'GOTS certificate valid until 2025-12-31. Verified by CertOrg.' },
  { id: 'VER003', productId: 'PROD001', productName: 'EcoSmart Refrigerator X1000', manufacturerName: 'GreenTech Innovations', itemToVerify: 'Full Bill of Materials (BOM) for Recyclability Assessment', status: 'Information Requested', submittedDate: '2024-06-01', notes: 'Need breakdown of plastic types used in interior components. - VerifierA 2024-06-03' },
  { id: 'VER004', productId: 'PROD005', productName: 'Recycled PET Water Bottle', manufacturerName: 'EcoPackaging Ltd.', itemToVerify: 'Recycled Content Percentage Validation (GRS)', documentUrl: '#doc-placeholder-3', status: 'Rejected', submittedDate: '2024-05-15', notes: 'Submitted GRS certificate seems to be for a different material batch. Please provide correct one. - VerifierB 2024-05-18' },
  { id: 'VER005', productId: 'PROD006', productName: 'Heavy Duty Lithium Battery', manufacturerName: 'PowerMax Batteries', itemToVerify: 'UN38.3 Transport Test Report', documentUrl: '#doc-placeholder-4', status: 'Pending Review', submittedDate: '2024-06-10' },
];


export default function VerificationQueuePage() {
  const { toast } = useToast();
  const [verificationQueue, setVerificationQueue] = useState<VerificationItem[]>(mockInitialVerificationQueue);
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [verifierNotes, setVerifierNotes] = useState('');

  const handleSelectItem = (item: VerificationItem) => {
    setSelectedItem(item);
    setAction(null); // Reset action when a new item is selected
    setVerifierNotes(item.notes || ''); // Load existing notes if any
  };

  const handleVerificationAction = () => {
    if (!selectedItem || !action) {
        toast({ variant: "destructive", title: "Action Error", description: "No item or action selected."});
        return;
    }
    
    const newStatus = action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Information Requested';
    
    setVerificationQueue(prev => 
      prev.map(it => 
        it.id === selectedItem.id 
        ? { ...it, status: newStatus, notes: verifierNotes ? `${verifierNotes} (Updated ${new Date().toLocaleDateString()})` : it.notes } 
        : it
      )
    );
    
    toast({ 
        title: `Item ${action.replace('_', ' ')}d`, 
        description: `${selectedItem.productName} status updated to ${newStatus}. Notes: ${verifierNotes || 'N/A'}` 
    });
    
    setSelectedItem(null); // Clear selection
    setVerifierNotes(''); // Clear notes
    setAction(null); // Clear action
  };
  
  const getStatusBadge = (status: VerificationItem['status']) => {
    switch (status) {
      case 'Pending Review':
        return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-700 border-yellow-500/50"><Clock className="mr-1 h-3 w-3" />Pending Review</Badge>;
      case 'Approved':
        return <Badge className="bg-accent text-accent-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive"><XSquare className="mr-1 h-3 w-3"/>Rejected</Badge>;
      case 'Information Requested':
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 border-orange-500/50"><MessageSquare className="mr-1 h-3 w-3" />Info Requested</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const itemsForReview = verificationQueue.filter(it => it.status === 'Pending Review' || it.status === 'Information Requested');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold text-primary flex items-center">
          <FileText className="mr-3 h-8 w-8" /> Verification Queue
        </h1>
      </div>
      <CardDescription>
        Review and process items submitted for verification. Select an item from the queue to take action.
      </CardDescription>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Items Awaiting Your Review ({itemsForReview.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {itemsForReview.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product / Manufacturer</TableHead>
                    <TableHead>Item to Verify</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsForReview.map((item) => (
                    <TableRow key={item.id} className={selectedItem?.id === item.id ? 'bg-muted/50' : 'hover:bg-muted/30'} onClick={() => handleSelectItem(item)}>
                      <TableCell className="py-3">
                        <div className="font-medium text-foreground">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">{item.manufacturerName}</div>
                      </TableCell>
                      <TableCell className="text-sm py-3">{item.itemToVerify}</TableCell>
                      <TableCell className="text-xs py-3">{item.submittedDate}</TableCell>
                      <TableCell className="py-3">{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right py-3">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleSelectItem(item); }}>Review</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-10">Verification queue is currently empty. Great job!</p>
            )}
          </CardContent>
        </Card>

        {selectedItem ? (
          <Card className="lg:col-span-1 shadow-lg border-primary/50">
            <CardHeader className="bg-primary/5">
              <CardTitle className="font-headline text-lg text-primary">Review: {selectedItem.itemToVerify.substring(0,30)}...</CardTitle>
              <CardDescription>For: {selectedItem.productName} <br/>By: {selectedItem.manufacturerName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {selectedItem.documentUrl && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={selectedItem.documentUrl} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4"/>View Submitted Document (Mock)</a>
                </Button>
              )}
              <p className="text-xs text-muted-foreground">Product ID: <span className="font-mono">{selectedItem.productId}</span></p>
              <p className="text-xs text-muted-foreground">Submitted: {selectedItem.submittedDate}</p>
              <div>
                <Label htmlFor="verifierNotes" className="text-sm font-medium">Verifier Notes & Feedback</Label>
                <Textarea 
                    id="verifierNotes" 
                    value={verifierNotes} 
                    onChange={(e) => setVerifierNotes(e.target.value)} 
                    placeholder="Add internal notes or reasons for decision. This will be logged." 
                    className="mt-1 min-h-[100px] resize-y text-sm" 
                />
              </div>
              <div className="flex flex-col space-y-2 pt-2">
                <Button onClick={() => { setAction('approve'); handleVerificationAction(); }} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full">
                    <CheckSquare className="mr-2 h-4 w-4"/> Approve
                </Button>
                <Button variant="destructive" onClick={() => { setAction('reject'); handleVerificationAction(); }} className="w-full">
                    <XSquare className="mr-2 h-4 w-4"/> Reject
                </Button>
                <Button variant="outline" onClick={() => { setAction('request_info'); handleVerificationAction(); }} className="w-full border-orange-500 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700">
                    <MessageSquare className="mr-2 h-4 w-4"/> Request More Information
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
           <Card className="lg:col-span-1 shadow-md flex flex-col items-center justify-center min-h-[300px] bg-muted/30 border-dashed">
             <CardContent className="text-center">
                <CheckSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4"/>
                <p className="text-muted-foreground">Select an item from the queue to review its details and take action.</p>
             </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
}

