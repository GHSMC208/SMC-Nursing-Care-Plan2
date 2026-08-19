import React, { useState } from 'react';
import { PatientDemographics, NursingCarePlan } from '../types';
import { PrintableCarePlan } from './PrintableCarePlan';
import { PrintableBedsideCardSheet } from './PrintableBedsideCardSheet';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  CheckCircle2,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';

export type PrintDocumentType = 'careplans' | 'bedside' | 'both_types';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientDemographics;
  carePlan1: NursingCarePlan;
  carePlan2: NursingCarePlan;
  printScope: 'both' | 'plan1' | 'plan2';
  onPrintScopeChange: (scope: 'both' | 'plan1' | 'plan2') => void;
  activeDocType?: PrintDocumentType;
  onDocTypeChange?: (docType: PrintDocumentType) => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  patient,
  carePlan1,
  carePlan2,
  printScope,
  onPrintScopeChange,
  activeDocType = 'careplans',
  onDocTypeChange,
}) => {
  const [docType, setDocType] = useState<PrintDocumentType>(activeDocType);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentDocType = onDocTypeChange ? activeDocType : docType;
  const handleSelectDocType = (type: PrintDocumentType) => {
    setDocType(type);
    if (onDocTypeChange) {
      onDocTypeChange(type);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="print-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="print-preview-modal-container"
        className="relative w-full max-w-6xl max-h-[96vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                A4 Print Preview & Export
              </h2>
              <p className="text-xs text-slate-500">
                {currentDocType === 'bedside'
                  ? 'Bedside & Door Label Sheet (A4 Landscape — Exact Hospital Template)'
                  : currentDocType === 'careplans'
                  ? 'Inpatient Nursing Care Plans (A4 Portrait — Clinical Formatted)'
                  : 'Complete Inpatient Bundle (Care Plans + Bedside Label Sheet)'}
              </p>
            </div>
          </div>

          {/* Document Type Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs">
              <button
                type="button"
                onClick={() => handleSelectDocType('bedside')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                  currentDocType === 'bedside'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Bedside & Door Labels (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDocType('careplans')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                  currentDocType === 'careplans'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Care Plans (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDocType('both_types')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                  currentDocType === 'both_types'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Documents</span>
              </button>
            </div>

            {/* Scope Selection (When Care Plans are visible) */}
            {(currentDocType === 'careplans' || currentDocType === 'both_types') && (
              <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => onPrintScopeChange('both')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    printScope === 'both'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Both Plans
                </button>
                <button
                  type="button"
                  onClick={() => onPrintScopeChange('plan1')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    printScope === 'plan1'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Plan 1
                </button>
                <button
                  type="button"
                  onClick={() => onPrintScopeChange('plan2')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    printScope === 'plan2'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Plan 2
                </button>
              </div>
            )}

            {/* Zoom Controls & Dimension Guide Toggle */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg border border-slate-200 p-1 text-xs gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1.5 rounded text-slate-500 hover:text-slate-900 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-slate-700 font-mono text-[11px] min-w-[42px] text-center font-bold">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1.5 rounded text-slate-500 hover:text-slate-900 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="px-2 py-1 rounded text-[10px] text-slate-600 hover:text-slate-900 transition-colors font-medium border-l border-slate-200"
                title="Reset to 100%"
              >
                100%
              </button>

              {currentDocType === 'bedside' && (
                <button
                  type="button"
                  onClick={() => setShowDimensions(!showDimensions)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all border-l border-slate-200 ml-1 flex items-center gap-1 ${
                    showDimensions
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Toggle 9x7cm and 1.6x6.5cm dimension rulers on screen"
                >
                  <Tag className="w-3 h-3" />
                  <span>{showDimensions ? 'Sizes On (9×7, 1.6×6.5)' : 'Sizes Off'}</span>
                </button>
              )}
            </div>

            <button
              id="confirm-print-btn"
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Instruction Subbar */}
        <div className="bg-blue-50/70 px-6 py-2.5 border-b border-blue-100 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Print Setting Tip:</strong> Paper size <span className="text-blue-800 font-bold">A4</span> •{' '}
              {currentDocType === 'bedside' ? (
                <>
                  Orientation: <span className="text-emerald-800 font-bold">Landscape</span> •{' '}
                </>
              ) : (
                <>
                  Orientation: <span className="text-blue-800 font-bold">Portrait</span> •{' '}
                </>
              )}
              Enable <span className="text-blue-800 font-bold">"Background Graphics"</span> in browser print dialog.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
            <span>A4 Size: 297mm × 210mm</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">
              {currentDocType === 'bedside'
                ? '1 Page (Bedside & Door Sheet)'
                : currentDocType === 'careplans'
                ? printScope === 'both'
                  ? '2 Pages Total'
                  : '1 Page Total'
                : printScope === 'both'
                ? '3 Pages Total (Care Plans + Bedside Sheet)'
                : '2 Pages Total'}
            </span>
          </div>
        </div>

        {/* Paper Canvas Scroll Area (Light Professional Neutral Canvas) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 space-y-10 flex flex-col items-center">
          <div
            className="w-full flex flex-col items-center space-y-10 transition-transform origin-top duration-150"
            style={{ transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined }}
          >
            {/* 1. Bedside & Door Label Sheet (A4 Landscape Layout) */}
            {(currentDocType === 'bedside' || currentDocType === 'both_types') && (
              <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-[297mm] text-xs font-bold text-slate-700 mb-2 flex items-center justify-between px-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>BEDSIDE & FILE CARDS SHEET (A4 LANDSCAPE — ALL 6 CARDS)</span>
                  </span>
                  <span className="text-emerald-700 font-mono text-[11px] font-bold">
                    2 Bedside Cards (9×7) • 2 ID Tags (1.6×6.5) • 2 File Attached Cards (9×7)
                  </span>
                </div>
                <div className="w-full max-w-[297mm] bg-white rounded-xs shadow-xl overflow-x-auto border border-slate-300">
                  <div className="min-w-[270mm] flex justify-center">
                    <PrintableBedsideCardSheet patient={patient} showDimensionBadges={showDimensions} />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Care Plan 1 */}
            {(currentDocType === 'careplans' || currentDocType === 'both_types') &&
              (printScope === 'both' || printScope === 'plan1') && (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-[210mm] text-xs font-bold text-slate-700 mb-2 flex items-center justify-between px-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span>PAGE 1: NURSING CARE PLAN #1 (A4 PORTRAIT)</span>
                    </span>
                    <span className="text-blue-700 font-mono text-[11px] font-bold">Upper-Right Inpatient Label Included</span>
                  </div>
                  <div className="w-full max-w-[210mm] bg-white rounded-xs shadow-xl overflow-hidden border border-slate-300">
                    <PrintableCarePlan
                      patient={patient}
                      carePlan={carePlan1}
                      planNumber={1}
                      totalPlans={printScope === 'both' ? 2 : 1}
                    />
                  </div>
                </div>
              )}

            {/* 3. Care Plan 2 */}
            {(currentDocType === 'careplans' || currentDocType === 'both_types') &&
              (printScope === 'both' || printScope === 'plan2') && (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-[210mm] text-xs font-bold text-slate-700 mb-2 flex items-center justify-between px-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                      <span>PAGE 2: NURSING CARE PLAN #2 (A4 PORTRAIT)</span>
                    </span>
                    <span className="text-blue-700 font-mono text-[11px] font-bold">Upper-Right Inpatient Label Included</span>
                  </div>
                  <div className="w-full max-w-[210mm] bg-white rounded-xs shadow-xl overflow-hidden border border-slate-300">
                    <PrintableCarePlan
                      patient={patient}
                      carePlan={carePlan2}
                      planNumber={2}
                      totalPlans={printScope === 'both' ? 2 : 1}
                    />
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
