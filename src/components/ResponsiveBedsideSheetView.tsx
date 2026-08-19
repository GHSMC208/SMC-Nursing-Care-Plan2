import React, { useState, useRef, useEffect } from 'react';
import { PatientDemographics } from '../types';
import {
  PrintableBedsideCardSheet,
  IdTagCard,
  formatShortDate,
  formatWardBed,
  getDoctorDisplay,
  splitPatientName,
  formatAllergy,
  getFileCardNameClass,
} from './PrintableBedsideCardSheet';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, Tag, Layers, FileText, User, Stethoscope, Scissors } from 'lucide-react';

interface ResponsiveBedsideSheetViewProps {
  patient: PatientDemographics;
  showDimensionBadges?: boolean;
  onToggleDimensions?: () => void;
}

type CardFocusMode = 'full_sheet' | 'file_cards' | 'name_card' | 'doctor_cards' | 'id_tags';

export const ResponsiveBedsideSheetView: React.FC<ResponsiveBedsideSheetViewProps> = ({
  patient,
  showDimensionBadges = true,
  onToggleDimensions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [userZoom, setUserZoom] = useState<number>(1);
  const [focusMode, setFocusMode] = useState<CardFocusMode>('full_sheet');

  // Measure container and compute auto-fit scale so the 297mm width fits 100% inside container
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // 297mm at 96dpi is approx 1122.5px. Add 16px safety margin = 1138px
        const targetWidthPx = 1130;
        const computedScale = Math.min(1, Math.max(0.28, (containerWidth - 24) / targetWidthPx));
        setScale(computedScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

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

  const effectiveScale = scale * userZoom;

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* View & Focus Mode Bar */}
      <div className="w-full bg-slate-900 text-white rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-300 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Card View:</span>
          </span>

          <button
            type="button"
            onClick={() => setFocusMode('full_sheet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              focusMode === 'full_sheet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full A4 Sheet (All 6 Cards)</span>
          </button>

          <button
            type="button"
            onClick={() => setFocusMode('file_cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              focusMode === 'file_cards'
                ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
            }`}
            title="Inspect File Attached Cards #1 & #2 (9×7 cm)"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>File Attached Cards (9×7 cm)</span>
          </button>

          <button
            type="button"
            onClick={() => setFocusMode('name_card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              focusMode === 'name_card'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Inspect Patient Bedside Name Card (9×7 cm)"
          >
            <User className="w-3.5 h-3.5" />
            <span>Bedside Name Card</span>
          </button>

          <button
            type="button"
            onClick={() => setFocusMode('doctor_cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              focusMode === 'doctor_cards'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Inspect Doctor Door Signs (9×7 cm)"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Signs</span>
          </button>

          <button
            type="button"
            onClick={() => setFocusMode('id_tags')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              focusMode === 'id_tags'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Inspect Vertical ID Tags (1.6×6.5 cm)"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>ID Tags</span>
          </button>
        </div>

        {/* Zoom Controls & Dimension Badges Toggle */}
        <div className="flex items-center gap-2">
          {onToggleDimensions && (
            <button
              type="button"
              onClick={onToggleDimensions}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                showDimensionBadges
                  ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle 9x7cm and 1.6x6.5cm dimension markers"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{showDimensionBadges ? 'Sizes: 9×7, 1.6×6.5' : 'Sizes: Off'}</span>
            </button>
          )}

          {focusMode === 'full_sheet' && (
            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-1 text-xs">
              <button
                type="button"
                onClick={() => setUserZoom((z) => Math.max(0.6, z - 0.1))}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-slate-300 font-mono text-[11px] min-w-[40px] text-center">
                {Math.round(effectiveScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setUserZoom((z) => Math.min(1.5, z + 0.1))}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setUserZoom(1)}
                className="p-1 text-[10px] text-slate-400 hover:text-white transition-colors border-l border-slate-700 ml-1"
                title="Reset to Fit Width"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FOCUS VIEW 1: FULL A4 SHEET (Responsive Auto-Fitting Frame) */}
      {focusMode === 'full_sheet' && (
        <div
          ref={containerRef}
          className="w-full bg-slate-100 rounded-xl p-3 sm:p-6 border border-slate-300 shadow-inner flex flex-col items-center overflow-x-auto"
        >
          <div
            className="transition-transform origin-top flex flex-col items-center"
            style={{
              width: '297mm',
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top center',
              marginBottom: `${(effectiveScale - 1) * 210}mm`,
            }}
          >
            <PrintableBedsideCardSheet
              patient={patient}
              showDimensionBadges={showDimensionBadges}
            />
          </div>
        </div>
      )}

      {/* FOCUS VIEW 2: DEDICATED FILE ATTACHED CARDS INSPECTION (High-Res 9×7 cm Focus) */}
      {focusMode === 'file_cards' && (
        <div className="w-full bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-emerald-400 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>File Attached Cards (Exact Size: 9 × 7 cm)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Contains all 9 inpatient clinical registration fields: Date of admission, Ward No, Bed No, Patient Name, ID (CPR), Age, Sex, Caring Dr, and Allergy.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-1 rounded">
              Physical Card: 90 × 70 mm
            </span>
          </div>

          {/* Cards Display Grid (Both File Attached Cards side-by-side or stacked) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
            {/* Card 1 (Top-Right position on A4 Sheet) */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs font-bold text-slate-300">
                1. File Attached Card #1 (Top-Right on A4 Sheet)
              </span>
              <div
                className="border-[3px] border-[#002878] bg-white text-black p-2.5 flex flex-col justify-between rounded-xs shadow-2xl font-sans"
                style={{
                  width: '90mm',
                  height: '70mm',
                  minWidth: '90mm',
                  maxWidth: '90mm',
                  minHeight: '70mm',
                  maxHeight: '70mm',
                  boxSizing: 'border-box',
                }}
              >
                {/* Header Row: Date & Ward/Bed */}
                <div className="flex items-center justify-between text-[15px] font-black text-black px-0.5 border-b border-slate-300 pb-0.5">
                  <span className="font-mono">{shortDate}</span>
                  <span className="font-bold text-[#002878] uppercase">{wardBed}</span>
                </div>

                {/* Center Inpatient Info */}
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

            {/* Card 2 (Bottom-Right position on A4 Sheet) */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs font-bold text-slate-300">
                2. File Attached Card #2 (Bottom-Right on A4 Sheet)
              </span>
              <div
                className="border-[3px] border-[#002878] bg-white text-black p-2.5 flex flex-col justify-between rounded-xs shadow-2xl font-sans"
                style={{
                  width: '90mm',
                  height: '70mm',
                  minWidth: '90mm',
                  maxWidth: '90mm',
                  minHeight: '70mm',
                  maxHeight: '70mm',
                  boxSizing: 'border-box',
                }}
              >
                {/* Header Row: Date & Ward/Bed */}
                <div className="flex items-center justify-between text-[15px] font-black text-black px-0.5 border-b border-slate-300 pb-0.5">
                  <span className="font-mono">{shortDate}</span>
                  <span className="font-bold text-[#002878] uppercase">{wardBed}</span>
                </div>

                {/* Center Inpatient Info */}
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
          </div>
        </div>
      )}

      {/* FOCUS VIEW 3: PATIENT BEDSIDE NAME CARD (9×7 cm) */}
      {focusMode === 'name_card' && (
        <div className="w-full bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-blue-400 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              <span>Bedside Patient Name Card (Exact Size: 9 × 7 cm)</span>
            </h3>
            <span className="text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-700 px-2 py-1 rounded">
              Physical Card: 90 × 70 mm
            </span>
          </div>

          <div className="flex justify-center py-4">
            <div
              className="border-[3px] border-[#002878] bg-white text-black p-4 flex flex-col justify-center items-center text-center rounded-xs shadow-2xl"
              style={{
                width: '90mm',
                height: '70mm',
                minWidth: '90mm',
                maxWidth: '90mm',
                minHeight: '70mm',
                maxHeight: '70mm',
                boxSizing: 'border-box',
              }}
            >
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
          </div>
        </div>
      )}

      {/* FOCUS VIEW 4: DOCTOR SIGNS (9×7 cm) */}
      {focusMode === 'doctor_cards' && (
        <div className="w-full bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-blue-400 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-400" />
              <span>Doctor Door & Bedside Cards (Exact Size: 9 × 7 cm)</span>
            </h3>
            <span className="text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-700 px-2 py-1 rounded">
              Physical Card: 90 × 70 mm
            </span>
          </div>

          <div className="flex justify-center py-4">
            <div
              className="border-[3px] border-[#002878] bg-white text-black p-4 flex flex-col justify-center items-center text-center rounded-xs shadow-2xl"
              style={{
                width: '90mm',
                height: '70mm',
                minWidth: '90mm',
                maxWidth: '90mm',
                minHeight: '70mm',
                maxHeight: '70mm',
                boxSizing: 'border-box',
              }}
            >
              <div className="w-full flex flex-col justify-center items-center text-center">
                <span className="text-[34px] font-black text-black tracking-wider block font-sans uppercase text-center w-full">
                  {doctor.title}
                </span>
                <span className="text-[42px] font-black text-black tracking-tight block font-sans mt-1 leading-[1.02] break-words text-center w-full">
                  {doctor.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOCUS VIEW 5: VERTICAL ID TAGS (1.6×6.5 cm) */}
      {focusMode === 'id_tags' && (
        <div className="w-full bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-emerald-400 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-emerald-400" />
                <span>ID Tags for Specimen Tubes & Wristbands (1.6 × 6.5 cm)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All 9 identification fields formatted into 4 structured rows, precision-fitted to the 16mm × 65mm physical tag size.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-1 rounded">
              Physical Tags: 16 × 65 mm
            </span>
          </div>

          {/* Display Grid: Actual Size & Enlarged Reading View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Physical Size Tags (1:1) */}
            <div className="flex flex-col items-center bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">
                1:1 Scale Print Output (Two 16 × 65 mm Tags)
              </span>
              <div className="flex justify-center items-center gap-8 py-2">
                <div className="flex flex-col items-center gap-1.5">
                  <IdTagCard patient={patient} id="preview-id-tag-1" unfilledWardBed={false} />
                  <span className="text-[10px] font-mono text-slate-400">Tag #1 (Filled)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <IdTagCard patient={patient} id="preview-id-tag-2" unfilledWardBed={true} />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">Tag #2 (Unfilled W/B)</span>
                </div>
              </div>
            </div>

            {/* Right: Enlarged Horizontal Layout Inspection (65mm × 16mm) */}
            <div className="flex flex-col items-center bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">
                Rotated Content Inspection (2× Scale)
              </span>
              <div className="py-2 flex flex-col items-center space-y-2">
                {/* Horizontal representation for Tag 1 */}
                <div className="text-[10px] text-slate-400 font-mono w-full flex justify-between items-center">
                  <span>Tag #1 (Filled Ward & Bed):</span>
                </div>
                <div
                  className="border-[2px] border-[#002878] bg-white text-black p-2.5 rounded-xs shadow-xl flex flex-col justify-between font-sans"
                  style={{
                    width: '130mm',
                    height: '32mm',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Row 1: Header */}
                  <div className="flex items-center justify-between text-[11px] font-black text-black border-b border-slate-300 pb-0.5">
                    <span className="font-mono">{shortDate}</span>
                    <span className="font-bold text-[#002878] uppercase">{wardBed}</span>
                  </div>

                  {/* Row 2: Patient Name */}
                  <div className="text-[14px] font-black tracking-tight leading-tight text-black uppercase truncate">
                    {patientName}
                  </div>

                  {/* Row 3: Demographics */}
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-black tracking-tight leading-none">
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

                  {/* Row 4: Doctor & Allergy */}
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-black tracking-tight leading-none pt-0.5">
                    <span className="truncate">
                      C/O <strong className="font-black text-[#002878]">{doctor.full}</strong>
                    </span>
                    <span className="font-black text-red-700 uppercase">
                      ALLERGY: {allergyDisplay}
                    </span>
                  </div>
                </div>

                {/* Horizontal representation for Tag 2 (Unfilled Ward & Bed) */}
                <div className="text-[10px] text-emerald-400 font-mono w-full flex justify-between items-center pt-2">
                  <span>Tag #2 (Unfilled Ward & Bed):</span>
                </div>
                <div
                  className="border-[2px] border-[#002878] bg-white text-black p-2.5 rounded-xs shadow-xl flex flex-col justify-between font-sans"
                  style={{
                    width: '130mm',
                    height: '32mm',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Row 1: Header with Unfilled W: _____ B: _____ */}
                  <div className="flex items-center justify-between text-[11px] font-black text-black border-b border-slate-300 pb-0.5">
                    <span className="font-mono">{shortDate}</span>
                    <span className="font-bold text-[#002878] uppercase">W: _____ B: _____</span>
                  </div>

                  {/* Row 2: Patient Name */}
                  <div className="text-[14px] font-black tracking-tight leading-tight text-black uppercase truncate">
                    {patientName}
                  </div>

                  {/* Row 3: Demographics */}
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-black tracking-tight leading-none">
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

                  {/* Row 4: Doctor & Allergy */}
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-black tracking-tight leading-none pt-0.5">
                    <span className="truncate">
                      C/O <strong className="font-black text-[#002878]">{doctor.full}</strong>
                    </span>
                    <span className="font-black text-red-700 uppercase">
                      ALLERGY: {allergyDisplay}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Tag #1 includes ward & bed, while Tag #2 keeps ward & bed unfilled (<code className="text-emerald-400">W: _____ B: _____</code>) for specimen tubes and flexible transfer use.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
