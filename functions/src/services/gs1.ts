
// functions/src/services/gs1.ts
// Note: `fetch`, `URL`, `URLSearchParams` are globally available in Node.js 18+

export interface GS1ParsedData {
  gtin?: string;
  serialNumber?: string;
  lot?: string;
  expirationDate?: Date; // YYMMDD parsed to Date
  // Add other AIs as needed
}

export interface GTINValidationResult {
  isValid: boolean;
  error?: string;
  message?: string; // e.g., "GTIN format is valid"
  registryData?: any; // Data from GS1 registry if queried
}

export interface GS1OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    // Other fields if present
}

export class GS1Service {
  private readonly gs1ApiEndpoint = process.env.GS1_API_ENDPOINT || 'https://api.gs1.org/v1'; // Example default
  private readonly gs1AuthEndpoint = process.env.GS1_AUTH_ENDPOINT || 'https://auth.gs1.org/token'; // Example default
  private readonly clientId = process.env.GS1_CLIENT_ID;
  private readonly clientSecret = process.env.GS1_CLIENT_SECRET;

  private accessToken: string | null = null;
  private tokenExpiryTime: number | null = null;

  /**
   * Generates a GS1 Digital Link URL.
   * @param gtin The Global Trade Item Number (GTIN).
   * @param serialNumber Optional serial number (AI 21).
   * @param lot Optional batch/lot number (AI 10).
   * @param baseUrl The base URL for the Digital Link resolver.
   * @returns A GS1 Digital Link URL string.
   */
  generateDigitalLink(
    gtin: string, 
    serialNumber?: string, 
    lot?: string,
    baseUrl: string = process.env.DIGITAL_LINK_BASE_URL || 'https://dpp.norruva.com' // Configurable base
  ): string {
    if (!gtin) throw new Error("GTIN is required to generate a Digital Link.");

    let digitalLink = `${baseUrl}/01/${gtin}`;
    
    if (serialNumber) {
      digitalLink += `/21/${serialNumber}`;
    }
    
    if (lot) {
      digitalLink += `/10/${lot}`;
    }
    
    // Example: Add expiration date (AI 17) if available
    // if (expirationDateYYMMDD) {
    //   digitalLink += `/17/${expirationDateYYMMDD}`;
    // }
    
    return digitalLink;
  }

  /**
   * Parses a GS1 Digital Link URL into its components.
   * @param url The GS1 Digital Link URL string.
   * @returns An object containing parsed GS1 Application Identifiers and their values.
   */
  parseDigitalLink(url: string): GS1ParsedData {
    try {
      const urlObj = new URL(url); 
      const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0); 
      
      const parsed: GS1ParsedData = {};
      
      for (let i = 0; i < pathParts.length; i += 2) {
        const ai = pathParts[i]; 
        const value = pathParts[i + 1];
        
        if (!value) continue; 

        switch (ai) {
          case '01': 
            parsed.gtin = value;
            break;
          case '21': 
            parsed.serialNumber = value;
            break;
          case '10': 
            parsed.lot = value;
            break;
          case '17': 
            parsed.expirationDate = this.parseGS1Date(value);
            break;
        }
      }
      
      if (Object.keys(parsed).length === 0) {
        throw new Error('No GS1 Application Identifiers found in path.');
      }
      return parsed;

    } catch (error: any) {
      console.error('Error parsing GS1 Digital Link:', error.message, error.stack);
      throw new Error(`Invalid Digital Link format or content: ${error.message}`);
    }
  }

  async validateGTIN(gtin: string): Promise<GTINValidationResult> {
    try {
      if (!/^[0-9]{8}$|^[0-9]{12,14}$/.test(gtin)) {
        return { isValid: false, error: 'Invalid GTIN format (must be 8, 12, 13, or 14 digits).' };
      }

      const gtin14 = gtin.padStart(14, '0');
      if (!this.validateGTIN14CheckDigit(gtin14)) {
        return { isValid: false, error: 'Invalid GTIN check digit.' };
      }

      if (this.clientId && this.clientSecret && this.gs1ApiEndpoint) {
        const registryData = await this.queryGS1Registry(gtin);
        if (registryData && registryData.error) { 
             return { isValid: true, message: 'GTIN format valid, but registry query failed or product not found.', error: registryData.error };
        }
        return {
          isValid: true, 
          message: registryData ? 'GTIN valid and found in registry.' : 'GTIN format valid, not found or error in registry query.',
          registryData: registryData || null
        };
      }

      return { isValid: true, message: 'GTIN format and check digit are valid.' };

    } catch (error: any) {
      console.error('Error validating GTIN:', error.message, error.stack);
      return { isValid: false, error: `Failed to validate GTIN: ${error.message}` };
    }
  }

  private validateGTIN14CheckDigit(gtin14: string): boolean {
    if (gtin14.length !== 14) return false;
    const digits = gtin14.split('').map(Number);
    const checkDigit = digits.pop()!; 
    
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += digits[i] * ((i % 2 === 0) ? 3 : 1);
    }
    
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    return calculatedCheckDigit === checkDigit;
  }

  private async queryGS1Registry(gtin: string): Promise<any | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
          console.warn("GS1 OAuth token not available for registry query.");
          return null;
      }
      
      if (!this.gs1ApiEndpoint) {
          console.warn("GS1 API endpoint not configured.");
          return null;
      }

      const response = await fetch(`${this.gs1ApiEndpoint}/gtin/${gtin}`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.warn(`GS1 Registry query for GTIN ${gtin} failed: ${response.status} ${response.statusText}`);
        try {
            const errorBody = await response.json();
            return { error: errorBody }; 
        } catch (e) {
            return { error: response.statusText }; 
        }
      }
    } catch (error: any) {
      console.error('Error querying GS1 registry:', error.message, error.stack);
      return { error: error.message };
    }
  }

  private async getAuthToken(): Promise<string | null> {
     if (this.accessToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
      return this.accessToken;
    }

    if (!this.gs1AuthEndpoint || !this.clientId || !this.clientSecret) {
      console.warn("GS1 OAuth client credentials or token URL not configured.");
      return null;
    }
    
    try {
      console.log("Requesting new GS1 auth token...");
      const response = await fetch(this.gs1AuthEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
          // scope: 'gs1_api_scope' 
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`GS1 Auth token error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`Failed to obtain GS1 auth token: ${errorBody}`);
      }

      const tokenData = await response.json() as GS1OAuthTokenResponse;
      this.accessToken = tokenData.access_token;
      this.tokenExpiryTime = Date.now() + (tokenData.expires_in - 60) * 1000; 
      console.log("Successfully obtained new GS1 auth token.");
      return this.accessToken;

    } catch (error: any) {
      console.error('Error fetching GS1 auth token:', error.message, error.stack);
      this.accessToken = null;
      this.tokenExpiryTime = null;
      return null;
    }
  }

  private parseGS1Date(dateStringYYMMDD: string): Date | undefined {
    if (!/^[0-9]{6}$/.test(dateStringYYMMDD)) return undefined; 
    
    const currentYearLastTwoDigits = new Date().getFullYear() % 100;
    const century = (parseInt(dateStringYYMMDD.substring(0, 2)) > currentYearLastTwoDigits + 10) ? '19' : '20'; 
    
    const year = parseInt(century + dateStringYYMMDD.substring(0, 2));
    const month = parseInt(dateStringYYMMDD.substring(2, 4)) - 1; 
    const day = parseInt(dateStringYYMMDD.substring(4, 6));
    
    if (month < 0 || month > 11 || day < 1 || day > 31) return undefined;

    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return undefined;
    }
    return date;
  }
}
