
"use client"; // Though primarily for types, Zod can be used client-side for validation.

import { z } from 'zod';

// This Zod schema defines the shape of the entire 5-step form.
export const multiStepProductFormSchema = z.object({
  // Step 1: Core Information
  gtin: z.string().min(8, "GTIN must be at least 8 digits").max(14, "GTIN can be at most 14 digits").regex(/^[0-9]+$/, "GTIN must be numeric"),
  name: z.string().min(3, "Product name must be at least 3 characters.").max(100, "Product name can be at most 100 characters."),
  brand: z.string().min(2, "Brand must be at least 2 characters.").max(50, "Brand can be at most 50 characters."),
  model: z.string().min(1, "Model is required.").max(50, "Model can be at most 50 characters."),
  category: z.enum(['electronics', 'battery', 'textile', 'furniture', 'appliances', 'packaging', 'other'], { required_error: "Category is required." }),
  manufacturingDate: z.date({ required_error: "Manufacturing date is required." }),
  countryOfOrigin: z.string().length(2, "Country code must be 2 uppercase letters e.g. US, DE, CN.").regex(/^[A-Z]{2}$/, "Must be 2 uppercase letters."),
  description: z.string().max(500, "Description can be at most 500 characters.").optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),

  // Step 2: Sustainability Details
  carbonFootprint: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "Must be a number" }).positive("Must be positive if provided").optional()
  ),
  recyclabilityScore: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "Must be a number" }).min(0).max(100, "Must be between 0-100").optional()
  ),
  materialSummary: z.string().max(1000, "Material summary too long").optional(),

  // Step 3: Compliance & Documents
  complianceStatus: z.enum(['Compliant', 'Non-Compliant', 'Pending Review', 'Partially Compliant'], {required_error: "Compliance status is required."}).optional(),
  declarationOfConformity: z.any().optional(), // For File object or FileList
  testReports: z.any().optional(), // For FileList object or array of Files

  // Step 4: Supply Chain & Manufacturing
  manufacturingSiteName: z.string().max(100, "Site name too long").optional(),
  manufacturingSiteLocation: z.string().max(150, "Site location too long").optional(),
  supplierInformation: z.string().max(2000, "Supplier information too long").optional(),
  componentOriginsInfo: z.string().max(2000, "Component origins information too long").optional(),
});

export type MultiStepProductFormValues = z.infer<typeof multiStepProductFormSchema>;

// --- Moved from src/app/actions/products.ts ---

export interface QRCodeData {
  dataURL?: string;
  digitalLink?: string;
  generatedAt?: string; // ISO Date string
}

// Document interface for product documents
export interface ProductDocument {
  id: string;
  name: string;
  type: string; // e.g., 'Declaration of Conformity', 'Test Report', 'User Manual', 'Image', 'Spreadsheet', 'Certificate', 'Other'
  uploadDate: string; // ISO Date string
  fileUrl: string; // Mock URL
  version?: string;
  size?: string; // e.g., "2.5 MB"
  fileName?: string; // Original file name
}


export interface MockProduct {
  id: string;
  gtin: string;
  name: string;
  brand: string;
  model: string;
  serialNumber?: string;
  category: 'electronics' | 'battery' | 'textile' | 'furniture' | 'appliances' | 'packaging' | 'other';
  manufacturingDate: string; // ISO string
  countryOfOrigin: string;
  description?: string;
  imageUrl?: string;
  
  dppStatus: 'Complete' | 'Incomplete' | 'Pending Supplier' | 'Pending Verification' | 'Changes Requested' | 'Draft';
  dppCompletion: number;
  
  // Compliance section
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Pending Review' | 'Partially Compliant';
  declarationOfConformityDocName?: string; 
  testReportDocNames?: string[]; 
  regulations?: Array<{ name: string; status: string }>;
  certificates?: Array<{ name: string; issuer: string; expiryDate?: string; documentLink?: string }>;
  
