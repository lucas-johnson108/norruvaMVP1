// src/app/page.tsx
"use client";
import Navigation from '@/components/landing/navigation';
import HeroSection from '@/components/landing/hero-section';
import DesignAndBuildSection from '@/components/landing/design-and-build-section';
import VerifyAndTrackSection from '@/components/landing/verify-and-track-section';
import AnalyzeAndOptimizeSection from '@/components/landing/analyze-and-optimize-section';
import ScaleAndCollaborateSection from '@/components/landing/scale-and-collaborate-section';
import DppIntegrationArchitectureSection from '@/components/landing/DppIntegrationArchitectureSection';
import PlatformInActionSection from '@/components/landing/PlatformInActionSection'; // Added import
import SocialProofSection from '@/components/landing/social-proof-section';
import PricingSection from '@/components/landing/pricing-section';
import ContactSection from '@/components/landing/contact-section';
import CTASection from '@/components/landing/cta-section';
import Footer from '@/components/landing/footer';

// Removed: WhyNorruvaSection, DppShowcaseSection, DeveloperExperienceSection, CustomerSuccessSection, AboutSection
// Kept and will be updated: SolutionsSection (if needed, or content merged), PricingSection, ContactSection, CTASection, Footer.
// Added: DesignAndBuildSection, VerifyAndTrackSection, AnalyzeAndOptimizeSection, ScaleAndCollaborateSection, SocialProofSection

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <DesignAndBuildSection />
      <VerifyAndTrackSection />
      <AnalyzeAndOptimizeSection />
      <ScaleAndCollaborateSection />
      <DppIntegrationArchitectureSection />
      <PlatformInActionSection /> {/* Added new section here */}
      <SocialProofSection />
      <PricingSection />
      {/* SolutionsSection might be integrated into the new sections or kept if distinct enough */}
      {/* <SolutionsSection /> */}
      <ContactSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
