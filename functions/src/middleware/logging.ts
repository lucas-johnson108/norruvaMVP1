
import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../services/auth'; // For req.user

export const loggingMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestTimestamp = new Date().toISOString();

  // Log incoming request details
  console.log(JSON.stringify({
    type: 'requestLog',
    timestamp: requestTimestamp,
    method: req.method,
    url: req.originalUrl, // Use originalUrl to get the full path including query params
    ip: req.ip,
    userAgent: req.get('User-Agent') || 'N/A',
    userId: req.user?.uid || 'anonymous', // Log user ID if authenticated
    apiVersion: req.apiVersion,
    headers: req.headers, // Be cautious logging all headers in production (sensitive info)
    body: req.method !== 'GET' ? req.body : undefined, // Log body for non-GET requests, consider redacting sensitive fields
  }));

  // Store original res.send and res.json to intercept response
  const originalSend = res.send;
  const originalJson = res.json;
  let responseBody: any = null;

  res.send = function (body?: any): Response {
    responseBody = body; // Capture body for logging
    return originalSend.call(this, body);
  };
  
  res.json = function (body?: any): Response {
    responseBody = body; // Capture body for logging
    return originalJson.call(this, body);
  };

  // Log response details when request is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      type: 'responseLog',
      timestamp: new Date().toISOString(),
      correlationId: requestTimestamp, // Link to the request log
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      durationMs: duration,
      userId: req.user?.uid || 'anonymous',
      responseHeaders: res.getHeaders(), // Log response headers
      // responseBody: responseBody, // Be very cautious logging entire response bodies in production
    }));
  });
  
  next();
};

    