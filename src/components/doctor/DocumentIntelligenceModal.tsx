import React, { useState } from 'react';
import {
  X,
  FileText,
  BrainCircuit,
  FileUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Check,
  Edit3,
  ZoomIn,
  ZoomOut,
  Camera,
  FileCheck,
  Pill,
  Activity,
  FileSpreadsheet,
  HeartPulse,
  Stethoscope,
  Tag,
  User,
  Building2,
  Calendar,
  RotateCcw
} from 'lucide-react';
import {
  ExtractedEntity,
  ExtractedDocumentStructuredData,
  MedicalDocument,
  NegationStatus,
  Patient,
  VerificationStatus
} from '../../types/healthcare';
import { api } from '../../services/api';
import { CameraCaptureModal } from '../common/CameraCaptureModal';

interface DocumentIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSaveExtractedToPatient: (
    docTitle: string,
    docType: MedicalDocument['documentType'],
    ocrText: string,
    entities: ExtractedEntity[]
  ) => void;
}

// 4 distinct clinical test benchmark fixtures for testing
export interface TestDocumentFixture {
  id: string;
  title: string;
  type: MedicalDocument['documentType'];
  format: 'PDF' | 'IMAGE';
  fileSize: string;
  badge: string;
  description: string;
  documentContent: string;
}

