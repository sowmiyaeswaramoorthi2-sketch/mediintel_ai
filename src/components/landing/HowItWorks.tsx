import React, { useState } from 'react';
import {
  UploadCloud,
  Cpu,
  UserCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

interface HowItWorksProps {
  onStartWorkflow?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartWorkflow }) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      number: '1',
      title: 'Upload',
      subtitle: 'Documents, PDFs or Images',
      description: 'Upload medical documents, PDFs or images.',
      details:
        'Easily import clinical discharge summaries, handwritten doctor notes, outpatient lab reports, and mobile camera captures in high fidelity.',
      icon: UploadCloud,
      meta: 'Supports PDF, PNG, JPEG & Scans',
      mockSnippet: {
        header: 'Apex General Hospital • Lab Specimen #4810',
        content: 'Fasting blood glucose 162 mg/dL. HbA1c 8.4%. Denies angina. Rx Metformin 500mg BID.'
      }
    },
    {
      number: '2',
      title: 'Extract',
      subtitle: 'AI & Negation Detection',
      description:
        'AI processes and extracts structured clinical entities (conditions, medications, lab results) with negation detection.',
      details:
        'Gemini-powered medical intelligence isolates diagnoses, pharmaceutical regimens, and biometric values while accurately distinguishing denied symptoms from positive findings.',
      icon: Cpu,
      meta: '99.4% Clinical Parser Accuracy',
      mockSnippet: {
        header: 'Structured Entity Parsing',
        content: '✓ Type 2 Diabetes [Affirmed] · ✕ Chest pain [Negated] · 💊 Metformin 500mg BID · 🧪 HbA1c 8.4%'
      }
    },
    {
      number: '3',
      title: 'Verify',
      subtitle: 'Doctor Review Gate',
      description:
        'Doctors review, edit, and validate AI findings with clinical confidence.',
      details:
        'Physicians verify each extracted entity, adjust dosages, or reject erroneous tags with a single click before clinical data commits to the patient record.',
      icon: UserCheck,
      meta: 'Human-in-the-Loop Governance',
      mockSnippet: {
        header: 'Clinician Approval by Dr. Sarah Mathew',
        content: 'Entities reviewed, verified against clinical history, and signed off into EHR.'
      }
    },
    {
      number: '4',
      title: 'Organize & Search',
      subtitle: 'Longitudinal Profiles & Search',
      description:
        'Records are organized into longitudinal patient timelines, trends, and unified searchable profiles.',
      details:
        'Data automatically populates chronological wave timelines, multi-year biomarker graphs (HbA1c, Creatinine, BP), and cohort-wide natural language search.',
      icon: Search,
      meta: 'Instant Natural Language Querying',
      mockSnippet: {
        header: 'Patient Longitudinal Profile Synced',
        content: 'PAT-1001 timeline updated · Graph plotted · Searchable by "T2DM", "Metformin", "HbA1c > 8%"'
      }
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold tracking-wider text-teal-700 uppercase">
              End-to-End Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How MediIntel Works
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              A clean 4-step workflow designed to transform chaotic clinical paperwork into reliable, doctor-verified patient intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Physician Validated · HIPAA Ready</span>
          </div>
        </div>

        {/* 4-Step Visual Workflow Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = selectedStep === Number(step.number);

            return (
              <div
                key={step.number}
                onClick={() => setSelectedStep(Number(step.number))}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-teal-50/40 border-teal-600 shadow-sm ring-1 ring-teal-600/30'
                    : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        isSelected
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {step.number}
                    </span>
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? 'text-teal-700' : 'text-slate-400'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-teal-800 font-medium pt-2 border-t border-slate-200/60">
                  {step.meta}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Detail Viewer for Selected Step */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                {steps[selectedStep - 1].number}
              </span>
              <h4 className="text-base font-bold text-white">
                Step {steps[selectedStep - 1].number}: {steps[selectedStep - 1].title} — {steps[selectedStep - 1].subtitle}
              </h4>
            </div>
            <div className="text-xs text-teal-400 font-medium">
              Click any step above to inspect workflow mechanics
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs items-center">
            <div className="space-y-3">
              <p className="text-slate-300 text-sm leading-relaxed">
                {steps[selectedStep - 1].details}
              </p>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>Engine: MediIntel Clinical Intelligence Core</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
              <div className="text-[11px] font-mono text-teal-400 uppercase tracking-wider font-semibold">
                {steps[selectedStep - 1].mockSnippet.header}
              </div>
              <p className="text-xs font-mono text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                {steps[selectedStep - 1].mockSnippet.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