  // Sustainability section
  carbonFootprint?: number | null; // Allow null for optional numeric fields
  recyclabilityScore?: number | null; 
  materialSummary?: string | null; 
  energyConsumption?: string | null; 
  waterUsage?: string | null; 
  renewableMaterialContent?: number | null;
  repairabilityIndex?: number | null;

  // Supply Chain & Manufacturing section
  manufacturingSiteName?: string | null;
  manufacturingSiteLocation?: string | null;
  supplierInformation?: string | null; 
  componentOriginsInfo?: string | null; 
  suppliers?: Array<{ id: string; name: string; role: string; location?: string; certification?: string; }>;
  componentOrigins?: Array<{ componentName: string; originCountry: string; supplierName?: string; }>;
  manufacturingSite?: { name: string; location: string; certifications?: string[]; };

  // Other metadata
  lastAuditDate?: string; // ISO string
  lastUpdated: string; // ISO string
  verificationLog?: Array<{ event: string; date: string; verifier: string; notes?: string }>;
  companyId: string;
  qrCode?: QRCodeData;
  documents?: ProductDocument[]; // Updated to use ProductDocument interface
  blockchain?: { 
    nftTokenId?: string;
    contractAddress?: string;
    transactionHash?: string;
  };
}

export const productDetailsUpdateSchema = z.object({
  gtin: z.string().min(8).max(14).regex(/^[0-9]+$/, "GTIN must be numeric").optional(),
  name: z.string().min(3).max(100).optional(),
  brand: z.string().min(2).max(50).optional(),
  model: z.string().min(1).max(50).optional(),
  category: z.enum(['electronics', 'battery', 'textile', 'furniture', 'appliances', 'packaging', 'other']).optional(),
  manufacturingDate: z.string().optional(), // Kept as ISO string for action
  countryOfOrigin: z.string().length(2).regex(/^[A-Z]{2}$/, "Must be 2 uppercase letters").optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')).nullable(),
  serialNumber: z.string().max(50, "Serial number too long").optional().nullable(),
});

export type ProductDetailsUpdateValues = z.infer<typeof productDetailsUpdateSchema>;


// New schema for Sustainability Tab
export const productSustainabilityUpdateSchema = z.object({
  carbonFootprint: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)), // Allow null
    z.number({ invalid_type_error: "Must be a number" }).positive("Must be positive if provided").nullable().optional()
  ),
  recyclabilityScore: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)), // Allow null
    z.number({ invalid_type_error: "Must be a number" }).min(0).max(100, "Must be between 0-100").nullable().optional()
  ),
  materialSummary: z.string().max(1000, "Material summary too long").nullable().optional(),
  energyConsumption: z.string().max(50, "Energy consumption value too long").nullable().optional(),
  waterUsage: z.string().max(50, "Water usage value too long").nullable().optional(),
  renewableMaterialContent: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)), // Allow null
    z.number({ invalid_type_error: "Must be a number" }).min(0).max(100).nullable().optional()
  ),
  repairabilityIndex: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)), // Allow null
    z.number({ invalid_type_error: "Must be a number" }).min(0).max(10).nullable().optional() // Assuming 0-10 scale
  ),
});

export type ProductSustainabilityUpdateValues = z.infer<typeof productSustainabilityUpdateSchema>;

// New schema for Supply Chain Tab
export const productSupplyChainUpdateSchema = z.object({
  manufacturingSiteName: z.string().max(100, "Site name too long").nullable().optional(),
  manufacturingSiteLocation: z.string().max(150, "Site location too long").nullable().optional(),
  supplierInformation: z.string().max(2000, "Supplier information too long").nullable().optional(),
  componentOriginsInfo: z.string().max(2000, "Component origins information too long").nullable().optional(),
});

export type ProductSupplyChainUpdateValues = z.infer<typeof productSupplyChainUpdateSchema>;


// --- End of moved types/schemas ---



