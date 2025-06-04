
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ScanLine, Search, Send, Info, Recycle, CheckCircle2, AlertTriangle, Loader2, Package, ListChecks, Camera, History, FileUp } from 'lucide-react';
import type { MockUser } from '@/app/dashboard/page.tsx'; // Assuming MockUser type is exported

interface ScannedProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  materialsSummary: string; // e.g., "Plastics: 40%, Metals: 30%, Glass: 20%"
  imageUrl?: string;
  dppId: string;
}

interface RecyclingRecord {
  id: string;
  dppId: string;
  productName: string;
  dateReceived: string;
  materialsRecoveredPercentage: number;
  componentsReused: string; // comma-separated
  hazardousDisposalNotes: string;
  recyclingCertificateId?: string;
}

// Mock product data that could be "found" by scanning a QR code
const mockProductDatabase: Record<string, ScannedProduct> = {
  'DPP-EWPM-2024-001': { id: 'PROD_RECYCLE_001', dppId: 'DPP-EWPM-2024-001', name: 'EcoWash Pro Washing Machine', brand: 'GreenTech', model: 'EW-2024-PRO', materialsSummary: 'Steel: 50%, Plastic: 30%, Copper: 10%, Electronics: 10%', imageUrl: 'https://placehold.co/300x200.png?text=EcoWash+Pro' },
  'DPP-SCPB-2024-005': { id: 'PROD_RECYCLE_002', dppId: 'DPP-SCPB-2024-005', name: 'SolarCharge Power Bank', brand: 'SunPower', model: 'SC-PB-10K', materialsSummary: 'Li-ion Battery: 60%, Plastic Casing: 30%, Electronics: 10%', imageUrl: 'https://placehold.co/300x200.png?text=SolarCharge+PB' },
};

const mockRecentRecyclingRecords: RecyclingRecord[] = [
    { id: 'REC001', dppId: 'DPP-OLD-001', productName: 'Old Model Toaster', dateReceived: '2024-06-01', materialsRecoveredPercentage: 65, componentsReused: 'Heating Element', hazardousDisposalNotes: 'None', recyclingCertificateId: 'RCERT-2024-06-001' },
    { id: 'REC002', dppId: 'DPP-XYZ-002', productName: 'PowerMax Vacuum', dateReceived: '2024-05-28', materialsRecoveredPercentage: 70, componentsReused: 'Motor, Filter Housing', hazardousDisposalNotes: 'Battery pack disposed separately as per protocol.', recyclingCertificateId: 'RCERT-2024-05-028' },
];


