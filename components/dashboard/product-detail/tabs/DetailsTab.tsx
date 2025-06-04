
"use client";
import React, { useState, useEffect } from 'react';
import { useForm, Controller, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format, parseISO } from "date-fns";
import { CalendarIcon, PackagePlus, Save, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import type { MockProduct as Product } from '@/app/actions/products';
import { updateProductDetailsAction, type ProductDetailsUpdateValues } from '@/app/actions/products';
import { useToast } from '@/hooks/use-toast';


interface DetailsTabProps {
  product: Product | null;
  refreshProductData: () => void; // Callback to refresh data in parent
}

const productCategories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'battery', label: 'Batteries' },
  { value: 'textile', label: 'Textiles' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'other', label: 'Other' },
];

// Zod schema for this tab's form
const detailsTabFormSchema = z.object({
  gtin: z.string().min(8, "GTIN must be at least 8 digits").max(14, "GTIN can be at most 14 digits").regex(/^[0-9]+$/, "GTIN must be numeric"),
  name: z.string().min(3, "Product name must be at least 3 characters.").max(100),
  brand: z.string().min(2, "Brand must be at least 2 characters.").max(50),
  model: z.string().min(1, "Model is required.").max(50),
  category: z.enum(['electronics', 'battery', 'textile', 'furniture', 'appliances', 'packaging', 'other']),
  manufacturingDate: z.date({ required_error: "Manufacturing date is required."}),
  countryOfOrigin: z.string().length(2, "Country code must be 2 letters").regex(/^[A-Z]{2}$/, "Must be 2 uppercase letters"),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')).nullable(),
  serialNumber: z.string().max(50, "Serial number too long").optional().nullable(),
});


const DetailsTab: React.FC<DetailsTabProps> = ({ product, refreshProductData }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ProductDetailsUpdateValues>({
    resolver: zodResolver(detailsTabFormSchema),
    defaultValues: {
      gtin: product?.gtin || '',
      name: product?.name || '',
      brand: product?.brand || '',
      model: product?.model || '',
      category: product?.category,
      manufacturingDate: product?.manufacturingDate ? parseISO(product.manufacturingDate) : undefined,
      countryOfOrigin: product?.countryOfOrigin || '',
      description: product?.description || '',
      imageUrl: product?.imageUrl || '',
      serialNumber: product?.serialNumber || '',
    },
  });
  
  useEffect(() => {
    if (product) {
      methods.reset({
        gtin: product.gtin,
        name: product.name,
        brand: product.brand,
        model: product.model,
        category: product.category,
        manufacturingDate: product.manufacturingDate ? parseISO(product.manufacturingDate) : undefined,
        countryOfOrigin: product.countryOfOrigin,
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        serialNumber: product.serialNumber || '',
      });
    }
  }, [product, methods]);


  const onSubmit: SubmitHandler<ProductDetailsUpdateValues> = async (data) => {
    if (!product) return;
    setIsSubmitting(true);

    // Convert date back to ISO string for the action
    const dataForAction = {
      ...data,
      manufacturingDate: data.manufacturingDate ? (data.manufacturingDate as Date).toISOString() : undefined,
    };

    try {
      const result = await updateProductDetailsAction(product.id, dataForAction);
      if (result.success) {
        toast({ title: "Details Updated", description: result.message });
        refreshProductData(); // Refresh parent data
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: result.message || "Could not save details." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return <p>Loading product details...</p>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Product Details: {product.name}</CardTitle>
            <CardDescription>View and edit core information about this product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={methods.control} name="gtin" render={({ field }) => (<FormItem><FormLabel>GTIN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={methods.control} name="name" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={methods.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={methods.control} name="model" render={({ field }) => (<FormItem><FormLabel>Model</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={methods.control} name="serialNumber" render={({ field }) => (<FormItem><FormLabel>Serial Number (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={methods.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                    <SelectContent>{productCategories.map(cat => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={methods.control} name="manufacturingDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Manufacturing Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={methods.control} name="countryOfOrigin" render={({ field }) => (<FormItem><FormLabel>Country of Origin (ISO Code)</FormLabel><FormControl><Input {...field} className="uppercase" maxLength={2} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={methods.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={methods.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[100px] resize-y"/></FormControl><FormMessage /></FormItem>)} />
            
            <div className="pt-4 text-right">
                <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                  Save Detail Changes
                </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};

export default DetailsTab;

