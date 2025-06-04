
"use server";
import { z } from 'zod';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string; // e.g., sk_live_...xxxx
  createdDate: string;
  lastUsedDate: string | null;
  status: 'active' | 'revoked';
  permissions: string[];
  token?: string; // Only available on creation
  expiresAt?: string | null; // Optional expiry date
}

interface ServerActionResult<T = null> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field?: string; message: string }[];
}

const createApiKeySchema = z.object({
  name: z.string().min(3, "Key name must be at least 3 characters.").max(50, "Key name must be 50 characters or less."),
  permissions: z.array(z.string()).min(1, "At least one permission is required."),
});

// Mock database for API keys
let mockApiKeys: ApiKey[] = [
  {
    id: 'key_1',
    name: 'Main Integration Key',
    prefix: 'sk_live_abc...',
    createdDate: '2023-10-01T10:00:00Z',
    lastUsedDate: '2024-05-15T12:30:00Z',
    status: 'active',
    permissions: ['read:product:all', 'write:product:publicData'],
    expiresAt: '2025-10-01T10:00:00Z',
  },
  {
    id: 'key_2',
    name: 'Reporting System Key',
    prefix: 'sk_live_def...',
    createdDate: '2024-01-20T14:00:00Z',
    lastUsedDate: null,
    status: 'active',
    permissions: ['read:analytics', 'read:product:publicData'],
    expiresAt: null,
  },
  {
    id: 'key_3',
    name: 'Old System Key',
    prefix: 'sk_live_ghi...',
    createdDate: '2022-05-01T08:00:00Z',
    lastUsedDate: '2023-02-10T10:00:00Z',
    status: 'revoked',
    permissions: ['read:product:all'],
    expiresAt: '2023-05-01T08:00:00Z',
  },
];

export async function listApiKeys(): Promise<ApiKey[]> {
  // In a real app, fetch from database for the authenticated user/company
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  return mockApiKeys.map(key => ({ ...key, token: undefined })); // Never return full tokens when listing
}

export async function createApiKey(
  name: string,
  permissions: string[]
): Promise<ServerActionResult<{ apiKey: string; keyId: string; prefix: string }>> {
  const validation = createApiKeySchema.safeParse({ name, permissions });
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
    };
  }

  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

  const newKeyId = `key_${Date.now()}`;
  const fullApiKey = `sk_live_${newKeyId}_${Math.random().toString(36).substring(2, 15)}`;
  const prefix = `${fullApiKey.substring(0, 12)}...`;

  const newApiKeyEntry: ApiKey = {
    id: newKeyId,
    name,
    prefix,
    createdDate: new Date().toISOString(),
    lastUsedDate: null,
    status: 'active',
    permissions,
    token: fullApiKey, // This is the sensitive part
    expiresAt: null, // New keys don't expire by default in this mock
  };
  mockApiKeys.push(newApiKeyEntry);

  return {
    success: true,
    data: { apiKey: fullApiKey, keyId: newKeyId, prefix },
    message: "API Key created successfully. Make sure to copy it now, you won't see it again.",
  };
}

export async function revokeApiKey(keyId: string): Promise<ServerActionResult> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

  const keyIndex = mockApiKeys.findIndex(key => key.id === keyId);
  if (keyIndex === -1) {
    return { success: false, message: "API Key not found." };
  }

  if (mockApiKeys[keyIndex].status === 'revoked') {
    return { success: false, message: "API Key is already revoked." };
  }

  mockApiKeys[keyIndex].status = 'revoked';
  return { success: true, message: "API Key revoked successfully." };
}
