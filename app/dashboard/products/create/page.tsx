
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm, type SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Removed z from here, it's now in product-form-types
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { createProductAction } from '@/app/actions/products'; 
import { multiStepProductFormSchema, type MultiStepProductFormValues } from '@/types/product-form-types'; // Import from shared types
import { Loader2, PackagePlus, ArrowLeft, CalendarIcon, Info, ChevronRight, ChevronLeft, UploadCloud, FileText, RecycleIcon, LeafIcon, CheckCircle, NetworkIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const productCategories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'battery', label: 'Batteries' },
  { value: 'textile', label: 'Textiles' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'other', label: 'Other' },
];

const complianceStatusOptions = ['Compliant', 'Non-Compliant', 'Pending Review', 'Partially Compliant'];

const steps = [
  { id: 1, name: 'Core Information', fields: ['gtin', 'name', 'brand', 'model', 'category', 'manufacturingDate', 'countryOfOrigin', 'description', 'imageUrl'] as (keyof MultiStepProductFormValues)[] },
  { id: 2, name: 'Sustainability', fields: ['carbonFootprint', 'recyclabilityScore', 'materialSummary'] as (keyof MultiStepProductFormValues)[] },
  { id: 3, name: 'Compliance & Documents', fields: ['complianceStatus', 'declarationOfConformity', 'testReports'] as (keyof MultiStepProductFormValues)[] },
  { id: 4, name: 'Supply Chain & Manufacturing', fields: ['manufacturingSiteName', 'manufacturingSiteLocation', 'supplierInformation', 'componentOriginsInfo'] as (keyof MultiStepProductFormValues)[] },
  { id: 5, name: 'Review & Submit', fields: [] as (keyof MultiStepProductFormValues)[] },
];

