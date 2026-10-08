import React, { useState } from 'react';
import {
  FileText,
  Search,
  Calendar,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';

interface CoreFeaturesProps {
  onExploreFeature?: (featureId: string) => void;
}

export const CoreFeatures: React.FC<CoreFeaturesProps> = ({ onExploreFeature }) => {
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'extract' | 'search' | 'timeline' | 'verify'>('extract');

  const features = [
    {
      id: 'doc-intel',
      tabKey: 'extract' as const,
      number: '01',
      title: 'AI Document Intelligence',
      description:
        'Automatically extract structured patient information from medical documents, PDFs and images.',
      details:
        'Advanced clinical OCR processes hospital discharge papers, clinical notes, and lab PDFs. Built-in negation detection correctly recognizes when a condition is ruled out or denied.',
      previewHighlight: 'Extracts conditions, dosages, and lab trends with negation flags',
      icon: FileText,
      accent: 'text-teal-700 bg-teal-50 border-teal-200'
    },
    {
      id: 'clinical-search',
      tabKey: 'search' as const,
      number: '02',
      title: 'Intelligent Clinical Search',
      description:
        'Find patients using diseases, medications, age, gender and natural-language queries.',
      details:
        'Execute multi-parameter queries across entire patient cohorts. Search by exact diagnosis, active pharmaceutical ingredients, lab value thresholds, or cohort demographics.',
      previewHighlight: 'Filter 15 patients by diagnoses, labs, and medications in real time',
      icon: Search,
      accent: 'text-cyan-700 bg-cyan-50 border-cyan-200'
    },
    {
      id: 'patient-timeline',
      tabKey: 'timeline' as const,
      number: '03',
      title: 'Unified Patient Timeline',
      description:
        'View diagnoses, medications, lab results and medical history chronologically.',
      details:
        'Consolidate disjointed encounters into a continuous month-by-month longitudinal wave. Track key biomarkers including HbA1c, Blood Pressure, and Creatinine over time.',
      previewHighlight: 'Month-wise wave timeline with synced biomarker trend graphs',
      icon: Calendar,
      accent: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    {
      id: 'doctor-verification',
      tabKey: 'verify' as const,
      number: '04',
      title: 'Doctor Verification',
      description:
        'Allow doctors to review extracted information before it becomes part of the patient record.',
      details:
        'Physician-in-the-loop governance ensures no AI output reaches the official EHR without explicit doctor sign-off, clinical confidence review, and full edit control.',
      previewHighlight: 'Human-in-the-loop confirmation before EHR commit',
      icon: UserCheck,
      accent: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold tracking-wider text-teal-700 uppercase">
            Clinical Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Core Features Engineered for Modern Care
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            MediIntel bridges the gap between unstructured clinical documentation and longitudinal electronic health records.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isSelected = activeInteractiveTab === feature.tabKey;

            return (
              <div
                key={feature.id}
                onClick={() => {
                  setActiveInteractiveTab(feature.tabKey);
                  onExploreFeature?.(feature.id);
                }}
                className={`p-6 rounded-2xl bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5 ${
                  isSelected
                    ? 'border-teal-600 shadow-md ring-1 ring-teal-600/30'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${feature.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {feature.number}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
                  <span className="text-[11px] truncate">{feature.previewHighlight}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Feature Deep Dive Panel */}
        <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Live Capability Inspection
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {activeInteractiveTab === 'extract' && 'AI Extraction Engine with Negation Detection'}
                {activeInteractiveTab === 'search' && 'Multi-Parametric Clinical Cohort Querying'}
                {activeInteractiveTab === 'timeline' && 'Longitudinal Trend & Wave Representation'}
                {activeInteractiveTab === 'verify' && 'Physician Sign-Off & Consent Governance'}
              </h4>
            </div>

            {/* Sub-tab controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveInteractiveTab('extract')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeInteractiveTab === 'extract' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Extraction
              </button>
              <button
                onClick={() => setActiveInteractiveTab('search')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeInteractiveTab === 'search' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveInteractiveTab('timeline')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeInteractiveTab === 'timeline' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveInteractiveTab('verify')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeInteractiveTab === 'verify' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Verification
              </button>
            </div>
          </div>

          {/* Interactive Dynamic Display based on activeInteractiveTab */}
          <div className="pt-5">
            {activeInteractiveTab === 'extract' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Raw Unstructured Text</span>
                  </div>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">
                    "Patient is a 54-year-old male with chronic T2DM. Fasting blood sugar 162 mg/dL. Denies any chest pain or radiating discomfort. Currently on Metformin 500mg BID."
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    <span>Gemini Medical Parsing</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 text-[11px]">
                    <li className="flex items-center justify-between">
                      <span>Condition: Type 2 Diabetes</span>
                      <span className="text-teal-800 font-semibold font-mono">Affirmed (99.4%)</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Condition: Chest pain</span>
                      <span className="text-amber-800 font-semibold font-mono">Negated (98.8%)</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Medication: Metformin 500mg</span>
                      <span className="text-teal-800 font-semibold font-mono">Affirmed (99.6%)</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Clinical Safety Advantage</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    Prevents false positives by differentiating between clinical diagnoses and explicit patient denials (e.g. "no chest pain" is never miscategorized as angina).
                  </p>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'search' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="text-xs font-mono text-slate-800 flex-1 truncate">
                    query: "Patients with Type 2 Diabetes AND Age &gt; 50 AND Metformin"
                  </div>
                  <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Cohort Search
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="font-bold text-slate-900">Arun Kumar (54y, M)</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">PAT-1001 · HbA1c: 8.4%</div>
                    <div className="text-[11px] text-teal-700 mt-1 font-semibold">T2DM, Metformin 500mg BID</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="font-bold text-slate-900">Vikram Malhotra (62y, M)</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">PAT-1004 · Fasting: 154 mg/dL</div>
                    <div className="text-[11px] text-teal-700 mt-1 font-semibold">T2DM, CKD Stage 3a</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="font-bold text-slate-900">Meera Nambiar (58y, F)</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">PAT-1008 · HbA1c: 7.9%</div>
                    <div className="text-[11px] text-teal-700 mt-1 font-semibold">T2DM, Dyslipidemia</div>
                  </div>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'timeline' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Longitudinal Timeline Visualization</span>
                  <span className="text-teal-700 font-semibold">Chronological Ordering</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block">January 2026</span>
                    <div className="font-bold text-slate-900">Initial Endocrine Consult</div>
                    <p className="text-[11px] text-slate-600">Diagnosed T2DM, HbA1c 8.8%. Started Metformin.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block">February 2026</span>
                    <div className="font-bold text-slate-900">Cardiology Clearance</div>
                    <p className="text-[11px] text-slate-600">ECG Normal, BP 134/84. Denied chest pain.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-teal-500 bg-teal-50/40 space-y-1">
                    <span className="text-[10px] font-mono text-teal-700 font-semibold block">March 2026 (Latest)</span>
                    <div className="font-bold text-slate-900">Metabolic Panel Review</div>
                    <p className="text-[11px] text-slate-600">HbA1c lowered to 8.4%. Creatinine 1.0 mg/dL.</p>
                  </div>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'verify' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Physician Approval Gate</span>
                  </div>
                  <p className="text-slate-600 text-[11px] max-w-xl">
                    Doctors can modify confidence flags, reject incorrect matches, edit medication dosages, and add personal clinical commentary before records are finalized into the immutable patient timeline.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 bg-white border border-teal-500 rounded-lg text-teal-800 font-semibold text-xs whitespace-nowrap shadow-2xs">
                  100% Doctor Confirmed
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
