import React, { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Stethoscope } from 'lucide-react';
import { User, UserRole } from '../../types/healthcare';
import { LandingHeader } from './LandingHeader';
import { VisualWorkflow } from './VisualWorkflow';
import { CoreFeatures } from './CoreFeatures';
import { HowItWorks } from './HowItWorks';
import { DoctorSection } from './DoctorSection';
import { HospitalSection } from './HospitalSection';
import { AboutSection } from './AboutSection';
import { LandingFooter } from './LandingFooter';
import { AuthModal } from '../auth/AuthModal';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('DOCTOR');
  const [authModalMode, setAuthModalMode] = useState<'DEMO' | 'LOGIN' | 'SIGNUP'>('DEMO');

  const handleOpenAuth = (role: UserRole = 'DOCTOR', mode: 'DEMO' | 'LOGIN' | 'SIGNUP' = 'DEMO') => {
    setAuthModalRole(role);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* 1. HEADER */}
      <LandingHeader
        onOpenSignIn={() => handleOpenAuth('DOCTOR', 'LOGIN')}
        onOpenGetStarted={() => handleOpenAuth('DOCTOR', 'DEMO')}
      />

      {/* 2. HERO SECTION */}
      <section id="platform" className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        {/* Subtle architectural background texture */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-50/80 via-white to-white pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition & Copy */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Small Label */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-teal-700 uppercase">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                <span>AI-POWERED HEALTHCARE INTELLIGENCE</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] text-balance">
                Turn Medical Documents into Actionable Patient Intelligence
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Upload medical reports, extract structured patient information using AI, verify the results, and organize them into searchable patient records.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {/* Primary Button */}
                <button
                  onClick={() => handleOpenAuth('DOCTOR', 'DEMO')}
                  className="px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Get Started →</span>
                </button>

                {/* Secondary Button */}
                <button
                  onClick={handleScrollToHowItWorks}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Quiet Trust Footnotes */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Doctor-in-the-Loop Sign-Off</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Negation Detection</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Strict Role Isolation</span>
                </span>
              </div>
            </div>

            {/* Right Column: Clean Visual Workflow */}
            {/* Medical Document → AI Extraction → Verified Patient Record */}
            <div className="lg:col-span-6 w-full">
              <VisualWorkflow />
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <CoreFeatures onExploreFeature={() => {}} />

      {/* 4. HOW MEDINTEL WORKS */}
      <HowItWorks onStartWorkflow={() => handleOpenAuth('DOCTOR', 'DEMO')} />

      {/* FOR DOCTORS SECTION */}
      <DoctorSection onOpenDoctorPortal={() => handleOpenAuth('DOCTOR', 'DEMO')} />

      {/* FOR HOSPITALS SECTION */}
      <HospitalSection onOpenHospitalPortal={() => handleOpenAuth('HOSPITAL_ADMIN', 'DEMO')} />

      {/* ABOUT SECTION */}
      <AboutSection />

      {/* FOOTER */}
      <LandingFooter
        onOpenSignIn={() => handleOpenAuth('DOCTOR', 'LOGIN')}
        onOpenGetStarted={() => handleOpenAuth('DOCTOR', 'DEMO')}
      />

      {/* Interactive Auth Modal (Houses the demo accounts and full login/signup flow without polluting the clean first screen) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialRole={authModalRole}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setIsAuthModalOpen(false);
          onLoginSuccess(user);
        }}
      />
    </div>
  );
};