export default function CreateMultiStepProductPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallFormData, setOverallFormData] = useState<Partial<MultiStepProductFormValues>>({});

  const methods = useForm<MultiStepProductFormValues>({
    resolver: zodResolver(multiStepProductFormSchema),
    mode: "onChange", 
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
      carbonFootprint: undefined,
      recyclabilityScore: undefined,
      materialSummary: '',
      complianceStatus: 'Pending Review', 
      declarationOfConformity: undefined,
      testReports: undefined,
      manufacturingSiteName: '',
      manufacturingSiteLocation: '',
      supplierInformation: '',
      componentOriginsInfo: '',
    },
  });

  const { handleSubmit, trigger, getValues, formState: { errors } } = methods;

  const nextStep = async () => {
    const currentStepFields = steps[currentStep].fields;
    const isValid = await trigger(currentStepFields);
    if (isValid) {
      setOverallFormData(prev => ({ ...prev, ...getValues() }));
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
       toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors before proceeding.",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setOverallFormData(prev => ({ ...prev, ...getValues() })); 
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit: SubmitHandler<MultiStepProductFormValues> = async (data) => {
    setIsSubmitting(true);
    const finalData = { ...overallFormData, ...data }; 

    // Prepare data for the server action, handling potential file objects
    // The server action now expects MultiStepProductFormValues, but File objects
    // need to be handled (e.g., by extracting names or not sending them if they are not simple string paths)
    // For this mock, we'll pass the names if they are File/FileList objects.
    const actionParams: MultiStepProductFormValues = {
      ...finalData,
      declarationOfConformity: finalData.declarationOfConformity instanceof File 
        ? finalData.declarationOfConformity.name 
        : (typeof finalData.declarationOfConformity === 'string' ? finalData.declarationOfConformity : undefined),
      testReports: finalData.testReports instanceof FileList 
        ? Array.from(finalData.testReports).map(f => f.name) 
        : (Array.isArray(finalData.testReports) && finalData.testReports.every(item => typeof item === 'string') ? finalData.testReports : undefined),
    };
    
    try {
      console.log("Submitting to createProductAction:", actionParams);
      console.log("Full form data captured before action:", finalData); 

      const result = await createProductAction(actionParams);
      if (result.success) {
        toast({
          title: "Product Passport Created!",
          description: result.message || `Product "${actionParams.name}" has been added successfully.`,
        });
        methods.reset();
        setOverallFormData({});
        setCurrentStep(0);
      } else {
        toast({
          variant: "destructive",
          title: "Creation Failed",
          description: result.message || "Could not create the product. Please check errors.",
          errors: result.errors // Assuming server action might return specific field errors
        } as any); // Cast to any if `errors` prop is not in default toast options
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
  
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <FormProvider {...methods}>
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
              Follow this guided 5-step workflow to register a new product and its DPP information.
            </p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</CardTitle>
            <Progress value={progressValue} className="mt-2 h-2" />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {currentStep === 0 && (
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Core Product Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={methods.control} name="gtin" render={({ field }) => (<FormItem><FormLabel>GTIN</FormLabel><FormControl><Input placeholder="e.g., 1234567890123" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={methods.control} name="name" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., EcoSmart LED Bulb E27" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={methods.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="e.g., BrightLife" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={methods.control} name="model" render={({ field }) => (<FormItem><FormLabel>Model Number / SKU</FormLabel><FormControl><Input placeholder="e.g., BL-LED-E27-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={methods.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select product category" /></SelectTrigger></FormControl><SelectContent>{productCategories.map(cat => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={methods.control} name="manufacturingDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Manufacturing Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP"): (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                    <FormField control={methods.control} name="countryOfOrigin" render={({ field }) => (<FormItem><FormLabel>Country of Origin (2-letter code)</FormLabel><FormControl><Input placeholder="e.g., DE, US, CN" {...field} className="uppercase" maxLength={2} /></FormControl><FormDescription>ISO 3166-1 alpha-2 code.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={methods.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Product Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                   <FormField control={methods.control} name="description" render={({ field }) => (<FormItem><FormLabel>Product Description (Optional)</FormLabel><FormControl><Textarea placeholder="Brief description of the product..." {...field} className="resize-y min-h-[100px]" /></FormControl><FormMessage /></FormItem>)} />
                </section>
              )}

              {currentStep === 1 && (
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><LeafIcon className="h-5 w-5 text-primary"/>Sustainability Details</h3>
                  <FormField control={methods.control} name="carbonFootprint" render={({ field }) => (<FormItem><FormLabel>Carbon Footprint (kg CO2e)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 150.5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={methods.control} name="recyclabilityScore" render={({ field }) => (<FormItem><FormLabel>Recyclability Score (%)</FormLabel><FormControl><Input type="number" step="1" min="0" max="100" placeholder="e.g., 85" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={methods.control} name="materialSummary" render={({ field }) => (<FormItem><FormLabel>Material Summary (Optional)</FormLabel><FormControl><Textarea placeholder="Describe key materials, recycled content, etc." {...field} className="resize-y min-h-[120px]" /></FormControl><FormMessage /></FormItem>)} />
                </section>
              )}

              {currentStep === 2 && (
                <section className="space-y-6">
                   <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>Compliance & Documents</h3>
                   <FormField control={methods.control} name="complianceStatus" render={({ field }) => (<FormItem><FormLabel>Overall Compliance Status (Initial)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select initial status" /></SelectTrigger></FormControl><SelectContent>{complianceStatusOptions.map(status => (<SelectItem key={status} value={status}>{status}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  
                  <FormField
                    control={methods.control}
                    name="declarationOfConformity"
                    render={({ field: { onChange, onBlur, name, ref } }) => ( // Destructure field to manually handle file input
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><UploadCloud className="h-4 w-4 text-muted-foreground"/>Declaration of Conformity (DoC)</FormLabel>
                        <Input 
                          type="file" 
                          onBlur={onBlur}
                          name={name}
                          ref={ref}
                          onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)} // Pass File object
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {errors.declarationOfConformity && <p className="text-sm font-medium text-destructive">{errors.declarationOfConformity.message as string}</p>}
                        <FormDescription>Upload the main DoC for this product.</FormDescription>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={methods.control}
                    name="testReports"
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><UploadCloud className="h-4 w-4 text-muted-foreground"/>Relevant Test Reports</FormLabel>
                        <Input 
                          type="file" 
                          multiple
                          onBlur={onBlur}
                          name={name}
                          ref={ref}
                          onChange={(e) => onChange(e.target.files)} // Pass FileList object
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {errors.testReports && <p className="text-sm font-medium text-destructive">{errors.testReports.message as string}</p>}
                        <FormDescription>Upload other relevant test reports (e.g., safety, EMC).</FormDescription>
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground pt-2">Note: File upload functionality is a placeholder. Actual file handling requires server-side storage integration.</p>
                </section>
              )}

              {currentStep === 3 && (
                <section className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><NetworkIcon className="h-5 w-5 text-primary"/>Supply Chain & Manufacturing</h3>
                  <FormField control={methods.control} name="manufacturingSiteName" render={({ field }) => (<FormItem><FormLabel>Manufacturing Site Name (Optional)</FormLabel><FormControl><Input placeholder="e.g., GreenTech Factory One" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={methods.control} name="manufacturingSiteLocation" render={({ field }) => (<FormItem><FormLabel>Manufacturing Site Location (Optional)</FormLabel><FormControl><Input placeholder="e.g., Berlin, Germany" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={methods.control} name="supplierInformation" render={({ field }) => (<FormItem><FormLabel>Key Supplier Information (Optional)</FormLabel><FormControl><Textarea placeholder="List key suppliers and their roles, e.g., BatteryCo - Battery Supplier; ChipSource - Microcontroller Supplier" {...field} className="resize-y min-h-[100px]" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={methods.control} name="componentOriginsInfo" render={({ field }) => (<FormItem><FormLabel>Component Origins (Optional)</FormLabel><FormControl><Textarea placeholder="Describe origin of key components, e.g., Display Panel - South Korea; Casing - Vietnam (Recycled Aluminum)" {...field} className="resize-y min-h-[100px]" /></FormControl><FormMessage /></FormItem>)} />
                </section>
              )}
              
              {currentStep === 4 && (
                 <section className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary"/>Review & Submit</h3>
                    <Card className="bg-muted/30">
                      <CardHeader><CardTitle className="text-base">Review your entries:</CardTitle></CardHeader>
                      <CardContent className="space-y-2 text-sm max-h-96 overflow-y-auto">
                        {Object.entries(overallFormData).map(([key, value]) => {
                          if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (typeof value === 'object' && !(value instanceof Date) && !(value instanceof File) && !(value instanceof FileList) && Object.keys(value).length === 0) || (Array.isArray(value) && value.length === 0)) return null;
                          
                          let displayValue = value;
                          if (value instanceof Date) {
                            displayValue = format(value, 'PPP');
                          } else if (value instanceof File) {
                            displayValue = `File: ${value.name} (${(value.size / 1024).toFixed(2)} KB)`;
                          } else if (value instanceof FileList) {
                             displayValue = Array.from(value).map(f => `${f.name} (${(f.size / 1024).toFixed(2)} KB)`).join(', ');
                          } else if (typeof value === 'object' && value !== null) {
                            displayValue = JSON.stringify(value); // Fallback for other objects
                          }
                          
                          return (
                            <div key={key} className="grid grid-cols-3 gap-2 items-start">
                              <strong className="capitalize col-span-1 text-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> 
                              <span className="col-span-2 break-words text-muted-foreground">{String(displayValue)}</span>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                 </section>
              )}

              <div className="flex justify-between pt-6 border-t">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep} disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Creating Passport...' : 'Create Product Passport'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
