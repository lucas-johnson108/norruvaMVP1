
// Firebase Studio Core Configuration
// Multi-environment setup for development, staging, and production

interface FirebaseStudioConfig {
  environments: {
    development: EnvironmentConfig;
    staging: EnvironmentConfig;
    production: EnvironmentConfig;
  };
  services: ServiceConfiguration;
  integrations: ExternalIntegrations;
}

interface EnvironmentConfig {
  projectId: string;
  region: string;
  database: {
    firestore: {
      region: string;
      multiRegion: boolean;
    };
    realtime: boolean;
  };
  storage: {
    multiRegion: boolean;
    defaultBucket: string;
  };
  functions: {
    region: string[];
    runtime: string;
    memory: string;
  };
  hosting: {
    site: string;
    customDomain?: string;
  };
}

interface ServiceConfiguration {
  auth: {
    providers: string[];
    customClaims: boolean;
    multiTenant: boolean;
  };
  firestore: {
    securityRules: string;
    indexes: string;
    backups: string;
  };
  storage: {
    cors: boolean;
    versioning: boolean;
    encryption: string;
  };
  functions: {
    triggers: string[];
    secrets: string;
    monitoring: string;
    i18nSupport?: boolean; // Added to reflect i18n capabilities
  };
}

interface ExternalIntegrations {
  external: {
    eprel: IntegrationDetail;
    ebsi: IntegrationDetail & { blockchain: string };
    gs1: IntegrationDetail & { digitalLink: boolean };
  };
  internal: {
    monitoring: string;
    logging: string;
    secrets: string;
    cdn: string;
  };
}

interface IntegrationDetail {
  endpoint: string;
  authentication: string;
  rateLimit?: number;
}


// Core Studio Configuration
const studioConfig: FirebaseStudioConfig = {
  environments: {
    development: {
      projectId: 'norruva-dev',
      region: 'europe-west1',
      database: {
        firestore: {
          region: 'europe-west1',
          multiRegion: false
        },
        realtime: true
      },
      storage: {
        multiRegion: false,
        defaultBucket: 'norruva-dev.appspot.com'
      },
      functions: {
        region: ['europe-west1'],
        runtime: 'nodejs18',
        memory: '512MB'
      },
      hosting: {
        site: 'norruva-dev'
      }
    },
    staging: {
      projectId: 'norruva-staging',
      region: 'europe-west1',
      database: {
        firestore: {
          region: 'europe-west1',
          multiRegion: true
        },
        realtime: true
      },
      storage: {
        multiRegion: true,
        defaultBucket: 'norruva-staging.appspot.com'
      },
      functions: {
        region: ['europe-west1', 'us-central1'],
        runtime: 'nodejs18',
        memory: '1GB'
      },
      hosting: {
        site: 'norruva-staging',
        customDomain: 'staging.norruva.com'
      }
    },
    production: {
      projectId: 'norruva-prod',
      region: 'europe-west1',
      database: {
        firestore: {
          region: 'europe-west1',
          multiRegion: true
        },
        realtime: true
      },
      storage: {
        multiRegion: true,
        defaultBucket: 'norruva-prod.appspot.com'
      },
      functions: {
        region: ['europe-west1', 'us-central1', 'asia-southeast1'],
        runtime: 'nodejs18',
        memory: '2GB'
      },
      hosting: {
        site: 'norruva-prod',
        customDomain: 'app.norruva.com'
      }
    }
  },
  services: {
    auth: {
      providers: ['email', 'google', 'microsoft'],
      customClaims: true,
      multiTenant: true
    },
    firestore: {
      securityRules: 'comprehensive', // This value is descriptive, the actual rules are in firestore.rules
      indexes: 'optimized',
      backups: 'automated'
    },
    storage: {
      cors: true,
      versioning: true,
      encryption: 'customer-managed'
    },
    functions: {
      triggers: ['https', 'firestore', 'auth', 'storage', 'pubsub'],
      secrets: 'secret-manager',
      monitoring: 'cloud-logging',
      i18nSupport: true // Indicating i18n is a consideration
    }
  },
  integrations: {
    external: {
      eprel: {
        endpoint: 'https://eprel.ec.europa.eu/api/v1',
        authentication: 'api-key',
        rateLimit: 1000
      },
      ebsi: {
        endpoint: 'https://api.ebsi.eu/v1',
        authentication: 'did-auth',
        blockchain: 'ethereum-compatible'
      },
      gs1: {
        endpoint: 'https://api.gs1.org/v1',
        authentication: 'oauth2',
        digitalLink: true
      }
    },
    internal: {
      monitoring: 'google-cloud-monitoring',
      logging: 'google-cloud-logging',
      secrets: 'google-secret-manager',
      cdn: 'google-cloud-cdn'
    }
  }
};

