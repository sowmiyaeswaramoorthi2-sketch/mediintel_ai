import React from 'react';
import {
  Stethoscope,
  TrendingUp,
  Search,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  ArrowRight,
  Camera,
  Activity
} from 'lucide-react';

interface DoctorSectionProps {
  onOpenDoctorPortal: () => void;
}

export const DoctorSection: React.FC<DoctorSectionProps> = ({ onOpenDoctorPortal }) => {
  return (
    <section id="for-doctors" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold tracking-wider text-teal-700 uppercase">
              Designed For Clinicians
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Empowering Doctors with Clinical Confidence
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Spend less time transcribing paperwork and more time treating patients. MediIntel automatically structures clinical documents while keeping you in full command.
            </p>
          </div>

          <button
            onClick={onOpenDoctorPortal}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 whitespace-nowrap self-start md:self-auto transition-colors"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Launch Doctor Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Value Pillars for Clinicians */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                OCR & Camera Document Capture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Snap photos of physical discharge summaries or upload external lab PDFs. The engine performs high-precision optical character recognition on the fly.
              </p>
            </div>
            <div className="text-[11px] text-teal-700 font-semibold pt-2 border-t border-slate-100">
              Webcam capture · PDF parsing · Multi-page support
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Negation-Aware Clinical Intelligence
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never worry about false-positive diagnoses. Explicit patient denials such as "denies chest pain" or "no history of stroke" are tagged as absent.
              </p>
            </div>
            <div className="text-[11px] text-cyan-700 font-semibold pt-2 border-t border-slate-100">
              Negation detection · Confidence thresholding
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Longitudinal Wave & Biomarker Graphs
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instantly visualize month-over-month patient trajectory. Correlate medication dosage changes with HbA1c, blood pressure, and creatinine fluctuations.
              </p>
            </div>
            <div className="text-[11px] text-blue-700 font-semibold pt-2 border-t border-slate-100">
              Multi-parameter trend graphs · Interactive hover points
            </div>
          </div>
        </div>

        {/* Doctor Testimonial / Clinical Guarantee Banner */}
        <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Clinical Guarantee
            </div>
            <p className="text-sm font-medium text-slate-200 max-w-2xl">
              "Every AI-extracted entity requires clinician confirmation before updating the official EHR. You maintain 100% diagnostic authority."
            </p>
          </div>
          <div className="text-xs text-slate-400 text-right shrink-0">
            <div className="text-white font-bold">Dr. Sarah Mathew, MD</div>
            <div>Chief of Endocrinology · Apex City Hospital</div>
          </div>
        </div>
      </div>
    </section>
  );
};
