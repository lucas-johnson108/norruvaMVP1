
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
// useToast is not directly used here, parent handles toasts
// import { useToast } from '@/hooks/use-toast'; 
import { Edit, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// Define types locally
type UserRole = 'admin' | 'editor' | 'viewer' | 'manager' | 'contributor';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'pending' | 'revoked';
  lastLogin?: string | null;
  joinedDate: string;
}

const availableUserRoles = [
  { value: 'admin' as UserRole, label: 'Admin (Full Access)' },
  { value: 'editor'as UserRole, label: 'Editor (Manage Products & Compliance)' },
  { value: 'viewer'as UserRole, label: 'Viewer (Read-only Access)' },
  { value: 'manager'as UserRole, label: 'Manager (Team & Settings Access)' },
  { value: 'contributor'as UserRole, label: 'Contributor (Add/Edit Product Data)' },
] as const;


interface EditRoleFormProps {
  member: TeamMember;
  currentRole: UserRole;
  onSave: (memberId: string, newRole: UserRole) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const EditRoleForm: React.FC<EditRoleFormProps> = ({ member, currentRole, onSave, onCancel, isSaving }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const handleSave = async () => {
    await onSave(member.id, selectedRole);
  };

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground">
        Modifying role for <span className="font-semibold text-foreground">{member.name}</span> ({member.email}).
      </p>
      <div>
        <Label htmlFor="role-select-edit" className="text-sm font-medium">New Role</Label>
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
          <SelectTrigger id="role-select-edit" className="mt-1">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {availableUserRoles.map((role) => (
              <SelectItem key={role.value} value={role.value} className="capitalize">
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving || selectedRole === currentRole} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
};


interface TeamMemberActionsProps {
  member: TeamMember;
  onEdit: (memberId: string, newRole: UserRole) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
  disabled?: boolean;
}

export default function TeamMemberActions({ member, onEdit, onRemove, disabled }: TeamMemberActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingRemove, setIsSubmittingRemove] = useState(false);

  const handleEditRoleSubmit = async (memberId: string, newRole: UserRole) => {
    setIsSubmittingEdit(true);
    await onEdit(memberId, newRole);
    setIsSubmittingEdit(false);
    setShowEditDialog(false);
  };

  const handleRemoveConfirm = async () => {
    setIsSubmittingRemove(true);
    await onRemove(member.id);
    setIsSubmittingRemove(false);
    setShowRemoveDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabled} aria-label={`Actions for ${member.name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setShowEditDialog(true)} disabled={disabled || member.status === 'revoked'}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Role
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onSelect={() => setShowRemoveDialog(true)} 
            className="text-destructive focus:text-destructive focus:bg-destructive/10" 
            disabled={disabled || member.status === 'revoked'}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Role for {member.name}</DialogTitle>
            <DialogDescription>
              Select a new role for this team member. Changes will take effect immediately.
            </DialogDescription>
          </DialogHeader>
          <EditRoleForm
            member={member}
            currentRole={member.role}
            onSave={handleEditRoleSubmit}
            onCancel={() => setShowEditDialog(false)}
            isSaving={isSubmittingEdit}
          />
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to remove {member.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove <span className="font-semibold">{member.name}</span> ({member.email}) from the team.
              Their access will be revoked. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmittingRemove}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isSubmittingRemove}
            >
              {isSubmittingRemove ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
