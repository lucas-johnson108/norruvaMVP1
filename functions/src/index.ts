
// functions/src/index.ts
// Main entry point for Firebase Functions

import { initializeApp } from 'firebase-admin/app';
import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { onCall, HttpsError } from 'firebase-functions/v2/https'; // Added onCall and HttpsError
import { setGlobalOptions } from 'firebase-functions/v2';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import QRCode from 'qrcode'; // For QR Code generation

// Initialize Firebase Admin
initializeApp();

// Set global options for all functions
setGlobalOptions({
  region: 'europe-west1',
  maxInstances: 100,
  memory: '1GiB',
  timeoutSeconds: 540
});

// Import route handlers
import { authRouter } from './api/auth';
import { companiesRouter } from './api/companies';
import { productsRouter } from './api/products';
import { verificationRouter } from './api/verification';
import { integrationsRouter } from './api/integrations';
import { webhooksRouter } from './api/webhooks';
import { analyticsRouter } from './api/analytics';
import { publicRouter } from './api/public';

// Import middleware
import { authMiddleware, type AuthenticatedRequest } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { loggingMiddleware } from './middleware/logging';
import { errorHandler } from './middleware/errorHandler';

// Import Blockchain Services for mock calls
import { NoruTokenService } from './blockchain/noruToken';
import { StakingService } from './dpp/stakingService'; // Staking service is in dpp
import { DppRegistryService } from './blockchain/dppRegistry';


// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.norruva.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://studio.norruva.com', 'https://app.norruva.com', 'https://dpp.norruva-demo.com'] // Added dpp.norruva-demo.com
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global middleware (applied to all routes after this point)
app.use(loggingMiddleware);
app.use(rateLimitMiddleware);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API versioning middleware
app.use('/v1', (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  req.apiVersion = 'v1';
  next();
});

// Public routes (no authentication required)
app.use('/v1/auth', authRouter);
app.use('/v1/public', publicRouter);

// Protected routes (authentication required)
app.use('/v1/companies', authMiddleware, companiesRouter);
app.use('/v1/products', authMiddleware, productsRouter);
app.use('/v1/verification', authMiddleware, verificationRouter);
app.use('/v1/integrations', authMiddleware, integrationsRouter);
app.use('/v1/webhooks', authMiddleware, webhooksRouter);
app.use('/v1/analytics', authMiddleware, analyticsRouter);

// Global error handler - should be the last middleware before exporting the app
app.use(errorHandler);

// 404 handler for any routes not matched above
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Export the main API function for Firebase
export const api = onRequest(app);


// --- Callable Functions ---

// Create Product API
export const createProduct = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }
  const { companyId, uid } = request.auth.token;
  if (!companyId) {
     throw new HttpsError('failed-precondition', 'User is not associated with a company.');
  }

  try {
    const productData = {
      ...request.data,
      companyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: uid,
      status: 'draft'
    };
    // Path as per user's function: companies/{companyId}/products
    const docRef = await admin.firestore()
      .collection('companies').doc(companyId as string) // Assuming companyId is string
      .collection('products').add(productData);
    return { id: docRef.id, success: true, product: { id: docRef.id, ...productData} }; // Return created product
  } catch (error: any) {
    console.error("Error creating product:", error);
    throw new HttpsError('internal', error.message, error.details);
  }
});

// Submit Product for Verification
export const submitForVerification = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }
  const { companyId, uid } = request.auth.token;
   if (!companyId) {
     throw new HttpsError('failed-precondition', 'User is not associated with a company.');
  }

  const { productId, verifierType, notes } = request.data as { productId: string; verifierType: string; notes?: string };
  if (!productId || !verifierType) {
    throw new HttpsError('invalid-argument', 'Missing productId or verifierType.');
  }

  try {
    const verificationRecord = {
      productId,
      companyId,
      verifierType,
      notes,
      status: 'pending',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      submittedBy: uid
    };
    await admin.firestore().collection('verifications').add(verificationRecord);

    // Update product status in companies/{companyId}/products/{productId}
    await admin.firestore()
      .collection('companies').doc(companyId as string)
      .collection('products').doc(productId)
      .update({ status: 'pending_verification', lastVerificationRequestAt: admin.firestore.FieldValue.serverTimestamp() });

    return { success: true, message: 'Submitted for verification' };
  } catch (error: any) {
    console.error("Error submitting for verification:", error);
    throw new HttpsError('internal', error.message, error.details);
  }
});

