
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createProductAction, type CreateProductFormValues } from '@/app/actions/products';
import { Loader2, PackagePlus, ArrowLeft, CalendarIcon, Info } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const productFormSchema = z.object({
  gtin: z.string().min(8, "GTIN must be at least 8 digits").max(14, "GTIN can be at most 14 digits").regex(/^[0-9]+$/, "GTIN must be numeric"),
  name: z.string().min(3, "Product name must be at least 3 characters.").max(100, "Product name can be at most 100 characters."),
  brand: z.string().min(2, "Brand must be at least 2 characters.").max(50, "Brand can be at most 50 characters."),
  model: z.string().min(1, "Model is required.").max(50, "Model can be at most 50 characters."),
  category: z.enum(['electronics', 'battery', 'textile', 'furniture', 'appliances', 'packaging', 'other'], {
    required_error: "Category is required." 
  }),
  manufacturingDate: z.date({
    required_error: "Manufacturing date is required.",
  }),
  countryOfOrigin: z.string().length(2, "Country code must be 2 uppercase letters e.g. US, DE, CN.").regex(/^[A-Z]{2}$/, "Must be 2 uppercase letters."),
  description: z.string().max(500, "Description can be at most 500 characters.").optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

const productCategories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'battery', label: 'Batteries' },
  { value: 'textile', label: 'Textiles' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'other', label: 'Other' },
];

export default function AddNewProductPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      gtin: '',
      name: '',
      brand: '',
      model: '',
      category: undefined, 
      manufacturingDate: undefined,
      countryOfOrigin: '',
      description: '',
      imageUrl: '',
    },
  });

  const onSubmit: SubmitHandler<CreateProductFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await createProductAction(data);
      if (result.success) {
        toast({
          title: "Product Created!",
          description: result.message || `Product "${data.name}" has been added successfully.`,
        });
        form.reset();
        // Potentially redirect: router.push('/dashboard/products');
      } else {
        toast({
          variant: "destructive",
          title: "Creation Failed",
          description: result.message || "Could not create the product. Please check errors.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating the product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Product Management</span>
          </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-headline font-semibold text-primary flex items-center gap-2">
            <PackagePlus className="h-8 w-8" /> Create New Digital Product Passport
            </h1>
            <p className="text-muted-foreground">
            Follow this guided flow to register a new product and its initial DPP information.
            </p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Step 1: Core Product Information</CardTitle>
          <CardDescription>Fill in the essential details for your product. More attributes can be added later in the full product detail view from the Product Management list.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gtin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GTIN (Global Trade Item Number)</FormLabel>
                      <FormControl><Input placeholder="e.g., 1234567890123" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl><Input placeholder="e.g., EcoSmart LED Bulb E27" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl><Input placeholder="e.g., BrightLife" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Number / SKU</FormLabel>
                      <FormControl><Input placeholder="e.g., BL-LED-E27-001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Manufacturing Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="countryOfOrigin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Origin (2-letter code)</FormLabel>
                      <FormControl><Input placeholder="e.g., DE, US, CN" {...field} className="uppercase" maxLength={2} /></FormControl>
                       <FormDescription>ISO 3166-1 alpha-2 code.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image URL (Optional)</FormLabel>
                      <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Brief description of the product..." {...field} className="resize-y min-h-[100px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                  {isSubmitting ? 'Creating Product...' : 'Create Product Passport'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Info className="h-6 w-6 text-blue-600"/>
            <div>
                <CardTitle className="font-headline text-blue-700">Next Steps</CardTitle>
                <CardDescription className="text-blue-600">After creating the product with its core information, you'll be redirected to the Product Management list. From there, you can select the product to manage its full Digital Product Passport, including detailed material composition, sustainability data, upload compliance documents, manage verification status, and generate consumer-facing QR codes.</CardDescription>
            </div>
        </CardHeader>
      </Card>

    </div>
  );
}
