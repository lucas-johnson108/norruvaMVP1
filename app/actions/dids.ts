
"use server";
import { z } from 'zod';
import crypto from 'crypto'; // For generating unique IDs

// Define the structure of a DID Document
// This is a simplified version; a full DID Document can be more complex.
export interface DidDocument {
  '@context': string | string[];
  id: string; // The DID itself, e.g., did:key:z6MkpTHR8VNsjMXPgBpi42b2kLDRB7j38N3u5VfRANzVqCwN
  verificationMethod?: Array<{
    id: string; // e.g., did:key:z6Mkp...#z6Mkp...
    type: string; // e.g., Ed25519VerificationKey2020 or JsonWebKey2020
    controller: string; // The DID that controls this verification method (usually the DID itself)
    publicKeyMultibase?: string; // For did:key
    publicKeyJwk?: Record<string, string>; // For other methods
  }>;
  authentication?: string[]; // Array of verification method IDs
  assertionMethod?: string[]; // Array of verification method IDs
  created: string; // ISO timestamp
  updated?: string; // ISO timestamp
  alias?: string; // User-friendly label for this DID in the platform
  status: 'active' | 'revoked' | 'pending';
  // Potentially other DID core properties like service endpoints
}

interface ServerActionResult<T = null> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field?: string; message: string }[];
}

// Mock database for DIDs associated with the organization
let mockOrganizationDids: DidDocument[] = [
  {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: 'did:key:z6MkpTHR8VNsjMXPgBpi42b2kLDRB7j38N3u5VfRANzVqCwN', // Example did:key
    verificationMethod: [{
      id: 'did:key:z6MkpTHR8VNsjMXPgBpi42b2kLDRB7j38N3u5VfRANzVqCwN#z6MkpTHR8VNsjMXPgBpi42b2kLDRB7j38N3u5VfRANzVqCwN',
      type: 'Ed25519VerificationKey2018', // Older type for this example key
      controller: 'did:key:z6MkpTHR8VNsjMXPgBpi42b2kLDRB7j38N3u5VfRANzVqCwN',
      publicKeyBase58: 'B12NYF8eK52hPqjDcQZy4qL1gYQJ4i3X9Xz7L5j6H8fL', // Example value
    }],
    authentication: ['did:key:z6MkpTHR8VNsjMXPgBpi42b2kLDRB7j38N3u5VfRANzVqCwN#z6MkpTHR8VNsjMXPgBpi42b2kLDRB7j38N3u5VfRANzVqCwN'],
    assertionMethod: ['did:key:z6MkpTHR8VNsjMXPgBpi42b2kLDRB7j38N3u5VfRANzVqCwN#z6MkpTHR8VNsjMXPgBpi42b2kLDRB7j38N3u5VfRANzVqCwN'],
    created: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    updated: new Date(Date.now() - 86400000 * 5).toISOString(),
    alias: 'Primary Product Issuer DID',
    status: 'active',
  },
  {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/ebsi/did/v1'],
    id: 'did:ebsi:zExampleMockEBSIOrgDID001', // Mock EBSI DID
    verificationMethod: [{
      id: 'did:ebsi:zExampleMockEBSIOrgDID001#keys-1',
      type: 'JsonWebKey2020',
      controller: 'did:ebsi:zExampleMockEBSIOrgDID001',
      publicKeyJwk: { kty: 'EC', crv: 'P-256', x: 'mockX', y: 'mockY' },
    }],
    authentication: ['did:ebsi:zExampleMockEBSIOrgDID001#keys-1'],
    assertionMethod: ['did:ebsi:zExampleMockEBSIOrgDID001#keys-1'],
    created: new Date(Date.now() - 86400000 * 30).toISOString(),
    alias: 'EBSI Compliance DID (Associated)',
    status: 'active',
  },
];

export async function listOrganizationDids(): Promise<ServerActionResult<DidDocument[]>> {
  // In a real app, fetch from Firestore based on authenticated user's organizationId
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
  return { success: true, data: JSON.parse(JSON.stringify(mockOrganizationDids)) };
}

export async function createPlatformDid(
  method: string = 'key',
  alias?: string
): Promise<ServerActionResult<{ didDocument: DidDocument }>> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate creation delay

  let newDid: DidDocument;
  const now = new Date().toISOString();
  const randomSuffix = crypto.randomBytes(12).toString('hex');

  if (method === 'key') {
    // This is a very simplified mock of did:key generation.
    // Real did:key involves cryptographic key pair generation.
    const mockDidKeyId = `did:key:z${randomSuffix}${Date.now().toString(36)}`;
    newDid = {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: mockDidKeyId,
      verificationMethod: [{
        id: `${mockDidKeyId}#${mockDidKeyId.split(':')[2]}`,
        type: 'Ed25519VerificationKey2020', // Example type
        controller: mockDidKeyId,
        publicKeyMultibase: `z${crypto.randomBytes(16).toString('hex')}`, // Mock public key
      }],
      authentication: [`${mockDidKeyId}#${mockDidKeyId.split(':')[2]}`],
      assertionMethod: [`${mockDidKeyId}#${mockDidKeyId.split(':')[2]}`],
      created: now,
      status: 'active',
      alias: alias || `Platform Key DID (${randomSuffix.substring(0,4)})`,
    };
  } else if (method === 'ebsi') {
    // Mocking an EBSI-like DID (actual EBSI registration is complex)
    const mockDidEbsiId = `did:ebsi:norruva-org-${randomSuffix}`;
    newDid = {
      '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/ebsi/did/v1'],
      id: mockDidEbsiId,
      verificationMethod: [{
        id: `${mockDidEbsiId}#keys-1`,
        type: 'JsonWebKey2020',
        controller: mockDidEbsiId,
        publicKeyJwk: { kty: 'EC', crv: 'P-256', x: `mockX_${randomSuffix}`, y: `mockY_${randomSuffix}` },
      }],
      authentication: [`${mockDidEbsiId}#keys-1`],
      assertionMethod: [`${mockDidEbsiId}#keys-1`],
      created: now,
      status: 'pending', // EBSI DIDs usually go through a registration process
      alias: alias || `Platform EBSI DID (${randomSuffix.substring(0,4)})`,
    };
  } else {
    return { success: false, message: `Unsupported DID method: ${method}` };
  }

  mockOrganizationDids.push(newDid);
  return { success: true, data: { didDocument: JSON.parse(JSON.stringify(newDid)) }, message: `DID ${newDid.id} created.` };
}

export async function associateExternalDid(
  didString: string,
  alias?: string
): Promise<ServerActionResult> {
  const validationSchema = z.string().startsWith("did:").min(10);
  const validationResult = validationSchema.safeParse(didString);
  if (!validationResult.success) {
    return { success: false, message: "Invalid DID string format.", errors: [{ field: "didString", message: "Must be a valid DID starting with 'did:' and at least 10 characters."}] };
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));

  if (mockOrganizationDids.some(d => d.id === didString)) {
    return { success: false, message: "This DID is already associated with your organization." };
  }

  // Simulate resolving/validating the DID (very basic mock)
  if (!didString.includes(':')) {
      return { success: false, message: "Invalid DID structure." };
  }

  const associatedDid: DidDocument = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: didString,
    // For associated DIDs, we might not store full VM details initially,
    // or they'd be fetched/resolved when needed.
    created: new Date().toISOString(),
    status: 'active', // Assume active upon association for this mock
    alias: alias || `Associated ${didString.split(':')[1]} DID`,
  };
  mockOrganizationDids.push(associatedDid);

  return { success: true, message: `DID ${didString} has been successfully associated with your organization.` };
}
