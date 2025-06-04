
import type { Response, NextFunction } from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AuthenticatedRequest, CustomClaims } from '../services/auth';

interface RateLimitConfig {
  windowMs: number; // Milliseconds
  maxRequests: number;
  tier: string;
}

// Define rate limits per tier. Tiers could come from user's custom claims.
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  starter: { windowMs: 60 * 60 * 1000, maxRequests: 1000, tier: 'starter' },     // 1000 requests per hour
  professional: { windowMs: 60 * 60 * 1000, maxRequests: 10000, tier: 'professional' }, // 10,000 requests per hour
  enterprise: { windowMs: 60 * 60 * 1000, maxRequests: 100000, tier: 'enterprise' }, // 100,000 requests per hour
  default: { windowMs: 60 * 60 * 1000, maxRequests: 100, tier: 'default' }      // 100 requests per hour for unauthenticated/default
};

export const rateLimitMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Use user UID if authenticated, otherwise fall back to IP address
    const identifier = req.user?.uid || req.ip; 
    if (!identifier) {
      // Should not happen if IP is available
      console.warn('Rate limiting identifier (UID or IP) is missing.');
      return next(); 
    }

    const userClaims = req.user?.claims as CustomClaims | undefined;
    const tier = userClaims?.tier || 'default';
    const config = RATE_LIMITS[tier] || RATE_LIMITS.default;

    const now = Date.now();
    const windowStart = now - config.windowMs;

    const db = getFirestore();
    const rateLimitRef = db.collection('rateLimits').doc(identifier); // Document per user/IP
    
    const transactionResult = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      
      let data: { requests: number[], tier: string, firstRequestMs?: number, lastRequestMs?: number };
      if (!doc.exists) {
        data = { requests: [], tier: config.tier };
      } else {
        data = doc.data() as { requests: number[], tier: string, firstRequestMs?: number, lastRequestMs?: number };
        // If tier changed, reset counts or apply new limits (simple reset here)
        if (data.tier !== config.tier) {
          data.requests = [];
          data.tier = config.tier;
        }
      }

      // Filter out request timestamps older than the current window
      const recentRequests = (data.requests || []).filter((timestamp: number) => timestamp > windowStart);
      
      if (recentRequests.length >= config.maxRequests) {
        const retryAfterSeconds = data.firstRequestMs ? Math.ceil((data.firstRequestMs + config.windowMs - now) / 1000) : Math.ceil(config.windowMs / 1000);
        res.setHeader('Retry-After', String(retryAfterSeconds > 0 ? retryAfterSeconds : 1));
        return { limited: true, message: `Rate limit of ${config.maxRequests} requests per ${config.windowMs / (60*1000)} minutes exceeded. Tier: ${config.tier}.`, retryAfter: retryAfterSeconds };
      }

      // Add current request timestamp
      recentRequests.push(now);
      
      transaction.set(rateLimitRef, {
        requests: recentRequests,
        tier: config.tier,
        firstRequestMs: recentRequests[0], // Timestamp of the first request in the current window
        lastRequestMs: now,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true }); // Use merge to not overwrite other fields if any

      return { limited: false };
    });

    if (transactionResult.limited) {
        res.status(429).json({
            error: 'Rate Limit Exceeded',
            message: transactionResult.message,
            retryAfter: transactionResult.retryAfter
        });
        return; // Stop processing
    }

    next();
  } catch (error) {
    console.error('Rate limiting middleware error:', error);
    // In case of an error in the rate limiter, decide if you want to fail open (allow request) or closed
    next(); // Fail open by default
  }
};

    