export default function RecyclerDashboard({ user }: { user: MockUser }) {
  const { toast } = useToast();
  const [scannedProductId, setScannedProductId] = useState('');
  const [currentProduct, setCurrentProduct] = useState<ScannedProduct | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().split('T')[0]);
  const [materialsRecovered, setMaterialsRecovered] = useState('');
  const [componentsReused, setComponentsReused] = useState('');
  const [disposalNotes, setDisposalNotes] = useState('');
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);

  const [recentRecords, setRecentRecords] = useState<RecyclingRecord[]>(mockRecentRecyclingRecords);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Cleanup camera stream if component unmounts or showCameraScanner becomes false
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCameraScanner]);

  const handleScanOrLookup = async () => {
    if (!scannedProductId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a Product ID or DPP ID.' });
      return;
    }
    setIsLoadingProduct(true);
    setCurrentProduct(null);
    // Simulate API call to fetch product details by DPP ID (or internal product ID)
    await new Promise(resolve => setTimeout(resolve, 1000));
    const foundProduct = mockProductDatabase[scannedProductId.toUpperCase()] || Object.values(mockProductDatabase).find(p => p.id === scannedProductId);
    
    if (foundProduct) {
      setCurrentProduct(foundProduct);
      toast({ title: 'Product Found', description: `Details for ${foundProduct.name} loaded.` });
    } else {
      toast({ variant: 'destructive', title: 'Not Found', description: 'Product not found for the given ID.' });
    }
    setIsLoadingProduct(false);
  };

  const handleSubmitRecyclingRecord = async () => {
    if (!currentProduct || !materialsRecovered) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please ensure product is loaded and materials recovered % is filled.' });
      return;
    }
    setIsSubmittingRecord(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newRecord: RecyclingRecord = {
        id: `REC${Date.now().toString().slice(-5)}`,
        dppId: currentProduct.dppId,
        productName: currentProduct.name,
        dateReceived,
        materialsRecoveredPercentage: parseFloat(materialsRecovered),
        componentsReused,
        hazardousDisposalNotes: disposalNotes,
        recyclingCertificateId: `RCERT-${currentProduct.dppId.split('-').pop()}-${Date.now().toString().slice(-3)}`
    };
    setRecentRecords(prev => [newRecord, ...prev]);
    
    toast({ title: 'Record Submitted', description: `Recycling record for ${currentProduct.name} saved. Certificate ID: ${newRecord.recyclingCertificateId}` });
    setCurrentProduct(null);
    setScannedProductId('');
    setMaterialsRecovered('');
    setComponentsReused('');
    setDisposalNotes('');
    setIsSubmittingRecord(false);
  };

  const startCameraScan = async () => {
    setShowCameraScanner(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                // In a real app, integrate QR scanning library here (e.g. jsQR, Zxing)
                // For demo, simulate finding a QR code after a delay
                setTimeout(() => {
                  const mockScannedDppId = Object.keys(mockProductDatabase)[Math.floor(Math.random() * Object.keys(mockProductDatabase).length)];
                  setScannedProductId(mockScannedDppId);
                  toast({ title: "QR Code Scanned (Mock)", description: `Found DPP ID: ${mockScannedDppId}. Click Lookup.` });
                  stopCameraScan();
                }, 4000);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access camera. Please check permissions.' });
            setShowCameraScanner(false);
        }
    } else {
        toast({ variant: 'destructive', title: 'Unsupported', description: 'Your browser does not support camera access.' });
        setShowCameraScanner(false);
    }
  };

  const stopCameraScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    setShowCameraScanner(false);
  };


  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Welcome, {user.name} from {user.companyName}! Scan products and record recycling outcomes.</p>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><ScanLine className="h-6 w-6 text-primary"/>Scan or Lookup Product</CardTitle>
          <CardDescription>Enter a Product/DPP ID or use the camera to scan a QR code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="Enter Product ID or DPP ID (e.g., DPP-EWPM-2024-001)" 
              value={scannedProductId}
              onChange={(e) => setScannedProductId(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleScanOrLookup} disabled={isLoadingProduct || !scannedProductId} className="w-full sm:w-auto">
              {isLoadingProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Lookup
            </Button>
             <Button onClick={startCameraScan} variant="outline" className="w-full sm:w-auto">
                <Camera className="mr-2 h-4 w-4" /> Scan QR
            </Button>
          </div>
          {showCameraScanner && (
            <div className="mt-4 p-2 border rounded-md bg-muted">
                <video ref={videoRef} className="w-full max-w-sm mx-auto aspect-video rounded" playsInline />
                <Button onClick={stopCameraScan} variant="outline" size="sm" className="mt-2 w-full">Stop Camera</Button>
                <p className="text-xs text-muted-foreground text-center mt-1">Scanning for QR code... (Mock: will auto-fill ID after a few seconds)</p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentProduct && (
        <Card className="shadow-lg">
          <CardHeader className="bg-secondary/20">
            <CardTitle className="font-headline text-xl text-primary">{currentProduct.name}</CardTitle>
            <CardDescription>{currentProduct.brand} - {currentProduct.model} (DPP ID: {currentProduct.dppId})</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
            <div>
              {currentProduct.imageUrl && <img src={currentProduct.imageUrl} alt={currentProduct.name} data-ai-hint="product" className="rounded-lg mb-4 w-full aspect-video object-cover border"/>}
              <h4 className="font-semibold mb-1 text-foreground">Materials Summary:</h4>
              <p className="text-sm text-muted-foreground mb-4">{currentProduct.materialsSummary}</p>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Recycling Instructions (from DPP - Placeholder)</AlertTitle>
                <AlertDescription className="text-xs">
                  Disassemble housing before shredding. Battery pack must be removed and processed separately. Refer to full DPP for detailed chemical composition and safety handling.
                </AlertDescription>
              </Alert>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dateReceived">Date Received</Label>
                <Input type="date" id="dateReceived" value={dateReceived} onChange={(e) => setDateReceived(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="materialsRecovered">Materials Recovered (%)</Label>
                <Input type="number" id="materialsRecovered" placeholder="e.g., 85" value={materialsRecovered} onChange={(e) => setMaterialsRecovered(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="componentsReused">Components Reused (comma-separated)</Label>
                <Input id="componentsReused" placeholder="e.g., Motor, PCB" value={componentsReused} onChange={(e) => setComponentsReused(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="disposalNotes">Hazardous Disposal & Notes</Label>
                <Textarea id="disposalNotes" placeholder="Notes on disposal of hazardous materials or other observations..." value={disposalNotes} onChange={(e) => setDisposalNotes(e.target.value)} className="resize-y"/>
              </div>
              <Button onClick={handleSubmitRecyclingRecord} disabled={isSubmittingRecord} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmittingRecord ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Recycling Record
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><History className="h-5 w-5 text-primary"/>Recent Recycling Records</CardTitle>
            <CardDescription>View your facility's recently processed items.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            {recentRecords.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product Name / DPP ID</TableHead>
                        <TableHead>Date Received</TableHead>
                        <TableHead>% Recovered</TableHead>
                        <TableHead>Certificate ID</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentRecords.map(rec => (
                        <TableRow key={rec.id}>
                            <TableCell>
                                <div>{rec.productName}</div>
                                <div className="text-xs text-muted-foreground font-mono">{rec.dppId}</div>
                            </TableCell>
                            <TableCell>{rec.dateReceived}</TableCell>
                            <TableCell>{rec.materialsRecoveredPercentage}%</TableCell>
                            <TableCell className="font-mono text-xs">{rec.recyclingCertificateId || 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            ) : (
                <p className="text-center text-muted-foreground py-10">No recent recycling records.</p>
            )}
        </CardContent>
      </Card>

    </div>
  );
}

