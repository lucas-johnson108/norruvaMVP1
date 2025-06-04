
"use client";
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Label is used for non-form fields or titles
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Network, Users, MapPin, Anchor, Save, Loader2 } from 'lucide-react';
import type { MockProduct as Product } from '@/app/actions/products';
import { updateProductSupplyChainAction, type ProductSupplyChainUpdateValues } from '@/app/actions/products';
import { productSupplyChainUpdateSchema } from '@/types/product-form-types';
import { useToast } from '@/hooks/use-toast';

interface SupplyChainTabProps {
  product: Product | null;
  refreshProductData: () => void;
}

const SupplyChainTab: React.FC<SupplyChainTabProps> = ({ product, refreshProductData }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ProductSupplyChainUpdateValues>({
    resolver: zodResolver(productSupplyChainUpdateSchema),
    defaultValues: {
      manufacturingSiteName: product?.manufacturingSiteName ?? product?.manufacturingSite?.name ?? null,
      manufacturingSiteLocation: product?.manufacturingSiteLocation ?? product?.manufacturingSite?.location ?? null,
      supplierInformation: product?.supplierInformation ?? null,
      componentOriginsInfo: product?.componentOriginsInfo ?? null,
    },
  });

  useEffect(() => {
    if (product) {
      methods.reset({
        manufacturingSiteName: product.manufacturingSiteName ?? product.manufacturingSite?.name ?? null,
        manufacturingSiteLocation: product.manufacturingSiteLocation ?? product.manufacturingSite?.location ?? null,
        supplierInformation: product.supplierInformation ?? null,
        componentOriginsInfo: product.componentOriginsInfo ?? null,
      });
    }
  }, [product, methods]);

  const onSubmit: SubmitHandler<ProductSupplyChainUpdateValues> = async (data) => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      const result = await updateProductSupplyChainAction(product.id, data);
      if (result.success) {
        toast({ title: "Supply Chain Updated", description: result.message });
        refreshProductData();
        methods.reset(data); // Keep form populated with saved data
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: result.message || "Could not save supply chain data." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return <p>Loading supply chain information...</p>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center"><Network className="mr-2 h-5 w-5 text-primary"/>Supply Chain Transparency: {product.name}</CardTitle>
            <CardDescription>View and edit information about suppliers, manufacturing, and component origins.</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader><CardTitle className="font-headline text-lg flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary"/>Manufacturing Site</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-4">
              <FormField
                control={methods.control}
                name="manufacturingSiteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="manufacturingSiteName">Site Name</FormLabel>
                    <FormControl><Input id="manufacturingSiteName" placeholder="e.g., GreenTech Factory One" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="manufacturingSiteLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="manufacturingSiteLocation">Site Location</FormLabel>
                    <FormControl><Input id="manufacturingSiteLocation" placeholder="e.g., Berlin, Germany" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              {product.manufacturingSite?.certifications && (
                   <div>
                      <Label>Site Certifications (Current - Read Only)</Label>
                      <p className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/50">
                          {product.manufacturingSite.certifications.join(', ')}
                      </p>
                  </div>
              )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader><CardTitle className="font-headline text-lg flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Key Supplier Information</CardTitle></CardHeader>
          <CardContent>
              <FormField
                control={methods.control}
                name="supplierInformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="supplierInformation">Summary of Key Suppliers & Roles</FormLabel>
                    <FormControl>
                      <Textarea 
                          id="supplierInformation"
                          placeholder="List key suppliers and their roles, e.g., BatteryCo - Battery Supplier; ChipSource - Microcontroller Supplier"
                          className="min-h-[100px] resize-y mt-1"
                          {...field}
                          value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              {product.suppliers && product.suppliers.length > 0 && (
                   <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">Detailed Suppliers (Current Records - Read Only):</h4>
                      <ul className="space-y-2">
                      {product.suppliers.map(supplier => (
                          <li key={supplier.id} className="p-2 text-xs border rounded-md bg-muted/30">
                          <p><strong className="text-foreground">{supplier.name}</strong> ({supplier.role})</p>
                          {supplier.location && <p>Location: {supplier.location}</p>}
                          {supplier.certification && <p>Certification: {supplier.certification}</p>}
                          </li>
                      ))}
                      </ul>
                  </div>
              )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader><CardTitle className="font-headline text-lg flex items-center"><Anchor className="mr-2 h-5 w-5 text-primary"/>Component Origins Information</CardTitle></CardHeader>
          <CardContent>
              <FormField
                control={methods.control}
                name="componentOriginsInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="componentOriginsInfo">Summary of Key Component Origins</FormLabel>
                    <FormControl>
                      <Textarea 
                          id="componentOriginsInfo"
                          placeholder="Describe origin of key components, e.g., Display Panel - South Korea; Casing - Vietnam (Recycled Aluminum)"
                          className="min-h-[100px] resize-y mt-1"
                          {...field}
                          value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              {product.componentOrigins && product.componentOrigins.length > 0 && (
                  <div className="mt-4 space-y-1">
                      <h4 className="text-sm font-semibold text-muted-foreground">Detailed Component Origins (Current Records - Read Only):</h4>
                      <ul className="space-y-1 text-xs">
                      {product.componentOrigins.map((comp, idx) => (
                          <li key={idx} className="p-1.5 border rounded-md bg-muted/30">
                              <strong className="text-foreground">{comp.componentName}:</strong> From {comp.originCountry} {comp.supplierName ? `(Supplier: ${comp.supplierName})` : ''}
                          </li>
                      ))}
                      </ul>
                  </div>
              )}
          </CardContent>
        </Card>
        
        <div className="pt-4 text-right">
            <Button type="submit" disabled={isSubmitting || !methods.formState.isDirty} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
              Save Supply Chain Changes
            </Button>
        </div>

      </form>
    </FormProvider>
  );
};

export default SupplyChainTab;