export const TEST_DOCUMENT_FIXTURES: TestDocumentFixture[] = [
  {
    id: 'test-discharge-pdf',
    title: 'Discharge Summary & Endocrinology Note - Apollo Specialty',
    type: 'Discharge Summary',
    format: 'PDF',
    fileSize: '1.4 MB',
    badge: 'Medical Report PDF',
    description: 'Quarterly endocrine review with explicit cardiovascular negation assertions.',
    documentContent: `APOLLO SPECIALTY HOSPITALS - CLINICAL DISCHARGE & CONSULTATION NOTE
PATIENT NAME: Arun Kumar | AGE/SEX: 48 / Male | PATIENT ID: PAT-1001
DATE OF EVALUATION: March 12, 2026 | CONSULTANT: Dr. Sarah Mathew, MD (Endocrinology)
HOSPITAL: Apollo Specialty Hospitals Bengaluru

CHIEF COMPLAINTS & HISTORY OF PRESENT ILLNESS:
Patient presents for scheduled quarterly metabolic follow-up and glycemic optimization. Patient confirms strict compliance with Metformin 500 mg BD orally after meals. Reports feeling active and denies dizziness or hypoglycemic episodes.

SYSTEMIC CLINICAL REVIEW:
- Cardiovascular: The patient explicitly denies chest pain, angina, or palpitations upon ordinary exertion.
- Respiratory: Reports mild exertional dyspnea during steep hill climbs; denied nocturnal paroxysmal dyspnea.
- Habits: Non-smoker. The patient denies tobacco, smoking, or alcohol consumption.

PHYSICAL EXAMINATION & VITALS:
- Blood Pressure: 120/80 mmHg (Sitting, Right Arm) | Heart Rate: 74 bpm
- SpO2: 98% room air | Temp: 98.4°F | BMI: 27.2 kg/m²

LABORATORY INVESTIGATIONS (March 12, 2026):
- Fasting Blood Sugar: 118 mg/dL (Ref: 70-99 mg/dL)
- Post-Prandial Blood Sugar: 142 mg/dL (Ref: < 140 mg/dL)
- Point-of-Care HbA1c: 6.8% (Ref: < 5.7%, target < 7.0%)
- Serum Creatinine: 0.94 mg/dL | eGFR: >90 mL/min

CLINICAL IMPRESSION & DIAGNOSES:
1. Type 2 Diabetes Mellitus - Well-controlled on oral hypoglycemic monotherapy.
2. Essential Hypertension - Stable on Telmisartan 40 mg.
3. Dyslipidemia - Controlled on low-dose Atorvastatin.

RECOMMENDED DISCHARGE MEDICATIONS:
- Tab. Metformin 500 mg - 1 tablet twice daily after meals (oral) x 90 days.
- Tab. Telmisartan 40 mg - 1 tablet once daily in morning x 90 days.
- Tab. Atorvastatin 10 mg - 1 tablet once daily at bedtime x 90 days.

ALLERGIES:
- No known drug allergies reported (NKDA).`
  },
  {
    id: 'test-prescription-doc',
    title: 'Outpatient Acute Care Rx - Metro Health Clinic',
    type: 'Prescription',
    format: 'PDF',
    fileSize: '680 KB',
    badge: 'Prescription Document',
    description: 'Outpatient acute prescription with antibiotic dosage and symptom negation.',
    documentContent: `METRO HEALTH FAMILY CLINIC & PHARMACY
14 Commercial Road, Koramangala, Bengaluru
Attending Physician: Dr. Sunita Rao, MBBS, MD (General Medicine) | Reg No: KMC-55912
Date of Consultation: September 15, 2026

PATIENT DETAILS:
Patient Name: Kavita Verma | Age: 34 Years | Gender: Female | OPD ID: KV-8841
Vitals: BP: 118/76 mmHg | Pulse: 78 bpm | Temp: 99.1°F | SpO2: 99%

SYMPTOMS & COMPLAINT:
Patient presents with severe dry cough and nasal congestion for 3 days. Subjective low-grade fever.
Clinical Assertion: Patient explicitly denies chest pain, denies shortness of breath, and denies nausea.

DIAGNOSIS:
1. Acute Bacterial Bronchitis
2. Allergic Rhinitis

PRESCRIPTION (Rx):
1. Tab. Azithromycin 500 mg - 1 tablet once daily before food x 3 days
2. Tab. Levocetirizine 5 mg - 1 tablet once daily at bedtime x 5 days
3. Tab. Paracetamol 650 mg - 1 tablet SOS (as needed) for fever/body ache (Max 3/day)
4. Cough Syrup Dextromethorphan 10 ml - thrice daily after food x 5 days

ALLERGIES & PRECAUTIONS:
- Patient denies any history of drug allergies.
- Advised warm water gargling and hydration. Review in 5 days if cough persists.`
  },
  {
    id: 'test-lab-scan',
    title: 'Comprehensive Diagnostic Panel - Quest Central Diagnostics',
    type: 'Lab Report',
    format: 'IMAGE',
    fileSize: '1.8 MB',
    badge: 'Image / Scan Report',
    description: 'Diagnostic laboratory blood test panel with flagged abnormal metabolic parameters.',
    documentContent: `QUEST CENTRAL DIAGNOSTIC LABORATORIES
Accreditation: CAP & NABL Certified | Report ID: LAB-2026-99120
Collection Date: August 20, 2026 08:15 AM | Report Date: August 20, 2026 02:30 PM
Ordering Clinician: Dr. Alan Grant, MD (Pathology Director) | Facility: Quest Central Diagnostics

PATIENT INFORMATION:
Patient Name: Robert Chen | Patient ID: QST-9921 | Age: 55 Years | Gender: Male
Specimen: Whole Blood & Serum (Fasting: 10 hours)

TEST RESULTS:
- Fasting Plasma Glucose: 145 mg/dL [HIGH] (Reference: 70 - 99 mg/dL)
- Hemoglobin A1c (HbA1c): 7.4 % [HIGH] (Reference: 4.0 - 5.6 %, Prediabetes: 5.7 - 6.4)
- Serum Creatinine: 1.12 mg/dL [NORMAL] (Reference: 0.70 - 1.30 mg/dL)
- Blood Urea Nitrogen (BUN): 18 mg/dL [NORMAL] (Reference: 7 - 20 mg/dL)
- Estimated GFR (eGFR): 78 mL/min/1.73m² [MILD DECREASE] (Reference: > 60 mL/min)
- Total Cholesterol: 218 mg/dL [HIGH] (Reference: < 200 mg/dL)
- Triglycerides: 195 mg/dL [HIGH] (Reference: < 150 mg/dL)
- HDL Cholesterol: 38 mg/dL [LOW] (Reference: > 40 mg/dL)
- LDL Cholesterol: 141 mg/dL [HIGH] (Reference: < 100 mg/dL)

CLINICAL IMPRESSION:
Laboratory evidence of diabetic dyslipidemia with uncontrolled fasting hyperglycemia. Normal renal clearance.
Panic / Critical Values: None identified.`
  },
  {
    id: 'test-handwritten-note',
    title: 'Handwritten Urgent Care Clinical Note - City Care Walk-in',
    type: 'Consultation Note',
    format: 'IMAGE',
    fileSize: '1.2 MB',
    badge: 'Handwritten Document',
    description: 'Handwritten urgent care clinical evaluation with uncertain dosage notation & drug allergy.',
    documentContent: `CITY CARE URGENT WALK-IN CLINIC
Handwritten Physician Evaluation Note
Date: 2/9/2026 | Provider: Dr. S. K. Patel, MD

Pt: Emily Watson, 29 yr female, ID: UC-1099
C/o: Severe sore throat x 2 days, difficulty swallowing [unclear notation: mild odynophagia], subjective fever.
Systemic: Denies cough, denies shortness of breath, denies nausea or vomiting.
O/E: Pharyngeal erythema +, tonsillar exudate mild left side. Tender anterior cervical lymph nodes.
Chest: Clear to auscultation.
Vitals: Temp 100.4 F, Pulse 84 bpm, BP 112/74 mmHg.

Dx: Acute exudative tonsillitis (Streptococcal infection suspected).

Rx (Handwritten):
1. Amoxicillin-Clavulanate 625mg - 1 tab twice daily x 7 days [handwritten, verified]
2. Ibuprofen 400mg - 1 tab tid prn pain/fever [unclear notation: 400 vs 600mg, low confidence]
3. Salt water gargle tid x 5 days.

ALLERGIES:
Patient confirms allergy to Sulfa drugs (causes maculopapular rash). Denies penicillin allergy.
Follow up in 48h if swallowing difficulty worsens.`
  }
];

