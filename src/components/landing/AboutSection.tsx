import React from 'react';
import { ShieldCheck, HeartPulse, CheckCircle2, Award, Users2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold tracking-wider text-teal-700 uppercase">
            About MediIntel
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Clinical Accuracy, Physician Trust, and Patient Privacy
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Healthcare providers spend an estimated 2 to 3 hours on documentation for every hour of patient care. MediIntel was built to eliminate this friction through intelligent clinical document structuring that never compromises medical rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Doctor-in-the-Loop Philosophy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We reject black-box automation. MediIntel acts as an intelligent clinical assistant that drafts structured findings while preserving the physician as the ultimate decision-maker.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Longitudinal Care Over Siloed Visits
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instead of scattering documents across disparate PDFs, MediIntel aggregates encounters into unified chronological trajectories with synced lab trends and vital markers.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Strict Patient Consent & Isolation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patients own their medical records. Our architecture enforces strict horizontal boundary checks preventing any patient from accessing or viewing records of another individual.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
