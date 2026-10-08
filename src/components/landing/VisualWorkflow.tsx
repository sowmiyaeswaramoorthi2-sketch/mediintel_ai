import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileCheck2,
  Stethoscope
} from 'lucide-react';

interface SampleCase {
  id: string;
  name: string;
  docTitle: string;
  date: string;
  patientId: string;
  patientName: string;
  patientMeta: string;
  rawText: string;
  extractedEntities: {
    name: string;
    type: 'Condition' | 'Medication' | 'Lab';
    negated: boolean;
    confidence: string;
    note?: string;
  }[];
  verifiedRecord: {
    primaryDiagnosis: string;
    activeMed: string;
    vitalTrend: string;
    status: string;
    doctor: string;
  };
}

const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'case-1',
    name: 'Endocrine Panel',
    docTitle: 'Discharge Summary & Lab Panel',
    date: 'March 12, 2026',
    patientId: 'PAT-1001',
    patientName: 'Arun Kumar',
    patientMeta: '54y · Male · Apex Endocrinology',
    rawText: '54yo male with poorly controlled diabetes. Fasting blood glucose: 162 mg/dL, HbA1c: 8.4%. Patient explicitly denies chest pain and denies shortness of breath. Prescribed Metformin 500mg BID.',
    extractedEntities: [
      { name: 'Type 2 Diabetes', type: 'Condition', negated: false, confidence: '99.4%' },
      { name: 'Chest pain', type: 'Condition', negated: true, confidence: '98.8%', note: 'Negation detected' },
      { name: 'Shortness of breath', type: 'Condition', negated: true, confidence: '97.5%', note: 'Negation detected' },
      { name: 'HbA1c 8.4%', type: 'Lab', negated: false, confidence: '99.1%', note: 'Elevated marker' },
      { name: 'Metformin 500mg BID', type: 'Medication', negated: false, confidence: '99.6%' }
    ],
    verifiedRecord: {
      primaryDiagnosis: 'Type 2 Diabetes Mellitus (E11.9)',
      activeMed: 'Metformin 500mg BID (Active)',
      vitalTrend: 'HbA1c: 8.4% (Graph Synced)',
      status: 'Clinically Confirmed',
      doctor: 'Dr. Sarah Mathew, MD'
    }
  },
  {
    id: 'case-2',
    name: 'Cardiology Consult',
    docTitle: 'Cardiovascular Evaluation Note',
    date: 'February 24, 2026',
    patientId: 'PAT-1002',
    patientName: 'Ananya Roy',
    patientMeta: '48y · Female · Apex Heart Institute',
    rawText: 'Patient presents with episodic palpitations. ECG demonstrates sinus rhythm. No history of myocardial infarction. Blood Pressure: 138/88 mmHg. Started on Metoprolol 25mg daily.',
    extractedEntities: [
      { name: 'Palpitations', type: 'Condition', negated: false, confidence: '99.2%' },
      { name: 'Myocardial infarction', type: 'Condition', negated: true, confidence: '99.5%', note: 'Negation detected' },
      { name: 'BP 138/88 mmHg', type: 'Lab', negated: false, confidence: '98.9%', note: 'Stage 1 Hypertension' },
      { name: 'Metoprolol 25mg', type: 'Medication', negated: false, confidence: '99.4%' }
    ],
    verifiedRecord: {
      primaryDiagnosis: 'Benign Palpitations & HTN Stage 1',
      activeMed: 'Metoprolol Tartrate 25mg QD',
      vitalTrend: 'BP: 138/88 mmHg (Logged)',
      status: 'Clinically Confirmed',
      doctor: 'Dr. Sarah Mathew, MD'
    }
  },
  {
    id: 'case-3',
    name: 'Renal Function Panel',
    docTitle: 'Nephrology Lab Analysis',
    date: 'January 18, 2026',
    patientId: 'PAT-1004',
    patientName: 'Vikram Malhotra',
    patientMeta: '62y · Male · Apex Renal Center',
    rawText: 'Routine chronic kidney disease follow-up. Serum Creatinine: 1.4 mg/dL. eGFR: 56 mL/min/1.73m². Denies pedal edema. Discontinue NSAIDs. Continue Losartan 50mg.',
    extractedEntities: [
      { name: 'CKD Stage 3a', type: 'Condition', negated: false, confidence: '98.7%' },
      { name: 'Pedal edema', type: 'Condition', negated: true, confidence: '99.1%', note: 'Negation detected' },
      { name: 'Serum Creatinine 1.4', type: 'Lab', negated: false, confidence: '99.3%', note: 'Trend point added' },
      { name: 'Losartan 50mg', type: 'Medication', negated: false, confidence: '99.5%' }
    ],
    verifiedRecord: {
      primaryDiagnosis: 'Chronic Kidney Disease Stage 3a',
      activeMed: 'Losartan Potassium 50mg QD',
      vitalTrend: 'Creatinine: 1.4 mg/dL · eGFR: 56',
      status: 'Clinically Confirmed',
      doctor: 'Dr. Sarah Mathew, MD'
    }
  }
];

