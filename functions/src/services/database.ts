// functions/src/services/database.ts
import { getFirestore, Timestamp, FieldValue, Query as FirestoreQuery } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { CustomClaims } from './auth'; // Assuming CustomClaims is in auth.ts and exported

// --- Placeholder Interfaces for ProductPassport ---
export interface MaterialSummary {
  material: string;
  percentage: number;
  recycledContent?: number; // Optional: percentage of recycled material
  isHazardous?: boolean; // Optional: if the material is hazardous
}

export interface EnergyLabel {
  class: string; // e.g., A++, B, etc.
  value?: number; // e.g., kWh/annum
  unit?: string;  // e.g., kWh/annum
  scale?: string; // e.g., A+++ to D
}

export interface ChemicalComposition {
  substance: string;
  casNumber?: string;
  percentage: number;
  role?: string; // e.g., colorant, flame retardant
  isHazardous?: boolean;
}

export interface Component {
  componentId: string;
  name: string;
  material?: string;
  supplier?: string;
  recyclabilityInfo?: string;
  isCritical?: boolean; // For repair/supply chain
}

export interface SparePart {
  partId: string;
  name: string;
  availability: 'In Stock' | 'Out of Stock' | 'On Demand' | 'Discontinued';
  price?: number;
  sku?: string;
  estimatedDeliveryTime?: string;
}

export interface Supplier {
  supplierId: string;
  name: string;
  contact?: string;
  address?: string;
  certification?: string; // e.g., ISO 9001
}

export interface Location {
  country: string; // ISO 3166-1 alpha-2 code
  city?: string;
  address?: string;
  postalCode?: string;
  coordinates?: { lat: number; lon: number };
}

export interface ComponentOrigin {
  componentName: string;
  originCountry: string; // ISO 3166-1 alpha-2 code
  supplierId?: string;
  facilityName?: string;
}

export interface LogisticsData {
  shippingMethod?: string;
  carbonFootprintTransport?: number; // kg CO2e
  packagingInfo?: string; // e.g., material, recyclability
  incoterms?: string;
}

export interface ComplianceDocument {
  documentId: string;
  name: string;
  type: 'Test Report' | 'Certificate' | 'Declaration of Conformity';
  url?: string; // Link to the document if stored externally/cloud storage
  issueDate: Date | Timestamp;
  expiryDate?: Date | Timestamp;
  issuingBody?: string;
}

export interface Certification {
  certId: string;
  name: string; // e.g., CE, RoHS, FairTrade
  issuingBody: string;
  validFrom: Date | Timestamp;
  validTo?: Date | Timestamp;
  scope?: string;
  certificateUrl?: string;
}

export interface AuditRecord {
  auditId: string;
  date: Date | Timestamp;
  auditor: string;
  findings: string;
  status: 'passed' | 'failed' | 'pending' | 'conditional';
  correctiveActions?: string;
}

export interface QualityMetric {
  metricName: string;
  value: string | number;
  unit?: string;
  measurementDate: Date | Timestamp;
  targetValue?: string | number;
  tolerance?: string;
}

// --- Main ProductPassport Interface ---
export interface ProductPassport {
  productId: string; // Firestore document ID
  gtin: string; // Global Trade Item Number
  companyId: string; // ID of the company owning/manufacturing this product
  category: 'electronics' | 'battery' | 'textile' | 'furniture' | string; // Allow custom categories