export const DocumentIntelligenceModal: React.FC<DocumentIntelligenceModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSaveExtractedToPatient
}) => {
  const [step, setStep] = useState<'SELECT' | 'PROCESSING' | 'REVIEW'>('SELECT');
  const [selectedFixture, setSelectedFixture] = useState<TestDocumentFixture | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [uploadedFileData, setUploadedFileData] = useState<string | null>(null);
  const [uploadedFileFormat, setUploadedFileFormat] = useState<'PDF' | 'IMAGE'>('PDF');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  
  // OCR & Extracted state (starts empty - reset on every upload)
  const [rawOcrText, setRawOcrText] = useState('');
  const [detectedDocType, setDetectedDocType] = useState('');
  const [isHandwritten, setIsHandwritten] = useState(false);
  const [structuredData, setStructuredData] = useState<ExtractedDocumentStructuredData | null>(null);
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  
  // UI & Loading state
  const [previewTab, setPreviewTab] = useState<'VISUAL' | 'OCR' | 'STRUCTURED'>('STRUCTURED');
  const [zoomScale, setZoomScale] = useState(100);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingPhase, setProcessingPhase] = useState('');
  const [highlightedEvidence, setHighlightedEvidence] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Individual Entity Editing
  const [editingEntity, setEditingEntity] = useState<ExtractedEntity | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  if (!isOpen) return null;

  // Complete reset helper to prevent any data leakage
  const resetExtractionState = () => {
    setRawOcrText('');
    setDetectedDocType('');
    setIsHandwritten(false);
    setStructuredData(null);
    setEntities([]);
    setErrorMessage(null);
    setHighlightedEvidence(null);
  };

  const handleCameraCapture = (file: File, dataUrl: string) => {
    resetExtractionState();
    setSelectedFixture(null);
    setCustomFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedFileSize(`${sizeInMb} MB`);
    setUploadedFileFormat('IMAGE');
    setUploadedFileData(dataUrl);
  };

  const handleFileUpload = (file: File) => {
    resetExtractionState();
    setSelectedFixture(null);
    setCustomFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedFileSize(`${sizeInMb} MB`);
    const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
    const format = isPdf ? 'PDF' : 'IMAGE';
    setUploadedFileFormat(format);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedFileData(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectFixture = (fixture: TestDocumentFixture) => {
    resetExtractionState();
    setSelectedFixture(fixture);
    setCustomFileName(fixture.title);
    setUploadedFileData(null);
    setUploadedFileFormat(fixture.format);
    setUploadedFileSize(fixture.fileSize);
  };

  // Dynamic document OCR pipeline execution
  const handleStartProcessing = async () => {
    const isUsingUploadedFile = Boolean(uploadedFileData);
    const isUsingFixture = Boolean(selectedFixture);

    if (!isUsingUploadedFile && !isUsingFixture) {
      setErrorMessage('Please select a test document or upload a medical document file (PDF/Image) first.');
      return;
    }

    // 1. Reset previous OCR state completely
    resetExtractionState();
    setStep('PROCESSING');
    setErrorMessage(null);

    // Required 5 sequential loading phases
    setProcessingProgress(15);
    setProcessingPhase('Uploading...');

    const t1 = setTimeout(() => {
      setProcessingProgress(35);
      setProcessingPhase('Processing document...');
    }, 500);

    const t2 = setTimeout(() => {
      setProcessingProgress(60);
      setProcessingPhase('Extracting text...');
    }, 1100);

    const t3 = setTimeout(() => {
      setProcessingProgress(82);
      setProcessingPhase('Structuring patient data...');
    }, 1800);

    try {
      const payload: {
        patientId: string;
        docTitle?: string;
        docType?: string;
        fileData?: string;
        fileName?: string;
        fileFormat?: string;
        customText?: string;
      } = {
        patientId: patient.id,
        docTitle: customFileName || selectedFixture?.title || 'Medical Record',
        docType: selectedFixture?.type || 'Medical Report',
        fileFormat: uploadedFileFormat,
        fileName: customFileName || (selectedFixture ? `${selectedFixture.title}.${selectedFixture.format.toLowerCase()}` : 'document')
      };

      if (isUsingUploadedFile && uploadedFileData) {
        payload.fileData = uploadedFileData;
      } else if (selectedFixture) {
        payload.customText = selectedFixture.documentContent;
      }

      const res = await api.processDocument(payload);

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      setProcessingProgress(100);
      setProcessingPhase('Extraction completed');

      setTimeout(() => {
        setDetectedDocType(res.detectedDocType || res.docType || 'Medical Document');
        setIsHandwritten(Boolean(res.isHandwritten));
        setRawOcrText(res.ocrText || res.rawOcrText || '');
        setStructuredData(res.structuredData || null);
        setEntities(res.extractedEntities || []);
        setStep('REVIEW');
        setPreviewTab('STRUCTURED');
      }, 400);

    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      console.error('OCR pipeline error:', err);
      setErrorMessage(err.message || 'OCR document processing and extraction failed. Please ensure the document is clear and readable.');
      setStep('SELECT');
    }
  };

  const handleConfirmEntity = (id: string) => {
    setEntities((prev) =>
      prev.map((ent) => (ent.id === id ? { ...ent, verificationStatus: 'CONFIRMED' } : ent))
    );
  };

  const handleRejectEntity = (id: string) => {
    setEntities((prev) =>
      prev.map((ent) => (ent.id === id ? { ...ent, verificationStatus: 'REJECTED' } : ent))
    );
  };

  const handleConfirmAll = () => {
    setEntities((prev) =>
      prev.map((ent) => ({
        ...ent,
        verificationStatus: ent.verificationStatus === 'REJECTED' ? 'REJECTED' : 'CONFIRMED'
      }))
    );
  };

  const handleSaveEdit = () => {
    if (!editingEntity) return;
    setEntities((prev) =>
      prev.map((ent) => (ent.id === editingEntity.id ? { ...editingEntity, verificationStatus: 'EDITED' } : ent))
    );
    setEditingEntity(null);
  };

  const handleCommitToEHR = () => {
    const verifiedEntities = entities.filter(e => e.verificationStatus !== 'REJECTED');
    const finalTitle = customFileName || selectedFixture?.title || `${detectedDocType || 'Verified'} Document`;
    const finalDocType = (selectedFixture?.type || detectedDocType || 'Consultation Note') as MedicalDocument['documentType'];
    
    onSaveExtractedToPatient(
      finalTitle,
      finalDocType,
      rawOcrText,
      verifiedEntities
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Clinical OCR & Document Intelligence
                </h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800 uppercase tracking-wider">
                  DYNAMIC RUNTIME OCR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Patient: <strong className="text-slate-200">{patient.fullName} ({patient.id})</strong> • Upload PDF / JPG / PNG or select benchmark document
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: SELECT / UPLOAD */}
        {step === 'SELECT' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-xs animate-fadeIn">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold mb-0.5">Extraction Pipeline Error</div>
                  <div>{errorMessage}</div>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                >
                  ×
                </button>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
                Step 1: Upload Document or Test Benchmark Document
              </h4>
              <p className="text-xs text-slate-500">
                Each document is treated as the ONLY source of patient information. No demo or hardcoded patient data is used.
              </p>
            </div>

            {/* Upload & Camera Scanning Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-teal-50/20 hover:bg-teal-50/50 transition-all cursor-pointer group flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  id="doctor-file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <label htmlFor="doctor-file-input" className="cursor-pointer block w-full">
                  <div className="w-12 h-12 mx-auto rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    Drop PDF or Image here, or <span className="text-teal-600 underline">browse</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Supports Medical Reports, Prescriptions, Scans (PDF, JPG, PNG)
                  </div>
                </label>
              </div>

              {/* Camera Scanner */}
              <div
                id="doctor-scan-with-camera-card"
                onClick={() => setIsCameraOpen(true)}
                className="border-2 border-dashed border-cyan-300 hover:border-cyan-500 rounded-2xl p-6 text-center bg-cyan-50/20 hover:bg-cyan-50/50 transition-all cursor-pointer group flex flex-col items-center justify-center select-none"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  Scan with Camera / Take Photo
                </div>
                <div className="text-xs text-slate-500 mt-1 mb-2.5">
                  Direct live camera capture for physical prescriptions or notes
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="doctor-scan-with-camera-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCameraOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan with Camera</span>
                  </button>
                  <button
                    type="button"
                    id="doctor-take-photo-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCameraOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-100 hover:bg-cyan-200 text-cyan-800 text-xs font-semibold border border-cyan-200 transition-colors flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Take Photo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Selected File Details Banner */}
            {customFileName && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {uploadedFileFormat}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{customFileName}</div>
                    <div className="text-[11px] text-slate-500">
                      {uploadedFileSize} • Format: <strong className="text-teal-900">{uploadedFileFormat}</strong>
                      {selectedFixture && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                          {selectedFixture.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomFileName('');
                    setUploadedFileData(null);
                    setSelectedFixture(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-100 font-semibold"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* 4 Required Benchmark Test Documents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Benchmark Test Documents (4 Distinct Types)
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Test that different uploaded documents produce completely different, dynamic OCR results:
                  </p>
                </div>
                <span className="text-[11px] text-teal-700 font-medium">Ready for instant runtime OCR</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEST_DOCUMENT_FIXTURES.map((fixture) => (
                  <div
                    key={fixture.id}
                    onClick={() => handleSelectFixture(fixture)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedFixture?.id === fixture.id
                        ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                          {fixture.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{fixture.fileSize} • {fixture.format}</span>
                      </div>
                      <h6 className="text-sm font-bold text-slate-900 mb-1">{fixture.title}</h6>
                      <p className="text-xs text-slate-600">
                        {fixture.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] truncate max-w-[200px]">
                        Type: <strong className="text-slate-700">{fixture.type}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFixture(fixture);
                          setTimeout(() => {
                            handleStartProcessing();
                          }, 100);
                        }}
                        className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
                      >
                        Run Live OCR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={handleStartProcessing}
                disabled={!uploadedFileData && !selectedFixture}
                className={`inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl shadow-xs transition-colors ${
                  uploadedFileData || selectedFixture
                    ? 'bg-teal-700 hover:bg-teal-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Dynamic OCR & Data Extraction
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING STATES (Uploading -> Processing -> Extracting -> Structuring -> Completed) */}
        {step === 'PROCESSING' && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center space-y-6 my-auto">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-teal-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-teal-700">
                <BrainCircuit className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div className="text-center max-w-md space-y-2">
              <h4 className="text-base font-bold text-slate-900">
                Running Clinical OCR & Document Intelligence
              </h4>
              <p className="text-xs font-semibold text-teal-700 h-6">
                {processingPhase}
              </p>
            </div>

            <div className="w-full max-w-md bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="bg-teal-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${processingProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-left w-full max-w-md text-xs text-slate-600">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block">Single Source of Truth</span>
                Treated exclusively from current document content
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block">BioClinical Negation</span>
                Distinguishing negated vs affirmative assertions
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: INTERACTIVE REVIEW & VERIFICATION */}
        {step === 'REVIEW' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Top Verification Banner */}
            <div className="px-5 py-2.5 bg-sky-50 border-b border-sky-200 flex flex-wrap items-center justify-between text-xs text-sky-900 shrink-0 gap-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                <span>
                  <strong>Document-Aware Extraction:</strong> Generated strictly at runtime from current document.
                </span>
                {isHandwritten && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    ✍️ Handwritten Document OCR
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                  {detectedDocType || 'Medical Record'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleConfirmAll}
                  className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 font-semibold rounded text-[11px] border border-sky-300 transition-colors"
                >
                  Confirm All Pending ({entities.filter((e) => e.verificationStatus === 'PENDING').length})
                </button>
              </div>
            </div>

            {/* Extracted Patient Info Bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center">
                  <User className="w-3 h-3 mr-1" /> Patient Name
                </span>
                <span className="font-bold text-slate-900 truncate block">
                  {structuredData?.patientName || <span className="text-slate-400 italic font-normal">Not found</span>}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center">
                  <Tag className="w-3 h-3 mr-1" /> Patient ID
                </span>
                <span className="font-bold text-slate-900 font-mono truncate block">
                  {structuredData?.patientId || <span className="text-slate-400 italic font-normal">Not found</span>}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Age / Gender</span>
                <span className="font-bold text-slate-900 truncate block">
                  {structuredData?.age ? `${structuredData.age} yr` : 'Not found'} {structuredData?.gender ? `• ${structuredData.gender}` : ''}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> Document Date
                </span>
                <span className="font-bold text-slate-900 truncate block">
                  {structuredData?.date || <span className="text-slate-400 italic font-normal">Not found</span>}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center">
                  <Stethoscope className="w-3 h-3 mr-1" /> Physician / Doctor
                </span>
                <span className="font-bold text-slate-900 truncate block">
                  {structuredData?.doctorName || <span className="text-slate-400 italic font-normal">Not found</span>}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center">
                  <Building2 className="w-3 h-3 mr-1" /> Hospital / Clinic
                </span>
                <span className="font-bold text-slate-900 truncate block">
                  {structuredData?.hospitalOrClinic || <span className="text-slate-400 italic font-normal">Not found</span>}
                </span>
              </div>
            </div>

            {/* Main Dual-Pane Content */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left Pane: Structured Clinical Extraction & Raw OCR Text (5 cols) */}
              <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50 flex flex-col overflow-y-auto space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('STRUCTURED')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewTab === 'STRUCTURED'
                          ? 'bg-teal-700 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Structured Data
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('OCR')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewTab === 'OCR'
                          ? 'bg-teal-700 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      Raw OCR Transcript
                    </button>
                    {uploadedFileData && (
                      <button
                        type="button"
                        onClick={() => setPreviewTab('VISUAL')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          previewTab === 'VISUAL'
                            ? 'bg-teal-700 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        Visual Scan
                      </button>
                    )}
                  </div>

                  {previewTab === 'VISUAL' && uploadedFileData && (
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setZoomScale((z) => Math.max(z - 25, 50))}
                        className="p-1 bg-white hover:bg-slate-100 rounded border border-slate-200 text-slate-600"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono text-slate-500">{zoomScale}%</span>
                      <button
                        type="button"
                        onClick={() => setZoomScale((z) => Math.min(z + 25, 200))}
                        className="p-1 bg-white hover:bg-slate-100 rounded border border-slate-200 text-slate-600"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {highlightedEvidence && (
                  <div className="p-2.5 bg-amber-100 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start justify-between animate-fadeIn">
                    <div>
                      <span className="font-bold block text-[11px]">Highlighted Source Evidence:</span>
                      <span className="italic">"{highlightedEvidence}"</span>
                    </div>
                    <button
                      onClick={() => setHighlightedEvidence(null)}
                      className="text-amber-700 hover:text-amber-900 font-bold ml-2 text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* TAB 1: STRUCTURED CLINICAL DATA OVERVIEW */}
                {previewTab === 'STRUCTURED' && (
                  <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px] pr-1">
                    {/* Diagnoses Section */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center mb-2">
                        <Activity className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                        Diagnoses & Clinical Findings
                      </h6>
                      {structuredData?.diagnoses && structuredData.diagnoses.length > 0 ? (
                        <div className="space-y-1.5">
                          {structuredData.diagnoses.map((diag, i) => (
                            <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-50 border border-slate-100">
                              <span className="font-semibold text-slate-900">{diag.name}</span>
                              <div className="flex items-center space-x-1.5">
                                {diag.status === 'NEGATED' ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                    NEGATED
                                  </span>
                                ) : diag.status === 'UNCERTAIN' || diag.isUncertain ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                    UNCERTAIN
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    PRESENT
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500 font-mono">{diag.confidence}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No diagnoses explicitly mentioned in document</span>
                      )}
                    </div>

                    {/* Medications Section */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center mb-2">
                        <Pill className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                        Prescribed Medications
                      </h6>
                      {structuredData?.medications && structuredData.medications.length > 0 ? (
                        <div className="space-y-1.5">
                          {structuredData.medications.map((med, i) => (
                            <div key={i} className="text-xs p-2 rounded bg-slate-50 border border-slate-100 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{med.name}</span>
                                <span className="text-[10px] font-mono text-slate-500">{med.confidence}%</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex flex-wrap gap-2">
                                {med.dosage && <span>Dosage: <strong>{med.dosage}</strong></span>}
                                {med.frequency && <span>Freq: <strong>{med.frequency}</strong></span>}
                                {med.duration && <span>Duration: <strong>{med.duration}</strong></span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No prescriptions found in document</span>
                      )}
                    </div>

                    {/* Lab Tests Section */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center mb-2">
                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                        Laboratory Tests & Biomarkers
                      </h6>
                      {structuredData?.labTests && structuredData.labTests.length > 0 ? (
                        <div className="space-y-1.5">
                          {structuredData.labTests.map((lab, i) => (
                            <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-50 border border-slate-100">
                              <div>
                                <span className="font-semibold text-slate-900">{lab.testName}</span>
                                {lab.referenceRange && (
                                  <span className="text-[10px] text-slate-500 block">Ref: {lab.referenceRange}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-slate-900">{lab.result} {lab.unit || ''}</span>
                                {lab.flag && (
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    lab.flag === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                                    lab.flag === 'LOW' ? 'bg-sky-100 text-sky-800' :
                                    'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {lab.flag}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No lab tests found in document</span>
                      )}
                    </div>

                    {/* Vital Signs Section */}
                    {structuredData?.vitalSigns && structuredData.vitalSigns.length > 0 && (
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center mb-2">
                          <HeartPulse className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                          Recorded Vitals
                        </h6>
                        <div className="grid grid-cols-2 gap-2">
                          {structuredData.vitalSigns.map((vit, i) => (
                            <div key={i} className="p-1.5 rounded bg-slate-50 border border-slate-100 text-xs">
                              <span className="text-[10px] text-slate-500 block">{vit.name}</span>
                              <span className="font-bold text-slate-900">{vit.value} {vit.unit || ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Allergies Section */}
                    {structuredData?.allergies && structuredData.allergies.length > 0 && (
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <h6 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center mb-2">
                          <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                          Allergies & Reactions
                        </h6>
                        <div className="space-y-1">
                          {structuredData.allergies.map((all, i) => (
                            <div key={i} className="p-1.5 rounded bg-rose-50 border border-rose-100 text-xs text-rose-900 font-semibold flex items-center justify-between">
                              <span>{all.substance} {all.reaction ? `(${all.reaction})` : ''}</span>
                              <span className="text-[10px] font-mono text-rose-700">{all.confidence}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: RAW OCR TRANSCRIPTION */}
                {previewTab === 'OCR' && (
                  <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]">
                    {rawOcrText || <span className="text-slate-400 italic font-sans">No text transcribed from this document.</span>}
                  </div>
                )}

                {/* TAB 3: VISUAL SCAN (IF IMAGE) */}
                {previewTab === 'VISUAL' && (
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 overflow-auto flex items-center justify-center min-h-[300px]">
                    {uploadedFileData && uploadedFileFormat === 'IMAGE' ? (
                      <img
                        src={uploadedFileData}
                        alt="Scanned Clinical Document"
                        style={{ width: `${zoomScale}%` }}
                        className="rounded object-contain shadow-xs transition-all max-h-[460px]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 mx-auto flex items-center justify-center font-mono font-bold text-lg">
                          {uploadedFileFormat}
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {customFileName || selectedFixture?.title || 'Clinical Document'}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-slate-500">
                  Click "View in OCR" on any extracted entity on the right to examine exact verbatim quote.
                </div>
              </div>

              {/* Right Pane: Extracted Entities List (7 cols) */}
              <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Extracted Clinical Assertions & Entities ({entities.length})
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Verify extracted terms before committing to patient's longitudinal record.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="flex items-center text-emerald-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                      Present
                    </span>
                    <span className="flex items-center text-rose-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mr-1" />
                      Negated
                    </span>
                    <span className="flex items-center text-amber-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mr-1" />
                      Uncertain
                    </span>
                  </div>
                </div>

                {entities.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No clinical entities were found in this document.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entities.map((entity) => {
                      const isNegated = entity.status === 'NEGATED';
                      const isUncertain = entity.status === 'UNCERTAIN' || entity.isUncertain || entity.confidence < 80;
                      const isConfirmed = entity.verificationStatus === 'CONFIRMED';
                      const isRejected = entity.verificationStatus === 'REJECTED';
                      const isEdited = entity.verificationStatus === 'EDITED';

                      return (
                        <div
                          key={entity.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isRejected
                              ? 'bg-slate-50 border-slate-200 opacity-60'
                              : isNegated
                              ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                              : isUncertain
                              ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                              : 'bg-white border-slate-200 hover:border-teal-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Category Badge */}
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                  {entity.category.replace('_', ' ')}
                                </span>

                                {/* Negation / Present / Uncertain Status Badge */}
                                {isNegated ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    <XCircle className="w-3 h-3 mr-1 text-rose-600" />
                                    NEGATED (Denied / Ruled Out)
                                  </span>
                                ) : isUncertain ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                                    Low confidence / Please verify
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                    PRESENT
                                  </span>
                                )}

                                {/* Confidence Gauge */}
                                <span className="text-[10px] font-mono text-slate-500">
                                  Conf: <strong className={entity.confidence < 80 ? 'text-amber-700' : 'text-slate-800'}>{entity.confidence}%</strong>
                                </span>

                                {/* Clinical Code */}
                                {entity.clinicalCode && (
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {entity.clinicalCode}
                                  </span>
                                )}
                              </div>

                              {/* Entity Name & Values */}
                              <div className="flex items-baseline space-x-2 pt-0.5">
                                <h6 className={`text-sm font-bold ${isNegated ? 'text-rose-950' : 'text-slate-900'}`}>
                                  {entity.name}
                                </h6>
                                {entity.value && (
                                  <span className="font-semibold text-slate-800 text-xs">
                                    : {entity.value} {entity.unit || ''}
                                  </span>
                                )}
                                {entity.dosage && (
                                  <span className="text-xs text-teal-800 font-medium">
                                    ({entity.dosage} {entity.frequency || ''})
                                  </span>
                                )}
                              </div>

                              {/* Source Evidence Quote */}
                              {entity.sourceEvidence && (
                                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/70 mt-1.5 flex items-start justify-between">
                                  <div>
                                    <span className="font-semibold text-slate-700 block text-[10px] uppercase">
                                      Source Evidence:
                                    </span>
                                    <span className="italic">"{entity.sourceEvidence}"</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setHighlightedEvidence(entity.sourceEvidence);
                                      setPreviewTab('OCR');
                                    }}
                                    className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 underline shrink-0 ml-2 mt-1"
                                  >
                                    View in OCR
                                  </button>
                                </div>
                              )}

                              {/* Negation or Uncertainty note */}
                              {isNegated && (
                                <div className="text-[11px] text-rose-800 bg-rose-100/50 p-1.5 rounded mt-1">
                                  Context Assertion: Patient or document explicitly rules out or denies this item.
                                </div>
                              )}
                              {isUncertain && !isNegated && (
                                <div className="text-[11px] text-amber-800 bg-amber-100/60 p-1.5 rounded mt-1 flex items-center space-x-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Handwriting or notation is unclear. Marked as <strong>uncertain</strong>. Please review manually.</span>
                                </div>
                              )}
                            </div>

                            {/* Clinician Action Buttons */}
                            <div className="flex flex-col items-end space-y-1.5 shrink-0 ml-2">
                              {isConfirmed ? (
                                <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                  Confirmed
                                </span>
                              ) : isRejected ? (
                                <span className="inline-flex items-center px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold">
                                  Rejected
                                </span>
                              ) : isEdited ? (
                                <span className="inline-flex items-center px-2 py-1 bg-sky-100 text-sky-800 rounded text-xs font-semibold">
                                  Edited
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-semibold">
                                  Needs Verification
                                </span>
                              )}

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleConfirmEntity(entity.id)}
                                  title="Confirm extraction"
                                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isConfirmed
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingEntity({ ...entity })}
                                  title="Edit extracted value"
                                  className="p-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRejectEntity(entity.id)}
                                  title="Reject extraction"
                                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isRejected
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                                  }`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-600">
                Verified: <strong className="text-teal-700">{entities.filter((e) => e.verificationStatus === 'CONFIRMED' || e.verificationStatus === 'EDITED').length}</strong> of {entities.length} items • Generated directly from current document.
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    resetExtractionState();
                    setStep('SELECT');
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Upload Another Document</span>
                </button>
                <button
                  onClick={handleCommitToEHR}
                  className="inline-flex items-center px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <FileCheck className="w-4 h-4 mr-1.5" />
                  Save to Health Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Entity */}
        {editingEntity && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-5 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h5 className="text-sm font-bold text-slate-900">Edit Extracted Entity</h5>
                <button
                  onClick={() => setEditingEntity(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Entity Name</label>
                  <input
                    type="text"
                    value={editingEntity.name}
                    onChange={(e) => setEditingEntity({ ...editingEntity, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Value / Dosage</label>
                    <input
                      type="text"
                      value={editingEntity.value || editingEntity.dosage || ''}
                      onChange={(e) => setEditingEntity({ ...editingEntity, value: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Assertion Status</label>
                    <select
                      value={editingEntity.status}
                      onChange={(e) => setEditingEntity({ ...editingEntity, status: e.target.value as NegationStatus })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="PRESENT">PRESENT (Positive)</option>
                      <option value="NEGATED">NEGATED (Ruled out / denied)</option>
                      <option value="UNCERTAIN">UNCERTAIN</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Doctor Correction Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Rationale for adjustment..."
                    value={editingEntity.doctorNotes || ''}
                    onChange={(e) => setEditingEntity({ ...editingEntity, doctorNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setEditingEntity(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Camera Scanner & Photo Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Scan Medical Document with Camera"
        subtitle={`Live camera capture for patient ${patient.fullName} (${patient.id})`}
      />
    </div>
  );
};
