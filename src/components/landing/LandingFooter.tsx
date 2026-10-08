import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

interface LandingFooterProps {
  onOpenSignIn: () => void;
  onOpenGetStarted: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onOpenSignIn,
  onOpenGetStarted
}) => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900">MediIntel</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Secure healthcare medical record and document intelligence platform featuring AI extraction with negation detection.
            </p>
          </div>

          {/* Navigation mirror */}
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Platform
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#platform" className="hover:text-teal-700 transition-colors">
                  Platform Overview
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-teal-700 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-teal-700 transition-colors">
                  Core Features
                </a>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Solutions
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#for-doctors" className="hover:text-teal-700 transition-colors">
                  For Doctors & Clinicians
                </a>
              </li>
              <li>
                <a href="#for-hospitals" className="hover:text-teal-700 transition-colors">
                  For Hospital Administrations
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-teal-700 transition-colors">
                  Clinical Negation Detection
                </a>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Portal Access
            </div>
            <div className="space-y-2 text-xs">
              <button
                onClick={onOpenSignIn}
                className="block text-slate-600 hover:text-teal-700 transition-colors"
              >
                Sign In to Platform
              </button>
              <button
                onClick={onOpenGetStarted}
                className="block font-semibold text-teal-700 hover:text-teal-800 transition-colors"
              >
                Launch Test Drive →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© 2026 MediIntel Healthcare Technologies. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>HIPAA Compliant</span>
            <span>·</span>
            <span>HL7 / FHIR R4 Ready</span>
            <span>·</span>
            <span>Zero AI Model Retention</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
