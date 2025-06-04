
// =============================================================================
// AUTOMATED WORKFLOW ENGINE
// =============================================================================

// functions/src/services/workflows.ts
import { getFirestore } from 'firebase-admin/firestore';
import { PubSub } from '@google-cloud/pubsub';
import { DatabaseService } from './database';
// import { EPRELService } from './eprel'; // Old import
// import { EBSIService } from './ebsi'; // Old import
import { EprelConnectorService } from '../integrations/eprelConnector'; // New import
import { EbsiIntegrationService } from '../blockchain/ebsiIntegration'; // New import
import { QRCodeService } from './qr';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  conditions?: WorkflowCondition[];
  retryPolicy: RetryPolicy;
  timeout: number; // seconds
  isActive: boolean;
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'webhook' | 'manual';
  config: {
    eventType?: string; // firestore document change, user action, etc.
    schedule?: string; // cron expression
    webhookPath?: string;
    collection?: string;
    condition?: string; // Firestore path/value condition for event triggers
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'validation' | 'integration' | 'notification' | 'transformation' | 'approval';
  config: Record<string, any>; // Step-specific configuration
  onSuccess?: string; // next step id
  onError?: string; // error handling step id
  timeout?: number; // Optional override for step timeout
}

export interface WorkflowCondition {
  field: string; // Field in the trigger data or context to check
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists' | 'startsWith' | 'endsWith';
  value: any; // Value to compare against
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number; // Factor by which delay increases
  initialDelay: number; // seconds
  maxDelay: number; // seconds
}

export class WorkflowEngine {
  private db = getFirestore();
  private pubsub = new PubSub();
  private dbService = new DatabaseService();
  private eprelService = new EprelConnectorService(); // Use new EPREL Connector
  private ebsiService = new EbsiIntegrationService();   // Use new EBSI Integration Service
  private qrService = new QRCodeService();

  // =============================================================================
  // PREDEFINED WORKFLOWS
  // =============================================================================

  private readonly workflows: WorkflowDefinition[] = [
    {
      id: 'product-verification-pipeline',
      name: 'Product Verification Pipeline',
      description: 'Automated verification workflow for new product passports',
      trigger: {
        type: 'event',
        config: {
          eventType: 'document.create', 
          collection: 'products'
        }
      },
      steps: [
        {
          id: 'validate-basic-data',
          name: 'Validate Basic Product Data',
          type: 'validation',
          config: {
            service: 'internalValidator', 
            checks: ['gtin-format', 'required-fields', 'data-consistency']
          },
          onSuccess: 'eprel-validation',
          onError: 'send-validation-error'
        },
        {
          id: 'eprel-validation',
          name: 'EPREL Database Validation',
          type: 'integration',
          config: {
            service: 'eprelService', // Refers to this.eprelService (now EprelConnectorService)
            action: 'validateProductRegistration', // Method on the service
            inputPath: 'triggerData.gtin', 
            outputPath: 'context.eprelValidationResult', 
            required: true
          },
          onSuccess: 'material-validation',
          onError: 'eprel-registration-required' 
        },
        {
          id: 'material-validation',
          name: 'Material Composition Validation',
          type: 'validation',
          config: {
            service: 'internalValidator',
            checks: ['material-percentages', 'hazardous-substances', 'restricted-materials']
          },
          onSuccess: 'auto-approve-check',
          onError: 'manual-review-required'
        },
        {
          id: 'auto-approve-check',
          name: 'Auto-Approval Eligibility Check',
          type: 'validation', 
          config: {
            service: 'approvalLogic',
            criteria: {
              eprelCompliantPath: 'context.eprelValidationResult.isRegistered',
              materialValidationPath: 'context.materialValidationResult.isValid', 
              companyTierPath: 'triggerData.companyDetails.tier', 
              allowedTiers: ['professional', 'enterprise'],
              historyScorePath: 'triggerData.companyDetails.complianceScore', 
              minHistoryScore: 8.0
            }
          },
          onSuccess: 'auto-approve',
          onError: 'manual-review-required'
        },
        {
          id: 'auto-approve',
          name: 'Auto-Approve Product',
          type: 'approval', 
          config: {
            service: 'dbService',
            action: 'updateProductVerificationStatus',
            productIdPath: 'triggerData.productId',
            status: 'verified',
            verifiedBy: 'system',
            generateCredentialConfig: { 
                service: 'ebsiService', // Refers to this.ebsiService (now EbsiIntegrationService)
                action: 'issueVerifiableCredential'
            },
            notifyUser: true 
          },
          onSuccess: 'generate-qr-code',
          onError: 'approval-failed' 
        },
        {
          id: 'generate-qr-code',
          name: 'Generate QR Code',
          type: 'integration',
          config: {
            service: 'qrService',
            action: 'generateQRCode',
            productIdPath: 'triggerData.productId',
            options: {
                formats: ['png', 'svg'],
                sizes: [300, 600]
            },
            outputPath: 'context.qrCodeResult'
          },
          onSuccess: 'send-completion-notification',
          onError: 'qr-generation-failed' 
        },
        {
          id: 'manual-review-required',
          name: 'Manual Review Required Notification',
          type: 'notification',
          config: {
            service: 'notificationService', 
            recipients: ['verifiers_group_email@example.com'], 
            template: 'manual-review-required',
            dataPaths: {
                productId: 'triggerData.productId',
                productName: 'triggerData.publicData.basicInfo.name'
            },
            priority: 'normal'
          }
        },
        {
          id: 'send-completion-notification',
          name: 'Send Completion Notification',
          type: 'notification',
          config: {
            service: 'notificationService',
            recipientPath: 'triggerData.ownerEmail', 
            template: 'verification-complete',
            dataPaths: {
                productId: 'triggerData.productId',
                productName: 'triggerData.publicData.basicInfo.name',
                credentialId: 'context.ebsiCredential.id' 
            }
          }
        },
        {
            id: 'send-validation-error',
            name: 'Send Basic Data Validation Error',
            type: 'notification',
            config: {
                service: 'notificationService',
                recipientPath: 'triggerData.ownerEmail',
                template: 'product-validation-failed',
                errorPath: 'context.validationErrorDetails'
            }
        },
        {
            id: 'eprel-registration-required',
            name: 'Notify EPREL Registration Required',
            type: 'notification',
            config: {
                service: 'notificationService',
                recipientPath: 'triggerData.ownerEmail',
                template: 'eprel-registration-prompt'
            }
        },
        {
            id: 'approval-failed',
            name: 'Notify Auto-Approval Failed',
            type: 'notification',
            config: {
                service: 'notificationService',
                recipientPath: 'triggerData.ownerEmail',
                template: 'approval-process-failed'
            }
        },
        {
            id: 'qr-generation-failed',
            name: 'Notify QR Generation Failed',
            type: 'notification',
            config: {
                service: 'notificationService',
                recipientPath: 'triggerData.ownerEmail',
                template: 'qr-code-generation-issue'
            }
        }
      ],
      conditions: [
        {
          field: 'category',
          operator: 'equals',
          value: 'electronics'
        }
      ],
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelay: 30,
        maxDelay: 300
      },
      timeout: 1800, 
      isActive: true
    },
    
