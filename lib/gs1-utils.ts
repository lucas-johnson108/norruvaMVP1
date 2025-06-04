
// src/lib/gs1-utils.ts
import type { DPPProduct } from '@/types/product-schema'; // Added import for DPPProduct
import QRCode from 'qrcode'; // Added import for qrcode library

interface GenerateDigitalLinkOptions {
  gtin: string;
  serialNumber?: string; // Corresponds to AI (21)
  lotNumber?: string;    // Corresponds to AI (10)
  // Add other Application Identifiers (AIs) as needed, e.g., expiryDate AI (17)
  baseURL?: string;      // The base URL for the resolver, e.g., https://id.gs1.org or your custom domain
}

/**
 * Generates a GS1 Digital Link URL.
 * @param options - Object containing GTIN and other optional AIs.
 * @returns The constructed GS1 Digital Link URL.
 */
export function generateDigitalLink({
  gtin,
  serialNumber,
  lotNumber,
  baseURL = 'https://id.gs1.org', // Default to GS1's resolver, can be configured
}: GenerateDigitalLinkOptions): string {
  if (!gtin) {
    throw new Error('GTIN is required to generate a Digital Link.');
  }

  // Ensure GTIN is correctly formatted (e.g., remove non-numeric characters if necessary, or validate)
  const cleanGTIN = gtin.replace(/\D/g, '');

  let path = `/01/${cleanGTIN}`;

  if (serialNumber) {
    path += `/21/${encodeURIComponent(serialNumber)}`;
  }

  if (lotNumber) {
    path += `/10/${encodeURIComponent(lotNumber)}`;
  }

  // Example for other AIs (you would add more based on requirements)
  // if (options.expiryDateYYMMDD) {
  //   path += `/17/${options.expiryDateYYMMDD}`;
  // }

  return `${baseURL}${path}`;
}

/**
 * Generates a QR code data URL for a DPPProduct.
 * Constructs a GS1 Digital Link with additional query parameters for verification and blockchain details.
 * @param product The DPPProduct object.
 * @returns A Promise resolving to the QR code data URL string.
 */
export async function generateDPPQRCode(product: DPPProduct): Promise<string> {
  const baseUrl = 'https://dpp.ecotrace.com'; // App-specific base URL for QR codes
  const gs1DigitalLinkPath = `/01/${product.gtin}`;
  
  const params = new URLSearchParams();
  params.append('verify', 'ebsi'); // Example verification parameter

  if (product.blockchain?.contractAddress) {
    params.append('blockchain', product.blockchain.contractAddress);
  }
  if (product.blockchain?.nftTokenId) {
    params.append('nft', product.blockchain.nftTokenId);
  }
  
  const queryString = params.toString();
  const fullUrl = `${baseUrl}${gs1DigitalLinkPath}${queryString ? `?${queryString}` : ''}`;

  // Generate QR code with embedded metadata
  return await QRCode.toDataURL(fullUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 256, // Default width, can be overridden if options are passed
    color: {
      dark: '#000000', // Black modules
      light: '#FFFFFF'  // White background
    }
  });
}
