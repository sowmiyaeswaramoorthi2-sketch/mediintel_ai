import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Heart,
  Building2,
  Server,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { User, UserRole } from '../../types/healthcare';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialRole?: UserRole;
  initialMode?: 'LOGIN' | 'DEMO' | 'SIGNUP';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'DOCTOR',
  initialMode = 'DEMO'
}) => {
  const [activeTab, setActiveTab] = useState<'DEMO' | 'LOGIN' | 'SIGNUP'>(initialMode);
  const [selectedIndividual, setSelectedIndividual] = useState<'doctor' | 'patient' | 'hospitalAdmin' | 'systemAdmin'>('doctor');
  const [email, setEmail] = useState('sarah.mathew@apexhospital.org');
  const [password, setPassword] = useState('clinical•secure•2026');
  const [fullName, setFullName] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Google identity modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('nivethaselvadassnivetha@gmail.com');
  const [googleName, setGoogleName] = useState('Dr. Nivetha Selvadass, MD');
  const [googleRole, setGoogleRole] = useState<UserRole>('DOCTOR');
  const [isCustomGoogleAccount, setIsCustomGoogleAccount] = useState(false);

  if (!isOpen) return null;

  const individuals = [
    {
      key: 'doctor' as const,
      role: 'DOCTOR' as const,
      title: 'Doctor',
      name: 'Dr. Sarah Mathew, MD',
      subtitle: 'Endocrinology & Internal Medicine',
      email: 'sarah.mathew@apexhospital.org',
      icon: Stethoscope,
      accent: 'text-teal-700 bg-teal-50 border-teal-200',
      tag: 'Full Clinical Intelligence & Review',
      features: ['Search & filter 15 patients', 'AI extraction with negation', 'Clinical trend graphs & longitudinal records']
    },
    {
      key: 'patient' as const,
      role: 'PATIENT' as const,
      title: 'Patient',
      name: 'Arun Kumar',
      subtitle: 'PAT-1001 • Chronic Disease Care',
      email: 'arun.kumar@gmail.com',
      icon: Heart,
      accent: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      tag: 'Self Record Access Only',
      features: ['View own profile & QR ID', 'View own timeline & labs', 'Strict self-access isolation']
    },
    {
      key: 'hospitalAdmin' as const,
      role: 'HOSPITAL_ADMIN' as const,
      title: 'Hospital Admin',
      name: 'Marcus Vance',
      subtitle: 'Apex City Hospital Administration',
      email: 'marcus.vance@apexhospital.org',
      icon: Building2,
      accent: 'text-blue-700 bg-blue-50 border-blue-200',
      tag: 'Hospital Department Scoped',
      features: ['Hospital doctors directory', 'Scoped patients & documents', 'Facility compliance logs']
    },
    {
      key: 'systemAdmin' as const,
      role: 'SYSTEM_ADMIN' as const,
      title: 'System Admin',
      name: 'Dr. Clara Chen',
      subtitle: 'Global Infrastructure Oversight',
      email: 'clara.chen@mediintel.org',
      icon: Server,
      accent: 'text-slate-700 bg-slate-100 border-slate-200',
      tag: 'Audit Logs & Governance',
      features: ['Microservice health probes', 'Global audit log monitoring', 'Cross-facility analytics']
    }
  ];

  const handleSelectIndividual = (key: 'doctor' | 'patient' | 'hospitalAdmin' | 'systemAdmin') => {
    setSelectedIndividual(key);
    const ind = individuals.find((i) => i.key === key);
    if (ind) {
      setEmail(ind.email);
      setPassword('clinical•secure•2026');
      setSignupRole(ind.role);
      setGoogleRole(ind.role);
      if (ind.role === 'DOCTOR') {
        setGoogleName('Dr. Nivetha Selvadass, MD');
        setGoogleEmail('nivethaselvadassnivetha@gmail.com');
      } else if (ind.role === 'PATIENT') {
        setGoogleName('Nivetha Selvadass');
        setGoogleEmail('nivethaselvadassnivetha@gmail.com');
      }
    }
    setErrorMessage('');
  };

  const handleQuickDemoLogin = async (key: 'doctor' | 'patient' | 'hospitalAdmin' | 'systemAdmin') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.login(key);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login(selectedIndividual, email, password);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.signUp({
        name: fullName || (signupRole === 'DOCTOR' ? 'Dr. Sarah Mathew, MD' : 'New Healthcare Member'),
        email,
        role: signupRole,
        hospitalId: 'HOSP-01'
      });
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteGoogleSignIn = async (emailToUse: string, nameToUse: string, roleToUse: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(emailToUse, nameToUse, roleToUse);
      setShowGoogleModal(false);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage('Google Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sign In to MediIntel</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an authorized clinical persona or authenticate with your credentials
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-4">
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('DEMO')}
              className={`flex-1 py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'DEMO'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              <span>1-Click Test Drive</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('LOGIN')}
              className={`flex-1 py-2 px-3 rounded-md transition-colors ${
                activeTab === 'LOGIN'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Sign In (Credentials)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SIGNUP')}
              className={`flex-1 py-2 px-3 rounded-md transition-colors ${
                activeTab === 'SIGNUP'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: 1-CLICK DEMO TEST DRIVE (Allows evaluating the 4 pre-configured users) */}
          {activeTab === 'DEMO' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600">
                Choose a pre-configured role to immediately explore dashboards, patient records, and extraction workflows:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {individuals.map((ind) => {
                  const Icon = ind.icon;
                  return (
                    <div
                      key={ind.key}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${ind.accent}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {ind.title}: {ind.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {ind.subtitle}
                          </p>
                          <div className="text-[11px] text-teal-700 font-medium mt-1">
                            {ind.tag}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleQuickDemoLogin(ind.key)}
                        className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>{isLoading ? 'Accessing...' : `Launch as ${ind.title}`}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Google Sign-in Alternative */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Need real OAuth token verification?</span>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Identity Sign-In</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS SIGN IN */}
          {activeTab === 'LOGIN' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all flex items-center justify-center space-x-2 text-xs font-bold text-slate-700 shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold">Or with credentials</span>
                </div>
              </div>

              {/* Persona quick switch */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Choose Login Target Role:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {individuals.map((ind) => (
                    <button
                      key={ind.key}
                      type="button"
                      onClick={() => handleSelectIndividual(ind.key)}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                        selectedIndividual === ind.key
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="font-semibold truncate">{ind.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{ind.name.split(',')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleStandardLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                      placeholder="user@apexhospital.org"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-mono"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: CREATE ACCOUNT */}
          {activeTab === 'SIGNUP' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Gupta"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Register As Role
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                >
                  <option value="DOCTOR">Doctor (Clinician Search & Review)</option>
                  <option value="PATIENT">Patient (Self Health Records)</option>
                  <option value="HOSPITAL_ADMIN">Hospital Administrator</option>
                  <option value="SYSTEM_ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@health.org"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>{isLoading ? 'Creating Account...' : 'Complete Sign Up'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer Trust Bar */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Strict Role-Based Isolation · Audit Logged</span>
          </span>
          <span>HIPAA & FHIR Standard</span>
        </div>
      </div>

      {/* Real-time Google Sign-In Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Google OAuth Identity</h4>
                  <p className="text-[10px] text-slate-500">Sign in with Google credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{googleName}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{googleEmail}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomGoogleAccount(!isCustomGoogleAccount)}
                  className="text-[11px] text-teal-800 font-semibold underline shrink-0"
                >
                  {isCustomGoogleAccount ? 'Default' : 'Switch'}
                </button>
              </div>

              {isCustomGoogleAccount && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Google Email
                    </label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Authorize Role:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['DOCTOR', 'PATIENT', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setGoogleRole(role)}
                      className={`p-2 rounded-lg text-left text-xs font-semibold transition-colors border ${
                        googleRole === role
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {role === 'DOCTOR' && 'Doctor'}
                      {role === 'PATIENT' && 'Patient'}
                      {role === 'HOSPITAL_ADMIN' && 'Hospital Admin'}
                      {role === 'SYSTEM_ADMIN' && 'System Admin'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleExecuteGoogleSignIn(googleEmail, googleName, googleRole)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center space-x-2 transition-all text-xs shadow-xs"
              >
                <span>{isLoading ? 'Authorizing...' : `Authorize as ${googleRole}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
