
"use client";
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CheckSquare } from 'lucide-react'; 
import type { ComplianceCheckInput, ComplianceCheckOutput } from '@/ai/flows/compliance-check-types';

const FormSchema = z.object({
  productData: z.string().min(50, { message: "Product data must be at least 50 characters." }),
  complianceStandards: z.string().min(50, { message: "Compliance standards must be at least 50 characters." }),
});

type ComplianceCheckFormValues = z.infer<typeof FormSchema>;

interface ComplianceCheckFormProps {
  onComplianceCheck: (data: ComplianceCheckInput) => Promise<ComplianceCheckOutput | null>;
  setReport: (report: ComplianceCheckOutput | null) => void;
  setIsLoadingReport: (isLoading: boolean) => void;
}

const sampleProductData = `{
  "dpp_id": "DPP-ES2000-20250603-0001",
  "product_name": "EcoSmart 2000 Smartphone",
  "gtin": "1234567890123",
  "model": "ES2K-A1",
  "manufacturer": {
    "name": "GreenTech Electronics S.A.",
    "address": "Avenida da Liberdade 100, 1250-096 Lisbon, Portugal"
  },
  "release_date": "2025-06-03",
  "materials": [
    {
      "component": "Housing (Chassis)",
      "material": "Aluminum (Recycled ≥75%)",
      "origin": "ReAlu Manufacturing, DE",
      "recyclability": "High",
      "recycled_content_percent": 75
    },
    {
      "component": "Battery Module",
      "material": "Li-ion (Lithium, Cobalt, Graphite)",
      "origin": "EcoCells Ltd., KR",
      "recyclability": "Medium-Low",
      "recycled_content_percent": 0
    }
  ],
  "environmental": {
    "carbon_footprint": {
      "cradle_to_gate": 24,
      "use_phase_per_year": 15,
      "end_of_life_credits": -5
    },
    "repairability_index": 9,
    "recyclability_index": 8
  },
  "hazardous_substances": {
    "rohs": {
      "lead": "<0.1%",
      "mercury": "<0.01%",
      "cadmium": "<0.01%",
      "hexavalent_chromium": "<0.1%",
      "pbb_pbde": "<0.1%"
    },
    "reach_svhcs": [
      {
        "substance": "Cobalt compounds",
        "percent": "<0.1%"
      }
    ]
  },
  "compliance": {
    "CE": true,
    "RoHS": true,
    "REACH": true,
    "WEEE": true,
    "Energy_Efficiency": "ErP Tier 2"
  },
  "packaging": {
    "material": "FSC cardboard, recycled PET tray",
    "weight_grams": 120,
    "recyclability": "High",
    "instructions": "Dispose with paper/cardboard recycling; remove PET tray and recycle separately."
  }
}`;

const sampleComplianceStandards = `CE Marking (Directive 2014/30/EU – EMC; Directive 2014/35/EU – Low Voltage; RED 2014/53/EU – Radio Equipment):
Declaration of Conformity: DOC-ES2K-20250601
Test Reports:
EMC Report: EMC-GT-0525
Radio Module (5G/LTE/Wi-Fi/Bluetooth): RED-GT-0425
LVD (Safety): LVD-GT-0525

RoHS Compliance (Directive 2011/65/EU & (EU) 2015/863):
RoHS Test Certificate: ROS-GT-0325
All six restricted substances (Pb, Hg, Cd, hex-Cr, PBB, PBDE) below threshold.

REACH SVHC Statement (Regulation (EC) 1907/2006):
Document: REACH-GT-0525
Only cobalt compounds in battery at <0.1 % by weight.

WEEE (Directive 2012/19/EU):
WEEE Registration Number: PT12345678
Product labeled with crossed-out wheelie bin symbol and WEEE producer info.

Energy-related Products (ErP Directive 2009/125/EC):
ErP Efficiency Class: Tier 2 (Measured standby consumption: 0.2 W; battery charging efficiency ≥85 %)
ErP Test Report: ERP-GT-0425

Battery Directive (2006/66/EC):
Battery Labeling: Complies with Pb, Cd, Hg markings; recycling logo with “Pb”, “Cd”
Battery Safety Tests: IEC 62133-2:2017 certified (Report: BAT-GT-0325)

Restriction of Chemicals in Packaging (Directive 94/62/EC & amendments):
All packaging inks & adhesives free of heavy metals >0.01 %
Recycled PET tray meets EU Regulation (EC) 10/2011 for food-contact materials (optional, if used for food contact)

Eco-Design (Directive 2019/2021/EC – Circular Electronics Initiative):
Meets proposed requirements for repairability, durability (MTBF >50,000 hours), spare parts availability for 5 years.

Quality Management Standard: ISO 9001:2015 (Certificate No. QMS-GT-2025)
Environmental Management Standard: ISO 14001:2015 (Certificate No. EMS-GT-2025)`;

export default function ComplianceCheckForm({ onComplianceCheck, setReport, setIsLoadingReport }: ComplianceCheckFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ComplianceCheckFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      productData: sampleProductData,
      complianceStandards: sampleComplianceStandards,
    },
  });

  const onSubmit: SubmitHandler<ComplianceCheckFormValues> = async (data) => {
    setIsSubmitting(true);
    setIsLoadingReport(true);
    setReport(null); // Clear previous report

    try {
      const result = await onComplianceCheck(data);
      setReport(result);
    } catch (error) {
      console.error("Compliance check failed:", error);
      setReport({
        overallStatus: "Error",
        summary: `An error occurred during the compliance check: ${error instanceof Error ? error.message : String(error)}`,
        detailedChecks: [],
        reportId: `err_frontend_${new Date().getTime()}`
      });
    } finally {
      setIsSubmitting(false);
      setIsLoadingReport(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><CheckSquare className="text-accent h-6 w-6"/>AI-Powered Compliance Check</CardTitle>
        <CardDescription>
          Enter product data (JSON format) and relevant compliance standards to generate an AI-driven conformance report. Sample data is pre-filled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Data (JSON format)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste detailed product specifications, material composition, manufacturing details, etc. in JSON format."
                      className="min-h-[200px] resize-y font-mono text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="complianceStandards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compliance Standards (e.g., ISO 14021, EU Battery Regulation)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Specify the relevant compliance directives, standards, or regulations to check against."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting} className="w-full bg-primary hover:bg-primary/90">
              {(isSubmitting || form.formState.isSubmitting) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckSquare className="mr-2 h-4 w-4" />
              )}
              {(isSubmitting || form.formState.isSubmitting) ? 'Analyzing Data...' : 'Run Compliance Check'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
