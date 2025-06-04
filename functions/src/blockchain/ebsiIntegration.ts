// functions/src/blockchain/ebsiIntegration.ts
'use server';
/**
 * @fileOverview Handles interactions with EBSI for Verifiable Credentials.
 * This service is responsible for issuing, verifying, and managing
 * EBSI-compliant Verifiable Credentials related to Digital Product Passports.
 */

import crypto from 'crypto'; // For crypto.randomUUID() and hashing

// Re-using structure from existing functions/src/services/ebsi.ts
// Note: `fetch` is globally available in Node.js 18+

export interface VerificationData {
  gtin: string;
  category: string;
  complianceStatus: string;
  method: string;
}

export interface VerifiableCredentialStructure {
  '@context': string[];
  id: string;
  type: string[];
  issuer: {
    id: string; // Verifier's DID
    name: string; // Verifier's Name
    accreditation?: string;
  };
  issuanceDate: string; // ISO 8601
  expirationDate?: string; // ISO 8601
  credentialSubject: {
    id: string; // DPP ID or Product DID
    type: string; // e.g., "Product", "DigitalProductPassport"
    digitalProductPassport: {
      gtin: string;
      category: string;
      complianceStatus: string;
      verificationDate: string;
      verificationMethod: string;
      regulatoryFramework?: string;
      dataIntegrityHash: string; // Hash of the relevant DPP data being attested
      // Potentially more fields specific to the attested aspect
    };
  };
  proof?: any; // Standard W3C VC Proof (e.g., Ed25519Signature2020)
}

export interface EBSIAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface EBSILedgerEntry {
    transactionId: string;
    blockNumber: string;
    timestamp: string;
}

export interface EBSIAPIVerificationResult {
  verified: boolean;
  issuer?: string;
  trustChain?: any;
  revocationStatus?: string;
  error?: string;
}

export class EbsiIntegrationService {
  private readonly ebsiApiEndpoint = process.env.EBSI_API_ENDPOINT || 'https://api.ebsi.eu/didresolver/v2'; // Example, adjust as needed
  private readonly verifierDID = process.env.EBSI_VERIFIER_DID || 'did:ebsi:yourVerifierDID';
  private readonly privateKeyHex = process.env.EBSI_SIGNING_KEY_HEX; // For signing VCs

  private readonly ebsiClientId = process.env.EBSI_CLIENT_ID;
  private readonly ebsiClientSecret = process.env.EBSI_CLIENT_SECRET;
  private readonly ebsiTokenUrl = process.env.EBSI_TOKEN_URL;

  private accessToken: string | null = null;
  private tokenExpiryTime: number | null = null;

  constructor() {
    if (!this.privateKeyHex && process.env.NODE_ENV !== 'test') {
      console.warn("EBSI_SIGNING_KEY_HEX is not set. VC issuance will be mocked.");
    }
  }

