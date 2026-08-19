import React from 'react';
import { PatientDemographics } from '../types';
import { Scissors } from 'lucide-react';

interface PrintableBedsideCardSheetProps {
  patient: PatientDemographics;
  isPrintOnly?: boolean;
  showDimensionBadges?: boolean;
}

// Helper to format date as DD/MM/YY (e.g. 18/08/26)
export function formatShortDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = String(today.getFullYear()).slice(-2);
    return `${d}/${m}/${y}`;
  }
  const clean = dateStr.trim();
  if (clean.includes('/')) return clean;

  try {
    const parts = clean.split('-');
    if (parts.length === 3) {
      const year = parts[0].slice(-2);
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
  } catch {
    // fallback
  }
  return clean;
}

// Helper to format ward & bed string (e.g. "Ward 12 bed 4")
export function formatWardBed(patient: PatientDemographics): string {
  const ward = (patient.wardNumber || '').trim();
  const bed = (patient.bedNumber || '').trim();

  if (ward && bed) {
    const cleanWard = ward.replace(/^ward\s*/i, '');
    const cleanBed = bed.replace(/^bed\s*/i, '');
    return `Ward ${cleanWard} bed ${cleanBed}`;
  }

  if (patient.wardAndBedNumber?.trim()) {
    const raw = patient.wardAndBedNumber.trim();
    if (raw.toLowerCase().includes('bed')) {
      return raw.replace(/,/g, '');
    }
    return raw;
  }

  if (ward) return `Ward ${ward}`;
  if (bed) return `Bed ${bed}`;
  return 'Ward — bed —';
}

// Helper to extract clean doctor title and name (e.g. "DR." and "Layla")
export function getDoctorDisplay(doctor?: string): { title: string; name: string; full: string } {
  if (!doctor || !doctor.trim()) {
    return { title: 'DR.', name: 'Physician', full: 'Dr. Physician' };
  }
  const clean = doctor
    .replace(/\(.*?\)/g, '')
    .replace(/,.*$/, '')
    .trim();

  const withoutDr = clean.replace(/^dr\.?\s+/i, '').trim();
  return {
    title: 'DR.',
    name: withoutDr || clean,
    full: clean.startsWith('Dr.') ? clean : `Dr. ${clean}`,
  };
}

// Helper to split patient name nicely across lines for 9x7cm display
export function splitPatientName(fullName?: string): { line1: string; line2: string } {
  if (!fullName || !fullName.trim()) {
    return { line1: 'Patient', line2: 'Name' };
  }
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { line1: parts[0], line2: '' };
  }
  if (parts.length === 2) {
    return { line1: parts[0], line2: parts[1] };
  }
  if (parts.length === 3) {
    return { line1: `${parts[0]} ${parts[1]}`, line2: parts[2] };
  }
  // 4 or more words
  const midpoint = Math.ceil(parts.length / 2);
  return {
    line1: parts.slice(0, midpoint).join(' '),
    line2: parts.slice(midpoint).join(' '),
  };
}

// Helper to scale and wrap patient name dynamically in 9×7cm File Attached Cards
export function getFileCardNameClass(fullName?: string): string {
  const len = fullName ? fullName.trim().length : 0;
  if (len > 35) {
    return 'text-[12.5px] leading-[1.1]';
  }
  if (len > 26) {
    return 'text-[14.5px] leading-[1.12]';
  }
  if (len > 18) {
    return 'text-[16.5px] leading-[1.15]';
  }
  return 'text-[18.5px] leading-tight';
}

// Helper for allergy display
export function formatAllergy(allergy?: string): string {
  if (!allergy || !allergy.trim()) return 'NKDA';
  const clean = allergy.trim();
  if (/^nkda\s*(\(no\s+known\s+drug\s+allergies\))?$/i.test(clean) || /^no\s+known\s+drug\s+allergies$/i.test(clean)) {
    return 'NKDA';
  }
  return clean.replace(/\(no\s+known\s+drug\s+allergies\)/gi, '').trim();
}

// Dedicated helper for ID tag allergy: strictly outputs NKDA instead of verbose phrases
export function formatIdTagAllergy(allergy?: string): string {
  if (!allergy || !allergy.trim()) return 'NKDA';
  const clean = allergy.trim();
  if (/no\s+known\s+drug\s+allergies/i.test(clean) || /^nkda/i.test(clean) || /^nka/i.test(clean)) {
    return 'NKDA';
  }
  return clean.replace(/\(no\s+known\s+drug\s+allergies\)/gi, '').trim();
}

