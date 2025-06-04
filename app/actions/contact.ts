
"use server";

import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SubmissionResult {
  success: boolean;
  message?: string;
  errors?: { field: string, message: string }[];
}

export async function submitContactForm(formData: ContactFormData): Promise<SubmissionResult> {
  const validationResult = contactFormSchema.safeParse(formData);

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

  // In a real application, you would send an email or save to a database here.
  // For this example, we'll just log the data.
  console.log("Contact Form Submitted:", validationResult.data);

  // Simulate a delay for an API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate a potential error (e.g., 10% chance of failure)
  // if (Math.random() < 0.1) {
  //   return { success: false, message: "An unexpected error occurred while sending your message. Please try again later." };
  // }

  return { success: true, message: "Thank you for your message! We'll get back to you soon." };
}

    