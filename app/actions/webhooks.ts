
"use server";
import { z } from 'zod';
import crypto from 'crypto';

export interface WebhookEntry {
  id: string;
  url: string;
  description: string;
  events: string[];
  status: 'active' | 'inactive' | 'failed_to_deliver';
  secretPrefix: string; // e.g., "whsec_..."
  createdAt: string;
  lastAttemptAt?: string;
  lastAttemptStatus?: 'success' | 'failed' | 'pending';
  // The full secret is only shown on creation
  secret?: string; // Only available on creation response
}

interface ServerActionResult<T = null> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field?: string; message: string }[];
}

const webhookFormSchema = z.object({
  id: z.string().optional(), // ID will be present for updates
  url: z.string().url({ message: "Please enter a valid URL." }).startsWith("https://", { message: "URL must start with https://"}),
  description: z.string().min(5, "Description must be at least 5 characters.").max(200, "Description must be 200 characters or less."),
  events: z.array(z.string()).min(1, "Please select at least one event to subscribe to."),
});

export type WebhookFormValues = z.infer<typeof webhookFormSchema>;


// Mock database for Webhooks
let mockWebhooks: WebhookEntry[] = [
  {
    id: 'wh_1',
    url: 'https://api.example.com/webhook-receiver-1',
    description: 'Main integration webhook for product updates.',
    events: ['product.created', 'product.updated', 'verification.completed'],
    status: 'active',
    secretPrefix: 'whsec_abc...',
    createdAt: '2024-01-15T10:00:00Z',
    lastAttemptAt: '2024-06-01T12:30:00Z',
    lastAttemptStatus: 'success',
  },
  {
    id: 'wh_2',
    url: 'https://my-service.com/norruva-events',
    description: 'Compliance alert system.',
    events: ['compliance.status_changed', 'verification.failed'],
    status: 'inactive',
    secretPrefix: 'whsec_def...',
    createdAt: '2024-03-22T14:30:00Z',
  },
    {
    id: 'wh_3',
    url: 'https://broken-endpoint.internal/webhook',
    description: 'Internal audit log forwarder.',
    events: ['product.deleted'],
    status: 'failed_to_deliver',
    secretPrefix: 'whsec_ghi...',
    createdAt: '2024-05-10T09:00:00Z',
    lastAttemptAt: '2024-05-30T10:00:00Z',
    lastAttemptStatus: 'failed',
  },
];

export async function listWebhooks(): Promise<WebhookEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  return mockWebhooks.map(wh => ({ ...wh, secret: undefined })); // Never return full secrets when listing
}

export async function createWebhook(
  values: Omit<WebhookFormValues, 'id'> // Expect values without id for creation
): Promise<ServerActionResult<{ webhook: WebhookEntry; secret: string }>> {
  const validation = webhookFormSchema.omit({id: true}).safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validation.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
    };
  }
  const { url, description, events } = validation.data;

  await new Promise(resolve => setTimeout(resolve, 500));

  const newId = `wh_${Date.now()}`;
  const secret = `whsec_${newId}_${crypto.randomBytes(16).toString('hex')}`;
  const secretPrefix = `${secret.substring(0, 12)}...`;

  const newWebhook: WebhookEntry = {
    id: newId,
    url,
    description,
    events,
    status: 'active',
    secretPrefix,
    createdAt: new Date().toISOString(),
  };
  mockWebhooks.push(newWebhook);

  return {
    success: true,
    data: { webhook: { ...newWebhook, secret: undefined }, secret: secret }, // Return full secret here only
    message: "Webhook created successfully. Store the signing secret securely; it won't be shown again.",
  };
}

export async function updateWebhook(
  webhookId: string,
  values: Omit<WebhookFormValues, 'id'> // Expect values without id for update payload
): Promise<ServerActionResult<WebhookEntry>> {
  const validation = webhookFormSchema.omit({id: true}).safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed for webhook update.",
      errors: validation.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
    };
  }
  const { url, description, events } = validation.data;

  await new Promise(resolve => setTimeout(resolve, 300));
  const webhookIndex = mockWebhooks.findIndex(wh => wh.id === webhookId);

  if (webhookIndex === -1) {
    return { success: false, message: "Webhook not found to update." };
  }

  mockWebhooks[webhookIndex] = {
    ...mockWebhooks[webhookIndex],
    url,
    description,
    events,
    // status remains unchanged by this action, handled by updateWebhookStatus
  };

  return {
    success: true,
    data: { ...mockWebhooks[webhookIndex], secret: undefined },
    message: `Webhook "${mockWebhooks[webhookIndex].description}" updated successfully.`,
  };
}


export async function updateWebhookStatus(webhookId: string, status: 'active' | 'inactive'): Promise<ServerActionResult> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const webhookIndex = mockWebhooks.findIndex(wh => wh.id === webhookId);
  if (webhookIndex === -1) {
    return { success: false, message: "Webhook not found." };
  }
  mockWebhooks[webhookIndex].status = status;
  if (status === 'active') mockWebhooks[webhookIndex].lastAttemptStatus = undefined; // Reset failure state if re-activating
  return { success: true, message: `Webhook status updated to ${status}.` };
}

export async function deleteWebhook(webhookId: string): Promise<ServerActionResult> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = mockWebhooks.length;
  mockWebhooks = mockWebhooks.filter(wh => wh.id !== webhookId);
  if (mockWebhooks.length === initialLength) {
    return { success: false, message: "Webhook not found." };
  }
  return { success: true, message: "Webhook deleted successfully." };
}

export async function testWebhook(webhookId: string): Promise<ServerActionResult<{ success: boolean; message: string; statusCode?: number; responseBody?: string }>> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
  const webhook = mockWebhooks.find(wh => wh.id === webhookId);
  if (!webhook) {
    return { success: false, message: "Webhook not found." };
  }

  // Simulate different responses
  const randomOutcome = Math.random();
  let resultData: { success: boolean; message: string; statusCode?: number; responseBody?: string };

  if (randomOutcome < 0.7) { // 70% success
    resultData = {
      success: true,
      message: `Test event sent to ${webhook.url} successfully.`,
      statusCode: 200,
      responseBody: JSON.stringify({ status: "received", message: "Test event processed." }),
    };
    webhook.lastAttemptAt = new Date().toISOString();
    webhook.lastAttemptStatus = 'success';
  } else if (randomOutcome < 0.9) { // 20% client error
    resultData = {
      success: false,
      message: `Failed to send test event to ${webhook.url}. Client error.`,
      statusCode: 400,
      responseBody: JSON.stringify({ error: "bad_request", details: "Invalid payload structure for test." }),
    };
    webhook.lastAttemptAt = new Date().toISOString();
    webhook.lastAttemptStatus = 'failed';
    webhook.status = 'failed_to_deliver';
  } else { // 10% server error or timeout
    resultData = {
      success: false,
      message: `Failed to send test event to ${webhook.url}. Server error or timeout.`,
      statusCode: 503,
      responseBody: "Service Unavailable",
    };
    webhook.lastAttemptAt = new Date().toISOString();
    webhook.lastAttemptStatus = 'failed';
    webhook.status = 'failed_to_deliver';
  }
  
  const webhookIndex = mockWebhooks.findIndex(wh => wh.id === webhookId);
  if (webhookIndex !== -1) {
    mockWebhooks[webhookIndex] = { ...webhook };
  }


  return { success: true, data: resultData, message: "Test event simulation complete." };
}
