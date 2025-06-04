
"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter, DialogTrigger } from '@/components/ui/dialog'; // Added DialogTrigger
import { ShoppingBag, Search, Eye, Info, QrCode, Share2, CheckCircle2, AlertTriangle, HelpCircle, Link as LinkIcon, ShoppingCart, ExternalLink } from 'lucide-react';
import type { MockUser } from '@/app/dashboard/page.tsx';
import ProductInfoCard from '@/components/product/product-info-card'; // Re-use for consumer view

interface RetailerProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  dppStatus: 'Available' | 'Missing' | 'Pending Update';
  consumerInfoLink?: string; // Link to the public DPP view
  sustainabilityScore?: number; // Example: 1-10
  imageUrl?: string;
}

const mockRetailerInventory: RetailerProduct[] = [
  { id: 'PROD001', sku: 'RET-SKU-001', name: 'EcoSmart Refrigerator X1000', brand: 'GreenTech', dppStatus: 'Available', consumerInfoLink: '/product/prod_mfg_001', sustainabilityScore: 8.5, imageUrl: 'https://placehold.co/100x100.png?text=Fridge' },
  { id: 'PROD002', sku: 'RET-SKU-002', name: 'Sustainable Cotton T-Shirt', brand: 'FashionForward', dppStatus: 'Available', consumerInfoLink: '/product/example-dpp-id-001', sustainabilityScore: 9.2, imageUrl: 'https://placehold.co/100x100.png?text=T-Shirt' },
  { id: 'PROD006', sku: 'RET-SKU-003', name: 'PowerMax Blender Pro', brand: 'KitchenKing', dppStatus: 'Missing', imageUrl: 'https://placehold.co/100x100.png?text=Blender' },
  { id: 'PROD007', sku: 'RET-SKU-004', name: 'ComfyLounge Sofa', brand: 'HomeComfort', dppStatus: 'Pending Update', sustainabilityScore: 6.0, imageUrl: 'https://placehold.co/100x100.png?text=Sofa' },
];

// Mock Product data for the ProductInfoCard. For a real app, fetch this via the consumerInfoLink.
const mockProductDataForViewer: Record<string, any> = {
  "prod_mfg_001": { // Corresponds to EcoSmart Refrigerator
    productId: "prod_mfg_001 / GTIN:01234567890123",
    basicInfo: { name: "EcoSmart Refrigerator X1000", brand: "GreenTech", model: "X1000" },
    publicData: { energyLabel: "A+++", carbonFootprint: "350kg CO2e", recyclability: "75%", warranty: "5 Years", origin: "Germany", recyclingInstructions: "Dispose with e-waste. Refer to manual.", image: "https://placehold.co/600x400.png?text=EcoSmart+Fridge" }
  },
   "example-dpp-id-001": { // Corresponds to Sustainable Cotton T-Shirt
    productId: "GTIN:01234567890123 (API)",
    basicInfo: { name: "Sustainable Cotton T-Shirt", brand: "FashionForward", model: "Organic Tee" },
    publicData: { carbonFootprint: "5kg CO2e", recyclability: "95% (Organic Cotton)", origin: "Portugal", recyclingInstructions: "Textile recycling program.", image: "https://placehold.co/600x400.png?text=Cotton+T-Shirt" }
  }
};