  async issueVerifiableCredential(
    productId: string, // Usually the DPP unique ID or a product-specific DID
    verificationData: VerificationData,
    attestedData: any // The actual data subset being attested
  ): Promise<VerifiableCredentialStructure | null> {
    if (!this.ebsiApiEndpoint || !this.verifierDID) {
        console.error("EBSI service is not configured for VC issuance.");
        throw new Error("EBSI service misconfiguration for VC issuance.");
    }
    console.log(`Issuing EBSI Verifiable Credential for Product ID: ${productId} (Placeholder)`);
    try {
      const credentialId = `urn:uuid:${crypto.randomUUID()}`;
      const issuanceDate = new Date().toISOString();
      const dataHash = await this.calculateDataHash(attestedData);

      const credentialPayload: Omit<VerifiableCredentialStructure, 'proof'> = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://ebsi.eu/schemas/vc/2022/v1',
          // Add specific DPP context if available e.g. 'https://ec.europa.eu/digital-product-passport/context/v1'
        ],
        id: credentialId,
        type: ['VerifiableCredential', 'DigitalProductPassportAttestation'],
        issuer: {
          id: this.verifierDID,
          name: 'Norruva Platform Verifier' // This should be configurable
        },
        issuanceDate: issuanceDate,
        // expirationDate: (optional) new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        credentialSubject: {
          id: `urn:dpp:${productId}`, // Product identifier (can be a DID)
          type: 'DigitalProductPassport',
          digitalProductPassport: { // This structure aligns with DPP context
            gtin: verificationData.gtin,
            category: verificationData.category,
            complianceStatus: verificationData.complianceStatus,
            verificationDate: issuanceDate,
            verificationMethod: verificationData.method,
            regulatoryFramework: 'EU.ESPR.2024', // Example
            dataIntegrityHash: dataHash
          }
        }
      };

      const signedCredential = await this.signCredential(credentialPayload);

      // Optional: Register credential on EBSI ledger or with Trusted Issuers API
      // await this.registerCredentialOnEbsi(signedCredential);

      return signedCredential;

    } catch (error: any) {
      console.error('Error issuing EBSI verifiable credential:', error.message, error.stack);
      return null;
    }
  }

  async verifyCredential(credentialJwtOrObject: string | object): Promise<EBSIAPIVerificationResult> {
    if (!this.ebsiApiEndpoint) {
        console.error("EBSI service API endpoint for verification is not configured.");
        throw new Error("EBSI service misconfiguration for VC verification.");
    }
    console.log(`Verifying EBSI credential (Placeholder)`);
    try {
      const verificationEndpoint = `${this.ebsiApiEndpoint}/verifications`; // Adjust based on actual EBSI Verifier API

      // const authToken = await this.getAuthToken(); // May not be needed for public verification endpoints
      // if (!authToken) throw new Error("Failed to obtain EBSI auth token for verification.");

      const response = await fetch(verificationEndpoint, {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // EBSI verifier API expects a Verifiable Presentation or array of VCs
            verifiableCredential: [typeof credentialJwtOrObject === 'string' ? credentialJwtOrObject : JSON.stringify(credentialJwtOrObject)],
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`EBSI verification API error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`EBSI verification failed: ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();
      return result as EBSIAPIVerificationResult;

    } catch (error: any) {
      console.error('EBSI credential verification error:', error.message, error.stack);
      return {
        verified: false,
        error: error.message || "An unexpected error occurred during EBSI credential verification."
      };
    }
  }

  private async signCredential(credentialPayload: Omit<VerifiableCredentialStructure, 'proof'>): Promise<VerifiableCredentialStructure> {
    if (!this.privateKeyHex && process.env.NODE_ENV !== 'test') {
        console.warn("Signing key not configured. Returning mock signature.");
    }
    // This is a MOCK signing process. In a real app, use a robust crypto library
    // (e.g., did-jwt, ethers.js Wallet for signing with private key).
    const mockJwsSignature = "mock.jws.signature." + crypto.randomBytes(32).toString('hex');

    return {
      ...credentialPayload,
      proof: {
        type: 'Ed25519Signature2020', // Or JsonWebSignature2020 depending on key type
        created: new Date().toISOString(),
        verificationMethod: `${this.verifierDID}#keys-1`, // Points to the public key in the DID document
        proofPurpose: 'assertionMethod', // Or 'authentication', etc.
        jws: mockJwsSignature // The actual JWS compact serialization
      }
    };
  }

  private async calculateDataHash(data: any): Promise<string> {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Auth token logic (if needed for certain EBSI APIs)
  private async getAuthToken(): Promise<string | null> {
    // Implementation from existing ebsi.ts
    if (this.accessToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
      return this.accessToken;
    }
    if (!this.ebsiTokenUrl || !this.ebsiClientId || !this.ebsiClientSecret) {
      console.warn("EBSI OAuth2 client credentials or token URL not configured.");
      return null;
    }
    // Mock token acquisition
    this.accessToken = "mockEbsiAccessToken";
    this.tokenExpiryTime = Date.now() + 3600 * 1000;
    return this.accessToken;
  }

  // Placeholder for registering credential (e.g., with Trusted Issuer Registry)
  async registerCredentialOnEbsi(signedCredential: VerifiableCredentialStructure): Promise<any> {
    console.log("Registering credential on EBSI (Placeholder)", signedCredential.id);
    // Example: POST to EBSI Trusted Issuer API
    // const registrationEndpoint = `${process.env.EBSI_ISSUER_API_ENDPOINT}/credentials`;
    // const response = await fetch(registrationEndpoint, { ... });
    return { success: true, message: "Credential registration submitted (mock)." };
  }
}
