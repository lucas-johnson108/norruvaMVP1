
import type { Response, NextFunction } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { AuthService, type AuthenticatedRequest, type CustomClaims } from '../services/auth';
import crypto from 'crypto';

// Utility function to hash API keys (example, use a secure method)
function hashApiKey(apiKey: string): string {
  // In a real app, use a slow hashing algorithm like bcrypt or Argon2 if comparing stored hashes.
  // For direct comparison or lookup, SHA256 is okay if the original key isn't stored,
  // or if this hash is used as an index for a securely stored mapping.
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Placeholder for API key rate limiting check
// In a real app, this would integrate with your rateLimitMiddleware or a separate service
async function isRateLimited(apiKeyHashed: string, keyData: any): Promise<boolean> {
  // Example: Check against `keyData.rateLimit` which might define { requests, windowMs }
  // This is a very simplified placeholder.
  // Your actual rateLimitMiddleware is more comprehensive for user-based limiting.
  // API key specific limits might be simpler or use a different store.
  console.log(`Checking rate limit for API key (hashed): ${apiKeyHashed}`, keyData.rateLimit);
  // For now, assume not rate limited for API keys as the main rate limiter handles user UIDs/IPs
  return false;
}


export const authMiddleware = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;

    if (!authHeader && !apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token or API key provided'
      });
      return;
    }

    const authService = new AuthService();

    if (apiKey) {
      // API Key authentication
      const hashedApiKey = hashApiKey(apiKey); // Hash the provided key for lookup
      const apiKeyQuerySnapshot = await getFirestore()
        .collection('apiKeys') // Ensure this collection exists and is structured correctly
        .where('hashedKey', '==', hashedApiKey) // Store hashed keys, not plaintext
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (apiKeyQuerySnapshot.empty) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or inactive API key'
        });
        return;
      }

      const apiKeyDoc = apiKeyQuerySnapshot.docs[0];
      const keyData = apiKeyDoc.data();
      
      // Check API key specific rate limits if applicable
      if (keyData.rateLimit && await isRateLimited(hashedApiKey, keyData)) {
        res.status(429).json({
          error: 'Rate Limit Exceeded',
          message: 'API key rate limit exceeded for this key'
        });
        return;
      }

      // Update last used timestamp and usage count
      await apiKeyDoc.ref.update({
        lastUsedAt: new Date(),
        usageCount: (keyData.usageCount || 0) + 1
      });
      
      // Construct user-like object from API key data
      // Ensure `keyData.permissions` aligns with CustomClaims structure
      req.user = {
        uid: keyData.userId || `apikey_${apiKeyDoc.id}`, // A UID associated with the key or a generated one
        email: keyData.userEmail || null, // Optional email
        claims: keyData.claims as CustomClaims || { role: 'service', permissions: keyData.permissions || [] } as CustomClaims,
      };

    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      // JWT Token authentication
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decodedToken = await authService.verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        claims: decodedToken as CustomClaims, // Assuming decodedToken structure matches CustomClaims
      };
    } else {
      // No valid auth method found in header
       res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication header missing or malformed'
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message || 'Failed to authenticate token or API key.'
    });
  }
};

    