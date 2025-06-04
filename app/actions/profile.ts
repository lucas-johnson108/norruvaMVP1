
"use server";

import { z } from 'zod';

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }).max(50, { message: "Display name must be 50 characters or less."}),
  email: z.string().email("Invalid email address.").optional(), // Email might be read-only
  jobTitle: z.string().max(100, "Job title must be 100 characters or less.").optional().nullable(),
  phoneNumber: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10,15}$|^$/, "Invalid phone number format.").optional().nullable(), // Basic E.164-like regex, or empty
  language: z.string().min(2, { message: "Language selection is required." }),
  timezone: z.string().optional().nullable(),
  companyName: z.string().max(100, "Company name must be 100 characters or less.").optional().nullable(),
  companyRole: z.string().max(100, "Company role must be 100 characters or less.").optional().nullable(),
  notificationPreferences: z.object({
    productUpdatesEmail: z.boolean().default(false),
    complianceAlertsEmail: z.boolean().default(false),
    newsletterEmail: z.boolean().default(false),
  }).default({ productUpdatesEmail: true, complianceAlertsEmail: true, newsletterEmail: false }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UpdateProfileResult {
  success: boolean;
  message?: string;
  errors?: { field: string, message: string }[];
  updatedData?: ProfileFormValues;
}

export async function updateUserProfile(formData: ProfileFormValues): Promise<UpdateProfileResult> {
  const validationResult = profileFormSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed. Please check your input.",
      errors: validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  // In a real application, you would:
  // 1. Get the authenticated user's ID.
  // 2. Update the user's profile in your database (e.g., Firestore).
  // 3. Potentially update custom claims or other auth provider data.
  console.log("Updating user profile with (simulated):", validationResult.data);

  // Simulate an API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate a potential error
  // if (Math.random() < 0.1) {
  //   return { success: false, message: "An unexpected error occurred while saving your profile. Please try again later." };
  // }

  return { 
    success: true, 
    message: "Profile updated successfully!",
    updatedData: validationResult.data 
  };
}
