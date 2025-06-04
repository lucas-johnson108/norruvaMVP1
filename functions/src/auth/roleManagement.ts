// functions/src/auth/roleManagement.ts
'use server';

/**
 * @fileOverview Manages user roles and permissions within the platform.
 * This service interacts with Firebase Auth custom claims and potentially
 * a Firestore database to define and enforce role-based access control (RBAC).
 */

import * as admin from 'firebase-admin';
// If not initialized elsewhere, initialize Firebase Admin SDK
// if (admin.apps.length === 0) {
//   admin.initializeApp();
// }

// Define platform roles
export type PlatformRole = 'manufacturer' | 'supplier' | 'recycler' | 'verifier' | 'regulator' | 'consumer' | 'admin' | 'partner'; // Added partner

interface RolePermissions {
  [role: string]: string[]; // e.g., { manufacturer: ['create:dpp', 'read:dpp'], ... }
}

// Example permissions structure (can be more granular)
const PLATFORM_PERMISSIONS: RolePermissions = {
  manufacturer: ['dpp:create', 'dpp:read_own', 'dpp:update_own', 'supplier:request_data', 'analytics:read_own'],
  supplier: ['dpp:contribute_data', 'request:read_own'],
  recycler: ['dpp:read_public', 'dpp:record_eol'],
  verifier: ['dpp:verify_all', 'dpp:read_restricted', 'audit:full'],
  regulator: ['dpp:read_all', 'audit:full', 'compliance:manage'],
  consumer: ['dpp:read_public'],
  admin: ['platform:manage_all', 'user:manage', 'role:assign'],
  partner: ['dpp:read_public', 'dashboard:access'], // Generic partner access
};

export class RoleManagementService {
  private auth = admin.auth();
  private firestore = admin.firestore();

  /**
   * Assigns a specific role to a user.
   * This sets custom claims on the Firebase Auth user and may update Firestore.
   * @param uid The Firebase UID of the user.
   * @param role The PlatformRole to assign.
   * @param companyId Optional company ID if role is company-specific.
   * @returns Promise<void>
   */
  async assignRoleToUser(uid: string, role: PlatformRole, companyId?: string): Promise<void> {
    console.log(`Assigning role '${role}' ${companyId ? `for company ${companyId}` : ''} to user ${uid} (Placeholder)`);
    const currentClaims = (await this.auth.getUser(uid)).customClaims || {};
    const newClaims: Record<string, any> = {
      ...currentClaims,
      role: role,
      permissions: PLATFORM_PERMISSIONS[role] || [],
    };
    if (companyId) {
      newClaims.companyId = companyId;
    }

    await this.auth.setCustomUserClaims(uid, newClaims);

    // Optionally, store role information in Firestore user profile for easier querying
    await this.firestore.collection('users').doc(uid).set({
      role: role,
      companyId: companyId || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`Role '${role}' assigned to user ${uid}. Claims updated.`);
  }

  /**
   * Retrieves the roles and permissions for a given user.
   * @param uid The Firebase UID of the user.
   * @returns Promise<{ role: PlatformRole | null, permissions: string[], companyId?: string } | null>
   */
  async getUserRolesAndPermissions(uid: string): Promise<{ role: PlatformRole | null, permissions: string[], companyId?: string } | null> {
    try {
      const userRecord = await this.auth.getUser(uid);
      const claims = userRecord.customClaims;
      if (claims && claims.role) {
        return {
          role: claims.role as PlatformRole,
          permissions: claims.permissions || [],
          companyId: claims.companyId
        };
      }
      return { role: null, permissions: [] }; // No specific role/claims found
    } catch (error) {
      console.error(`Error getting roles for user ${uid}:`, error);
      return null;
    }
  }

  /**
   * Checks if a user has a specific permission.
   * @param uid The Firebase UID of the user.
   * @param permission The permission string to check (e.g., 'dpp:create').
   * @returns Promise<boolean>
   */
  async userHasPermission(uid: string, permission: string): Promise<boolean> {
    const userData = await this.getUserRolesAndPermissions(uid);
    if (userData && userData.permissions) {
      // Admin role implicitly has all permissions
      if (userData.role === 'admin') return true;
      return userData.permissions.includes(permission);
    }
    return false;
  }

  /**
   * Gets all defined roles and their associated permissions.
   * @returns RolePermissions
   */
  getAllRolesAndPermissions(): RolePermissions {
    return PLATFORM_PERMISSIONS;
  }
}
