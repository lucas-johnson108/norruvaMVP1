
"use server";

// TYPE DEFINITIONS (kept at module level for clarity, TypeScript only, no runtime value)
type UserRoleInternal = 'admin' | 'editor' | 'viewer' | 'manager' | 'contributor';

interface TeamMemberInternal {
  id: string;
  name: string;
  email: string;
  role: UserRoleInternal;
  status: 'active' | 'pending' | 'revoked';
  lastLogin?: string | null; // ISO Date string
  joinedDate: string; // ISO Date string
}

interface ServerActionResultInternal<T = null> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field?: string; message: string }[];
}

// MOCK DATABASE (module-level variable)
let mockTeamMembersDb: TeamMemberInternal[] = [
  { id: 'user_1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'admin', status: 'active', lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(), joinedDate: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'user_2', name: 'Bob The Builder', email: 'bob@example.com', role: 'editor', status: 'active', lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), joinedDate: new Date(Date.now() - 86400000 * 60).toISOString() },
  { id: 'user_3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer', status: 'pending', lastLogin: null, joinedDate: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'user_4', name: 'Diana Prince', email: 'diana@example.com', role: 'manager', status: 'active', lastLogin: new Date(Date.now() - 86400000 * 0.5).toISOString(), joinedDate: new Date(Date.now() - 86400000 * 90).toISOString()},
  { id: 'user_5', name: 'Edward Scissorhands', email: 'edward@example.com', role: 'contributor', status: 'revoked', lastLogin: new Date(Date.now() - 86400000 * 180).toISOString(), joinedDate: new Date(Date.now() - 86400000 * 120).toISOString()},
];


// SERVER ACTIONS (only these are exported)
export async function listTeamMembers(): Promise<ServerActionResultInternal<TeamMemberInternal[]>> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  // Return a deep copy to prevent direct modification of mock DB from outside and ensure serializability
  return { success: true, data: JSON.parse(JSON.stringify(mockTeamMembersDb)) };
}

export async function inviteTeamMember(
  email: string,
  role: UserRoleInternal
): Promise<ServerActionResultInternal<{ member: TeamMemberInternal }>> {
  const { z } = await import('zod'); // Dynamic import for Zod
  const crypto = (await import('crypto')).default; // Dynamic import for crypto

  const userRoleValues = ['admin', 'editor', 'viewer', 'manager', 'contributor'] as [UserRoleInternal, ...UserRoleInternal[]];
  const inviteMemberSchemaInternal = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    role: z.enum(userRoleValues),
  });

  const validation = inviteMemberSchemaInternal.safeParse({ email, role });
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed. Please check the email and role.",
      errors: validation.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
    };
  }

  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async

  if (mockTeamMembersDb.some(member => member.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: `User with email ${email} already exists or has been invited.` };
  }

  const newMember: TeamMemberInternal = {
    id: `user_${crypto.randomBytes(4).toString('hex')}`,
    name: 'Invited User', // Or "Pending Invitation"
    email,
    role,
    status: 'pending',
    joinedDate: new Date().toISOString(),
    lastLogin: null,
  };
  mockTeamMembersDb.push(newMember);
  // Return a deep copy of the new member
  return { success: true, data: { member: JSON.parse(JSON.stringify(newMember)) }, message: `Invitation sent to ${email} for the ${role} role.` };
}

export async function updateTeamMemberRole(
  memberId: string,
  newRole: UserRoleInternal
): Promise<ServerActionResultInternal> {
  const { z } = await import('zod'); // Dynamic import

  const userRoleValues = ['admin', 'editor', 'viewer', 'manager', 'contributor'] as [UserRoleInternal, ...UserRoleInternal[]];
  const updateRoleSchemaInternal = z.object({
    memberId: z.string().min(1),
    newRole: z.enum(userRoleValues),
  });

  const validation = updateRoleSchemaInternal.safeParse({ memberId, newRole });
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed for role update.",
      errors: validation.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
    };
  }

  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  const memberIndex = mockTeamMembersDb.findIndex(m => m.id === memberId);

  if (memberIndex === -1) {
    return { success: false, message: "Team member not found." };
  }
  mockTeamMembersDb[memberIndex].role = newRole;
  return { success: true, message: `Role for ${mockTeamMembersDb[memberIndex].name} updated to ${newRole}.` };
}

export async function removeTeamMember(memberId: string): Promise<ServerActionResultInternal> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  const initialLength = mockTeamMembersDb.length;
  const memberToRemove = mockTeamMembersDb.find(m => m.id === memberId);

  if (!memberToRemove) {
     return { success: false, message: "Team member not found." };
  }
  mockTeamMembersDb = mockTeamMembersDb.filter(m => m.id !== memberId);

  if (mockTeamMembersDb.length < initialLength) {
    return { success: true, message: `Member ${memberToRemove.name} (${memberToRemove.email}) removed successfully.` };
  }
  return { success: false, message: "Failed to remove member (already removed or not found)." };
}