    {
      id: 'daily-eprel-sync',
      name: 'Daily EPREL Synchronization',
      description: 'Daily sync with EPREL database for energy label updates',
      trigger: {
        type: 'schedule',
        config: {
          schedule: '0 2 * * *' 
        }
      },
      steps: [
        {
          id: 'fetch-updated-products',
          name: 'Fetch Products Updated in Last 24h',
          type: 'integration', 
          config: {
            service: 'dbService', 
            action: 'searchProducts', 
            params: {
              needsEprelSync: true 
            },
            outputPath: 'context.productsToSync' 
          },
          onSuccess: 'sync-with-eprel'
        },
        {
          id: 'sync-with-eprel',
          name: 'Sync with EPREL Database',
          type: 'integration',
          config: {
            service: 'eprelService', // Refers to this.eprelService (now EprelConnectorService)
            action: 'getProductDataByRegNumber', // Changed from syncProductData, assuming this is the action to call for each product
            inputPath: 'context.productsToSync', 
            batchSize: 100, 
            outputPath: 'context.eprelSyncResults'
          },
          onSuccess: 'update-products',
          onError: 'log-sync-errors'
        },
        {
          id: 'update-products',
          name: 'Update Product Data from EPREL Sync',
          type: 'transformation', 
          config: {
            service: 'dbService',
            action: 'batchUpdateProductFromEprel', 
            inputPath: 'context.eprelSyncResults',
            updateFields: [ 
              'publicData.sustainability.energyLabelClass',
              'publicData.compliance.energyLabel',
              'metadata.lastEPRELSyncDate' 
            ]
          },
          onSuccess: 'send-sync-report'
        },
        {
          id: 'send-sync-report',
          name: 'Send Sync Report',
          type: 'notification',
          config: {
            service: 'notificationService', 
            recipients: ['admin_email@example.com'], 
            template: 'eprel-sync-report',
            dataPath: 'context.eprelSyncResults', 
            includeStats: true
          }
        },
        {
            id: 'log-sync-errors',
            name: 'Log EPREL Sync Errors',
            type: 'notification', 
            config: {
                service: 'loggingService', 
                action: 'logWorkflowError',
                errorPath: 'context.currentError', 
                workflowId: 'daily-eprel-sync',
                stepIdPath: 'context.failedStepId', 
                level: 'error'
            }
        }
      ],
      retryPolicy: {
        maxRetries: 2,
        backoffMultiplier: 2,
        initialDelay: 60,
        maxDelay: 600
      },
      timeout: 3600, 
      isActive: true
    },

    {
      id: 'compliance-monitoring',
      name: 'Compliance Status Monitoring',
      description: 'Monitor products for compliance issues and alerts',
      trigger: {
        type: 'schedule',
        config: {
          schedule: '0 */6 * * *'
        }
      }
      // Steps, retryPolicy, timeout, isActive for this workflow were not provided in the last input
    }
  ];

  constructor() {
    // console.log("WorkflowEngine initialized with:", this.workflows.length, "predefined workflows.");
  }

  public getWorkflowDefinition(id: string): WorkflowDefinition | undefined {
    return this.workflows.find(wf => wf.id === id);
  }

  async triggerWorkflow(workflowId: string, triggerData: any): Promise<void> {
    const definition = this.getWorkflowDefinition(workflowId);
    if (!definition || !definition.isActive) {
      console.log(`Workflow ${workflowId} not found or not active.`);
      return;
    }

    console.log(`Triggering workflow: ${definition.name}`, triggerData);
  }
}
