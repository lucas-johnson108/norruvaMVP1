
"use client";
import React, { useState, useEffect } from 'react';
import { useForm, Controller, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Zap, Recycle, Droplets, Sun, Wrench as RepairIcon, Save, Loader2 } from 'lucide-react';
import type { MockProduct as Product } from '@/app/actions/products';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { productSustainabilityUpdateSchema, type ProductSustainabilityUpdateValues } from '@/types/product-form-types';
import { updateProductSustainabilityAction } from '@/app/actions/products';

interface SustainabilityTabProps {
  product: Product | null;
  refreshProductData: () => void;
}

// Helper component for editable stats, now integrated with react-hook-form
const SustainabilityStatEditable: React.FC<{
  control: any; // Control object from react-hook-form
  name: keyof ProductSustainabilityUpdateValues; // Name of the field in the form
  icon: React.ElementType;
  label: string;
  unit?: string;
  isNumeric?: boolean;
  placeholder?: string;
}> = ({ control, name, icon: Icon, label, unit, isNumeric, placeholder }) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="p-4 border rounded-lg bg-muted/40 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <div className="p-2 bg-primary/10 rounded-lg mr-3 shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <FormLabel htmlFor={name} className="text-sm font-medium text-muted-foreground">{label}</FormLabel>
          </div>
          <div className="flex items-center">
            <FormControl>
              <Input
                id={name}
                type={isNumeric ? "number" : "text"}
                placeholder={placeholder || (unit ? `e.g., ${isNumeric ? '100' : 'Value'}` : 'Enter value')}
                className="text-lg font-semibold text-foreground flex-grow"
                {...field}
                value={field.value === null || field.value === undefined ? '' : String(field.value)} // Handle null/undefined for input
                onChange={(e) => {
                  const val = e.target.value;
                  if (isNumeric) {
                    field.onChange(val === '' ? null : parseFloat(val)); // Allow clearing to null
                  } else {
                    field.onChange(val === '' ? null : val); // Allow clearing to null
                  }
                }}
              />
            </FormControl>
            {unit && <span className="text-sm font-normal text-muted-foreground ml-2 whitespace-nowrap">{unit}</span>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const SustainabilityTab: React.FC<SustainabilityTabProps> = ({ product, refreshProductData }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ProductSustainabilityUpdateValues>({
    resolver: zodResolver(productSustainabilityUpdateSchema),
    defaultValues: {
      carbonFootprint: product?.carbonFootprint ?? null,
      recyclabilityScore: product?.recyclabilityScore ?? null,
      materialSummary: product?.materialSummary ?? null,
      energyConsumption: product?.energyConsumption ?? null,
      waterUsage: product?.waterUsage ?? null,
      renewableMaterialContent: product?.renewableMaterialContent ?? null,
      repairabilityIndex: product?.repairabilityIndex ?? null,
    },
  });

  useEffect(() => {
    if (product) {
      methods.reset({
        carbonFootprint: product.carbonFootprint ?? null,
        recyclabilityScore: product.recyclabilityScore ?? null,
        materialSummary: product.materialSummary ?? null,
        energyConsumption: product.energyConsumption ?? null,
        waterUsage: product.waterUsage ?? null,
        renewableMaterialContent: product.renewableMaterialContent ?? null,
        repairabilityIndex: product.repairabilityIndex ?? null,
      });
    }
  }, [product, methods]);

  const onSubmit: SubmitHandler<ProductSustainabilityUpdateValues> = async (data) => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      const result = await updateProductSustainabilityAction(product.id, data);
      if (result.success) {
        toast({ title: "Sustainability Updated", description: result.message });
        refreshProductData();
        methods.reset(data); // Re-set form with saved values to clear dirty state
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: result.message || "Could not save sustainability data." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!product) return <p>Loading sustainability data...</p>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-xl"><Leaf className="mr-2 h-6 w-6 text-accent" />Sustainability Profile: {product.name}</CardTitle>
            <CardDescription>View and edit the product's environmental and sustainability characteristics.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SustainabilityStatEditable control={methods.control} name="carbonFootprint" icon={Leaf} label="Carbon Footprint" unit="kg CO₂e" isNumeric placeholder="e.g., 150.5"/>
            <SustainabilityStatEditable control={methods.control} name="recyclabilityScore" icon={Recycle} label="Recyclability Score" unit="%" isNumeric placeholder="e.g., 85"/>
            <SustainabilityStatEditable control={methods.control} name="energyConsumption" icon={Zap} label="Energy Consumption" unit="kWh/year (example)" placeholder="e.g., 150 kWh/year"/>
            <SustainabilityStatEditable control={methods.control} name="waterUsage" icon={Droplets} label="Water Usage" unit="L/cycle (example)" placeholder="e.g., 20L/cycle"/>
            <SustainabilityStatEditable control={methods.control} name="renewableMaterialContent" icon={Sun} label="Renewable Material Content" unit="%" isNumeric placeholder="e.g., 30"/>
            <SustainabilityStatEditable control={methods.control} name="repairabilityIndex" icon={RepairIcon} label="Repairability Index" unit="/ 10" isNumeric placeholder="e.g., 8.5"/>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader><CardTitle className="font-headline text-lg">Material Composition Summary</CardTitle></CardHeader>
          <CardContent>
            <FormField
              control={methods.control}
              name="materialSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="materialSummaryEditable">Detailed Material Breakdown</FormLabel>
                  <FormControl>
                    <Textarea 
                        id="materialSummaryEditable"
                        className="text-sm text-muted-foreground whitespace-pre-line min-h-[120px] resize-y mt-1"
                        placeholder="Describe key materials, their sources, recycled content percentages, and any hazardous substance declarations..."
                        {...field}
                        value={field.value ?? ""} // Handle null for textarea
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="pt-4 text-right">
            <Button type="submit" disabled={isSubmitting || !methods.formState.isDirty} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
              Save Sustainability Changes
            </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default SustainabilityTab;