  publicData: {
    basicInfo: {
      name: string;
      brand: string;
      model: string;
      description?: string;
      manufacturingDate: Date | Timestamp;
      countryOfOrigin: string; // ISO 3166-1 alpha-2 code
      imageUrl?: string; // URL to main product image
    };
    sustainability: {
      carbonFootprint?: number; // kg CO2e (product lifecycle assessment)
      energyLabelClass?: string;
      recyclabilityScore?: number; // Percentage
      materialSummary?: MaterialSummary[];
      repairabilityIndex?: number; // Score (e.g., 1-10)
      waterUsage?: number; // Liters per use or lifecycle
      renewableEnergyUsage?: number; // Percentage in manufacturing
    };
    compliance: {
      ceMarking?: boolean;
      energyLabel?: EnergyLabel;
      hazardousSubstances?: boolean; // e.g., RoHS compliance
      complianceStatus: 'verified' | 'pending' | 'non-compliant' | 'not-applicable';
      standards?: string[]; // e.g. ['ISO 14001', 'EU Ecodesign']
    };
    usage: {
      expectedLifespan?: number; // Years
      warrantyPeriod?: number; // Years
      usageInstructionsUrl?: string;
      safetyWarnings?: string[];
      maintenanceGuideUrl?: string;
    };
    endOfLife: {
      recyclingInstructionsUrl?: string;
      disassemblyGuideUrl?: string;
      takebackProgramAvailable?: boolean;
      takebackProgramUrl?: string;
      recyclingCodes?: string[]; // e.g. plastics #1-7
      expectedResidualValue?: number;
    };
  };

  restrictedData?: {
    technical: {
      fullComposition?: ChemicalComposition[];
      componentList?: Component[];
      technicalSpecs?: Record<string, any>;
      repairManualUrl?: string;
      spareParts?: SparePart[];
      schematicsUrl?: string;
    };
    supplyChain: { // Renamed from 'supply' for clarity
      supplierInfo?: Supplier[];
      manufacturingLocation?: Location;
      componentOrigins?: ComponentOrigin[];
      logisticsInfo?: LogisticsData;
      billOfMaterialsUrl?: string;
    };
    complianceDetails: { // Renamed from 'compliance' for clarity
      testReports?: ComplianceDocument[];
      certifications?: Certification[];
      auditRecords?: AuditRecord[];
      declarationOfConformityUrl?: string;
    };
  };

  privateData?: {
    business: {
      manufacturingCost?: number;
      profitMargin?: number;
      competitorAnalysisUrl?: string; // Link to document
      strategicInfo?: string;
      salesChannels?: string[];
    };
    intellectualProperty: { // Renamed from 'intellectual'
      patents?: string[];
      tradeSecrets?: string;
      designFilesUrl?: string[]; // Link to CAD files etc.
    };
    internalNotes: { // Renamed from 'internal'
      qualityMetrics?: QualityMetric[];
      internalProductNotes?: string;
      projectCodes?: string[];
      batchNumbers?: string[];
    };
  };

  verification: {
    status: 'draft' | 'pending' | 'verified' | 'rejected' | 'archived';
    verifiedBy?: string; // User ID or Verifier ID
    verificationDate?: Date | Timestamp;
    verificationMethod: 'automated' | 'manual' | 'hybrid';
    credentialId?: string; // e.g., Verifiable Credential ID from EBSI
    blockchainHash?: string; // Hash of the DPP on a blockchain
    lastUpdated: Date | Timestamp;
    version: number;
    changeLog?: Array<{ version: number; date: Date | Timestamp; userId: string; changes: string }>;
  };

  metadata: {
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
    createdBy: string; // User ID
    visibility: 'public' | 'restricted' | 'private' | 'company-only';
    tags?: string[];
    languages?: string[]; // ISO 639-1 codes
    searchKeywords?: string[];
    accessCount: number;
    lastAccessedAt?: Date | Timestamp;
    relatedProductIds?: string[]; // For accessories or product families
  };
}


// --- Service Method Specific Interfaces ---
export interface ProductSearchParams {
  companyId?: string;
  category?: string;
  status?: 'draft' | 'pending' | 'verified' | 'rejected' | 'archived';
  gtin?: string;
  keywords?: string; // For searching name, brand, model, keywords
  limit?: number;
  offset?: number; // Changed from startAfter for offset-based pagination
  orderBy?: string; // e.g., 'metadata.createdAt'
  orderDirection?: 'asc' | 'desc';
}

export interface ProductSearchResult {
  products: ProductPassport[];
  totalCount: number; 
  hasMore: boolean;
}

