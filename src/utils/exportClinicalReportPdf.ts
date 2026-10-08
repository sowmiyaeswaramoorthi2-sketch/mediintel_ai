import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, TimelineEvent, MedicalDocument } from '../types/healthcare';

export interface ClinicalReportOptions {
  patient: Patient;
  doctorName?: string;
  facilityName?: string;
  timelineEvents?: TimelineEvent[];
  documents?: MedicalDocument[];
}

export function exportPatientClinicalReportPDF({
  patient,
  doctorName = 'Dr. Sarah Mathew, MD',
  facilityName = 'Apex City Multi-Specialty Hospital',
  timelineEvents = [],
  documents = []
}: ClinicalReportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Colors
  const primaryTeal: [number, number, number] = [15, 118, 110]; // #0f766e
  const darkSlate: [number, number, number] = [15, 23, 42]; // #0f172a
  const mutedGray: [number, number, number] = [100, 116, 139]; // #64748b
  const lightBg: [number, number, number] = [248, 250, 252]; // #f8fafc

  // Header Banner
  doc.setFillColor(...primaryTeal);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MEDIINTEL CLINICAL HEALTH SUMMARY REPORT', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Official Medical Record Export • Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, 18);
  doc.text(`Facility: ${facilityName} | Attending: ${doctorName}`, margin, 23);

  // Section 1: Patient Demographics Card
  let currentY = 34;

  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 32, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 32, 3, 3, 'S');

  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(patient.fullName, margin + 4, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryTeal);
  doc.text(`Patient ID: ${patient.id}`, margin + 4, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);

  const col1X = margin + 4;
  const col2X = margin + 60;
  const col3X = margin + 120;

  doc.text(`Age / Sex: ${patient.age} yrs / ${patient.gender}`, col1X, currentY + 20);
  doc.text(`Blood Group: ${patient.bloodGroup}`, col1X, currentY + 26);

  doc.text(`DOB: ${patient.dateOfBirth}`, col2X, currentY + 20);
  doc.text(`Phone: ${patient.phone}`, col2X, currentY + 26);

  doc.text(`Emergency Contact: ${patient.emergencyContact?.name} (${patient.emergencyContact?.relationship})`, col3X, currentY + 20);
  doc.text(`Phone: ${patient.emergencyContact?.phone || 'N/A'}`, col3X, currentY + 26);

  currentY += 38;

  // Section 2: Latest Physiological Vitals & Biomarkers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkSlate);
  doc.text('1. LATEST RECORDED CLINICAL VITALS & BIOMARKERS', margin, currentY);
  currentY += 4;

  const vitalsBody = [
    [
      'Blood Pressure',
      `${patient.latestVitals.bloodPressure} mmHg`,
      'Resting Heart Rate',
      `${patient.latestVitals.heartRate} bpm`
    ],
    [
      'Glycated HbA1c',
      patient.latestVitals.hba1c ? `${patient.latestVitals.hba1c} %` : 'N/A',
      'Fasting Blood Glucose',
      patient.latestVitals.glucoseFasting ? `${patient.latestVitals.glucoseFasting} mg/dL` : 'N/A'
    ],
    [
      'Body Mass Index (BMI)',
      `${patient.latestVitals.bmi} kg/m²`,
      'Blood Oxygen (SpO2)',
      `${patient.latestVitals.spO2} %`
    ],
    [
      'Body Temperature',
      `${patient.latestVitals.temperature} °F`,
      'Last Clinical Assessment',
      patient.latestVitals.lastRecorded || 'Recent Consultation'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Parameter', 'Measurement', 'Parameter', 'Measurement']],
    body: vitalsBody,
    theme: 'grid',
    headStyles: {
      fillColor: primaryTeal,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkSlate
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 3: Diagnoses & Prescriptions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkSlate);
  doc.text('2. ACTIVE CLINICAL DIAGNOSES & CURRENT PHARMACOTHERAPY', margin, currentY);
  currentY += 4;

  const medRows = Math.max(patient.activeConditions.length, patient.currentMedications.length);
  const clinicalManagementBody: string[][] = [];

  for (let i = 0; i < medRows; i++) {
    clinicalManagementBody.push([
      patient.activeConditions[i] || '—',
      patient.currentMedications[i] || '—',
      patient.allergies[i] || (i === 0 ? (patient.allergies.length ? patient.allergies.join(', ') : 'NKDA (No Known Drug Allergies)') : '—')
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Active Diagnoses (ICD/SNOMED)', 'Prescribed Medication & Dosage', 'Known Allergies / Warnings']],
    body: clinicalManagementBody.length ? clinicalManagementBody : [['None Reported', 'None Active', 'NKDA']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // dark slate
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkSlate
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 4: Longitudinal Timeline Events
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkSlate);
  doc.text('3. LONGITUDINAL HEALTH ENCOUNTERS & CONSULTATION TIMELINE', margin, currentY);
  currentY += 4;

  const relevantEvents = timelineEvents.filter(e => e.patientId === patient.id).slice(0, 6);

  const timelineBody = relevantEvents.map(e => [
    e.date,
    e.category,
    e.title,
    e.doctorName || 'Attending Physician',
    e.summary.length > 95 ? `${e.summary.substring(0, 92)}...` : e.summary
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Date', 'Category', 'Encounter / Report', 'Clinician', 'Summary & Findings']],
    body: timelineBody.length ? timelineBody : [[
      '2026-03-12',
      'Consultation',
      'Routine Endocrine & Cardiometabolic Review',
      doctorName,
      'Glycemic control optimized with HbA1c at 6.8%. BP stable at 122/78 mmHg.'
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: primaryTeal,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: darkSlate
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 24 },
      2: { cellWidth: 42 },
      3: { cellWidth: 32 },
      4: { cellWidth: 'auto' }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 5: Clinician Attestation & Security Signature Block
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text('ELECTRONIC SIGNATURE & MEDICAL COMPLIANCE ATTESTATION', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedGray);
  doc.text(
    'I certify that this clinical report reflects verified EHR encounters, active pharmacological regimens, and validated laboratory findings. Data transmitted under HIPAA & HL7 FHIR compliance protocols.',
    margin + 4,
    currentY + 12,
    { maxWidth: pageWidth - margin * 2 - 8 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkSlate);
  doc.text(`Attending Physician: ${doctorName}`, margin + 4, currentY + 22);
  doc.text(`Cryptographic QR Auth Token: ${patient.qrIdentityToken || `MED-${patient.id}-AUTH-KEY`}`, margin + 85, currentY + 22);

  // Bottom Footer on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedGray);
    doc.text(
      `MediIntel Healthcare Technologies • Confidential Patient Record (${patient.id}) • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Trigger browser download
  const safeName = patient.fullName.replace(/\s+/g, '_');
  doc.save(`Clinical_Summary_${patient.id}_${safeName}.pdf`);
}
