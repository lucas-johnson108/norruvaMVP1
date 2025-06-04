
"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Search, Info, FileText, CheckCircle2, AlertTriangle, Clock, ExternalLink, MessageSquare, CheckSquare, XSquare, Eye, History, Download } from 'lucide-react';
import type { MockUser } from '@/app/dashboard/page.tsx';

interface VerificationItem {
  id: string;
  productId: string;
  productName: string;
  manufacturerName: string;
  itemToVerify: string; // e.g., "ISO 14001 Certificate", "Material Composition Report"
  documentUrl?: string; // Link to the document if any
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Information Requested';
  submittedDate: string;
  notes?: string;
}

const mockVerificationQueue: VerificationItem[] = [
  { id: 'VER001', productId: 'PROD004', productName: 'High-Efficiency Solar Panel V2', manufacturerName: 'GreenTech Innovations', itemToVerify: 'Energy Efficiency Test Report (IEC 61215)', documentUrl: '#doc-placeholder', status: 'Pending Review', submittedDate: '2024-06-08' },
  { id: 'VER002', productId: 'PROD002', productName: 'Sustainable Cotton T-Shirt', manufacturerName: 'FashionForward Inc.', itemToVerify: 'Organic Cotton Certification (GOTS)', documentUrl: '#doc-placeholder', status: 'Approved', submittedDate: '2024-05-25', notes: 'GOTS certificate valid until 2025-12-31.' },
  { id: 'VER003', productId: 'PROD001', productName: 'EcoSmart Refrigerator X1000', manufacturerName: 'GreenTech Innovations', itemToVerify: 'Full Bill of Materials (BOM) for Recyclability Assessment', status: 'Information Requested', submittedDate: '2024-06-01', notes: 'Need breakdown of plastic types used in interior components.' },
  { id: 'VER004', productId: 'PROD005', productName: 'Recycled PET Water Bottle', manufacturerName: 'EcoPackaging Ltd.', itemToVerify: 'Recycled Content Percentage Validation (GRS)', documentUrl: '#doc-placeholder', status: 'Rejected', submittedDate: '2024-05-15', notes: 'Submitted GRS certificate seems to be for a different material batch. Please provide correct one.' },
];

// Mock data for product search result
interface ProductForAudit {
  id: string;
  name: string;
  manufacturerName: string;
  dppStatus: 'Verified' | 'Partially Verified' | 'Self-Declared';
  lastAuditDate?: string;
  timeline: Array<{ event: string; date: string; actor: string; status: 'Self-Declared' | 'Third-Party Verified' | 'Blockchain-Audited' }>;
  fullChemicalComposition?: Record<string, string>; // Example for restricted data
}

const mockAuditableProduct: ProductForAudit = {
    id: 'PROD001', name: 'EcoSmart Refrigerator X1000', manufacturerName: 'GreenTech Innovations', dppStatus: 'Partially Verified', lastAuditDate: '2024-03-10',
    timeline: [
        { event: 'DPP Created', date: '2024-01-15', actor: 'GreenTech Innovations', status: 'Self-Declared' },
        { event: 'Material Composition Updated', date: '2024-02-01', actor: 'Supplier: MetalParts GmbH', status: 'Self-Declared' },
        { event: 'Energy Label Verified', date: '2024-02-20', actor: 'CertiBody EU', status: 'Third-Party Verified' },
        { event: 'Carbon Footprint Anchored', date: '2024-03-05', actor: 'System (Polygon TX:0xabc...)' , status: 'Blockchain-Audited'}
    ],
    fullChemicalComposition: { "Polypropylene": "15%", "ABS Plastic": "10%", "Steel (Recycled)": "40%", "HFC-134a (Refrigerant)": "0.5%" }
};