export interface IdTagCardProps {
  patient: PatientDemographics;
  id?: string;
  className?: string;
  zoom?: number;
  showBorder?: boolean;
  unfilledWardBed?: boolean;
}

// Dedicated ID Tag component scaled and calibrated exactly to 1.6cm × 6.5cm (16mm × 65mm)
export const IdTagCard: React.FC<IdTagCardProps> = ({
  patient,
  id,
  className = '',
  zoom = 1,
  showBorder = true,
  unfilledWardBed = false,
}) => {
  const shortDate = formatShortDate(patient.dateOfAdmission);
  const wardBed = formatWardBed(patient);
  const wardBedDisplay = unfilledWardBed ? 'W: _____ B: _____' : wardBed;
  const doctor = getDoctorDisplay(patient.caringDoctor);
  const patientName = patient.fullName || 'Patient Name';
  const cprNumber = patient.idNumber || '—';
  const ageDisplay = patient.age ? `${patient.age} YRS` : '— YRS';
  const sexCode = patient.sex ? (patient.sex.toUpperCase().startsWith('M') ? 'M' : 'F') : '—';
  const nationalityDisplay = (patient.nationality || 'BAHRAINI').toUpperCase();
  const allergyDisplay = formatIdTagAllergy(patient.allergies);

  return (
    <div
      id={id}
      className={`bg-white relative flex items-center justify-center box-border select-text overflow-hidden ${
        showBorder ? 'border-[1.5px] border-[#002878] shadow-2xs' : ''
      } ${className}`}
      style={{
        width: '16mm',
        height: '65mm',
        minWidth: '16mm',
        maxWidth: '16mm',
        minHeight: '65mm',
        maxHeight: '65mm',
        boxSizing: 'border-box',
        transform: zoom !== 1 ? `scale(${zoom})` : undefined,
        transformOrigin: 'center center',
      }}
    >
      <div
        className="id-tag-inner flex flex-col justify-between text-black font-sans box-border"
        style={{
          width: '63mm',
          height: '14.5mm',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-90deg)',
          transformOrigin: 'center center',
          boxSizing: 'border-box',
          lineHeight: 1.15,
          padding: '0 0.5mm',
        }}
      >
        {/* Row 1: Header - Date of Admission & Ward / Bed Number */}
        <div className="flex items-center justify-between text-[7px] font-black tracking-tight text-black border-b border-slate-300 pb-[0.5px]">
          <span className="font-mono">{shortDate}</span>
          <span className="font-bold text-[#002878] uppercase">{wardBedDisplay}</span>
        </div>

        {/* Row 2: Patient Full Name (Prominent & Clear) */}
        <div className="text-[8.5px] font-black tracking-tight leading-none text-black uppercase truncate">
          {patientName}
        </div>

        {/* Row 3: CPR Number, Age, Sex, Nationality */}
        <div className="flex items-center justify-between text-[6.8px] font-bold text-black tracking-tight leading-none">
          <span>
            CPR: <strong className="font-black">{cprNumber}</strong>
          </span>
          <span>
            {ageDisplay} <strong className="font-black">({sexCode})</strong>
          </span>
          <span className="tracking-wide text-slate-800 uppercase font-black">
            {nationalityDisplay}
          </span>
        </div>

        {/* Row 4: Caring Doctor & Allergy Warning (NKDA only, no verbose bracket text) */}
        <div className="flex items-center justify-between text-[6.8px] font-bold text-black tracking-tight leading-none pt-[0.5px]">
          <span className="truncate max-w-[34mm]">
            C/O <strong className="font-black text-[#002878]">{doctor.full}</strong>
          </span>
          <span className="truncate max-w-[27mm] text-right font-black text-red-700 uppercase">
            ALLERGY: {allergyDisplay}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PrintableBedsideCardSheet: React.FC<PrintableBedsideCardSheetProps> = ({
  patient,
  isPrintOnly = false,
  showDimensionBadges = false,
}) => {
  const shortDate = formatShortDate(patient.dateOfAdmission);
  const wardBed = formatWardBed(patient);
  const doctor = getDoctorDisplay(patient.caringDoctor);
  const patientNameSplit = splitPatientName(patient.fullName);
  const patientName = patient.fullName || 'Patient Name';
  const cprNumber = patient.idNumber || '—';
  const ageDisplay = patient.age ? `${patient.age} YRS` : '— YRS';
  const sexCode = patient.sex ? (patient.sex.toUpperCase().startsWith('M') ? 'M' : 'F') : '—';
  const nationalityDisplay = (patient.nationality || 'BAHRAINI').toUpperCase();
  const allergyDisplay = formatAllergy(patient.allergies);

  return (
    <div
      id="printable-bedside-label-sheet"
      className={`bedside-card-sheet bg-white text-black font-sans box-border select-text flex flex-col items-center justify-center relative ${
        isPrintOnly
          ? 'printable-landscape-sheet'
          : 'w-full max-w-[297mm] shadow-xl border border-slate-300 rounded-sm mx-auto'
      }`}
      style={{
        width: '297mm', // Exact A4 Landscape Width
        minHeight: '210mm', // Exact A4 Landscape Height
        height: '210mm',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '0',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      {/* A4 Sheet Header Trim & Calibration Bar (Visible in Screen & Print Margin) */}
      <div className="w-full max-w-[270mm] flex items-center justify-between text-[8px] text-slate-400 font-mono pt-3 pb-1.5 px-1 no-print">
        <span className="flex items-center gap-1 font-semibold text-slate-600">
          <Scissors className="w-3 h-3 text-slate-400" />
          <span>A4 Landscape Sheet (297 × 210 mm) • Cut along the solid blue lines</span>
        </span>
        <span className="font-bold text-slate-500">
          Cards: 9 × 7 cm | ID Tags: 1.6 × 6.5 cm
        </span>
      </div>

      {/* Main Centered 27cm × 14cm Card Grid Frame (3 Columns of 9cm, 2 Rows of 7cm) */}
      <div
        className="bedside-sheet-grid bg-white border-[3px] border-[#002878] box-border relative"
        style={{
          width: '270mm', // Exact 3 * 90mm = 27cm
          height: '140mm', // Exact 2 * 70mm = 14cm
          minWidth: '270mm',
          maxWidth: '270mm',
          minHeight: '140mm',
          maxHeight: '140mm',
          display: 'grid',
          gridTemplateColumns: '90mm 90mm 90mm',
          gridTemplateRows: '70mm 70mm',
          borderColor: '#002878',
          boxSizing: 'border-box',
          margin: 'auto',
        }}
      >
        {/* ========================================================= */}
        {/* ROW 1: TOP 3 CARDS (Each 90mm × 70mm = 9cm × 7cm)          */}
        {/* ========================================================= */}

        {/* 1. TOP-LEFT: Bedside Patient Name Card (9cm × 7cm) */}
        <div
          id="card-bedside-name"
          className="relative border-r-[3px] border-b-[3px] border-[#002878] p-4 flex flex-col justify-center items-center text-center overflow-hidden bg-white box-border"
          style={{ width: '90mm', height: '70mm', minWidth: '90mm', maxWidth: '90mm', minHeight: '70mm', maxHeight: '70mm', boxSizing: 'border-box' }}
        >
          {showDimensionBadges && (
            <span className="absolute top-1.5 right-1.5 text-[8.5px] font-mono font-bold bg-blue-50 text-blue-900 px-1 py-0.2 rounded border border-blue-200 no-print z-10">
              9 × 7 cm
            </span>
          )}
          <div className="w-full flex flex-col justify-center items-center text-center">
            <h1 className={`${patientNameSplit.line2 ? 'text-[36px]' : 'text-[44px]'} font-black text-black leading-[1.02] tracking-tight font-sans break-words uppercase text-center w-full`}>
              {patientNameSplit.line1}
            </h1>
            {patientNameSplit.line2 && (
              <h1 className="text-[36px] font-black text-black leading-[1.02] tracking-tight font-sans mt-2 break-words uppercase text-center w-full">
                {patientNameSplit.line2}
              </h1>
            )}
          </div>
        </div>

        {/* 2. TOP-MIDDLE: Bedside Caring Dr Card #1 (9cm × 7cm) */}
        <div
          id="card-bedside-doctor-1"
          className="relative border-r-[3px] border-b-[3px] border-[#002878] p-4 flex flex-col justify-center items-center text-center overflow-hidden bg-white box-border"
          style={{ width: '90mm', height: '70mm', minWidth: '90mm', maxWidth: '90mm', minHeight: '70mm', maxHeight: '70mm', boxSizing: 'border-box' }}
        >
          {showDimensionBadges && (
            <span className="absolute top-1.5 right-1.5 text-[8.5px] font-mono font-bold bg-blue-50 text-blue-900 px-1 py-0.2 rounded border border-blue-200 no-print z-10">
              9 × 7 cm
            </span>
          )}
          <div className="w-full flex flex-col justify-center items-center text-center">
            <span className="text-[34px] font-black text-black tracking-wider block font-sans uppercase text-center w-full">
              {doctor.title}
            </span>
            <span className="text-[42px] font-black text-black tracking-tight block font-sans mt-1 leading-[1.02] break-words text-center w-full">
              {doctor.name}
            </span>
          </div>
        </div>

        {/* 3. TOP-RIGHT: File Attached Card #1 (9cm × 7cm) */}
        {/* Fields: [date of admission, ward numer, bed number, patient name, ID, age, sex, nationality, caring Dr, allergy] */}
        <div
          id="card-file-attached-1"
          className="relative border-b-[3px] border-[#002878] p-2.5 flex flex-col justify-between overflow-hidden bg-white box-border font-sans"
          style={{ width: '90mm', height: '70mm', minWidth: '90mm', maxWidth: '90mm', minHeight: '70mm', maxHeight: '70mm', boxSizing: 'border-box' }}
        >
          {showDimensionBadges && (
            <span className="absolute top-1.5 right-1.5 text-[8px] font-mono font-bold bg-blue-50 text-blue-900 px-1 py-0.2 rounded border border-blue-200 no-print z-10">
              9 × 7 cm
            </span>
          )}
          {/* Header Row: Date & Ward/Bed */}
          <div className="flex items-center justify-between text-[15px] font-black text-black border-b border-slate-300 pb-0.5 px-0.5">
            <span className="font-mono">{shortDate}</span>
            <span className="font-bold text-[#002878] uppercase">{wardBed}</span>
          </div>

          {/* Center Info - suitably scaled to fill 9x7cm */}
          <div className="flex flex-col justify-evenly flex-1 py-0.5 text-center space-y-0.5">
            <h2 className={`${getFileCardNameClass(patientName)} font-black text-black tracking-tight uppercase text-center break-words max-w-full px-0.5`}>
              {patientName}
            </h2>

            <div className="text-[16px] font-bold text-black tracking-wide leading-none">
              <span>CPR </span>
              <strong className="font-mono font-black ml-1">{cprNumber}</strong>
            </div>

            <div className="text-[15px] font-bold text-black tracking-wide leading-none">
              <span>{ageDisplay}</span>
              <span className="mx-1.5 font-black">•</span>
              <strong className="font-black">({sexCode})</strong>
              <span className="mx-1.5 font-black">•</span>
              <strong className="font-black text-slate-800 uppercase">{nationalityDisplay}</strong>
            </div>

            <div className="text-[15px] font-bold text-black leading-none truncate">
              <span>C/O </span>
              <strong className="font-black text-[#002878]">{doctor.full}</strong>
            </div>

            <div className="text-[15px] font-bold text-black tracking-tight leading-none pt-0.5">
              <span>ALLERGY: </span>
              <strong className="font-black uppercase text-red-700">{allergyDisplay}</strong>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: BOTTOM 3 CARDS / SLOTS (Each 90mm × 70mm = 9cm × 7cm)*/}
        {/* ========================================================= */}

        {/* 4. BOTTOM-LEFT: Bedside Caring Dr Card #2 (9cm × 7cm) */}
        <div
          id="card-bedside-doctor-2"
          className="relative border-r-[3px] border-[#002878] p-4 flex flex-col justify-center items-center text-center overflow-hidden bg-white box-border"
          style={{ width: '90mm', height: '70mm', minWidth: '90mm', maxWidth: '90mm', minHeight: '70mm', maxHeight: '70mm', boxSizing: 'border-box' }}
        >
          {showDimensionBadges && (
            <span className="absolute top-1.5 right-1.5 text-[8.5px] font-mono font-bold bg-blue-50 text-blue-900 px-1 py-0.2 rounded border border-blue-200 no-print z-10">
              9 × 7 cm
            </span>
          )}
          <div className="w-full flex flex-col justify-center items-center text-center">
            <span className="text-[34px] font-black text-black tracking-wider block font-sans uppercase text-center w-full">
              {doctor.title}
            </span>
            <span className="text-[42px] font-black text-black tracking-tight block font-sans mt-1 leading-[1.02] break-words text-center w-full">
              {doctor.name}
            </span>
          </div>
        </div>

        {/* 5. BOTTOM-MIDDLE: ID Tags Slot (9cm × 7cm slot holding two 1.6cm × 6.5cm vertical tags) */}
        <div
          id="slot-id-tags"
          className="relative border-r-[3px] border-[#002878] flex items-center justify-center gap-3.5 p-1 bg-white box-border overflow-hidden"
          style={{ width: '90mm', height: '70mm', minWidth: '90mm', maxWidth: '90mm', minHeight: '70mm', maxHeight: '70mm', boxSizing: 'border-box' }}
        >
          {showDimensionBadges && (
            <span className="absolute top-1.5 right-1.5 text-[8px] font-mono font-bold bg-blue-50 text-blue-900 px-1 py-0.2 rounded border border-blue-200 no-print z-10">
              ID Tags (1.6 × 6.5 cm)
            </span>
          )}

          {/* ID Tag #1 (Filled with Ward and Bed) */}
          <IdTagCard patient={patient} id="id-tag-1" unfilledWardBed={false} />

          {/* ID Tag #2 (Ward and Bed number left unfilled for flexible handwritten/transfer use) */}
          <IdTagCard patient={patient} id="id-tag-2" unfilledWardBed={true} />
        </div>

        {/* 6. BOTTOM-RIGHT: File Attached Card #2 (9cm × 7cm) */}
        {/* Fields: [date of admission, ward numer, bed number, patient name, ID, age, sex, nationality, caring Dr, allergy] */}
        <div
          id="card-file-attached-2"
          className="relative p-2.5 flex flex-col justify-between overflow-hidden bg-white box-border font-sans"
          style={{ width: '90mm', height: '70mm', minWidth: '90mm', maxWidth: '90mm', minHeight: '70mm', maxHeight: '70mm', boxSizing: 'border-box' }}
        >
          {showDimensionBadges && (
            <span className="absolute top-1.5 right-1.5 text-[8px] font-mono font-bold bg-blue-50 text-blue-900 px-1 py-0.2 rounded border border-blue-200 no-print z-10">
              9 × 7 cm
            </span>
          )}
          {/* Header Row: Date & Ward/Bed */}
          <div className="flex items-center justify-between text-[15px] font-black text-black border-b border-slate-300 pb-0.5 px-0.5">
            <span className="font-mono">{shortDate}</span>
            <span className="font-bold text-[#002878] uppercase">{wardBed}</span>
          </div>

          {/* Center Info - suitably scaled to fill 9x7cm */}
          <div className="flex flex-col justify-evenly flex-1 py-0.5 text-center space-y-0.5">
            <h2 className={`${getFileCardNameClass(patientName)} font-black text-black tracking-tight uppercase text-center break-words max-w-full px-0.5`}>
              {patientName}
            </h2>

            <div className="text-[16px] font-bold text-black tracking-wide leading-none">
              <span>CPR </span>
              <strong className="font-mono font-black ml-1">{cprNumber}</strong>
            </div>

            <div className="text-[15px] font-bold text-black tracking-wide leading-none">
              <span>{ageDisplay}</span>
              <span className="mx-1.5 font-black">•</span>
              <strong className="font-black">({sexCode})</strong>
              <span className="mx-1.5 font-black">•</span>
              <strong className="font-black text-slate-800 uppercase">{nationalityDisplay}</strong>
            </div>

            <div className="text-[15px] font-bold text-black leading-none truncate">
              <span>C/O </span>
              <strong className="font-black text-[#002878]">{doctor.full}</strong>
            </div>

            <div className="text-[15px] font-bold text-black tracking-tight leading-none pt-0.5">
              <span>ALLERGY: </span>
              <strong className="font-black uppercase text-red-700">{allergyDisplay}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* A4 Sheet Bottom Calibration Bar (Visible in Screen & Print Margin) */}
      <div className="w-full max-w-[270mm] flex items-center justify-between text-[8px] text-slate-400 font-mono pb-3 pt-1.5 px-1 no-print">
        <span>KINGDOM OF BAHRAIN • GOVERNMENT HOSPITALS</span>
        <span>Standard Hospital Printout Format</span>
      </div>
    </div>
  );
};
