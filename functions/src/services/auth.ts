
// functions/src/services/auth.ts
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
// import jwt from 'jsonwebtoken'; // jwt is used for creating custom tokens by firebase-admin itself. Direct use here might be for other purposes.
import type { Request } from 'express';

export interface CustomClaims {
  role: 'admin' | 'user' | 'viewer' | 'verifier' | 'regulator' | string; // Allow string for more flexibility if needed
  companyId?: string;
  permissions?: string[]; // Made optional as not all tokens might have it explicitly
  scope?: string[];       // Made optional
  tier?: 'starter' | 'professional' | 'enterprise' | string; // Allow string
  // Add any other claims you need
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string | null; // email can be null
    claims: CustomClaims & Record<string, any>; // Allow any other properties from decoded token
  };
  apiVersion?: string;
}

export class AuthService {
  private db = getFirestore();
  private auth = getAuth();

  async createCustomToken(uid: string, claims: CustomClaims): Promise<string> {
    try {
      return await this.auth.createCustomToken(uid, claims);
    } catch (error) {
      console.error('Error creating custom token:', { uid, claims, error });
      throw new Error('Failed to create authentication token');
    }
  }

  async setCustomClaims(uid: string, claims: CustomClaims): Promise<void> {
    try {
      await this.auth.setCustomUserClaims(uid, claims);
      
      // Also store/update in Firestore for quick access or denormalization if needed
      // This depends on your data model. If user profiles are in Firestore:
      await this.db.collection('users').doc(uid).set({ // Using set with merge:true or update
        customClaims: claims,
        lastUpdatedClaimsAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error setting custom claims:', { uid, claims, error });
      throw new Error('Failed to set user permissions');
    }
  }

  async verifyIdToken(idToken: string): Promise<any> { // Returns Firebase DecodedIdToken
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      // It's good to distinguish between different error types if possible
      // For example, token expired, token revoked, etc.
      throw new Error('Invalid or expired authentication token');
    }
  }

  async getUserWithClaims(uid: string): Promise<any> {
    try {
      const userRecord = await this.auth.getUser(uid);
      // Optionally fetch additional user data from Firestore if you store profiles separately
      const userDocRef = this.db.collection('users').doc(uid);
      const userDoc = await userDocRef.get();
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        emailVerified: userRecord.emailVerified,
        customClaims: userRecord.customClaims || {}, // Ensure customClaims is an object
        providerData: userRecord.providerData,
        // Include Firestore data if it exists
        ...(userDoc.exists && { firestoreData: userDoc.data() }),
      };
    } catch (error) {
      console.error('Error getting user with claims:', { uid, error });
      throw new Error('Failed to retrieve user information');
    }
  }

  hasPermission(userClaims: CustomClaims, requiredPermission: string): boolean {
    if (!userClaims.permissions) return false;
    return userClaims.permissions.includes(requiredPermission) || 
           userClaims.role === 'admin'; // Assuming admin has all permissions
  }

  hasRole(userClaims: CustomClaims, requiredRole: string | string[]): boolean {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(userClaims.role);
  }

  canAccessCompany(userClaims: CustomClaims, companyId: string): boolean {
    // Admin can access any company, regulators might have broad access too.
    if (userClaims.role === 'admin' || userClaims.role === 'regulator') {
      return true;
    }
    return userClaims.companyId === companyId;
  }
}

    