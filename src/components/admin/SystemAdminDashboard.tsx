import React, { useState, useEffect } from 'react';
import {
  User,
  Hospital,
  Patient,
  MedicalDocument,
  AuditLog,
  SystemAdminStatsData,
  RegisteredPatientCategoryItem,
  RegisteredDoctorCategoryItem,
  RegisteredHospitalCategoryItem
} from '../../types/healthcare';
import {
  Server,
  Building,
  Users,
  FileText,
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Heart,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';

interface SystemAdminDashboardProps {
  currentUser: User;
  hospitals: Hospital[];
  patients: Patient[];
  documents: MedicalDocument[];
  auditLogs: AuditLog[];
}

export const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({
  currentUser,
  hospitals: initialHospitals,
  patients: initialPatients,
  documents,
  auditLogs
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PATIENTS_CAT' | 'DOCTORS_CAT' | 'HOSPITALS_CAT' | 'AUDIT_LOGS'>('OVERVIEW');
  const [statsData, setStatsData] = useState<SystemAdminStatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditFilter, setAuditFilter] = useState('');

  // Fetch real-time system stats and categories from backend API
  const fetchLiveStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await api.getSystemStats();
      setStatsData(data);
    } catch (err) {
      console.warn('Could not fetch live system stats via API, using fallback calculations:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const totalPatientsCount = statsData?.totalPatients ?? initialPatients.length;
  const totalDoctorsCount = statsData?.totalDoctors ?? 4;
  const totalHospitalsCount = statsData?.totalHospitals ?? initialHospitals.length;
  const totalUsersCount = statsData?.totalRegisteredUsers ?? (totalPatientsCount + totalDoctorsCount + totalHospitalsCount + 1);

  const patientsCategoryList = statsData?.categories?.patients || initialPatients.map((p) => ({
    id: p.id,
    patientId: p.id,
    userId: `USR-${p.id}`,
    name: p.fullName,
    email: p.email,
    phone: p.phone,
    registeredDate: p.registeredDate,
    age: p.age,
    gender: p.gender,
    activeConditionsCount: p.activeConditions.length
  }));

  const doctorsCategoryList = statsData?.categories?.doctors || [
    {
      id: 'DOC-201',
      doctorId: 'DOC-201',
      userId: 'USR-DOC-101',
      name: 'Dr. Dhananjayan, MD',
      email: 'dhananjayan@gmail.com',
      phone: '+91 98450 11223',
      specialty: 'Endocrinology & Internal Medicine',
      hospital: 'Apex City Multi-Specialty Hospital',
      license: 'MCI-REG-84920',
      registeredDate: '2024-02-10'
    },
    {
      id: 'DOC-202',
      doctorId: 'DOC-202',
      userId: 'USR-DOC-102',
      name: 'Dr. Anand Raman, DM',
      email: 'anand.raman@apexhospital.org',
      phone: '+91 98450 44332',
      specialty: 'Cardiology',
      hospital: 'Apex City Multi-Specialty Hospital',
      license: 'MCI-REG-91204',
      registeredDate: '2024-02-15'
    }
  ];

  const hospitalsCategoryList = statsData?.categories?.hospitals || initialHospitals.map((h) => ({
    id: h.id,
    hospitalId: h.id,
    name: h.name,
    city: h.city,
    adminName: 'Marcus Vance',
    email: 'marcus.vance@apexhospital.org',
    phone: '+91 98801 77210',
    doctorsCount: h.doctorsCount,
    patientsCount: h.patientsCount
  }));

  // Filtering category lists
  const filteredPatients = patientsCategoryList.filter((p) =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDoctors = doctorsCategoryList.filter((d) =>
    !searchQuery ||
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.doctorId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHospitals = hospitalsCategoryList.filter((h) =>
    !searchQuery ||
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.adminName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAudits = auditLogs.filter(
    (log) =>
      !auditFilter ||
      log.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
      log.actorName.toLowerCase().includes(auditFilter.toLowerCase()) ||
      log.details.toLowerCase().includes(auditFilter.toLowerCase()) ||
      (log.targetPatientId && log.targetPatientId.toLowerCase().includes(auditFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* System Admin Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-slate-900 text-teal-400 rounded-2xl border border-slate-700 shrink-0">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Authorized Administrator
              </span>
              <span className="px-2.5 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-900 text-teal-300">
                SYSTEM_ADMIN
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                CONTROLLED ACCESS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              MediIntel Overall Platform Administration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin: <strong>{currentUser.name}</strong> ({currentUser.email}) • User ID: <span className="font-mono text-slate-700">{currentUser.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={fetchLiveStats}
            disabled={isLoadingStats}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </button>
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-semibold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
            Platform Services Active
          </div>
        </div>
      </div>

      {/* Dynamic System Information Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-slate-900">{totalPatientsCount}</span>
            <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
              Live Category
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Registered longitudinal patient records</p>
        </div>

        {/* Total Doctors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Doctors</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-slate-900">{totalDoctorsCount}</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              Verified Clinicians
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Active licensed medical practitioners</p>
        </div>

        {/* Total Hospitals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Hospitals</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-slate-900">{totalHospitalsCount}</span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Federated Centers
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Connected healthcare facilities</p>
        </div>

        {/* Total Registered Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered Users</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-slate-900">{totalUsersCount}</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              All Roles
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Unique registered accounts in platform</p>
        </div>
      </div>

      {/* Tabs Switcher for Categories and Audits */}
      <div className="flex space-x-2 border-b border-slate-200 pb-1 text-xs font-semibold overflow-x-auto">
        {[
          { key: 'OVERVIEW', label: 'System Overview & Health' },
          { key: 'PATIENTS_CAT', label: 'Patient Category', count: totalPatientsCount },
          { key: 'DOCTORS_CAT', label: 'Doctor Category', count: totalDoctorsCount },
          { key: 'HOSPITALS_CAT', label: 'Hospital Category', count: totalHospitalsCount },
          { key: 'AUDIT_LOGS', label: 'Global Audit Trail', count: auditLogs.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              setSearchQuery('');
            }}
            className={`py-2.5 px-4 rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === tab.key ? 'bg-slate-700 text-teal-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: SYSTEM OVERVIEW & ARCHITECTURE */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Platform Microservices & Infrastructure</span>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">All Healthy</span>
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Core Healthcare Data Integration Gateway', status: 'OPERATIONAL', latency: '24ms', uptime: '99.98%' },
                { name: 'BioClinical Gemini Negation Detection Engine', status: 'OPERATIONAL', latency: '1.1s', uptime: '99.95%' },
                { name: 'Cryptographic Audit Trail (Immutable Log)', status: 'OPERATIONAL', latency: '12ms', uptime: '100%' },
                { name: 'RBAC Policy & Consent Decision Gateway', status: 'OPERATIONAL', latency: '8ms', uptime: '99.99%' },
              ].map((svc) => (
                <div key={svc.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{svc.name}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Latency: <span className="font-mono text-teal-700">{svc.latency}</span> • SLA Uptime: <span className="font-bold text-slate-700">{svc.uptime}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              System Admin Controls
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              System Admin accounts cannot be created publicly and have full oversight over all federations, clinicians, patients, and security audit logs.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Zero-Trust Isolation
              </div>
              <p className="text-[11px] text-slate-500">
                Patients are cryptographically restricted from cross-accessing records. Any unauthorized query logs an immutable violation.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={fetchLiveStats}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Calculate System Metrics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PATIENT CATEGORY */}
      {activeTab === 'PATIENTS_CAT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Category Directory</h3>
              <p className="text-xs text-slate-500">Total registered patients: {totalPatientsCount}</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, email, ID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Unique User ID</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Conditions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No patients found matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-800">
                        {p.patientId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {p.userId}
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-slate-700 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{p.email}</span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.age ? `${p.age} yrs • ` : ''}{p.gender || 'Not specified'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {p.registeredDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                          {p.activeConditionsCount ?? 1} active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR CATEGORY */}
      {activeTab === 'DOCTORS_CAT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Doctor Category Directory</h3>
              <p className="text-xs text-slate-500">Total registered doctors: {totalDoctorsCount}</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clinician name, specialty, hospital..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Doctor Name</th>
                  <th className="py-3 px-4">Doctor ID</th>
                  <th className="py-3 px-4">Unique User ID</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Hospital Facility</th>
                  <th className="py-3 px-4">License / MCI</th>
                  <th className="py-3 px-4 text-right">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No doctors found matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {d.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                        {d.doctorId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {d.userId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {d.specialty}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {d.hospital}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {d.license}
                      </td>
                      <td className="py-3.5 px-4 text-right space-y-0.5">
                        <div className="text-slate-700 font-mono text-[11px]">{d.email}</div>
                        <div className="text-slate-500 font-mono text-[10px]">{d.phone}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HOSPITAL CATEGORY */}
      {activeTab === 'HOSPITALS_CAT' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredHospitals.map((hosp) => (
              <div key={hosp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                      {hosp.hospitalId}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{hosp.name}</h4>
                    <p className="text-xs text-slate-500">{hosp.city}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="text-slate-700 font-medium">
                    Admin: <strong>{hosp.adminName}</strong>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">{hosp.email}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{hosp.phone}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-teal-50/50 rounded-xl border border-teal-200 text-xs text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Registered Doctors</span>
                    <strong className="text-slate-900 text-sm">{hosp.doctorsCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">Registered Patients</span>
                    <strong className="text-teal-800 text-sm">{hosp.patientsCount}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Global Immutable Audit Trail</h3>
              <p className="text-xs text-slate-500">Every read, export, and write access is cryptographically recorded</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                placeholder="Filter audit actions, actors, targets..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredAudits.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start justify-between text-xs gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-700">{log.id}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'DENIED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">{log.details}</p>
                  <div className="text-[11px] text-slate-500">
                    Actor: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole}) • IP: <span className="font-mono">{log.ipAddress}</span>
                  </div>
                </div>
                {log.targetPatientId && (
                  <span className="px-2 py-1 rounded bg-slate-100 font-mono text-[10px] text-slate-700 font-semibold shrink-0">
                    {log.targetPatientId}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
