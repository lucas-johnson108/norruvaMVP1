// functions/src/integrations/eprelConnector.ts
'use server';

/**
 * @fileOverview Connector for the EPREL (European Product Registry for Energy Labelling) API.
 * Facilitates fetching product data, energy labels, and compliance information from EPREL.
 */

// Re-using structure from existing functions/src/services/eprel.ts
// Note: `fetch` is globally available in Node.js 18+

export interface EPRELValidationResult {
  isRegistered: boolean;
  registrationNumber?: string;
  energyLabelClass?: string;
  productCategory?: string;
  lastUpdated?: Date;
  complianceStatus: 'compliant' | 'non_compliant' | 'unknown'; // Consistent with definition
  error?: string;
  officialData?: any; // Raw data from EPREL
}

export interface EnergyData {
  energyClass: string;
  annualConsumption: number; // kWh/annum typically
  standbyConsumption?: number; // Watts
  peakConsumption?: number; // Watts
  testStandard?: string;
  measurementDate?: Date;
  certificationBody?: string;
  // Add more fields as per EPREL data model
}

export interface EPRELProductData {
  gtin: string; // Or other identifier used by EPREL
  registrationNumber: string;
  modelIdentifier: string;
  supplierName: string;
  brandName: string;
  productCategory: string;
  energyData?: EnergyData;
  documents?: Array<{ name: string, url: string, type: string }>; // Links to datasheets, labels
  complianceStatus: 'compliant' | 'non_compliant' | 'unknown';
  lastSyncDate: Date;
}

export class EprelConnectorService {
  private readonly baseURL = process.env.EPREL_API_ENDPOINT || 'https://eprel.ec.europa.eu/api/v1'; // Official or Sandbox
  private readonly apiKey = process.env.EPREL_API_KEY;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // milliseconds

  constructor() {
    if (!this.apiKey && process.env.NODE_ENV !== 'test') {
      console.warn("EPREL_API_KEY is not set. EPREL API calls may fail.");
    }
  }

  /**
   * Validates a product's registration status and basic info on EPREL.
   * @param identifier GTIN or other EPREL recognized product identifier.
   * @returns Promise<EPRELValidationResult>
   */
  async validateProductRegistration(identifier: string): Promise<EPRELValidationResult> {
    console.log(`Validating product registration on EPREL for identifier: ${identifier} (Placeholder)`);
    try {
      // Example: Search by GTIN. Endpoint and params depend on EPREL API specifics.
      const response = await this.makeRequest(`/products`, { search_query: identifier, type: 'gtin' });

      if (response.status === 200 && response.data && response.data.products && response.data.products.length > 0) {
        const productInfo = response.data.products[0]; // Assuming first result is the most relevant
        return {
          isRegistered: true,
          registrationNumber: productInfo.registrationNumber,
          energyLabelClass: productInfo.energyLabelDetails?.energyEfficiencyClass,
          productCategory: productInfo.categoryName,
          lastUpdated: productInfo.lastModifiedDate ? new Date(productInfo.lastModifiedDate) : undefined,
          complianceStatus: 'compliant', // This is a simplification; real status might be more complex
          officialData: productInfo
        };
      } else if (response.status === 404 || (response.data && response.data.products && response.data.products.length === 0)) {
        return { isRegistered: false, complianceStatus: 'unknown', error: 'Product not found in EPREL database.' };
      }
      console.error(`EPREL API error for identifier ${identifier}: ${response.status} ${response.statusText}`, response.data);
      return { isRegistered: false, complianceStatus: 'unknown', error: `EPREL API error: ${response.statusText}` };
    } catch (error: any) {
      console.error('EPREL validation error:', error.message);
      return { isRegistered: false, complianceStatus: 'unknown', error: error.message };
    }
  }

  /**
   * Fetches detailed product data from EPREL using its registration number.
   * @param eprelRegistrationNumber The EPREL registration number.
   * @returns Promise<EPRELProductData | null>
   */
  async getProductDataByRegNumber(eprelRegistrationNumber: string): Promise<EPRELProductData | null> {
    console.log(`Fetching EPREL product data for registration number: ${eprelRegistrationNumber} (Placeholder)`);
    try {
      const response = await this.makeRequest(`/products/${eprelRegistrationNumber}`);
      if (response.status === 200 && response.data) {
        const data = response.data;
        // Map EPREL response to EPRELProductData structure
        return {
          gtin: data.gtin || data.otherIdentifiers?.gtin,
          registrationNumber: data.registrationNumber,
          modelIdentifier: data.modelIdentifier,
          supplierName: data.supplierOrTrademark,
          brandName: data.brand,
          productCategory: data.categoryName,
          // Map energyData and documents carefully based on actual EPREL response structure
          energyData: data.energyLabelDetails ? {
            energyClass: data.energyLabelDetails.energyEfficiencyClass,
            annualConsumption: data.energyLabelDetails.annualEnergyConsumption, // Example field
          } : undefined,
          documents: data.documents?.map((doc: any) => ({ name: doc.name, url: doc.url, type: doc.type })) || [],
          complianceStatus: 'compliant', // Simplification
          lastSyncDate: new Date(),
        };
      }
      return null;
    } catch (error: any) {
      console.error(`Error fetching EPREL data for ${eprelRegistrationNumber}:`, error);
      return null;
    }
  }

  private async makeRequest(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    retryCount = 0
  ): Promise<{ status: number; statusText: string; data: any }> {
    if (!this.apiKey) {
      console.error("EPREL API Key is missing. Cannot make request.");
      return { status: 401, statusText: "Unauthorized - API Key Missing", data: null };
    }
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`, // Or other auth scheme if EPREL uses it
          'Accept': 'application/json'
        }
      });

      let responseData = null;
      if (response.headers.get("content-type")?.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok && retryCount < this.maxRetries) {
          console.warn(`EPREL request failed (attempt ${retryCount + 1}/${this.maxRetries}): ${response.status} ${response.statusText}. Retrying in ${this.retryDelay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
          return this.makeRequest(endpoint, params, retryCount + 1);
      }

      return { status: response.status, statusText: response.statusText, data: responseData };
    } catch (error: any) {
      if (retryCount < this.maxRetries) {
        console.warn(`EPREL request error (attempt ${retryCount + 1}/${this.maxRetries}): ${error.message}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.makeRequest(endpoint, params, retryCount + 1);
      }
      console.error(`EPREL request failed after ${this.maxRetries} retries: ${endpoint}`, error);
      throw error;
    }
  }
}
