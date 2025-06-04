
import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi'; // Ensure Joi is in your package.json and installed

// Middleware generator for validating request body against a Joi schema
export const validateSchema = (schema: Joi.ObjectSchema | Joi.AlternativesSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate req.body, req.query, or req.params as needed. This example focuses on req.body.
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow properties not defined in schema (can be set to false for stricter validation)
      stripUnknown: true, // Remove properties not defined in schema (can be set to false)
    }); 
    
    if (error) {
      // Map Joi error details to a more user-friendly format
      const errors = error.details.map(detail => ({
        message: detail.message,
        path: detail.path,
        type: detail.type
      }));
      
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data. Please check the errors.',
        details: errors
      });
      return;
    }
    
    req.body = value; // Assign validated and potentially transformed (e.g. stripped) value back to req.body
    next();
  };
};

// Common validation schemas (examples)
export const schemas = {
  // Example: Schema for creating a company
  createCompany: Joi.object({
    name: Joi.string().trim().required().min(2).max(100).messages({
      'string.base': `"name" should be a type of 'text'`,
      'string.empty': `"name" cannot be an empty field`,
      'string.min': `"name" should have a minimum length of {#limit}`,
      'string.max': `"name" should have a maximum length of {#limit}`,
      'any.required': `"name" is a required field`
    }),
    type: Joi.string().valid('manufacturer', 'verifier', 'partner', 'recycler').required(),
    address: Joi.object({
      street: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      country: Joi.string().trim().length(2).uppercase().required().messages({ // Example: ISO 3166-1 alpha-2 country code
        'string.length': `"country" must be a 2-character ISO country code (e.g., US)`
      }),
      postalCode: Joi.string().trim().required()
    }).required(),
    contact: Joi.object({
      email: Joi.string().trim().email().required(),
      phone: Joi.string().trim().required(), // Add more specific phone validation if needed
      website: Joi.string().trim().uri().optional().allow('')
    }).required()
  }),

  // Example: Schema for creating a product
  createProduct: Joi.object({
    gtin: Joi.string().trim().pattern(/^[0-9]{8,14}$/).required().messages({ // GS1 GTIN
        'string.pattern.base': `"gtin" must be a valid GTIN (8-14 digits)`
    }),
    name: Joi.string().trim().required().min(2).max(200),
    brand: Joi.string().trim().required().min(1).max(100),
    model: Joi.string().trim().required().min(1).max(100),
    category: Joi.string().valid('electronics', 'battery', 'textile', 'furniture').required(),
    manufacturingDate: Joi.date().iso().required(), // ISO 8601 date format (YYYY-MM-DD)
    countryOfOrigin: Joi.string().trim().length(2).uppercase().required() // ISO 3166-1 alpha-2
  }),

  // Example: Schema for updating a product (all fields optional)
  updateProduct: Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    brand: Joi.string().trim().min(1).max(100).optional(),
    model: Joi.string().trim().min(1).max(100).optional(),
    description: Joi.string().trim().max(1000).optional().allow(''),
    sustainabilityData: Joi.object().optional(), // Define nested structure if needed
    complianceData: Joi.object().optional()     // Define nested structure if needed
  }),

  // Example: Schema for creating an API key
  createApiKey: Joi.object({
    name: Joi.string().trim().required().min(1).max(100),
    permissions: Joi.array().items(Joi.string().trim()).min(1).required().messages({
        'array.min': `"permissions" must contain at least one permission`
    }),
    // Example: rateLimit could be an object or a specific tier string
    rateLimitTier: Joi.string().valid('starter', 'professional', 'enterprise').optional(),
    // expiresAt: Joi.date().iso().greater('now').optional(), // Example: Expiry date
    // expiresIn: Joi.number().integer().min(24 * 60 * 60).optional() // Example: Expires in seconds (min 1 day)
  }),

  // Generic ID parameter validation (e.g., for /items/:id)
  // This would typically be used for req.params, not req.body
  // Example: validateParams(schemas.idParam)
  idParam: Joi.object({
    id: Joi.string().trim().alphanum().length(20).required() // Example for Firestore-like ID
  })
};

    