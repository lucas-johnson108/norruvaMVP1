
"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileQuestion, Send, Eye, Info, CheckCircle2, AlertTriangle, Clock, MessageSquare, Settings2 } from 'lucide-react';
import type { MockUser } from '@/app/dashboard/page.tsx';

interface DataRequest {
  id: string;
  manufacturerName: string;
  productName: string;
  componentName: string;
  requestedData: string[]; // e.g., ['Material Composition', 'Recycled Content Percentage']
  dueDate: string;
  status: 'Pending Response' | 'Submitted' | 'Clarification Needed';
  previewLink?: string;
}

const mockRequests: DataRequest[] = [
  { id: 'REQ001', manufacturerName: 'GreenTech Innovations', productName: 'EcoSmart Refrigerator X1000', componentName: 'Compressor Unit Z-500', requestedData: ['Material Composition', 'Origin Country', 'Energy Efficiency Rating'], dueDate: '2024-07-15', status: 'Pending Response' },
  { id: 'REQ002', manufacturerName: 'FashionForward Inc.', productName: 'Organic Cotton T-Shirt', componentName: 'Fabric Batch #123', requestedData: ['Recycled Content Percentage', 'Chemical Test Report (Oeko-Tex)'], dueDate: '2024-06-30', status: 'Submitted' },
  { id: 'REQ003', manufacturerName: 'BuildRight Tools', productName: 'ProDrill 5000', componentName: 'Battery Pack BP-XL', requestedData: ['Battery Capacity (mAh)', 'Safety Data Sheet (SDS)'], dueDate: '2024-07-05', status: 'Clarification Needed' },
];

export default function SupplierDashboard({ user }: { user: MockUser }) {
  const [requests, setRequests] = useState<DataRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [shareAggregateOnly, setShareAggregateOnly] = useState(false);

  const handleSelectRequest = (request: DataRequest) => {
    setSelectedRequest(request);
    // Initialize form data based on selected request (mocked)
    const initialData: Record<string, string> = {};
    request.requestedData.forEach(field => initialData[field.toLowerCase().replace(/\s/g, '')] = '');
    setFormData(initialData);
    setShareAggregateOnly(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitData = () => {
    if (!selectedRequest) return;
    alert(`Submitting data for ${selectedRequest.componentName} (Manufacturer: ${selectedRequest.manufacturerName}) with confidentiality setting: Aggregate Only = ${shareAggregateOnly}. Data (mock): ${JSON.stringify(formData)}`);
    // Update request status and clear selection
    setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'Submitted' } : r));
    setSelectedRequest(null);
    setFormData({});
  };

  const getStatusBadge = (status: DataRequest['status']) => {
    switch (status) {
      case 'Pending Response':
        return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-600"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'Submitted':
        return <Badge className="bg-accent text-accent-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Submitted</Badge>;
      case 'Clarification Needed':
        return <Badge variant="destructive" className="bg-orange-500/80 text-white"><AlertTriangle className="mr-1 h-3 w-3" />Clarification</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Welcome, {user.name} from {user.companyName}! Respond to data requests from manufacturers.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><FileQuestion className="h-5 w-5 text-primary"/>Pending Data Requests</CardTitle>
            <CardDescription>Review and respond to requests for component or material information.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {requests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Product / Component</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id} className={selectedRequest?.id === req.id ? 'bg-muted' : ''}>
                      <TableCell className="font-medium">{req.manufacturerName}</TableCell>
                      <TableCell>
                        <div>{req.productName}</div>
                        <div className="text-xs text-muted-foreground">{req.componentName}</div>
                      </TableCell>
                      <TableCell>{req.dueDate}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleSelectRequest(req)} className={req.status !== 'Pending Response' ? 'opacity-50' : ''} disabled={req.status !== 'Pending Response'}>
                          {req.status === 'Pending Response' ? 'Provide Data' : 'View Submitted'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-10">No pending data requests.</p>
            )}
          </CardContent>
        </Card>

        {selectedRequest && (
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Provide Data for: {selectedRequest.componentName}</CardTitle>
              <CardDescription>For product: {selectedRequest.productName} by {selectedRequest.manufacturerName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRequest.requestedData.map(field => (
                <div key={field}>
                  <Label htmlFor={field.toLowerCase().replace(/\s/g, '')} className="flex items-center">
                    <Info className="mr-2 h-3 w-3 text-muted-foreground"/>{field}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><Info className="ml-1 h-3 w-3 text-muted-foreground cursor-help"/></TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs">
                          <p>This data is required by {selectedRequest.manufacturerName} for DPP compliance (e.g., ESPR Article X for material disclosure).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input 
                    id={field.toLowerCase().replace(/\s/g, '')} 
                    value={formData[field.toLowerCase().replace(/\s/g, '')] || ''} 
                    onChange={(e) => handleInputChange(field.toLowerCase().replace(/\s/g, ''), e.target.value)} 
                    className="mt-1"
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
              
              <div className="pt-2 space-y-3">
                <Label className="font-semibold flex items-center"><Settings2 className="mr-2 h-4 w-4 text-primary"/>Confidentiality Controls</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="shareAggregateOnly" 
                    checked={shareAggregateOnly} 
                    onCheckedChange={(checked) => setShareAggregateOnly(Boolean(checked))}
                  />
                  <Label htmlFor="shareAggregateOnly" className="text-sm font-normal">Share only aggregated data or compliance result (not raw values).</Label>
                </div>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto text-primary" onClick={() => alert(`Preview: Manufacturer will see ${shareAggregateOnly ? 'aggregated data' : 'detailed data'} for ${selectedRequest.componentName} (Placeholder).`)}>
                  <Eye className="mr-1 h-3 w-3" /> Preview what manufacturer will see
                </Button>
              </div>

              {selectedRequest.status === 'Clarification Needed' && (
                <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/30 text-orange-700">
                  <AlertTriangle className="h-4 w-4 !text-orange-600" />
                  <AlertTitle className="font-semibold">Clarification Needed</AlertTitle>
                  <AlertDescription className="text-xs">
                    Manufacturer {selectedRequest.manufacturerName} requested clarification on previously submitted data. Please review and resubmit.
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSubmitData} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Send className="mr-2 h-4 w-4" /> Submit Data
              </Button>
            </CardContent>
          </Card>
        )}
        {!selectedRequest && (
           <Card className="lg:col-span-1 shadow-md flex flex-col items-center justify-center min-h-[300px]">
             <CardContent className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                <p className="text-muted-foreground">Select a request from the list to provide data.</p>
             </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
}

