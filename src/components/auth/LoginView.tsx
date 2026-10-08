import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Stethoscope,
  Building2,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  KeyRound
} from 'lucide-react';
import { User, UserRole } from '../../types/healthcare';
import { api, RegisterPayload } from '../../services/api';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Common Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Common Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN'>('PATIENT');

  // Role-specific fields
  const [doctorSpecialty, setDoctorSpecialty] = useState('Endocrinology & Internal Medicine');
  const [doctorLicense, setDoctorLicense] = useState('');
  const [hospitalName, setHospitalName] = useState('Apex City Multi-Specialty Hospital');
  const [hospitalCity, setHospitalCity] = useState('Bengaluru, KA');
  const [patientAge, setPatientAge] = useState<number>(36);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientBloodGroup, setPatientBloodGroup] = useState('B+');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // -------------------------------------------------------------
  // Handle Common Login Flow
  // Email + Password only. The backend authenticates and identifies
  // the permanently stored role and unique User ID.
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.login(loginEmail.trim(), loginPassword.trim());
      if (res && res.user) {
        onLoginSuccess(res.user);
      } else {
        throw new Error('No user data returned from authentication.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Handle Common Registration Flow
  // Creates a unique User ID, stores permanent role and profile ID
  // -------------------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!registerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!registerEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!registerPhone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!registerPassword) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (registerPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirm password.');
      return;
    }

    // Prepare role-specific payload
    const payload: RegisterPayload = {
      fullName: registerName.trim(),
      email: registerEmail.trim(),
      phone: registerPhone.trim(),
      password: registerPassword,
      role: selectedRole
    };

    if (selectedRole === 'DOCTOR') {
      payload.specialty = doctorSpecialty;
      payload.licenseNumber = doctorLicense.trim() || undefined;
    } else if (selectedRole === 'HOSPITAL_ADMIN') {
      payload.hospitalName = hospitalName.trim();
      payload.city = hospitalCity.trim();
    } else if (selectedRole === 'PATIENT') {
      payload.age = Number(patientAge) || 35;
      payload.gender = patientGender;
      payload.bloodGroup = patientBloodGroup;
    }

    try {
      setIsLoading(true);
      const res = await api.register(payload);
      if (res && res.user) {
        setSuccessMessage('Account registered successfully! Loading your dashboard...');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 500);
      } else {
        throw new Error('Registration completed but unable to establish session.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill demo credentials for testing
  const fillCredentials = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setActiveTab('LOGIN');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-teal-50/20 to-slate-100 flex flex-col justify-between text-slate-800 antialiased font-sans">
      {/* Top Clinical Header Bar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-teal-700 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/10">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                MediIntel
                <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Healthcare Record & Document Intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>HIPAA & HL7 FHIR Compliant</span>
            </div>
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title="View pre-configured authorized accounts"
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden md:inline">Test Credentials</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl mx-auto">
          {/* Main Auth Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Brand Intro Banner */}
            <div className="px-6 sm:px-8 pt-8 pb-6 text-center border-b border-slate-100 bg-linear-to-b from-slate-50/60 to-white">
              <div className="w-14 h-14 rounded-2xl bg-teal-600/10 border border-teal-500/20 text-teal-700 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <Activity className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                MediIntel
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Intelligent Healthcare Medical Record Platform with clinical document OCR, automated negation detection, and longitudinal timelines.
              </p>

              {/* Clean Switcher Tabs: Login & Register */}
              <div className="mt-6 flex p-1 bg-slate-100 rounded-xl max-w-xs mx-auto border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('LOGIN');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'LOGIN'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('REGISTER');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'REGISTER'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* TAB 1: LOGIN FLOW */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. dhananjayan@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[11px] text-teal-700 font-medium">Encrypted & Secure</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    New user?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('REGISTER');
                        setErrorMessage('');
                      }}
                      className="text-teal-700 font-bold hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FLOW */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. Dhananjayan or Dr. Dhananjayan"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="e.g. dhananjayan@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="e.g. +91 98450 11223"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Role Selection (RULE: Patient, Doctor, Hospital Admin ONLY - System Admin is strictly prohibited from public signup) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Your Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Patient option */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('PATIENT')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        selectedRole === 'PATIENT'
                          ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-500/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-5 h-5 mb-1 ${selectedRole === 'PATIENT' ? 'text-teal-600' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold">Patient</span>
                    </button>

                    {/* Doctor option */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('DOCTOR')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        selectedRole === 'DOCTOR'
                          ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-500/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Stethoscope className={`w-5 h-5 mb-1 ${selectedRole === 'DOCTOR' ? 'text-teal-600' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold">Doctor</span>
                    </button>

                    {/* Hospital Admin option */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('HOSPITAL_ADMIN')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        selectedRole === 'HOSPITAL_ADMIN'
                          ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-500/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className={`w-5 h-5 mb-1 ${selectedRole === 'HOSPITAL_ADMIN' ? 'text-teal-600' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold">Hospital Admin</span>
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 italic">
                    Note: System Admin accounts are restricted and must be provisioned by an authorized platform administrator.
                  </p>
                </div>

                {/* Conditional Fields based on Selected Role */}
                {selectedRole === 'DOCTOR' && (
                  <div className="p-3.5 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase tracking-wider mb-1">
                        Doctor Specialization <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={doctorSpecialty}
                        onChange={(e) => setDoctorSpecialty(e.target.value)}
                        placeholder="e.g. Endocrinology & Internal Medicine"
                        className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-teal-900 uppercase tracking-wider mb-1">
                        Medical License / MCI Registration (Optional)
                      </label>
                      <input
                        type="text"
                        value={doctorLicense}
                        onChange={(e) => setDoctorLicense(e.target.value)}
                        placeholder="e.g. MCI-REG-84920"
                        className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                {selectedRole === 'HOSPITAL_ADMIN' && (
                  <div className="p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-xl space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                        Hospital / Health System Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        placeholder="e.g. Apex City Multi-Specialty Hospital"
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                        City / Location
                      </label>
                      <input
                        type="text"
                        value={hospitalCity}
                        onChange={(e) => setHospitalCity(e.target.value)}
                        placeholder="e.g. Bengaluru, KA"
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {selectedRole === 'PATIENT' && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Gender
                      </label>
                      <select
                        value={patientGender}
                        onChange={(e: any) => setPatientGender(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Blood Group
                      </label>
                      <input
                        type="text"
                        value={patientBloodGroup}
                        onChange={(e) => setPatientBloodGroup(e.target.value)}
                        placeholder="B+"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Register Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account & Register</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('LOGIN');
                        setErrorMessage('');
                      }}
                      className="text-teal-700 font-bold hover:underline"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Test Credentials Helper Popover / Drawer */}
            {showDemoAccounts && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                    Pre-Configured Accounts for Testing
                  </span>
                  <button
                    onClick={() => setShowDemoAccounts(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin@mediintel.org', 'Admin@2026!')}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-400 text-left transition-colors"
                  >
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>System Admin</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">Controlled</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">admin@mediintel.org</div>
                    <div className="text-[10px] text-slate-400">Pass: Admin@2026!</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentials('dhananjayan@gmail.com', 'Doctor@2026!')}
                    className="p-2.5 rounded-lg border border-teal-200 bg-white hover:border-teal-400 text-left transition-colors"
                  >
                    <div className="font-bold text-teal-900 flex items-center justify-between">
                      <span>Doctor (Clinician)</span>
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-mono">DOC-201</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">dhananjayan@gmail.com</div>
                    <div className="text-[10px] text-slate-400">Pass: Doctor@2026!</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentials('arun.kumar@gmail.com', 'Patient@2026!')}
                    className="p-2.5 rounded-lg border border-cyan-200 bg-white hover:border-cyan-400 text-left transition-colors"
                  >
                    <div className="font-bold text-cyan-900 flex items-center justify-between">
                      <span>Patient</span>
                      <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded font-mono">PAT-1001</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">arun.kumar@gmail.com</div>
                    <div className="text-[10px] text-slate-400">Pass: Patient@2026!</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentials('marcus.vance@apexhospital.org', 'Hospital@2026!')}
                    className="p-2.5 rounded-lg border border-blue-200 bg-white hover:border-blue-400 text-left transition-colors"
                  >
                    <div className="font-bold text-blue-900 flex items-center justify-between">
                      <span>Hospital Admin</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">HOSP-01</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">marcus.vance@apexhospital.org</div>
                    <div className="text-[10px] text-slate-400">Pass: Hospital@2026!</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="py-4 px-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white/60">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediIntel Longitudinal Clinical Health System</span>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>256-bit Encryption</span>
            <span>•</span>
            <span>Zero-Knowledge Verification</span>
            <span>•</span>
            <span>Role-Based Access Control</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