export interface CompanyData {
  id?: string; // ID is usually assigned by Firestore
  name: string;
  type: 'manufacturer' | 'verifier' | 'partner' | 'recycler' | 'regulator' | string;
  address?: Location;
  contactEmail?: string;
  website?: string;
  vatNumber?: string;
  registrationNumber?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  createdBy?: string;
  status?: 'active' | 'inactive' | 'pending_verification';
  memberIds?: string[];
  certifications?: any[]; // Using any for now, can be detailed later
  subscriptionTier?: 'starter' | 'professional' | 'enterprise';
  [key: string]: any;
}

export interface VerificationResult {
  success?: boolean; // from original prompt
  status: 'verified' | 'rejected'; // from database service prompt
  credentialId?: string;
  blockchainHash?: string;
  notes?: string;
  verificationReportUrl?: string; // from database service prompt
  error?: string; // from original prompt
  isValid?: boolean; // from EBSI context in prompt
  issuer?: string; // from EBSI context in prompt
  trustChain?: any; // from EBSI context in prompt
  revocationStatus?: string; // from EBSI context in prompt
  verificationTimestamp?: string; // from EBSI context in prompt
}

export interface AnalyticsMetrics {
  totalProducts?: FieldValue | number;
  newProducts?: FieldValue | number;
  verifiedProducts?: FieldValue | number;
  apiCalls?: FieldValue | number;
  qrScans?: FieldValue | number;
  publicViews?: FieldValue | number;
  errorRate?: FieldValue | number; // Percentage, store as number
  averageResponseTime?: FieldValue | number; // Milliseconds, store as number
  views?: FieldValue; 
  uniqueVisitors?: FieldValue; 
  downloads?: FieldValue;
  complianceChecksRun?: FieldValue;
  [key: string]: FieldValue | any;
}

export interface AnalyticsData {
  date: string; // YYYY-MM-DD
  metrics: Record<string, number | any>;
  companyMetrics?: Record<string, Record<string, number | any>>; // Optional: per-company breakdown
  timestamp: Date | Timestamp;
}


export class DatabaseService {
  private db = getFirestore();
  private storage = getStorage().bucket(); // Get default bucket

  // =============================================================================
  // PRODUCT OPERATIONS
  // =============================================================================

