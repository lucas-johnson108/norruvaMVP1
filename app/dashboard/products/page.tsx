"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays, format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { listProductsAction, submitForVerificationAction } from '@/app/actions/products'; 
import type { MockProduct as Product } from '@/types/product-form-types'; // Updated import path

import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Filter,
  Download,
  MoreHorizontal,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers, // For DPP Status Pending Verification
  Users2, // For DPP Status Pending Supplier
  QrCodeIcon,
  ShieldCheck,
  Package,
  ExternalLink,
  Loader2,
  Info,
  Archive,
  History
} from "lucide-react";
import { cn } from '@/lib/utils';

const productCategories = ['all', 'electronics', 'battery', 'textile', 'furniture', 'appliances', 'packaging', 'other'];
const complianceStatuses = ['all', 'Compliant', 'Non-Compliant', 'Pending Review', 'Partially Compliant'];
const dppStatusesForFilter: (Product['dppStatus'] | 'all')[] = ['all', 'Complete', 'Incomplete', 'Pending Supplier', 'Pending Verification', 'Changes Requested', 'Draft'];


export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isArchivingProduct, setIsArchivingProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState<{
    dppStatus: Product['dppStatus'] | 'all';
    complianceStatus: Product['complianceStatus'] | 'all';
    category: string;
    dateRange: DateRange | undefined;
  }>({
    dppStatus: 'all',
    complianceStatus: 'all',
    category: 'all',
    dateRange: { from: addDays(new Date(), -90), to: new Date() },
  });

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using 'admin-view-all-for-mock' to get all products for demo purposes
      const result = await listProductsAction('admin-view-all-for-mock'); 
      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error fetching products",
          description: result.message || "Could not load product data.",
        });
        setProducts([]);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching products.",
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.gtin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDppStatus = filters.dppStatus === 'all' || product.dppStatus === filters.dppStatus;
      const matchesComplianceStatus = filters.complianceStatus === 'all' || product.complianceStatus === filters.complianceStatus;
      const matchesCategory = filters.category === 'all' || product.category === filters.category;
      
      let productLastUpdatedDate;
      try {
        productLastUpdatedDate = parseISO(product.lastUpdated);
      } catch (e) {
        productLastUpdatedDate = new Date(0); 
      }

      const matchesDate = filters.dateRange?.from && filters.dateRange?.to ? 
                          productLastUpdatedDate >= filters.dateRange.from && productLastUpdatedDate <= filters.dateRange.to : true;
      return matchesSearch && matchesDppStatus && matchesComplianceStatus && matchesCategory && matchesDate;
    });
  }, [products, searchTerm, filters]);

  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      dppStatus: 'all',
      complianceStatus: 'all',
      category: 'all',
      dateRange: { from: addDays(new Date(), -90), to: new Date() },
    });
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleRequestVerification = async (productId: string) => {
    toast({ title: "Submitting...", description: `Requesting verification for product ID: ${productId}` });
    const result = await submitForVerificationAction(productId, 'mockUserId'); // Replace mockUserId with actual user ID from context
    if (result.success) {
      toast({ title: "Verification Requested", description: result.message });
      fetchProducts(); // Refresh product list
    } else {
      toast({ variant: "destructive", title: "Submission Failed", description: result.message });
    }
  };

  const handleArchiveProduct = (product: Product) => {
    setIsArchivingProduct(product);
  };

  const confirmArchiveProduct = async () => {
    if (!isArchivingProduct) return;
    // Mock action:
    toast({ title: "Product Archived (Mock)", description: `Product ${isArchivingProduct.name} has been archived.`});
    // In a real app: await archiveProductAction(isArchivingProduct.id);
    // Then refresh: fetchProducts();
    setIsArchivingProduct(null);
  };

  
  const getComplianceStatusBadge = (status: Product['complianceStatus'] | 'all') => {
    switch (status) {
      case 'Compliant':
        return <Badge className="bg-accent text-accent-foreground text-xs"><CheckCircle2 className="mr-1 h-3 w-3" />Compliant</Badge>;
      case 'Non-Compliant':
        return <Badge variant="destructive" className="text-xs"><AlertTriangle className="mr-1 h-3 w-3" />Non-Compliant</Badge>;
      case 'Pending Review':
        return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-600 text-xs"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'Partially Compliant':
        return <Badge variant="secondary" className="bg-orange-400/20 text-orange-600 text-xs"><Info className="mr-1 h-3 w-3" />Partial</Badge>; 
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getDppStatusBadge = (status: Product['dppStatus'] | 'all') => {
     switch (status) {
      case 'Complete':
        return <Badge className="bg-accent text-accent-foreground text-xs"><CheckCircle2 className="mr-1 h-3 w-3" />Complete</Badge>;
      case 'Incomplete':
        return <Badge variant="destructive" className="text-xs"><AlertTriangle className="mr-1 h-3 w-3" />Incomplete</Badge>;
      case 'Pending Supplier':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 text-xs"><Users2 className="mr-1 h-3 w-3" />Supplier</Badge>; 
      case 'Pending Verification':
        return <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 text-xs"><Layers className="mr-1 h-3 w-3" />Verification</Badge>; 
      case 'Changes Requested':
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 text-xs"><AlertTriangle className="mr-1 h-3 w-3" />Changes Req.</Badge>;
      case 'Draft':
        return <Badge variant="outline" className="text-xs"><FileText className="mr-1 h-3 w-3" />Draft</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  }

  if (isLoading && products.length === 0) { // Show loader only on initial load
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold text-primary flex items-center">
          <Package className="mr-3 h-8 w-8" /> Product Management 
        </h1>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/dashboard/products/create">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Product 
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg border-border"> 
        <CardHeader className="border-b border-border"> 
          <CardTitle className="font-headline text-xl flex items-center gap-2"><Filter className="h-5 w-5 text-primary"/>Filter & Search Products</CardTitle> 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-4 items-end">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /> 
              <Input 
                type="search" 
                placeholder="Search by Name, GTIN, Brand..." 
                className="pl-10 w-full py-2.5" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filters.dppStatus} onValueChange={(value) => handleFilterChange('dppStatus', value as Product['dppStatus'] | 'all')}>
              <SelectTrigger className="py-2.5"><SelectValue placeholder="DPP Status" /></SelectTrigger> 
              <SelectContent>
                {dppStatusesForFilter.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All DPP Statuses' : s}</SelectItem>)}
              </SelectContent>
            </Select>
             <Select value={filters.complianceStatus} onValueChange={(value) => handleFilterChange('complianceStatus', value as Product['complianceStatus'] | 'all')}>
              <SelectTrigger className="py-2.5"><SelectValue placeholder="Compliance Status" /></SelectTrigger> 
              <SelectContent>
                {complianceStatuses.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Compliance' : s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="py-2.5"><SelectValue placeholder="Category" /></SelectTrigger> 
              <SelectContent>
                {productCategories.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row justify-between items-center gap-2">
            <DatePickerWithRange date={filters.dateRange} onDateChange={(value) => handleFilterChange('dateRange', value)} className="w-full sm:max-w-xs" />
            <div className="flex gap-2 mt-2 sm:mt-0">
                <Button variant="outline" onClick={resetFilters} size="sm">Reset Filters</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Bulk Actions <ChevronDown className="ml-1.5 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert("Bulk request verification (Placeholder)")}><ShieldCheck className="mr-2 h-4 w-4"/>Request Verification</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert("Bulk archive products (Placeholder)")}><Archive className="mr-2 h-4 w-4"/>Archive Selected</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert("Bulk export products (Placeholder)")}><Download className="mr-2 h-4 w-4"/>Export Selected (CSV)</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 px-3 py-3">Image</TableHead> 
                <TableHead className="px-3 py-3">Product Name / GTIN</TableHead>
                <TableHead className="px-3 py-3">Category</TableHead>
                <TableHead className="px-3 py-3">DPP Progress</TableHead>
                <TableHead className="px-3 py-3">DPP Status</TableHead>
                <TableHead className="px-3 py-3">Compliance</TableHead>
                <TableHead className="px-3 py-3">Last Updated</TableHead>
                <TableHead className="text-right px-3 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto"/></TableCell></TableRow>
              ) : filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/30"> 
                  <TableCell className="px-3 py-2"> 
                    <div className="w-14 h-14 relative rounded-lg border border-border overflow-hidden bg-muted group"> 
                      <Image 
                        src={product.imageUrl || "https://placehold.co/56x56.png?text=N/A"} 
                        alt={product.name} 
                        fill
                        sizes="56px"
                        className="object-cover group-hover:scale-105 transition-transform duration-200" 
                        data-ai-hint="product thumbnail"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <Link href={`/dashboard/products/edit/${product.id}`} className="font-medium text-primary hover:underline">{product.name}</Link>
                    <div className="text-xs text-muted-foreground font-mono">{product.gtin}</div>
                  </TableCell>
                  <TableCell className="capitalize px-3 py-2">{product.category}</TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center w-32"> 
                      <Progress value={product.dppCompletion || 0} className="h-2.5 flex-grow" indicatorClassName={(product.dppCompletion || 0) === 100 ? "bg-accent" : "bg-primary"} /> 
                      <span className="text-xs ml-2 w-9 text-right text-muted-foreground">{(product.dppCompletion || 0)}%</span>
                    </div>
                  </TableCell>
                   <TableCell className="px-3 py-2">{getDppStatusBadge(product.dppStatus)}</TableCell>
                  <TableCell className="px-3 py-2">{getComplianceStatusBadge(product.complianceStatus)}</TableCell>
                  <TableCell className="px-3 py-2 text-xs">{format(parseISO(product.lastUpdated), 'PP')}</TableCell>
                  <TableCell className="text-right space-x-0.5 px-3 py-2"> 
                    <Button variant="ghost" size="icon" title="View Details" onClick={() => handleViewDetails(product)} className="hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit Product" asChild className="hover:text-primary">
                      <Link href={`/dashboard/products/edit/${product.id}`}> 
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-primary"><MoreHorizontal className="h-4 w-4"/></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {product.dppStatus !== 'Complete' && product.dppStatus !== 'Pending Verification' &&
                          <DropdownMenuItem onClick={() => handleRequestVerification(product.id)}>
                              <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" /> Request Verification
                          </DropdownMenuItem>
                        }
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/edit/${product.id}?tab=qr-code`}>
                            <QrCodeIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Manage QR Code
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href={`/product/${product.id}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" /> View Public DPP
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive hover:!text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleArchiveProduct(product)}>
                            <Archive className="mr-2 h-4 w-4" /> Archive Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12"> 
                        <Package className="h-10 w-10 mx-auto mb-3 text-primary/30" /> 
                        {products.length === 0 && !isLoading ? "No products found. Add a new product to get started." : "No products match your current filters."}
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedProduct && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-3xl min-h-[70vh] flex flex-col p-0"> 
            <DialogHeader className="p-6 border-b"> 
              <div className="flex items-start gap-4">
                 {selectedProduct.imageUrl && 
                    <div className="w-20 h-20 relative rounded-md border overflow-hidden flex-shrink-0 bg-muted">
                        <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} fill sizes="80px" className="object-cover"/>
                    </div>
                 }
                <div>
                    <DialogTitle className="font-headline text-2xl text-primary">{selectedProduct.name}</DialogTitle>
                    <DialogDescription>
                        {selectedProduct.brand} - GTIN: {selectedProduct.gtin}
                    </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="p-6 flex-grow overflow-y-auto"> 
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="verification_log">Verification Log</TabsTrigger>
                  <TabsTrigger value="qr_code">QR Code</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-lg font-semibold flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Key Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <p><strong>Category:</strong> <span className="capitalize">{selectedProduct.category}</span></p>
                            <div><strong>DPP Status:</strong> {getDppStatusBadge(selectedProduct.dppStatus)}</div>
                            <div><strong>Compliance:</strong> {getComplianceStatusBadge(selectedProduct.complianceStatus)}</div>
                            <p><strong>Last Updated:</strong> {format(parseISO(selectedProduct.lastUpdated), 'PPp')}</p>
                            <p><strong>Carbon Footprint:</strong> {selectedProduct.carbonFootprint ?? 'N/A'} kgCO₂e</p>
                            <p><strong>Recyclability Score:</strong> {selectedProduct.recyclabilityScore ?? 'N/A'}%</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="compliance">
                  <Card>
                    <CardHeader><CardTitle className="text-lg font-semibold flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Compliance Summary</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">Status against applicable regulations for <span className="font-semibold">{selectedProduct.category}</span> products.</p>
                        {selectedProduct.regulations?.length ? (
                            <ul className="space-y-2">
                                {selectedProduct.regulations.map((reg, idx) => (
                                    <li key={idx} className="flex justify-between items-center p-2 border rounded-md text-sm bg-muted/30"> 
                                        <span>{reg.name}</span>
                                        {getComplianceStatusBadge(reg.status as Product['complianceStatus'])}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-muted-foreground text-sm">No specific regulations tracked for this product yet.</p>}
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="verification_log">
                  <Card>
                    <CardHeader><CardTitle className="text-lg font-semibold flex items-center"><History className="mr-2 h-5 w-5 text-primary"/>Verification Log</CardTitle></CardHeader>
                    <CardContent className="max-h-60 overflow-y-auto">
                        {selectedProduct.verificationLog?.length ? (
                             <ul className="space-y-3">
                                {selectedProduct.verificationLog.slice().reverse().map((log, idx) => ( // Show newest first
                                    <li key={idx} className="text-sm p-3 border rounded-md bg-muted/50"> 
                                        <p className="font-semibold text-foreground">{log.event} - <span className="text-xs text-muted-foreground">{format(parseISO(log.date), 'PPp')}</span></p>
                                        <p className="text-xs text-muted-foreground">By: {log.verifier}</p>
                                        {log.notes && <p className="text-xs mt-1 p-1.5 rounded bg-background border text-foreground">Notes: {log.notes}</p>} 
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-muted-foreground text-sm text-center py-4">No verification events logged.</p>}
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="qr_code">
                   <Card>
                    <CardHeader><CardTitle className="text-lg font-semibold flex items-center"><QrCodeIcon className="mr-2 h-5 w-5 text-primary"/>DPP QR Code</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center space-y-3">
                        {selectedProduct.qrCode?.dataURL ? (
                            <>
                                <div className="p-2 bg-white rounded-md border shadow-sm inline-block"> 
                                    <Image src={selectedProduct.qrCode.dataURL} alt="QR Code" width={150} height={150} data-ai-hint="QR code product"/>
                                </div>
                                <p className="text-xs text-muted-foreground">Digital Link: <a href={selectedProduct.qrCode.digitalLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{selectedProduct.qrCode.digitalLink}</a></p>
                            </>
                        ) : (
                           <p className="text-muted-foreground text-sm py-4">QR Code not generated yet.</p>
                        )}
                        <Button variant="outline" size="sm" asChild>
                             <Link href={`/dashboard/products/edit/${selectedProduct.id}?tab=qr-code`}>Manage QR Code</Link>
                        </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="mt-auto p-6 border-t"> 
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
                 <Button className="bg-primary hover:bg-primary/90" asChild>
                    <Link href={`/dashboard/products/edit/${selectedProduct.id}`}>Go to Full Edit View</Link>
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isArchivingProduct && (
        <AlertDialog open={!!isArchivingProduct} onOpenChange={() => setIsArchivingProduct(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Product: {isArchivingProduct.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Archiving this product will remove it from active lists and may limit certain operations. 
                It can usually be restored later. Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmArchiveProduct} className="bg-destructive hover:bg-destructive/80 text-destructive-foreground">
                Confirm Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}