export default function RetailerDashboard({ user }: { user: MockUser }) {
  const [inventory, setInventory] = useState<RetailerProduct[]>(mockRetailerInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductForView, setSelectedProductForView] = useState<RetailerProduct | null>(null);

  const filteredInventory = inventory.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: RetailerProduct['dppStatus']) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-accent text-accent-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Available</Badge>;
      case 'Missing':
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Missing DPP</Badge>;
      case 'Pending Update':
        return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-600"><Info className="mr-1 h-3 w-3" />Pending Update</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPublicDPPLink = (consumerLink: string | undefined): string => {
    if (!consumerLink) return '#';
    // This mock assumes consumerInfoLink directly contains the product ID for the public viewer
    return consumerLink;
  }

  const getProductDataForPreview = (consumerLink: string | undefined) => {
      if (!consumerLink) return null;
      const productIdKey = consumerLink.split('/').pop();
      return productIdKey ? mockProductDataForViewer[productIdKey] : null;
  };


  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Welcome, {user.name} from {user.companyName}! Manage product DPPs for your inventory and consumer transparency.</p>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <CardTitle className="font-headline flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary"/>Product Inventory & DPP Status</CardTitle>
            <Button variant="outline" size="sm" onClick={() => alert("Sync with inventory system (Placeholder)")}>Sync Inventory</Button>
          </div>
          <CardDescription>View products in your catalog and their Digital Product Passport availability.</CardDescription>
           <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search by SKU, Name, or Brand..." 
              className="pl-8 w-full md:w-1/2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredInventory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product Name / SKU</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>DPP Status</TableHead>
                  <TableHead>Sust. Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img src={product.imageUrl || 'https://placehold.co/64x64.png?text=N/A'} alt={product.name} data-ai-hint="product thumbnail" className="h-12 w-12 object-cover rounded"/>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{product.sku}</div>
                    </TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{getStatusBadge(product.dppStatus)}</TableCell>
                    <TableCell>
                      {product.sustainabilityScore ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                                <div className="flex items-center">
                                    <div className={`h-2.5 w-2.5 rounded-full mr-1.5 ${product.sustainabilityScore >= 7 ? 'bg-accent' : product.sustainabilityScore >= 4 ? 'bg-yellow-500' : 'bg-destructive'}`}></div>
                                    {product.sustainabilityScore.toFixed(1)}/10
                                </div>
                            </TooltipTrigger>
                            <TooltipContent><p>Sustainability Score (mock)</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : <span className="text-xs text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                        <Dialog open={!!selectedProductForView && selectedProductForView.id === product.id} onOpenChange={(isOpen) => !isOpen && setSelectedProductForView(null)}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="View Consumer DPP" onClick={() => setSelectedProductForView(product)} disabled={product.dppStatus !== 'Available'}>
                                    <Eye className="h-4 w-4"/>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle className="font-headline">Consumer Product Passport View</DialogTitle>
                                    <DialogDescription>This is how the DPP for "{selectedProductForView?.name}" will appear to consumers.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 max-h-[70vh] overflow-y-auto">
                                    {selectedProductForView && getProductDataForPreview(selectedProductForView.consumerInfoLink) ? (
                                       <ProductInfoCard product={getProductDataForPreview(selectedProductForView.consumerInfoLink)} loading={false} error={null} />
                                    ) : <p className="text-center py-6 text-muted-foreground">No detailed DPP data available for preview for this product.</p>}
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" title="Generate Consumer QR/Link" disabled={product.dppStatus !== 'Available'} onClick={() => alert(`Generate QR/Link for ${product.name} (Public link: ${getPublicDPPLink(product.consumerInfoLink)}) Placeholder`)}>
                              <Share2 className="h-4 w-4"/>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Get shareable QR code or link for consumers.</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-10">No products found in your inventory matching criteria.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>DPP Information</CardTitle>
                <CardDescription>Resources for understanding and utilizing DPPs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    As a retailer, Digital Product Passports help you provide transparency to your customers, verify product authenticity, and meet upcoming EU regulations.
                </p>
                <Button variant="link" asChild className="p-0 h-auto text-primary"><a href="#" target="_blank" rel="noopener noreferrer">Learn more about ESPR for Retailers <ExternalLink className="h-3 w-3 ml-1"/></a></Button>
                 <Button variant="link" asChild className="p-0 h-auto text-primary"><a href="/api-docs" target="_blank" rel="noopener noreferrer">Integrate DPP data via API <ExternalLink className="h-3 w-3 ml-1"/></a></Button>
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary"/>Support & FAQs</CardTitle>
                <CardDescription>Get help with DPP integration and usage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                 <p className="text-sm text-muted-foreground">
                   Having trouble finding a DPP for a product? Contact your supplier or check our FAQ.
                </p>
                <Button variant="outline" size="sm" onClick={() => alert("View FAQs (Placeholder)")}>View FAQs</Button>
                <Button variant="outline" size="sm" onClick={() => alert("Contact Support (Placeholder)")}>Contact Support</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