export default function VerifierDashboard({ user }: { user: MockUser }) {
  const { toast } = useToast();
  const [verificationQueue, setVerificationQueue] = useState<VerificationItem[]>(mockVerificationQueue);
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [verifierNotes, setVerifierNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedProduct, setSearchedProduct] = useState<ProductForAudit | null>(null);

  const handleSelectItem = (item: VerificationItem) => {
    setSelectedItem(item);
    setAction(null);
    setVerifierNotes(item.notes || '');
  };

  const handleVerificationAction = () => {
    if (!selectedItem || !action) return;
    
    const newStatus = action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Information Requested';
    setVerificationQueue(prev => 
      prev.map(it => it.id === selectedItem.id ? { ...it, status: newStatus, notes: verifierNotes } : it)
    );
    toast({ title: `Item ${action.replace('_', ' ')}d`, description: `${selectedItem.productName} status updated to ${newStatus}. Notes: ${verifierNotes}` });
    setSelectedItem(null);
    setVerifierNotes('');
    setAction(null);
  };
  
  const handleProductSearch = () => {
      if(!searchTerm) {
          setSearchedProduct(null);
          return;
      }
      // Simulate finding a product
      if(searchTerm.toLowerCase().includes(mockAuditableProduct.id.toLowerCase()) || searchTerm.toLowerCase().includes(mockAuditableProduct.name.toLowerCase())) {
          setSearchedProduct(mockAuditableProduct);
      } else {
          setSearchedProduct(null);
          toast({variant: "destructive", title: "Not Found", description: "No product found matching your query."})
      }
  };

  const getStatusBadge = (status: VerificationItem['status'] | ProductForAudit['dppStatus']) => {
    switch (status) {
      case 'Pending Review':
        return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-600"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'Approved':
      case 'Verified':
        return <Badge className="bg-accent text-accent-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive"><XSquare className="mr-1 h-3 w-3"/>Rejected</Badge>;
      case 'Information Requested':
        return <Badge variant="secondary" className="bg-orange-500/80 text-white"><MessageSquare className="mr-1 h-3 w-3" />Info Req.</Badge>;
       case 'Partially Verified':
        return <Badge variant="secondary" className="bg-blue-400/20 text-blue-600"><CheckSquare className="mr-1 h-3 w-3"/>Partially Verified</Badge>;
      case 'Self-Declared':
        return <Badge variant="outline"><Info className="mr-1 h-3 w-3"/>Self-Declared</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

   const getTimelineStatusIcon = (status: ProductForAudit['timeline'][0]['status']) => {
    switch(status) {
        case 'Self-Declared': return <Info className="h-4 w-4 text-muted-foreground" title="Self-Declared"/>;
        case 'Third-Party Verified': return <ShieldCheck className="h-4 w-4 text-accent" title="Third-Party Verified"/>;
        case 'Blockchain-Audited': return <ExternalLink className="h-4 w-4 text-primary" title="Blockchain-Audited"/>; // Using ExternalLink for blockchain chain icon
        default: return null;
    }
  }


  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Welcome, {user.name} from {user.companyName}! Review pending verifications and audit product data.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>Verification Queue</CardTitle>
            <CardDescription>Items requiring your review and action.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {verificationQueue.filter(it => it.status === 'Pending Review' || it.status === 'Information Requested').length > 0 ? (
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
                  {verificationQueue.filter(it => it.status === 'Pending Review' || it.status === 'Information Requested').map((item) => (
                    <TableRow key={item.id} className={selectedItem?.id === item.id ? 'bg-muted' : ''}>
                      <TableCell>
                        <div>{item.productName}</div>
                        <div className="text-xs text-muted-foreground">{item.manufacturerName}</div>
                      </TableCell>
                      <TableCell className="text-sm">{item.itemToVerify}</TableCell>
                      <TableCell>{item.submittedDate}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleSelectItem(item)}>Review</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-10">Verification queue is empty.</p>
            )}
          </CardContent>
        </Card>

        {selectedItem && (
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Review: {selectedItem.itemToVerify}</CardTitle>
              <CardDescription>For {selectedItem.productName} by {selectedItem.manufacturerName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItem.documentUrl && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={selectedItem.documentUrl} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4"/>View Submitted Document</a>
                </Button>
              )}
              <p className="text-xs text-muted-foreground">Product ID: {selectedItem.productId}</p>
              <div>
                <Label htmlFor="verifierNotes">Verifier Notes</Label>
                <Textarea id="verifierNotes" value={verifierNotes} onChange={(e) => setVerifierNotes(e.target.value)} placeholder="Add internal notes or reasons for decision..." className="mt-1 resize-y" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => { setAction('request_info'); handleVerificationAction(); }} className="text-orange-600 border-orange-500 hover:bg-orange-50">Request Info</Button>
                <Button variant="destructive" onClick={() => { setAction('reject'); handleVerificationAction(); }}>Reject</Button>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => { setAction('approve'); handleVerificationAction(); }}>Approve</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {!selectedItem && (
           <Card className="lg:col-span-1 shadow-md flex flex-col items-center justify-center min-h-[300px]">
             <CardContent className="text-center">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                <p className="text-muted-foreground">Select an item from the queue to review.</p>
             </CardContent>
           </Card>
        )}
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Search className="h-5 w-5 text-primary"/>Audit Product Passport</CardTitle>
            <CardDescription>Search for a product or company to view its full DPP and audit trail.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex gap-2 mb-6">
                <Input 
                    type="search" 
                    placeholder="Enter Product ID, Name, or Company Name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                <Button onClick={handleProductSearch}><Search className="mr-2 h-4 w-4"/>Search</Button>
            </div>

            {searchedProduct && (
                <Card className="bg-muted/30">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="font-headline text-xl">{searchedProduct.name}</CardTitle>
                                <CardDescription>{searchedProduct.manufacturerName} - ID: {searchedProduct.id}</CardDescription>
                            </div>
                            {getStatusBadge(searchedProduct.dppStatus)}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" className="w-full">
                            <AccordionItem value="timeline">
                                <AccordionTrigger className="font-semibold text-foreground">Verification Timeline</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-3 pt-2">
                                    {searchedProduct.timeline.map((entry, idx) => (
                                        <li key={idx} className="flex items-center justify-between text-sm p-2 rounded-md border border-border">
                                            <div>
                                                <span className="font-medium">{entry.event}</span>
                                                <span className="block text-xs text-muted-foreground">by {entry.actor} on {entry.date}</span>
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                <TooltipTrigger>{getTimelineStatusIcon(entry.status)}</TooltipTrigger>
                                                <TooltipContent><p>{entry.status}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </li>
                                    ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="chemical">
                                <AccordionTrigger className="font-semibold text-foreground">Full Chemical Composition (Restricted)</AccordionTrigger>
                                <AccordionContent>
                                    <Alert variant="default" className="border-primary/30 bg-primary/5 text-primary mb-2">
                                      <Info className="h-4 w-4" />
                                      <AlertDescription className="text-xs">This data is sensitive and access is logged.</AlertDescription>
                                    </Alert>
                                    {searchedProduct.fullChemicalComposition ? (
                                        <pre className="text-xs bg-background p-2 rounded-md border max-h-40 overflow-auto">
                                            {JSON.stringify(searchedProduct.fullChemicalComposition, null, 2)}
                                        </pre>
                                    ) : <p className="text-xs text-muted-foreground">No detailed composition data available for this product.</p>}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <Button variant="outline" size="sm" className="mt-6"><Download className="mr-2 h-4 w-4"/>Export Full Audit Report (PDF)</Button>
                    </CardContent>
                </Card>
            )}
        </CardContent>
      </Card>

       <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><History className="h-5 w-5 text-primary"/>Recently Verified Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableBody>
                    {verificationQueue.filter(it => it.status === 'Approved' || it.status === 'Rejected').slice(0,3).map((item) => (
                         <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.itemToVerify}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.notes}</TableCell>
                         </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
       </Card>

    </div>
  );
}