  async createProduct(productData: Partial<ProductPassport>, userId: string): Promise<string> {
    if (!productData.gtin || !productData.companyId || !productData.category || !productData.publicData?.basicInfo) {
      throw new Error('Missing required fields for product creation (gtin, companyId, category, publicData.basicInfo).');
    }
    try {
      const productRef = this.db.collection('products').doc(); // Auto-generate ID
      const productId = productRef.id;

      const now = Timestamp.now();
      const product: ProductPassport = {
        productId,
        gtin: productData.gtin,
        companyId: productData.companyId,
        category: productData.category,
        publicData: productData.publicData,
        restrictedData: productData.restrictedData,
        privateData: productData.privateData,
        verification: {
          status: 'draft',
          verificationMethod: 'automated', // Default, can be changed
          lastUpdated: now,
          version: 1,
          ...(productData.verification || {})
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          createdBy: userId,
          visibility: productData.metadata?.visibility || 'public',
          tags: productData.metadata?.tags || [],
          languages: productData.metadata?.languages || ['en'],
          searchKeywords: this.generateSearchKeywords(productData.publicData.basicInfo, productData.gtin, productData.category),
          accessCount: 0,
          ...(productData.metadata || {})
        }
      };

      await productRef.set(product);
      await this.logProductAccess(productId, userId, 'created', { gtin: product.gtin });
      return productId;
    } catch (error: any) {
      console.error('Error creating product:', error.message, error.stack);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async getProduct(
    productId: string,
    userId?: string,
    userClaims?: CustomClaims
  ): Promise<ProductPassport | null> {
    try {
      const productRef = this.db.collection('products').doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return null;
      }

      let product = productDoc.data() as ProductPassport;

      if (userId) {
        await this.logProductAccess(productId, userId, 'viewed');
        await productRef.update({
          'metadata.accessCount': FieldValue.increment(1),
          'metadata.lastAccessedAt': Timestamp.now()
        });
        product.metadata.accessCount = (product.metadata.accessCount || 0) + 1;
        product.metadata.lastAccessedAt = Timestamp.now();
      }

      return this.filterProductData(product, userClaims);
    } catch (error: any) {
      console.error(`Error getting product ${productId}:`, error.message, error.stack);
      throw new Error(`Failed to retrieve product: ${error.message}`);
    }
  }

  async updateProduct(
    productId: string,
    updateData: Partial<Omit<ProductPassport, 'productId' | 'gtin' | 'companyId' | 'category' | 'metadata' | 'verification'>> & 
                  { metadata?: Partial<ProductPassport['metadata']>, verification?: Partial<ProductPassport['verification']> },
    userId: string
  ): Promise<void> {
    try {
      const productRef = this.db.collection('products').doc(productId);
      const now = Timestamp.now();
  
      const updates: Record<string, any> = {};
      
      // Flatten updateData for direct field updates
      for (const [key, value] of Object.entries(updateData)) {
        if (key !== 'metadata' && key !== 'verification' && value !== undefined) {
          updates[key] = value;
        }
      }
      
      // Handle nested metadata updates
      if (updateData.metadata) {
        for (const [metaKey, metaValue] of Object.entries(updateData.metadata)) {
          if (metaValue !== undefined) {
            updates[`metadata.${metaKey}`] = metaValue;
          }
        }
      }
      
      // Handle nested verification updates
      if (updateData.verification) {
        for (const [verifKey, verifValue] of Object.entries(updateData.verification)) {
          if (verifValue !== undefined) {
            updates[`verification.${verifKey}`] = verifValue;
          }
        }
      }

      // Always update these fields
      updates['verification.lastUpdated'] = now;
      updates['verification.version'] = FieldValue.increment(1);
      updates['metadata.updatedAt'] = now;
  
      if (Object.keys(updates).length === 0) {
        console.log("No fields to update for product:", productId);
        return;
      }

      await productRef.update(updates);
      await this.logProductAccess(productId, userId, 'updated', { fieldsChanged: Object.keys(updateData) });
    } catch (error: any) {
      console.error(`Error updating product ${productId}:`, error.message, error.stack);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  private async getProductCount(searchParams: ProductSearchParams): Promise<number> {
    try {
      let query: FirestoreQuery = this.db.collection('products');

      if (searchParams.companyId) query = query.where('companyId', '==', searchParams.companyId);
      if (searchParams.category) query = query.where('category', '==', searchParams.category);
      if (searchParams.status) query = query.where('verification.status', '==', searchParams.status);
      if (searchParams.gtin) query = query.where('gtin', '==', searchParams.gtin);
      if (searchParams.keywords) {
        query = query.where('metadata.searchKeywords', 'array-contains-any', searchParams.keywords.toLowerCase().split(/\s+/).slice(0,10));
      }
      
      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error: any) {
      console.error('Error getting product count:', error.message, error.stack);
      throw new Error(`Failed to get product count: ${error.message}`);
    }
  }

  async searchProducts(
    searchParams: ProductSearchParams,
    userClaims?: CustomClaims
  ): Promise<ProductSearchResult> {
    try {
      let query: FirestoreQuery = this.db.collection('products');

      if (searchParams.companyId) query = query.where('companyId', '==', searchParams.companyId);
      if (searchParams.category) query = query.where('category', '==', searchParams.category);
      if (searchParams.status) query = query.where('verification.status', '==', searchParams.status);
      if (searchParams.gtin) query = query.where('gtin', '==', searchParams.gtin);
      if (searchParams.keywords) {
         query = query.where('metadata.searchKeywords', 'array-contains-any', searchParams.keywords.toLowerCase().split(/\s+/).slice(0,10));
      }
      
      if (searchParams.orderBy) {
        query = query.orderBy(searchParams.orderBy, searchParams.orderDirection || 'asc');
      } else {
        query = query.orderBy('metadata.createdAt', 'desc'); // Default sort
      }

      const totalCount = await this.getProductCount(searchParams);

      if (searchParams.offset) query = query.offset(searchParams.offset);
      
      const limit = searchParams.limit || 10;
      query = query.limit(limit); 

      const snapshot = await query.get();
      const products = snapshot.docs.map(doc => {
        const product = doc.data() as ProductPassport;
        return this.filterProductData(product, userClaims);
      });
      
      const hasMore = (searchParams.offset || 0) + products.length < totalCount;

      return {
        products,
        totalCount,
        hasMore
      };
    } catch (error: any) {
      console.error('Error searching products:', error.message, error.stack);
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  // =============================================================================
  // COMPANY OPERATIONS
  // =============================================================================

  async createCompany(companyData: CompanyData, userId: string): Promise<string> {
    if (!companyData.name || !companyData.type) {
        throw new Error('Company name and type are required.');
    }
    try {
      const companyRef = this.db.collection('companies').doc(); // Auto-generate ID
      const companyId = companyRef.id;
      const now = Timestamp.now();

      const company: CompanyData = {
        ...companyData,
        id: companyId,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        status: companyData.status || 'active', 
        memberIds: [userId, ...(companyData.memberIds || [])], 
      };

      await companyRef.set(company);
      return companyId;
    } catch (error: any) {
      console.error('Error creating company:', error.message, error.stack);
      throw new Error(`Failed to create company: ${error.message}`);
    }
  }

  async getCompany(companyId: string): Promise<CompanyData | null> {
    try {
      const companyDoc = await this.db.collection('companies').doc(companyId).get();
      return companyDoc.exists ? companyDoc.data() as CompanyData : null;
    } catch (error: any) {
      console.error(`Error getting company ${companyId}:`, error.message, error.stack);
      throw new Error(`Failed to retrieve company: ${error.message}`);
    }
  }
  
  async updateCompany(companyId: string, updateData: Partial<CompanyData>, userId?: string): Promise<void> {
    try {
      const companyRef = this.db.collection('companies').doc(companyId);
      const now = Timestamp.now();
      const updatesToApply: Partial<CompanyData> & { updatedAt: Timestamp } = {
        ...updateData,
        updatedAt: now,
      };
      // Optionally log who updated it if needed and userId is passed
      // if (userId) { updatesToApply.updatedBy = userId; }

      await companyRef.update(updatesToApply);
    } catch (error: any) {
      console.error(`Error updating company ${companyId}:`, error.message, error.stack);
      throw new Error(`Failed to update company: ${error.message}`);
    }
  }


  // =============================================================================
  // VERIFICATION OPERATIONS
  // =============================================================================

  async submitForVerification(productId: string, userId: string): Promise<void> {
    try {
      const productRef = this.db.collection('products').doc(productId);
      const verificationLogRef = this.db.collection('verificationLogs').doc(); 
      const now = Timestamp.now();

      await this.db.runTransaction(async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) throw new Error('Product not found.');
        
        transaction.update(productRef, {
          'verification.status': 'pending',
          'verification.lastUpdated': now,
          'metadata.updatedAt': now
        });

        transaction.set(verificationLogRef, {
          logId: verificationLogRef.id,
          productId,
          action: 'submitted_for_verification',
          userId,
          timestamp: now,
          details: { previousStatus: productDoc.data()?.verification.status, newStatus: 'pending' }
        });
      });
    } catch (error: any) {
      console.error(`Error submitting product ${productId} for verification:`, error.message, error.stack);
      throw new Error(`Failed to submit for verification: ${error.message}`);
    }
  }

  async completeVerification(
    productId: string,
    verifierId: string, 
    result: VerificationResult 
  ): Promise<void> {
    try {
      const productRef = this.db.collection('products').doc(productId);
      const verificationLogRef = this.db.collection('verificationLogs').doc(); 
      const now = Timestamp.now();

      await this.db.runTransaction(async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) throw new Error('Product not found.');

        transaction.update(productRef, {
          'verification.status': result.status,
          'verification.verifiedBy': verifierId,
          'verification.verificationDate': now,
          'verification.credentialId': result.credentialId || null,
          'verification.blockchainHash': result.blockchainHash || null,
          'verification.lastUpdated': now,
          'metadata.updatedAt': now
        });

        transaction.set(verificationLogRef, {
          logId: verificationLogRef.id,
          productId,
          verifierId,
          action: result.status === 'verified' ? 'verification_approved' : 'verification_rejected',
          result: result.status,
          notes: result.notes,
          timestamp: now,
          credentialId: result.credentialId,
          verificationReportUrl: result.verificationReportUrl
        });
      });
    } catch (error: any) {
      console.error(`Error completing verification for product ${productId}:`, error.message, error.stack);
      throw new Error(`Failed to complete verification: ${error.message}`);
    }
  }

  // =============================================================================
  // ANALYTICS OPERATIONS
  // =============================================================================

  async recordAnalytics(date: string, metrics: AnalyticsMetrics): Promise<void> {
    try {
      const analyticsRef = this.db.collection('analytics').doc(date);
      
      const updateMetrics: Record<string, FieldValue | any> = {};
      let hasMetricsToUpdate = false;
      for (const [key, value] of Object.entries(metrics)) {
        if (value instanceof FieldValue) { 
            updateMetrics[`metrics.${key}`] = value;
            hasMetricsToUpdate = true;
        } else if (typeof value === 'number') { 
            updateMetrics[`metrics.${key}`] = FieldValue.increment(value);
            hasMetricsToUpdate = true;
        }
      }
      
      if (hasMetricsToUpdate) {
        await analyticsRef.set({ 
            date, 
            timestamp: Timestamp.now(),
            ...updateMetrics 
        }, { merge: true });
      } else {
        // If only non-FieldValue/non-numeric metrics are passed, still ensure the doc exists with timestamp
        const doc = await analyticsRef.get();
        if (!doc.exists) {
            await analyticsRef.set({ date, timestamp: Timestamp.now(), metrics: {} }, { merge: true });
        } else {
            await analyticsRef.update({ timestamp: Timestamp.now() });
        }
      }
    } catch (error: any) {
      console.error(`Error recording analytics for date ${date}:`, error.message, error.stack);
      throw new Error(`Failed to record analytics: ${error.message}`);
    }
  }

  async getAnalytics(
    startDate: string, 
    endDate: string,   
    companyId?: string 
  ): Promise<AnalyticsData[]> {
    try {
      let query: FirestoreQuery = this.db.collection('analytics')
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date', 'asc');

      const snapshot = await query.get();
      const analytics = snapshot.docs.map(doc => doc.data() as AnalyticsData);

      if (companyId) {
        return analytics.map(data => this.filterAnalyticsByCompany(data, companyId));
      }

      return analytics;
    } catch (error: any) {
      console.error('Error getting analytics:', error.message, error.stack);
      throw new Error(`Failed to retrieve analytics: ${error.message}`);
    }
  }
  
  private filterAnalyticsByCompany(data: AnalyticsData, companyId: string): AnalyticsData {
    const companyMetricsData = data.companyMetrics?.[companyId] || {};
    return {
      ...data,
      metrics: { ...data.metrics, ...companyMetricsData }, // Example: merge or prioritize company specific
      companyMetrics: { [companyId]: companyMetricsData } // Only return specific company's breakdown
    };
  }


  // =============================================================================
  // UTILITY METHODS
  // =============================================================================
  private filterProductData(product: ProductPassport, userClaims?: CustomClaims): ProductPassport {
    const filteredProduct: Partial<ProductPassport> = {
      productId: product.productId,
      gtin: product.gtin,
      category: product.category,
      publicData: product.publicData,
      verification: { 
        status: product.verification.status,
        verificationDate: product.verification.verificationDate,
        credentialId: product.verification.credentialId, 
        lastUpdated: product.verification.lastUpdated,
        version: product.verification.version,
        verificationMethod: product.verification.verificationMethod, // Added this for completeness
      },
      metadata: { 
        createdAt: product.metadata.createdAt,
        updatedAt: product.metadata.updatedAt, 
        visibility: product.metadata.visibility,
        tags: product.metadata.tags,
        languages: product.metadata.languages,
        searchKeywords: product.metadata.searchKeywords,
        accessCount: product.metadata.accessCount, 
        lastAccessedAt: product.metadata.lastAccessedAt,
        createdBy: product.metadata.createdBy // Often useful to know creator
      }
    };

    if (userClaims) {
      const canAccessRestricted = this.canAccessRestrictedData(userClaims, product);
      const canAccessPrivate = this.canAccessPrivateData(userClaims, product);

      if (canAccessRestricted || canAccessPrivate) { // If private access, restricted is implied
        filteredProduct.restrictedData = product.restrictedData;
        // Full verification details if restricted or private access
        filteredProduct.verification = product.verification; 
      }

      if (canAccessPrivate) {
        filteredProduct.privateData = product.privateData;
        // Full metadata for private access
        filteredProduct.metadata = product.metadata; 
      }
    }
    return filteredProduct as ProductPassport; 
  }

  private canAccessRestrictedData(userClaims: CustomClaims, product: ProductPassport): boolean {
    if (!userClaims) return false;
    const roles = Array.isArray(userClaims.role) ? userClaims.role : [userClaims.role];
    
    return roles.includes('verifier') ||
           roles.includes('regulator') ||
           roles.includes('admin') || 
           (userClaims.companyId === product.companyId) || 
           (userClaims.permissions || []).includes('read:product:restricted') ||
           (userClaims.permissions || []).includes(`read:product:${product.productId}:restricted`);
  }

  private canAccessPrivateData(userClaims: CustomClaims, product: ProductPassport): boolean {
    if (!userClaims) return false;
    const roles = Array.isArray(userClaims.role) ? userClaims.role : [userClaims.role];

    return (userClaims.companyId === product.companyId && (roles.includes('admin') || roles.includes('owner') || roles.includes('user'))) || // Assuming 'user' role in owner company can see private
           roles.includes('regulator') || 
           roles.includes('admin') || // System admin
           (userClaims.permissions || []).includes('read:product:private') ||
           (userClaims.permissions || []).includes(`read:product:${product.productId}:private`);
  }

  private generateSearchKeywords(basicInfo: ProductPassport['publicData']['basicInfo'], gtin?: string, category?: string): string[] {
    const keywords = new Set<string>();

    const addWords = (text?: string) => {
      if (text) {
        text.toLowerCase().split(/[\s,.-]+/).forEach(word => { // Split by more delimiters
          if (word.length > 2) keywords.add(word.trim()); 
        });
      }
    };

    addWords(basicInfo.name);
    addWords(basicInfo.brand);
    addWords(basicInfo.model);
    addWords(basicInfo.description);
    if (gtin) keywords.add(gtin.toLowerCase());
    if (category) keywords.add(category.toLowerCase());
    if (basicInfo.countryOfOrigin) keywords.add(basicInfo.countryOfOrigin.toLowerCase());

    return Array.from(keywords);
  }

  private async logProductAccess(
    productId: string,
    userId: string,
    action: string, // 'created' | 'viewed' | 'updated' | 'deleted' | etc.
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const accessLogRef = this.db.collection('products').doc(productId).collection('accessLogs').doc();
      await accessLogRef.set({
        logId: accessLogRef.id,
        userId,
        action,
        timestamp: Timestamp.now(),
        details: details || {}, // Store additional context
        // Consider adding ip: req.ip, userAgent: req.get('User-Agent') if called from request context
      });
    } catch (error: any) {
      console.error(`Error logging product access for ${productId}, action ${action}:`, error.message, error.stack);
    }
  }
  
  async getVerificationLogs(productId: string, limit: number = 20): Promise<any[]> {
    try {
        const snapshot = await this.db.collection('verificationLogs')
            .where('productId', '==', productId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error: any) {
        console.error(`Error fetching verification logs for product ${productId}:`, error.message, error.stack);
        throw new Error(`Failed to fetch verification logs: ${error.message}`);
    }
  }
}
