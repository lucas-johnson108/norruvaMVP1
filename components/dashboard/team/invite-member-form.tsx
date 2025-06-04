
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
// Label is not directly used here but might be needed if FormLabel is insufficient.
// import { Label } from '@/components/ui/label'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { inviteTeamMember } from '@/app/actions/team';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define UserRole type locally
type UserRole = 'admin' | 'editor' | 'viewer' | 'manager' | 'contributor';

// Define availableUserRoles locally
const availableUserRoles = [
  { value: 'admin' as UserRole, label: 'Admin (Full Access)' },
  { value: 'editor' as UserRole, label: 'Editor (Manage Products & Compliance)' },
  { value: 'viewer' as UserRole, label: 'Viewer (Read-only Access)' },
  { value: 'manager' as UserRole, label: 'Manager (Team & Settings Access)' },
  { value: 'contributor' as UserRole, label: 'Contributor (Add/Edit Product Data)' },
] as const;


// Zod schema for inviting a new member
const inviteMemberSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  role: z.enum(availableUserRoles.map(role => role.value) as [UserRole, ...UserRole[]], {
    required_error: "Please select a role for the new member."
  }),
});

type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

interface InviteMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
}

export default function InviteMemberForm({ isOpen, onClose, onInviteSuccess }: InviteMemberFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: undefined,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset(); // Reset form when dialog closes
    }
  }, [isOpen, form]);

  const onSubmit: SubmitHandler<InviteMemberFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await inviteTeamMember(data.email, data.role);
      if (result.success) {
        onInviteSuccess(); 
      } else {
        toast({
          variant: "destructive",
          title: "Invitation Failed",
          description: result.message || "Could not send invitation. Please check details or try again.",
        });
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while sending the invitation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => { if (!openState) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Invite New Team Member
          </DialogTitle>
          <DialogDescription>
            Enter the email address and assign a role for the new team member. They will receive an email to join your organization.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="member@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUserRoles.map((roleOption) => (
                        <SelectItem key={roleOption.value} value={roleOption.value} className="capitalize">
                          {roleOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