// Placeholder interfaces for Firestore document types
interface CompanyDocument { /* Define company fields here */ }
interface ProductDocument {
  /* Define product fields here */
  companyId: string;
  metadata?: {
      languages?: string[]; // ISO 639-1 codes for available translations
      visibility?: 'public' | 'restricted' | 'private' | 'company-only';
      // ... other metadata fields
  };
  verification?: {
    status?: 'draft' | 'pending' | 'verified' | 'rejected' | 'archived';
    // ... other verification fields
  };
}
interface UserDocument { /* Define user fields here */ }
// Renamed from 'VerificationDocument' to 'VerificationRequestDocument' for clarity if these are top-level general requests
interface VerificationRequestDocument {
  companyId: string;
  productId: string;
  verifierId?: string;
  // ... other verification fields
}
interface ApiKeyDocument { /* Define API key fields here */ }
interface WebhookDocument { /* Define webhook fields here */ }
interface AnalyticsDocument { /* Define analytics fields here */ }
interface AuditLogDocument { /* Define audit log fields here */ }
interface ConfigurationDocument { /* Define configuration fields here */ }
interface IntegrationDocument { /* Define integration fields here */ }
interface BillingDocument { /* Define billing fields here */ }
interface ProductVersionDocument { /* Define product version fields here */ }
// Product-specific verification logs. 'VerificationLogDocument' can still be used if its structure is generic.
interface ProductVerificationLogDocument { /* Define product-specific verification log fields here */ }
interface AccessLogDocument { /* Define access log fields here */ }
interface SessionDocument { /* Define session fields here */ }
interface PreferenceDocument { /* Define preference fields here */ }

// New Blockchain Hub related collections
interface DppNftDocument { owner: string; companyId?: string; /* ... other NFT fields */ }
interface NoruHoldingDocument { stakedAmount: number; /* ... other holding fields */ }
interface DaoProposalDocument { creator: string; /* ... other proposal fields */ }
interface DaoVoteDocument { userId: string; proposalId: string; /* ... other vote fields */ }
interface EbsiCredentialDocument { holder: string; issuer: string; /* ... other VC fields */ }
interface ComplianceReportDocument { /* ... fields for compliance reports */ }
interface PlatformVerificationLogDocument { /* For general platform verification logs, not product specific */ }


// Database Schema Design
interface FirestoreSchema {
  collections: {
    companies: CompanyDocument;
    products: ProductDocument;
    users: UserDocument;
    verificationRequests: VerificationRequestDocument; // For general verification submissions
    apiKeys: ApiKeyDocument;
    webhooks: WebhookDocument;
    analytics: AnalyticsDocument;
    auditLogs: AuditLogDocument;
    configurations: ConfigurationDocument;
    integrations: IntegrationDocument;
    publicProducts: ProductDocument; // Denormalized for public read
    dpp_nfts: DppNftDocument;
    noru_holdings: NoruHoldingDocument;
    dao_proposals: DaoProposalDocument;
    dao_votes: DaoVoteDocument;
    ebsi_credentials: EbsiCredentialDocument;
    compliance_reports: ComplianceReportDocument;
    verificationLogs: PlatformVerificationLogDocument; // Platform-wide verification logs
  };
  subcollections: {
    'companies/{companyId}/users': UserDocument;
    'companies/{companyId}/apiKeys': ApiKeyDocument;
    'companies/{companyId}/billing': BillingDocument;
    'products/{productId}/versions': ProductVersionDocument;
    'products/{productId}/verifications': ProductVerificationLogDocument; // Product-specific verification log
    'products/{productId}/accessLogs': AccessLogDocument;
    'users/{userId}/sessions': SessionDocument;
    'users/{userId}/preferences': PreferenceDocument;
  };
}

// The very long securityRules string constant has been removed from here.
// Its content is now directly in firestore.rules.

interface CloudFunctionsArchitecture {
  api: {
    'api-gateway': 'Main API routing and authentication';
    'api-products': 'Product CRUD operations';
    'api-companies': 'Company management';
    'api-auth': 'Authentication and authorization';
    'api-webhooks': 'Webhook management';
  };
  integrations: {
    'eprel-sync': 'EPREL database synchronization';
    'ebsi-credentials': 'EBSI blockchain interactions';
    'gs1-resolver': 'GS1 Digital Link resolution';
    'qr-generator': 'QR code generation service';
  };
  background: {
    'data-validation': 'Automated data validation';
    'compliance-checker': 'Regulatory compliance verification';
    'analytics-processor': 'Analytics data aggregation';
    'backup-manager': 'Automated backup operations';
  };
  triggers: {
    'user-onCreate': 'New user onboarding';
    'product-onWrite': 'Product change handling';
    'verification-onComplete': 'Verification completion';
    'payment-onSuccess': 'Payment processing';
  };
}

export {
  studioConfig,
  type FirebaseStudioConfig,
  type EnvironmentConfig,
  type ServiceConfiguration,
  type ExternalIntegrations,
  type FirestoreSchema,
  // securityRules, // Removed
  type CloudFunctionsArchitecture,
  type CompanyDocument,
  type ProductDocument,
  type UserDocument,
  type VerificationRequestDocument as VerificationDocument, // Alias for compatibility if needed
  type ApiKeyDocument,
  type WebhookDocument,
  type AnalyticsDocument,
  type AuditLogDocument,
  type ConfigurationDocument,
  type IntegrationDocument,
  type BillingDocument,
  type ProductVersionDocument,
  type ProductVerificationLogDocument, // Exporting specific product verification log
  type PlatformVerificationLogDocument, // Exporting platform-wide verification log
  type AccessLogDocument,
  type SessionDocument,
  type PreferenceDocument,
  // Exporting new blockchain types
  type DppNftDocument,
  type NoruHoldingDocument,
  type DaoProposalDocument,
  type DaoVoteDocument,
  type EbsiCredentialDocument,
  type ComplianceReportDocument
};

    