
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Users, Loader2, CheckCircle, ShieldAlert, Search, Filter, CalendarDays, ClockIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import TeamMemberActions from '@/components/dashboard/team/team-member-actions';
import InviteMemberForm from '@/components/dashboard/team/invite-member-form';
import { listTeamMembers, updateTeamMemberRole, removeTeamMember } from '@/app/actions/team';

// Define types locally as they are not exported from actions
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

const availableRolesForFilter: { value: UserRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'manager', label: 'Manager' },
  { value: 'contributor', label: 'Contributor' },
];

const availableStatusesForFilter: { value: TeamMember['status'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'revoked', label: 'Revoked' },
];


export default function TeamPage() {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TeamMember['status'] | 'all'>('all');

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listTeamMembers();
      if (result.success && Array.isArray(result.data)) {
        setTeamMembers(result.data);
      } else {
        console.error("Failed to fetch team members or data is not an array:", result.message, result.data);
        toast({ variant: 'destructive', title: 'Data Error', description: result.message || 'Received invalid team member data.' });
        setTeamMembers([]);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load team members.' });
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchTerm, roleFilter, statusFilter]);

  const handleInviteSuccess = () => {
    setShowInviteDialog(false);
    toast({ title: "Invitation Sent", description: "The new member has been invited."});
    fetchMembers(); 
  };

  const handleUpdateRole = async (memberId: string, newRole: UserRole) => {
    setIsLoading(true); 
    const result = await updateTeamMemberRole(memberId, newRole);
    if (result.success) {
      toast({ title: "Role Updated", description: result.message });
      fetchMembers(); 
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: result.message });
    }
    setIsLoading(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsLoading(true); 
    const result = await removeTeamMember(memberId);
    if (result.success) {
      toast({ title: "Member Removed", description: result.message });
      fetchMembers();
    } else {
      toast({ variant: "destructive", title: "Removal Failed", description: result.message });
    }
    setIsLoading(false);
  };
  
  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-accent text-accent-foreground"><CheckCircle className="mr-1 h-3 w-3" />Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-700 border-yellow-500"><ClockIcon className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'revoked':
        return <Badge variant="destructive" className="bg-destructive/80 text-destructive-foreground"><ShieldAlert className="mr-1 h-3 w-3" />Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'PPp'); // e.g., Jun 10, 2024, 10:00 AM
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-headline font-semibold text-primary">Team Management</h1>
                <p className="text-muted-foreground">Manage users, roles, and permissions for your organization.</p>
            </div>
        </div>
        <Button onClick={() => setShowInviteDialog(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Invite New Member
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Team Members & Filters</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by Name or Email..." 
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
              <SelectTrigger aria-label="Filter by Role"><SelectValue placeholder="Filter by Role" /></SelectTrigger>
              <SelectContent>
                {availableRolesForFilter.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TeamMember['status'] | 'all')}>
              <SelectTrigger aria-label="Filter by Status"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                {availableStatusesForFilter.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0"> {/* Remove padding for full-width table */}
          {isLoading && teamMembers.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-60 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">Loading team members...</p>
              <p className="text-sm">Please wait a moment.</p>
            </div>
          ) : filteredMembers.length === 0 && !isLoading ? ( 
            <div className="flex flex-col justify-center items-center h-60 text-muted-foreground">
                <Users className="h-12 w-12 text-primary/50 mb-4"/>
                <p className="text-lg font-semibold">No Team Members Found</p>
                <p className="text-sm max-w-xs text-center">
                    {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                        ? "No members match your current filters. Try adjusting your search." 
                        : "Your team is currently empty. Invite someone to get started!"}
                </p>
                {!(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                     <Button onClick={() => setShowInviteDialog(true)} className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                        <PlusCircle className="mr-2 h-4 w-4" /> Invite First Member
                    </Button>
                )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><CalendarDays className="inline-block mr-1 h-4 w-4 text-muted-foreground"/>Joined Date</TableHead>
                  <TableHead><ClockIcon className="inline-block mr-1 h-4 w-4 text-muted-foreground"/>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell className="capitalize">{member.role}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-xs">{formatDate(member.joinedDate)}</TableCell>
                    <TableCell className="text-xs">{formatDate(member.lastLogin)}</TableCell>
                    <TableCell className="text-right">
                      <TeamMemberActions
                        member={member}
                        onEdit={handleUpdateRole} 
                        onRemove={handleRemoveMember} 
                        disabled={isLoading} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteMemberForm
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
}
