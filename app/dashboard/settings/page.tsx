
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Save, 
  UserCircle, 
  Mail, 
  Globe, 
  Briefcase, 
  Phone,
  Building2,
  Clock,
  Bell,
  ShieldAlert,
  KeyRound,
  Trash2,
  Edit2,
  Camera,
  Settings // Added Settings icon here
} from 'lucide-react';
import type { ProfileFormValues } from '@/app/actions/profile';
import { updateUserProfile } from '@/app/actions/profile';

// Zod schema should match the one in the server action
const profileFormSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(50, "Display name must be 50 characters or less."),
  email: z.string().email("Invalid email address.").optional(),
  jobTitle: z.string().max(100, "Job title must be 100 characters or less.").optional().nullable(),
  phoneNumber: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10,15}$|^$/, "Invalid phone number format. Use E.164 like +12223334444").optional().nullable(),
  language: z.string().min(2, "Please select a language."),
  timezone: z.string().optional().nullable(),
  companyName: z.string().max(100, "Company name must be 100 characters or less.").optional().nullable(),
  companyRole: z.string().max(100, "Company role must be 100 characters or less.").optional().nullable(),
  notificationPreferences: z.object({
    productUpdatesEmail: z.boolean().default(true),
    complianceAlertsEmail: z.boolean().default(true),
    newsletterEmail: z.boolean().default(false),
  }).default({ productUpdatesEmail: true, complianceAlertsEmail: true, newsletterEmail: false }),
});

const availableLanguages = [
  { value: 'en', label: 'English (US)' }, { value: 'en-GB', label: 'English (UK)' },
  { value: 'de', label: 'Deutsch (German)' }, { value: 'fr', label: 'Français (French)' },
  { value: 'es', label: 'Español (Spanish)' }, { value: 'it', label: 'Italiano (Italian)' },
];

const availableTimezones = [
  { value: 'Etc/GMT+12', label: '(GMT-12:00) International Date Line West' },
  { value: 'Europe/London', label: '(GMT+00:00) London, Dublin' },
  { value: 'Europe/Berlin', label: '(GMT+01:00) Amsterdam, Berlin, Rome, Paris' },
  { value: 'America/New_York', label: '(GMT-05:00) Eastern Time (US & Canada)' },
];

export default function ProfileSettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentUser, setCurrentUser] = useState<ProfileFormValues>({
    displayName: 'Demo Partner User',
    email: 'partner@norruva.com',
    jobTitle: 'Compliance Manager',
    phoneNumber: '+15551234567',
    language: 'en',
    timezone: 'Europe/Berlin',
    companyName: 'GreenTech Solutions Ltd.',
    companyRole: 'Primary Contact',
    notificationPreferences: {
      productUpdatesEmail: true,
      complianceAlertsEmail: true,
      newsletterEmail: false,
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: currentUser,
  });

  useEffect(() => {
    form.reset(currentUser);
  }, [currentUser, form]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await updateUserProfile(data);
      if (result.success && result.updatedData) {
        toast({
          title: "Profile Updated",
          description: result.message || "Your settings have been saved.",
        });
        setCurrentUser(prev => ({...prev, ...result.updatedData}));
      } else {
        let descriptionMessage = result.message || "Could not save your settings.";
        if (result.errors && result.errors.length > 0) {
          const errorDetails = result.errors.map(e => `${e.field}: ${e.message}`).join('\n');
          descriptionMessage += `\nDetails:\n${errorDetails}`;
        }
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: descriptionMessage,
        });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold text-primary mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information, company details, preferences, and security settings.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Personal Information Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><UserCircle className="text-primary h-6 w-6"/>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Image 
                  src="https://placehold.co/100x100.png?text=Avatar" 
                  alt="User Avatar" 
                  width={100} 
                  height={100} 
                  className="rounded-full border"
                  data-ai-hint="user avatar"
                />
                <div>
                  <Button type="button" variant="outline" size="sm" onClick={() => alert("Change picture clicked (Placeholder)")} className="flex items-center gap-1">
                    <Camera className="h-4 w-4"/> Change Picture
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF. Max 2MB.</p>
                </div>
              </div>
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Edit2 className="mr-2 h-4 w-4 text-muted-foreground" />Display Name</FormLabel>
                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" />Email Address</FormLabel>
                    <FormControl><Input placeholder="your.email@example.com" {...field} readOnly disabled className="bg-muted/50 cursor-not-allowed"/></FormControl>
                    <FormDescription>Cannot be changed here.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />Job Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Compliance Manager" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" />Phone Number</FormLabel>
                    <FormControl><Input type="tel" placeholder="+1 123 456 7890" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Company Details Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Building2 className="text-primary h-6 w-6"/>Company Details</CardTitle>
              <CardDescription>Information about your organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Edit2 className="mr-2 h-4 w-4 text-muted-foreground" />Company Name</FormLabel>
                    <FormControl><Input placeholder="Your Company Inc." {...field} value={field.value ?? ""} readOnly disabled className="bg-muted/50 cursor-not-allowed"/></FormControl>
                     <FormDescription>Managed by organization admin.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Edit2 className="mr-2 h-4 w-4 text-muted-foreground" />Your Role</FormLabel>
                    <FormControl><Input placeholder="e.g., Primary Contact, Technical Lead" {...field} value={field.value ?? ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          {/* Preferences Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Settings className="text-primary h-6 w-6"/>Preferences</CardTitle>
              <CardDescription>Customize your platform experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Globe className="mr-2 h-4 w-4 text-muted-foreground" />Preferred Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {availableLanguages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Clock className="mr-2 h-4 w-4 text-muted-foreground" />Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {availableTimezones.map(tz => (
                          <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notification Settings Card */}
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Bell className="text-primary h-6 w-6"/>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive platform notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="notificationPreferences.productUpdatesEmail"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Product Updates</FormLabel>
                                <FormDescription>Receive emails about new product data or status changes.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notificationPreferences.complianceAlertsEmail"
                    render={({ field }) => (
                         <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Compliance Alerts</FormLabel>
                                <FormDescription>Get notified about critical compliance issues or deadlines.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notificationPreferences.newsletterEmail"
                    render={({ field }) => (
                         <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Platform Newsletter</FormLabel>
                                <FormDescription>Receive occasional news, tips, and updates from Norruva.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>

          {/* Security Settings Card */}
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><ShieldAlert className="text-primary h-6 w-6"/>Security</CardTitle>
                <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg shadow-sm">
                    <div>
                        <Label className="font-medium">Password</Label>
                        <p className="text-sm text-muted-foreground">Change your account password regularly for security.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => alert("Change Password clicked (Placeholder)")} className="flex items-center gap-1">
                        <KeyRound className="h-4 w-4"/>Change Password
                    </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg shadow-sm">
                    <div>
                        <Label className="font-medium">Two-Factor Authentication (2FA)</Label>
                        <p className="text-sm text-muted-foreground">Status: <span className="text-destructive font-semibold">Disabled</span></p>
                    </div>
                     <Button type="button" variant="outline" onClick={() => alert("Setup 2FA clicked (Placeholder)")} className="flex items-center gap-1">
                        <ShieldAlert className="h-4 w-4"/>Setup 2FA
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                 <p className="text-xs text-muted-foreground">For any security concerns, please contact support immediately.</p>
            </CardFooter>
          </Card>

          <Separator />

          <div className="flex justify-between items-center">
             <Button type="button" variant="destructive" onClick={() => alert("Delete Account clicked (Placeholder)")} className="flex items-center gap-1">
                <Trash2 className="h-4 w-4"/> Delete Account
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Saving Changes...' : 'Save All Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
