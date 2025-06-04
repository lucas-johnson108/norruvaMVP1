
"use server";

import { z } from 'zod';
import crypto from 'crypto';

// Schema for the input of the issue credential action
const issueCredentialActionSchema = z.object({
  credentialType: z.string().min(3, "Credential type is required (min 3 chars)."),
  subjectDppId: z.string().min(5, "Subject DPP ID is required (min 5 chars)."),
  credentialDataString: z.string().refine((data) => { // Changed name to avoid conflict if parsing
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Credential data must be valid JSON." }),
});

export type IssueCredentialActionValues = z.infer<typeof issueCredentialActionSchema>;

interface ServerActionResult<T = null> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field?: string; message: string }[];
}

// Mock Verifiable Credential structure for the action's response
export interface MockIssuedCredential {
  id: string;
  type: string;
  issuer: string;
  subjectDppId: string;
  issuanceDate: string;
  status: 'Valid' | 'Pending'; // New credentials might be pending initially
  credentialDataPreview?: string;
}

export async function issueEbsiCredentialAction(
  input: IssueCredentialActionValues
): Promise<ServerActionResult<MockIssuedCredential>> {
  const validation = issueCredentialActionSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed for issuing credential.",
      errors: validation.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
    };
  }

  console.log("Server Action: issueEbsiCredentialAction called with:", input);

  // Simulate backend processing (e.g., interacting with an EBSI service)
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newCredentialId = `vc_mock_${crypto.randomBytes(6).toString('hex')}`;
  const issuedCredential: MockIssuedCredential = {
    id: newCredentialId,
    type: input.credentialType,
    issuer: 'did:ebsi:mock-platform-issuer-001', // Mock issuer DID
    subjectDppId: input.subjectDppId,
    issuanceDate: new Date().toISOString(),
    status: 'Pending', // Or 'Valid' if mock issuance is immediate
    credentialDataPreview: input.credentialDataString, // Store the JSON string as preview
  };

  // In a real scenario, this would save to a database and interact with EBSI.
  // Here, we just simulate success. The EBSICredentialsManager will add a new mock item on refresh.

  return {
    success: true,
    data: issuedCredential,
    message: `Verifiable Credential (ID: ${newCredentialId}) for ${input.subjectDppId} has been mock-issued.`
  };
}
