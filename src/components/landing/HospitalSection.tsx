import React from 'react';
import {
  Building2,
  ShieldCheck,
  Lock,
  FileCheck2,
  Database,
  ArrowRight,
  Server,
  Users
} from 'lucide-react';

interface HospitalSectionProps {
  onOpenHospitalPortal: () => void;
}

export const HospitalSection: React.FC<HospitalSectionProps> = ({ onOpenHospitalPortal }) => {
  return (
    <section id="for-hospitals" className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold tracking-wider text-teal-700 uppercase">
              Enterprise Healthcare Systems
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Hospital-Grade Security & Governance
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Designed for hospital administrators, compliance officers, and health systems requiring zero data leakage, role-based scoping, and tamper-evident audit logs.
            </p>
          </div>

          <button
            onClick={onOpenHospitalPortal}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 whitespace-nowrap self-start md:self-auto transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>Launch Hospital Admin View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Security & Compliance Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100/80 text-teal-800 flex items-center justify-center">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Strict RBAC Isolation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patients cannot view records belonging to other patients. Staff access is bounded strictly by assigned clinical roles and hospital facility identifiers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Immutable Audit Trail</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every document upload, AI extraction, patient record query, and administrative action is logged with timestamp, user ID, IP address, and cryptographic hash.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100/80 text-indigo-800 flex items-center justify-center">
              <FileCheck2 className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">FHIR R4 Interoperability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Native FHIR bundle export enables seamless interoperability with Cerner, Epic, and legacy HL7 interfaces without costly custom middleware.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center">
              <Database className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Zero AI Training Retention</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Medical documents processed by the Gemini extraction pipeline are not retained for model training, satisfying strict HIPAA and GDPR standards.
            </p>
          </div>
        </div>

        {/* Hospital Metrics Summary Strip */}
        <div className="p-6 bg-teal-50/60 rounded-2xl border border-teal-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-extrabold text-teal-900 font-mono">100%</div>
            <div className="text-xs text-teal-800 font-medium mt-0.5">Role Isolation Enforcement</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-teal-900 font-mono">&lt;1.2s</div>
            <div className="text-xs text-teal-800 font-medium mt-0.5">Average OCR Extraction Time</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-teal-900 font-mono">99.4%</div>
            <div className="text-xs text-teal-800 font-medium mt-0.5">Clinical Entity Extraction Rate</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-teal-900 font-mono">0</div>
            <div className="text-xs text-teal-800 font-medium mt-0.5">Unauthorized Access Leaks</div>
          </div>
        </div>
      </div>
    </section>
  );
};
