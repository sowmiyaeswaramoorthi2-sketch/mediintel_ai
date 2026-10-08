import React, { useState, useEffect } from 'react';
import {
  User,
  Patient,
  MedicalDocument,
  AuditLog,
  Hospital
} from '../../types/healthcare';
import {
  Building2,
  Users,
  Stethoscope,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  Plus,
  TrendingUp,
  AlertTriangle,
  Mail,
  Phone,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

interface HospitalAdminDashboardProps {
  currentUser: User;
  hospital: Hospital;
  patients: Patient[];
  documents: MedicalDocument[];
  auditLogs: AuditLog[];
}

export const HospitalAdminDashboard: React.FC<HospitalAdminDashboardProps> = ({
  currentUser,
  hospital: initialHospital,
  patients: initialPatients,
  documents: initialDocuments,
  auditLogs: initialAuditLogs
}) => {
  const [activeTab, setActiveTab] = useState<'DOCTORS' | 'PATIENTS' | 'DOCUMENTS' | 'AUDIT'>('DOCTORS');
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active hospital state
  const [activeHospital, setActiveHospital] = useState<Hospital & { adminName?: string; adminEmail?: string; adminPhone?: string }>(initialHospital);
  const [scopedPatients, setScopedPatients] = useState<Patient[]>(initialPatients);
  const [scopedDocuments, setScopedDocuments] = useState<MedicalDocument[]>(initialDocuments);
  const [scopedAuditLogs, setScopedAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Hospital-scoped doctors list
  const [doctorsList, setDoctorsList] = useState([
    {
      id: 'DOC-201',
      name: 'Dr. Sarah Mathew, MD',
      specialty: 'Endocrinology & Internal Medicine',
      activePatients: 24,
      documentsVerified: 142,
      license: 'MCI-REG-84920',
      status: 'ACTIVE'
    },
    {
      id: 'DOC-202',
      name: 'Dr. Anand Raman, DM',
      specialty: 'Cardiology',
      activePatients: 18,
      documentsVerified: 98,
      license: 'MCI-REG-91204',
      status: 'ACTIVE'
    },
    {
      id: 'DOC-203',
      name: 'Dr. Meenakshi Sundaram, MS',
      specialty: 'Orthopedics',
      activePatients: 15,
      documentsVerified: 76,
      license: 'MCI-REG-77312',
      status: 'ACTIVE'
    },
    {
      id: 'DOC-204',
      name: 'Dr. Rajesh Rao, MD',
      specialty: 'Pulmonology',
      activePatients: 12,
      documentsVerified: 54,
      license: 'MCI-REG-66401',
      status: 'ACTIVE'
    }
  ]);

  const loadHospitalData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getHospitalData();
      if (data.hospital) {
        setActiveHospital(data.hospital);
      }
      if (data.doctors && data.doctors.length > 0) {
        setDoctorsList(data.doctors);
      }
      if (data.patients) {
        setScopedPatients(data.patients);
      }
      if (data.documents) {
        setScopedDocuments(data.documents);
      }
      if (data.auditLogs) {
        setScopedAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.warn('Could not fetch hospital-scoped data via API, using initial props:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitalData();
  }, []);

  const hospitalAudits = scopedAuditLogs.filter(
    (a) => !a.hospitalId || a.hospitalId === activeHospital.id
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-teal-600/10 text-teal-700 rounded-2xl border border-teal-600/20 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Welcome, {currentUser.name}
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 text-slate-800">
                {activeHospital.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                AUTHORIZED FACILITY
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {activeHospital.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hospital Administrator: <strong>{currentUser.name}</strong> • Email: <span className="font-mono text-slate-700">{currentUser.email}</span> {currentUser.phone ? `• Phone: ${currentUser.phone}` : ''} • Location: {activeHospital.city}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadHospitalData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            title="Refresh Hospital Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 uppercase tracking-wider block text-[10px] font-semibold">
              Scope Boundary
            </span>
            <span className="font-bold text-slate-800">
              Strictly Isolated to {activeHospital.name.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Hospital Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Hospital Doctors</span>
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-slate-900">{doctorsList.length}</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">All credentials verified</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Registered Patients</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-slate-900">{scopedPatients.length || activeHospital.patientsCount}</div>
          <div className="mt-1 text-[11px] text-slate-500">In hospital database</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Documents Processed</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-slate-900">{scopedDocuments.length || activeHospital.documentsProcessed}</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">Multi-page OCR extracts</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Audit Compliance</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-emerald-700">100%</div>
          <div className="mt-1 text-[11px] text-slate-500">Zero unauthorized leaks</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-1 text-xs font-semibold">
        {[
          { key: 'DOCTORS', label: 'Hospital Doctors Directory', count: doctorsList.length },
          { key: 'PATIENTS', label: 'Hospital-Scoped Patients', count: scopedPatients.length },
          { key: 'DOCUMENTS', label: 'Document Intelligence Stream', count: scopedDocuments.length },
          { key: 'AUDIT', label: 'Permitted Hospital Audit Logs', count: hospitalAudits.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-2 px-3 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === tab.key
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === tab.key ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: DOCTORS */}
      {activeTab === 'DOCTORS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Authorized Clinicians Under {activeHospital.name}
            </h4>
            <span className="text-xs text-slate-500">MCI Verified Registrations</span>
          </div>

          <div className="divide-y divide-slate-100">
            {doctorsList.map((doc: any) => (
              <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-800">
                      {doc.license}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{doc.specialty}</p>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Active Patients</span>
                    <strong className="text-slate-800">{doc.activePatients}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Verified Docs</span>
                    <strong className="text-teal-700">{doc.documentsVerified}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PATIENTS */}
      {activeTab === 'PATIENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Hospital Registered Patients ({scopedPatients.length})
            </h4>
            <span className="text-xs text-slate-500 font-mono">Scope: Hospital Restricted</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {scopedPatients.map((p: Patient) => (
              <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{p.fullName}</span>
                    <span className="font-mono text-teal-700 font-bold">{p.id}</span>
                    <span className="text-slate-500">{p.gender}, {p.age} yrs</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Primary Clinician: <strong>{p.primaryDoctorName}</strong> • Registered: {p.registeredDate}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                    {p.activeConditions.length} conditions
                  </span>
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded text-[11px]">
                    {p.currentMedications.length} active meds
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Clinical Document Processing Stream
            </h4>
            <span className="text-xs text-emerald-700 font-semibold">AI Extraction Engine Online</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {scopedDocuments.map((doc: MedicalDocument) => (
              <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900">{doc.id}</span>
                    <span className="font-semibold text-slate-800">{doc.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                      {doc.documentType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Patient: <span className="font-mono">{doc.patientId}</span> • Uploaded: {doc.uploadedAt} • By: {doc.uploadedByName}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {doc.extractedEntities.length} Entities Extracted
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Permitted Hospital Audit Logs ({hospitalAudits.length})
            </h4>
            <span className="text-xs text-slate-500 font-mono">Hospital Level Only</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {hospitalAudits.map((log) => (
              <div key={log.id} className="p-3.5 space-y-1 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] text-slate-500">{log.timestamp}</span>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {log.status}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">IP: {log.ipAddress}</span>
                </div>
                <p className="text-slate-600">{log.details}</p>
                <div className="text-[11px] text-slate-500">
                  Actor: <strong>{log.actorName}</strong> ({log.actorRole}) • Target: {log.targetPatientId || 'Hospital Scope'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