// QR Code Generation
export const generateQR = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }
  const { productId, size = 'medium' } = request.data as { productId: string; size?: string };
  if (!productId) {
    throw new HttpsError('invalid-argument', 'Missing productId.');
  }

  try {
    const digitalLinkURL = `${process.env.APP_BASE_URL || 'https://yourdomain.com'}/product/${productId}`;

    let qrWidth: number;
    switch (size) {
        case 'small': qrWidth = 200; break;
        case 'large': qrWidth = 600; break;
        default: qrWidth = 400; // medium
    }

    const qrOptions: QRCode.QRCodeToDataURLOptions = {
      width: qrWidth,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'H'
    };
    const qrDataURL = await QRCode.toDataURL(digitalLinkURL, qrOptions);
    return { qrCode: qrDataURL, digitalLink: digitalLinkURL, success: true };
  } catch (error: any) {
    console.error("Error generating QR code:", error);
    throw new HttpsError('internal', error.message, error.details);
  }
});

// --- Blockchain related Callable Functions ---
// Instantiate mock services
const noruTokenService = new NoruTokenService();
const stakingService = new StakingService();
const dppRegistryService = new DppRegistryService();

export const getTokenBalance = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to check token balance.');
  }
  const { account } = request.data as { account?: string };
  if (!account || typeof account !== 'string') {
    throw new HttpsError('invalid-argument', 'Account address (string) is required.');
  }
  try {
    console.log(`getTokenBalance called for account: ${account} by user: ${request.auth.uid}`);
    const balance = await noruTokenService.getTokenBalance(account);
    const stakedBalance = await stakingService.getStakedBalance(account); // Assuming StakingService has this
    return {
      balance, // NORU token balance
      stakedBalance,
      success: true
    };
  } catch (error: any) {
    console.error("Error in getTokenBalance:", error);
    throw new HttpsError('internal', error.message || "Failed to get token balance.");
  }
});

export const stakeTokens = onCall(async (request) => {
  if (!request.auth) { throw new HttpsError('unauthenticated', 'Authentication required.'); }
  const { amount, account } = request.data as { amount?: number, account?: string };

  if (typeof amount !== 'number' || amount <= 0) {
    throw new HttpsError('invalid-argument', 'Valid amount (number > 0) is required.');
  }
  if (!account || typeof account !== 'string') {
    throw new HttpsError('invalid-argument', 'Account address (string) is required.');
  }

  try {
    console.log(`stakeTokens called for account ${account} with amount ${amount} by user ${request.auth.uid}`);
    const transactionHash = await stakingService.stakeTokens(account, amount.toString());
    return {
      transactionHash,
      message: `${amount} NORU tokens staked successfully (mock).`,
      success: true
    };
  } catch (error: any) {
    console.error("Error in stakeTokens:", error);
    throw new HttpsError('internal', error.message || "Failed to stake tokens.");
  }
});

export const mintDPP = onCall(async (request) => {
  if (!request.auth) { throw new HttpsError('unauthenticated', 'Authentication required.'); }
  const { organizationId, productData, account } = request.data as { organizationId?: string, productData?: any, account?: string };

  if (!organizationId || typeof organizationId !== 'string') {
    throw new HttpsError('invalid-argument', 'Organization ID (string) is required.');
  }
  if (!productData || typeof productData !== 'object' || !productData.name) {
    throw new HttpsError('invalid-argument', 'Product data (object with at least a name field) is required.');
  }
  if (!account || typeof account !== 'string') {
    throw new HttpsError('invalid-argument', 'Account address (string) for minting is required.');
  }

  try {
    console.log(`mintDPP called for product "${productData.name}" (Org: ${organizationId}) by user ${request.auth.uid} on behalf of ${account}`);
    // Assuming productData has at least gtin, name, description, imageUrl for the NFT metadata
    const metadata = {
        name: productData.name,
        description: productData.description || `DPP for ${productData.name}`,
        image: productData.imageUrl || '', // URL to product image
        gtin: productData.gtin || 'N/A',
        manufacturerDid: `did:org:${organizationId}`, // Example DID
        publicDataHash: `mockHashFor${productData.name}` // Hash of public DPP data
    };

    const result = await dppRegistryService.mintDppNft(account, productData.gtin || 'N/A_GTIN', metadata);

    return {
      tokenId: result.tokenId,
      transactionHash: result.transactionHash,
      metadataUrl: result.metadataUrl,
      message: `DPP NFT ${result.tokenId} for "${productData.name}" minted successfully (mock).`,
      success: true
    };
  } catch (error: any) {
    console.error("Error in mintDPP:", error);
    throw new HttpsError('internal', error.message || "Failed to mint DPP NFT.");
  }
});
    