
// src/components/blockchain/MintNFTForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Package, Info, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBlockchain } from '@/hooks/useBlockchain';
import { listProductsAction, type MockProduct } from '@/app/actions/products';

const mintNftFormSchema = z.object({
  selectedProductId: z.string().min(1, "Please select a product to mint an NFT for."),
  // Add other NFT-specific fields if needed, e.g., NFT Name, Description
  // For now, we'll derive these from the product data.
});

type MintNftFormValues = z.infer<typeof mintNftFormSchema>;

interface MintNFTFormProps {
  onMintSuccess: () => void; // Callback to refresh parent list or close dialog
}

export default function MintNFTForm({ onMintSuccess }: MintNFTFormProps) {
  const { toast } = useToast();
  const { account, mintDPP, actionLoading, providerLoading } = useBlockchain();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState<MockProduct | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const form = useForm<MintNftFormValues>({
    resolver: zodResolver(mintNftFormSchema),
    defaultValues: {
      selectedProductId: '',
    },
  });

  const { watch, control } = form;
  const watchedProductId = watch('selectedProductId');

  const fetchMintableProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      // Assuming 'mockCompany123' or get from user context if available
      const result = await listProductsAction('mockCompany123'); 
      if (result.success && Array.isArray(result.data)) {
        // Filter for products that don't have an nftTokenId in their blockchain field
        const mintable = result.data.filter(p => !p.blockchain?.nftTokenId);
        setProducts(mintable);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load products for minting.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch products.' });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMintableProducts();
  }, [fetchMintableProducts]);

  useEffect(() => {
    if (watchedProductId) {
      const product = products.find(p => p.id === watchedProductId);
      setSelectedProductDetails(product || null);
    } else {
      setSelectedProductDetails(null);
    }
  }, [watchedProductId, products]);

  const onSubmit: SubmitHandler<MintNftFormValues> = async (data) => {
    if (!selectedProductDetails) {
      toast({ variant: "destructive", title: "No Product Selected", description: "Please select a product." });
      return;
    }
    if (!account) {
      toast({ variant: "destructive", title: "Wallet Not Connected", description: "Please connect your wallet."});
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare productData for mintDPP function, might need to match specific structure expected by backend
      // The useBlockchain hook's mintDPP expects productData (any), organizationId (mocked in hook), account
      // The DppRegistryService.mintDppNft expects ownerAddress, gtin, metadata (name, desc, image, gtin, manufacturerDid, publicDataHash)
      // For now, we pass the whole selectedProductDetails. The backend callable will handle metadata extraction.
      await mintDPP(selectedProductDetails); 
      // Success toast is handled within useBlockchain hook
      onMintSuccess();
      form.reset();
      setSelectedProductDetails(null);
      await fetchMintableProducts(); // Refresh the list of mintable products
    } catch (error: any) {
      // Error toast is handled within useBlockchain hook or the action itself
      console.error("Minting NFT failed in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProducts) {
    return <div className="flex items-center justify-center p-6"><Loader2 className="h-6 w-6 animate-spin mr-2"/> Loading available products...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="selectedProductId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Product to Mint NFT</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={products.length === 0 || isSubmitting || actionLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={products.length === 0 ? "No products available for minting" : "Choose a product..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (GTIN: {product.gtin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedProductDetails && (
          <Card className="bg-muted/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-semibold text-primary">{selectedProductDetails.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <p><strong className="text-muted-foreground">GTIN:</strong> {selectedProductDetails.gtin}</p>
              <p><strong className="text-muted-foreground">Brand:</strong> {selectedProductDetails.brand}</p>
              <p><strong className="text-muted-foreground">Model:</strong> {selectedProductDetails.model}</p>
              <p><strong className="text-muted-foreground">Category:</strong> <span className="capitalize">{selectedProductDetails.category}</span></p>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground font-medium flex items-center"><Info className="h-3 w-3 mr-1"/>NFT Metadata (Derived from Product):</p>
                <ul className="list-disc list-inside pl-4 text-muted-foreground/80">
                    <li>Name: {selectedProductDetails.name}</li>
                    <li>Description: {selectedProductDetails.description || 'DPP for product.'}</li>
                    <li>GTIN: {selectedProductDetails.gtin}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="pt-2">
            <Button 
                type="submit" 
                disabled={!selectedProductDetails || isSubmitting || actionLoading || providerLoading || !account} 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
                {(isSubmitting || actionLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4"/>}
                {(isSubmitting || actionLoading) ? 'Minting NFT...' : `Mint DPP NFT for ${selectedProductDetails ? selectedProductDetails.name.substring(0,15) + "..." : "Selected Product"}`}
            </Button>
            {!account && <p className="text-xs text-destructive text-center mt-2">Please connect your wallet to mint.</p>}
        </div>
      </form>
    </Form>
  );
}

    