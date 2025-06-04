
// /src/components/developer/ApiDocumentationRenderer.tsx
"use client";

import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Environment = 'development' | 'staging' | 'production';

interface ApiDocsTabProps {
  currentEnv: Environment;
}

const ApiDocumentationRenderer: React.FC<ApiDocsTabProps> = ({ currentEnv }) => {
  const serverUrls = {
    development: 'https://dev-api.norruva.com/v1',
    staging: 'https://staging-api.norruva.com/v1',
    production: 'https://api.norruva.com/v1',
  };

  // Memoize apiSpec to prevent unnecessary re-renders of SwaggerUI
  // if the spec object reference changes without actual content change.
  const apiSpec = React.useMemo(() => ({
    openapi: '3.0.0',
    info: {
      title: `Norruva API (${currentEnv.toUpperCase()})`,
      version: '1.0.0',
      description: `API for managing Digital Product Passports and related data on the Norruva platform. Current environment: ${currentEnv}.`,
    },
    servers: [
      { url: serverUrls[currentEnv], description: `${currentEnv.charAt(0).toUpperCase() + currentEnv.slice(1)} server` }
    ],
    tags: [
      { name: 'Products', description: 'Product and DPP management' },
      { name: 'Compliance', description: 'Compliance checking and reporting' },
      { name: 'Webhooks', description: 'Webhook configuration and event management' },
    ],
    paths: {
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List all products',
          description: 'Retrieves a list of products, potentially filtered by query parameters.',
          parameters: [
            { name: 'limit', in: 'query', description: 'Maximum number of products to return', required: false, schema: { type: 'integer', format: 'int32', default: 20 } },
            { name: 'category', in: 'query', description: 'Filter by product category', required: false, schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'A list of products.',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } },
            },
          },
        },
        post: {
          tags: ['Products'],
          summary: 'Create a new product',
          description: 'Adds a new product to the system.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/NewProduct' } } } },
          responses: {
            '201': { description: 'Product created successfully.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            '400': { description: 'Invalid input' },
          },
        },
      },
      '/products/{productId}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID',
          description: 'Retrieves a specific product by its unique ID.',
          parameters: [ { name: 'productId', in: 'path', description: 'ID of the product to retrieve', required: true, schema: { type: 'string' } } ],
          responses: {
            '200': { description: 'Successful operation', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            '404': { description: 'Product not found' },
          },
        },
        put: {
          tags: ['Products'],
          summary: 'Update an existing product',
          description: 'Updates details for a specific product.',
          parameters: [ { name: 'productId', in: 'path', description: 'ID of the product to update', required: true, schema: { type: 'string' } } ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProduct' } } }
          },
          responses: {
            '200': { description: 'Product updated successfully.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            '400': { description: 'Invalid input' },
            '404': { description: 'Product not found' },
          },
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete a product',
          description: 'Deletes a specific product by its ID.',
          parameters: [ { name: 'productId', in: 'path', description: 'ID of the product to delete', required: true, schema: { type: 'string' } } ],
          responses: {
            '204': { description: 'Product deleted successfully.' },
            '404': { description: 'Product not found' },
          },
        }
      },
      '/compliance/check': {
        post: {
          tags: ['Compliance'],
          summary: 'Perform a compliance check',
          description: 'Analyzes product data against specified compliance standards using AI.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ComplianceCheckInput' } } }
          },
          responses: {
            '200': { description: 'Compliance check report.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ComplianceCheckOutput' } } } },
            '400': { description: 'Invalid input for compliance check' }
          }
        }
      },
      '/webhooks': {
        get: {
          tags: ['Webhooks'],
          summary: 'List configured webhooks',
          description: 'Retrieves a list of all webhook subscriptions for the authenticated organization.',
          responses: {
            '200': {
              description: 'A list of webhooks.',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Webhook' } } } }
            }
          }
        },
        post: {
          tags: ['Webhooks'],
          summary: 'Create a new webhook',
          description: 'Registers a new webhook endpoint to receive event notifications.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/NewWebhook' } } }
          },
          responses: {
            '201': { description: 'Webhook created successfully.', content: { 'application/json': { schema: { $ref: '#/components/schemas/WebhookWithSecret' } } } },
            '400': { description: 'Invalid input (e.g., invalid URL or events)'}
          }
        }
      }
    },
    components: {
      schemas: {
        Product: { type: 'object', properties: { id: { type: 'string', example: 'prod_abc123' }, name: { type: 'string', example: 'EcoSmart LED Bulb' }, gtin: { type: 'string', example: '01234567890123' }, category: { type: 'string', example: 'Electronics' }, status: { type: 'string', enum: ['draft', 'active', 'archived'], example: 'active' }}},
        NewProduct: { type: 'object', required: ['name', 'gtin', 'category'], properties: { name: { type: 'string', example: 'EcoPro Solar Panel' }, gtin: { type: 'string', example: '09876543210987' }, category: { type: 'string', example: 'Energy' }, description: { type: 'string', nullable: true, example: 'High-efficiency monocrystalline solar panel.' }}},
        UpdateProduct: { type: 'object', properties: { name: { type: 'string', nullable: true, example: 'EcoPro Solar Panel Gen2' }, category: { type: 'string', nullable: true, example: 'Energy Generation' }, description: { type: 'string', nullable: true, example: 'Updated description.' }}},
        ComplianceCheckInput: { type: 'object', properties: { productData: { type: 'object', description: 'JSON object of the product data.' }, complianceStandards: { type: 'string', description: 'Text content of compliance standards and directives.'}}},
        ComplianceCheckOutput: { type: 'object', properties: { overallStatus: { type: 'string', enum: ['Compliant', 'Non-Compliant', 'Partially Compliant', 'Error'] }, summary: { type: 'string' }, detailedChecks: { type: 'array', items: { type: 'object', properties: { standard: { type: 'string' }, status: { type: 'string' }, findings: { type: 'string' }, evidence: { type: 'array', items: {type: 'string'}}, recommendations: {type: 'string', nullable: true} }}}}}
      ,
        Webhook: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'wh_123xyz' },
            url: { type: 'string', format: 'url', example: 'https://example.com/webhook-receiver' },
            description: { type: 'string', example: 'Product update notifications' },
            events: { type: 'array', items: { type: 'string', example: 'product.updated' } },
            status: { type: 'string', enum: ['active', 'inactive', 'failed'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        NewWebhook: {
          type: 'object',
          required: ['url', 'events'],
          properties: {
            url: { type: 'string', format: 'url', example: 'https://example.com/my-new-webhook' },
            description: { type: 'string', nullable: true, example: 'Customer order notifications' },
            events: { type: 'array', items: { type: 'string', example: 'order.created' }, minItems: 1 }
          }
        },
        WebhookWithSecret: {
          allOf: [
            { $ref: '#/components/schemas/Webhook' },
            { type: 'object', properties: { secret: { type: 'string', description: 'The signing secret for this webhook. Only returned on creation.' } } }
          ]
        }
      },
      securitySchemes: { ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-KEY' }}
    },
    security: [ { ApiKeyAuth: [] } ]
  }), [currentEnv, serverUrls]);

  // Using a key that changes with currentEnv helps ensure SwaggerUI remounts
  // when the environment (and thus the spec's server URL) changes.
  const swaggerKey = `swagger-ui-${currentEnv}`;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">API Documentation</CardTitle>
        <CardDescription>
          Comprehensive API reference for the <span className="font-semibold capitalize">{currentEnv}</span> environment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="swagger-ui-container" style={{ minHeight: '600px' }}>
          <SwaggerUI key={swaggerKey} spec={apiSpec} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiDocumentationRenderer;
