
import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import type { AuthenticatedRequest } from '../services/auth'; // For req.user

// Extend Error to include a status code and potentially other details
interface HttpError extends Error {
  statusCode?: number;
  status?: number; // Alias for statusCode
  isOperational?: boolean; // Flag for operational errors vs. programmer errors
  details?: any; // Additional details for the error
}

export const errorHandler: ErrorRequestHandler = (
  err: HttpError, 
  req: AuthenticatedRequest, // Use AuthenticatedRequest if user info is needed
  res: Response, 
  next: NextFunction // next is required for Express to recognize it as an error handler
) => {
  const errorTimestamp = new Date().toISOString();
  
  // Log the detailed error internally (e.g., to console, or a logging service)
  console.error(JSON.stringify({
    type: 'errorLog',
    timestamp: errorTimestamp,
    message: err.message,
    stack: err.stack, // Stack trace for debugging
    name: err.name,
    statusCode: err.statusCode || err.status || 500,
    isOperational: err.isOperational,
    details: err.details,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.uid || 'anonymous',
    apiVersion: req.apiVersion,
  }));

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Determine status code: use error's status code or default to 500
  const statusCode = err.statusCode || err.status || 500;
  
  // Prepare response message
  let responseMessage = 'An unexpected error occurred. Please try again later.';
  if (err.isOperational) { // For operational errors, we might show the message
    responseMessage = err.message;
  } else if (isDevelopment && err.message) { // In development, show more details
    responseMessage = err.message;
  }
  
  // If it's a non-operational error and not in development, keep it generic
  if (statusCode >= 500 && !err.isOperational && !isDevelopment) {
    responseMessage = 'Internal Server Error. Our team has been notified.';
  }

  res.status(statusCode).json({
    error: {
      message: responseMessage,
      code: err.name, // e.g., 'ValidationError', 'AuthenticationError'
      timestamp: errorTimestamp,
      // Only include stack and full details in development for security reasons
      ...(isDevelopment && { 
        details: err.details,
        stack: err.stack,
        fullError: err.toString()
      }),
    },
  });
};

    