export const VisualWorkflow: React.FC = () => {
  const [activeCaseId, setActiveCaseId] = useState('case-1');
  const activeCase = SAMPLE_CASES.find((c) => c.id === activeCaseId) || SAMPLE_CASES[0];

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl space-y-5">
      {/* Visual Workflow Header & Case Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Clinical Processing Pipeline</span>
        </div>

        {/* Sample Switcher Tabs (Anti-slop functional segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-lg text-xs self-start sm:self-auto">
          {SAMPLE_CASES.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveCaseId(sc.id)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-[11px] font-medium ${
                activeCaseId === sc.id
                  ? 'bg-teal-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sc.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Stage Vertical / Horizontal Sequence */}
      <div className="grid grid-cols-1 gap-4">
        {/* STAGE 1: MEDICAL DOCUMENT CARD */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider block">
                  Stage 1 · Medical Document
                </span>
                <h4 className="text-xs font-bold text-white truncate">{activeCase.docTitle}</h4>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {activeCase.date}
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
            <div className="text-[10px] text-slate-500 mb-1">
              PATIENT: {activeCase.patientName} ({activeCase.patientId}) · {activeCase.patientMeta}
            </div>
            <p className="text-slate-200">
              "{activeCase.rawText}"
            </p>
          </div>
        </div>

        {/* CONNECTING FLOW ARROW */}
        <div className="flex items-center justify-center gap-2 text-xs text-teal-400 font-mono py-0.5">
          <div className="h-px bg-slate-700 flex-1" />
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-[11px] text-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Entity Extraction & Negation Logic</span>
            <ArrowRight className="w-3 h-3 text-teal-400" />
          </span>
          <div className="h-px bg-slate-700 flex-1" />
        </div>

        {/* STAGE 2: AI PROCESSING ELEMENT */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-teal-500/30 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider block">
                  Stage 2 · Extracted Clinical Entities
                </span>
                <h4 className="text-xs font-bold text-white">Gemini Medical OCR & Parser</h4>
              </div>
            </div>
            <span className="text-[11px] text-teal-400 font-mono font-medium">
              99.4% Avg Confidence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {activeCase.extractedEntities.map((ent, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  ent.negated
                    ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    : 'bg-teal-950/30 border-teal-800/60 text-teal-200'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate text-white">{ent.name}</div>
                  <div className="text-[10px] opacity-80 flex items-center gap-1.5 mt-0.5">
                    <span>{ent.type}</span>
                    <span>·</span>
                    <span>{ent.confidence}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 uppercase ${
                    ent.negated
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-600/40'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-600/40'
                  }`}
                >
                  {ent.negated ? 'Negated' : 'Affirmed'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CONNECTING FLOW ARROW */}
        <div className="flex items-center justify-center gap-2 text-xs text-teal-400 font-mono py-0.5">
          <div className="h-px bg-slate-700 flex-1" />
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span>Doctor Reviewed & Sign-Off</span>
            <ArrowRight className="w-3 h-3 text-teal-400" />
          </span>
          <div className="h-px bg-slate-700 flex-1" />
        </div>

        {/* STAGE 3: VERIFIED PATIENT RECORD CARD */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                  Stage 3 · Verified Patient Record
                </span>
                <h4 className="text-xs font-bold text-white">
                  Longitudinal EHR Profile: {activeCase.patientName}
                </h4>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeCase.verifiedRecord.status}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-900/95 rounded-xl border border-slate-800/90 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 text-[11px]">Primary Condition</span>
              <span className="font-semibold text-white">{activeCase.verifiedRecord.primaryDiagnosis}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 text-[11px]">Active Medication</span>
              <span className="font-semibold text-teal-300">{activeCase.verifiedRecord.activeMed}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 text-[11px]">Timeline & Trend Sync</span>
              <span className="font-semibold text-emerald-300">{activeCase.verifiedRecord.vitalTrend}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Audited Entry</span>
              </span>
              <span>Signed by {activeCase.verifiedRecord.doctor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
