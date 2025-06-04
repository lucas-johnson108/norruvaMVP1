
// src/components/landing/contact-section.tsx
"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { submitContactForm } from '@/app/actions/contact'; // Assuming this action exists and is compatible
import { Mail, Send, Loader2 } from 'lucide-react'; 

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submissionStatus, setSubmissionStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionStatus({ type: 'loading', message: '' });
    try {
      const result = await submitContactForm(formData);
      if (result.success) {
        setSubmissionStatus({ type: 'success', message: result.message || 'Message sent! We will reply soon.' });
        setFormData({ name: '', email: '', subject: '', message: '' }); 
      } else {
        // Improved error message display
        const errors = result.errors?.map(err => `${err.field}: ${err.message}`).join(', ') || 'Please check your input.';
        setSubmissionStatus({ type: 'error', message: result.message || errors });
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      setSubmissionStatus({ type: 'error', message: 'An unexpected error occurred. Please try again later.' });
    }
  };
  
  return (
    <section id="contact" className="py-20 bg-light-gray-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-inter font-extrabold text-deep-slate mb-4">
            Let's Connect
          </h2>
          <p className="text-lg md:text-xl text-dark-gray-text max-w-2xl mx-auto font-inter">
            Have questions or ready to start your DPP journey? Reach out to our expert team.
          </p>
        </div>
        <Card className="p-6 md:p-10 shadow-strong bg-pure-white rounded-xl border border-medium-gray-border">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name-contact" className="font-inter text-sm text-deep-slate mb-1 block">Full Name</Label>
                    <Input type="text" name="name" id="name-contact" value={formData.name} onChange={handleChange} required className="mt-1 bg-pure-white border-medium-gray-border focus:ring-electric-blue focus:border-electric-blue" placeholder="e.g., Jane Doe"/>
                  </div>
                  <div>
                    <Label htmlFor="email-contact" className="font-inter text-sm text-deep-slate mb-1 block">Email Address</Label>
                    <Input type="email" name="email" id="email-contact" value={formData.email} onChange={handleChange} required className="mt-1 bg-pure-white border-medium-gray-border focus:ring-electric-blue focus:border-electric-blue" placeholder="you@example.com"/>
                  </div>
              </div>
              <div>
                <Label htmlFor="subject-contact" className="font-inter text-sm text-deep-slate mb-1 block">Subject</Label>
                <Input type="text" name="subject" id="subject-contact" value={formData.subject} onChange={handleChange} required className="mt-1 bg-pure-white border-medium-gray-border focus:ring-electric-blue focus:border-electric-blue" placeholder="Regarding DPP Platform"/>
              </div>
              <div>
                <Label htmlFor="message-contact" className="font-inter text-sm text-deep-slate mb-1 block">Your Message</Label>
                <Textarea name="message" id="message-contact" rows={5} value={formData.message} onChange={handleChange} required className="mt-1 resize-y bg-pure-white border-medium-gray-border focus:ring-electric-blue focus:border-electric-blue" placeholder="How can we help you?"/>
              </div>
              <Button type="submit" className="w-full bg-electric-blue hover:bg-electric-blue/90 text-pure-white font-inter font-semibold py-3 text-base shadow-medium" disabled={submissionStatus.type === 'loading'}>
                {submissionStatus.type === 'loading' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                {submissionStatus.type === 'loading' ? 'Sending...' : 'Send Message'}
              </Button>
              {submissionStatus.message && (
                <p className={`text-sm mt-4 text-center ${submissionStatus.type === 'success' ? 'text-electric-blue' : 'text-destructive'}`}>{submissionStatus.message}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
