import React, { useState } from 'react';
import { PatientDemographics } from '../types';
import {
  IdTagCard,
  formatShortDate,
  formatWardBed,
  getDoctorDisplay,
  formatAllergy,
} from './PrintableBedsideCardSheet';
import {
  User,
  Calendar,
  Bed,
  Hash,
  Stethoscope,
  Flag,
  Building2,
  Sparkles,
  DoorOpen,
  Edit3,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Info,
  Printer,
  Tag,
  FileText,
  Eye,
  Layers,
  Scissors,
} from 'lucide-react';

const PRESET_NATIONALITIES = ['Bahraini', 'Indian', 'Bangladish', 'Pakistan', 'Philippines'];

const COMMON_ALLERGIES = [
  'NKDA',
  'Penicillin',
  'Sulfa Drugs',
  'NSAIDs / Aspirin',
  'Cephalosporins',
  'Latex',
  'Opioids / Morphine',
  'Contrast Dye',
  'Food Allergies',
];

interface PatientDemographicsFormProps {
  patient: PatientDemographics;
  onChange: (updated: PatientDemographics) => void;
  onReset: () => void;
  onOpenPrintPreview?: (docType?: 'careplans' | 'bedside' | 'both_types') => void;
}

export const PatientDemographicsForm: React.FC<PatientDemographicsFormProps> = ({
  patient,
  onChange,
  onReset,
  onOpenPrintPreview,
}) => {
  const isPresetNationality = PRESET_NATIONALITIES.includes(patient.nationality);
  const [isManualNationality, setIsManualNationality] = useState<boolean>(
    !isPresetNationality && Boolean(patient.nationality)
  );
  const [previewTab, setPreviewTab] = useState<'label' | 'file_card' | 'id_tag'>('label');

  const handleFieldChange = (field: keyof PatientDemographics, value: any) => {
    const updated = {
      ...patient,
      [field]: value,
    };

    // Keep wardAndBedNumber in sync
    if (field === 'wardNumber' || field === 'bedNumber') {
      const w = field === 'wardNumber' ? value : patient.wardNumber;
      const b = field === 'bedNumber' ? value : patient.bedNumber;
      updated.wardAndBedNumber = w && b ? `${w}, Bed ${b}` : w || b || '';
    }

    onChange(updated);
  };

  const handleAllergyPresetClick = (allergy: string) => {
    const current = (patient.allergies || '').trim();

    if (allergy === 'NKDA (No Known Drug Allergies)') {
      handleFieldChange('allergies', 'NKDA (No Known Drug Allergies)');
      return;
    }

    // If current was NKDA or empty, replace with this allergy
    if (!current || current.toLowerCase().includes('nkda') || current.toLowerCase().includes('no known')) {
      handleFieldChange('allergies', allergy);
      return;
    }

    // Otherwise split by comma and toggle
    const items = current.split(',').map((s) => s.trim()).filter(Boolean);
    const existingIndex = items.findIndex((item) => item.toLowerCase() === allergy.toLowerCase());

    if (existingIndex >= 0) {
      items.splice(existingIndex, 1);
      handleFieldChange('allergies', items.length > 0 ? items.join(', ') : 'NKDA (No Known Drug Allergies)');
    } else {
      items.push(allergy);
      handleFieldChange('allergies', items.join(', '));
    }
  };

  const isNkda =
    Boolean(patient.allergies?.trim()) &&
    (patient.allergies?.toLowerCase().includes('nkda') ||
      patient.allergies?.toLowerCase().includes('no known'));

  const hasSpecificAllergies = Boolean(patient.allergies?.trim()) && !isNkda;

  const setTodayAdmission = () => {
    const today = new Date().toISOString().split('T')[0];
    handleFieldChange('dateOfAdmission', today);
  };

  const wardDisplay = patient.wardNumber || (patient.wardAndBedNumber ? patient.wardAndBedNumber.split(',')[0]?.trim() : '');
  const bedDisplay = patient.bedNumber || (patient.wardAndBedNumber ? patient.wardAndBedNumber.split(',')[1]?.replace(/^Bed\s*/i, '').trim() : '');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Inpatient Demographics & Upper-Right Label Data
            </h2>
            <p className="text-xs text-slate-500">
              Required for the hospital identification label printed on the top-right of both care plans
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2 text-xs">
          {/* Clear Fields Button */}
          <button
            id="clear-demographics-fields-btn"
            type="button"
            onClick={onReset}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-all text-xs flex items-center gap-1.5 shadow-2xs"
            title="Clear all demographic inputs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Fields</span>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Fields (8 Cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Patient Full Name */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" /> Patient Full Name *
            </label>
            <input
              id="patient-full-name-input"
              type="text"
              placeholder="e.g., Eleanor Vance"
              value={patient.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 2. Patient ID / MRN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-blue-600" /> ID Number (MRN) *
            </label>
            <input
              id="patient-id-input"
              type="text"
              placeholder="e.g., MRN-8492015"
              value={patient.idNumber}
              onChange={(e) => handleFieldChange('idNumber', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono placeholder:text-slate-400"
            />
          </div>

          {/* 3. Age */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Age *
            </label>
            <input
              id="patient-age-input"
              type="number"
              min="0"
              max="130"
              placeholder="e.g., 58"
              value={patient.age}
              onChange={(e) => handleFieldChange('age', e.target.value ? parseInt(e.target.value, 10) : '')}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 4. Sex */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Sex *
            </label>
            <select
              id="patient-sex-select"
              value={patient.sex || ''}
              onChange={(e) => handleFieldChange('sex', e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value="" disabled>-- Select Sex --</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          {/* 5. Nationality */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-blue-600" /> Nationality *
              </label>
              <button
                type="button"
                onClick={() => setIsManualNationality(!isManualNationality)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline"
              >
                <Edit3 className="w-3 h-3" />
                {isManualNationality ? 'Choose from list' : 'Type other manually'}
              </button>
            </div>

            {!isManualNationality ? (
              <select
                id="patient-nationality-select"
                value={isPresetNationality ? patient.nationality : (patient.nationality ? 'Other' : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    setIsManualNationality(true);
                  } else {
                    handleFieldChange('nationality', val);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              >
                <option value="" disabled>-- Select Nationality --</option>
                <option value="Bahraini">Bahraini</option>
                <option value="Indian">Indian</option>
                <option value="Bangladish">Bangladish</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Philippines">Philippines</option>
                <option value="Other">Other / Custom Nationality (Type manually)...</option>
              </select>
            ) : (
              <div className="space-y-1.5">
                <div className="relative flex items-center">
                  <input
                    id="patient-nationality-input"
                    type="text"
                    placeholder="Type nationality manually..."
                    value={patient.nationality}
                    onChange={(e) => handleFieldChange('nationality', e.target.value)}
                    className="w-full pl-3.5 pr-20 py-2.5 bg-white border border-blue-500 ring-1 ring-blue-500/20 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsManualNationality(false)}
                    className="absolute right-2 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 transition-all"
                  >
                    List View
                  </button>
                </div>
              </div>
            )}

            {/* Quick-Pick Preset Pills */}
            <div className="mt-1.5 flex flex-wrap gap-1 items-center">
              {PRESET_NATIONALITIES.map((nat) => (
                <button
                  key={nat}
                  type="button"
                  onClick={() => {
                    handleFieldChange('nationality', nat);
                    setIsManualNationality(false);
                  }}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all ${
                    patient.nationality === nat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {nat}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Date of Admission */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Date of Admission *
              </label>
              <button
                type="button"
                onClick={setTodayAdmission}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Set Today
              </button>
            </div>
            <input
              id="patient-admission-date-input"
              type="date"
              value={patient.dateOfAdmission}
              onChange={(e) => handleFieldChange('dateOfAdmission', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* 7. Ward Number (Separated) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <DoorOpen className="w-3.5 h-3.5 text-blue-600" /> Ward Number *
            </label>
            <input
              id="patient-ward-number-input"
              type="text"
              placeholder="e.g., Ward 4B / 4B"
              value={patient.wardNumber || ''}
              onChange={(e) => handleFieldChange('wardNumber', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 8. Bed Number (Separated) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-blue-600" /> Bed Number *
            </label>
            <input
              id="patient-bed-number-input"
              type="text"
              placeholder="e.g., 12 / Bed 12"
              value={patient.bedNumber || ''}
              onChange={(e) => handleFieldChange('bedNumber', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 9. Caring Doctor (DR) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Caring Doctor (DR) *
            </label>
            <input
              id="patient-caring-dr-input"
              type="text"
              placeholder="e.g., Dr. Michael Chen, MD"
              value={patient.caringDoctor}
              onChange={(e) => handleFieldChange('caringDoctor', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Hospital / Health Facility Name */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Hospital / Health Facility Name
            </label>
            <input
              id="patient-hospital-name-input"
              type="text"
              placeholder="e.g., Salmaniya Medical Complex"
              value={patient.hospitalName || ''}
              onChange={(e) => handleFieldChange('hospitalName', e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* 10. Patient Allergies / Adverse Drug Reactions Entry (Digital Kardex Record) */}
          <div className="md:col-span-2 lg:col-span-3 pt-2">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold border border-amber-300">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      Patient Allergies & Adverse Drug Reactions (ADR)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Logged in clinical intake • <strong className="text-amber-800 font-semibold">Excluded from care plan print</strong>
                    </span>
                  </div>
                </div>

                {/* Status Indicator Badge */}
                {isNkda ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    NKDA Confirmed
                  </span>
                ) : hasSpecificAllergies ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300 animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Allergies Recorded
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    No allergy entry yet
                  </span>
                )}
              </div>

              {/* Allergy Text Input */}
              <div className="space-y-1.5">
                <input
                  id="patient-allergies-input"
                  type="text"
                  placeholder="e.g., NKDA (No Known Drug Allergies) or Penicillin (Anaphylaxis), Morphine (Severe Nausea)"
                  value={patient.allergies || ''}
                  onChange={(e) => handleFieldChange('allergies', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
                    hasSpecificAllergies
                      ? 'border-rose-300 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                      : isNkda
                      ? 'border-emerald-300 text-emerald-900 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : 'border-slate-300 text-slate-900 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
              </div>

              {/* Common Allergy Quick-Select Pills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Quick Clinical Presets & Common Allergens:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('allergies', 'NKDA (No Known Drug Allergies)')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3" /> Set NKDA
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {COMMON_ALLERGIES.map((allergen) => {
                    const isSelected =
                      patient.allergies &&
                      patient.allergies.toLowerCase().includes(allergen.toLowerCase());
                    const isNkdaBtn = allergen.startsWith('NKDA');

                    return (
                      <button
                        key={allergen}
                        type="button"
                        onClick={() => handleAllergyPresetClick(allergen)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 ${
                          isSelected
                            ? isNkdaBtn
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : isNkdaBtn
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <span>✓</span>}
                        {allergen}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Documentation Clarification Banner */}
              <div className="pt-2 border-t border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900">
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Print Compliance:</strong> In accordance with clinical nursing care plan formatting standards, allergy details are maintained in this electronic chart record and are <strong>not printed</strong> on the physical A4 care plan sheet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Column: Live Previews (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-start">
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm border border-slate-800 relative overflow-hidden space-y-3">
            {/* Header Tabs */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 gap-2">
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs flex-wrap">
                <button
                  type="button"
                  onClick={() => setPreviewTab('label')}
                  className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 ${
                    previewTab === 'label'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="View Upper-Right Care Plan Official Label"
                >
                  <Tag className="w-3 h-3" />
                  <span>Plan Label (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('file_card')}
                  className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 ${
                    previewTab === 'file_card'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-emerald-400 hover:text-white'
                  }`}
                  title="View 9x7cm File Attached Inpatient Card"
                >
                  <FileText className="w-3 h-3 text-emerald-400" />
                  <span>File Card (9×7)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('id_tag')}
                  className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1 ${
                    previewTab === 'id_tag'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-emerald-400 hover:text-white'
                  }`}
                  title="View 1.6×6.5cm Vertical Specimen & Wristband ID Tag"
                >
                  <Scissors className="w-3 h-3 text-emerald-400" />
                  <span>ID Tag (1.6×6.5)</span>
                </button>
              </div>

              {onOpenPrintPreview && (
                <button
                  type="button"
                  onClick={() => onOpenPrintPreview(previewTab === 'label' ? 'careplans' : 'bedside')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 shrink-0"
                  title="Print this formatted sheet"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              )}
            </div>

            {/* TAB 1: UPPER-RIGHT CARE PLAN LABEL PREVIEW (DEFAULT) */}
            {previewTab === 'label' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-bold text-blue-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    Upper-Right Print Label Preview
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Kardex Sticker</span>
                </div>

                {/* The exact official inpatient label formatting */}
                <div
                  id="upper-right-patient-label-preview"
                  className="bg-white text-slate-900 p-3.5 rounded-lg border border-slate-300 shadow-sm font-sans text-xs space-y-2"
                >
                  <div className="flex justify-between items-start border-b border-slate-200 pb-1.5">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Patient Full Name</span>
                      <p className="font-bold text-sm text-slate-900 tracking-tight">
                        {patient.fullName || '— [Full Name Required] —'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">ID / CPR</span>
                      <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-slate-800">
                        {patient.idNumber || 'CPR-XXXXXXX'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px] border-b border-slate-200 pb-1.5">
                    <div>
                      <span className="text-[9px] text-slate-500 block">AGE</span>
                      <span className="font-bold">{patient.age ? `${patient.age} yrs` : '—'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">SEX</span>
                      <span className="font-bold">{patient.sex || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">NATIONALITY</span>
                      <span className="font-bold truncate block">{patient.nationality || '—'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] border-b border-slate-200 pb-1.5">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-semibold">WARD NO.</span>
                      <span className="font-bold text-slate-900 truncate block">{wardDisplay || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-semibold">BED NO.</span>
                      <span className="font-bold text-blue-700 truncate block">{bedDisplay || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-semibold">ADMISSION</span>
                      <span className="font-bold truncate block">{patient.dateOfAdmission || '—'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 block font-semibold">CARING DOCTOR (DR)</span>
                    <span className="font-bold text-slate-900 block truncate">{patient.caringDoctor || '—'}</span>
                  </div>
                </div>

                {/* Inpatient Allergy Status Badge in Preview */}
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    <span>Inpatient Allergy Status:</span>
                    <span className="text-amber-400 font-normal">Not in care plan print</span>
                  </div>
                  <div className="text-xs font-semibold">
                    {isNkda ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {patient.allergies || 'NKDA (No Known Drug Allergies)'}
                      </span>
                    ) : hasSpecificAllergies ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {patient.allergies}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">
                        — No allergy status entered —
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DEDICATED FILE ATTACHED CARD PREVIEW (9x7 cm) */}
            {previewTab === 'file_card' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    File Attached Inpatient Card (9 × 7 cm)
                  </span>
                  <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700">
                    90 × 70 mm
                  </span>
                </div>

                <div className="flex justify-center p-2 bg-slate-950/80 rounded-lg border border-slate-700">
                  <div
                    className="border-[3px] border-[#002878] bg-white text-black p-3 flex flex-col justify-between rounded-xs shadow-xl font-sans"
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
                    <div className="flex items-center justify-between text-[13px] font-black text-black px-0.5 border-b border-slate-300 pb-0.5">
                      <span className="font-mono">{formatShortDate(patient.dateOfAdmission)}</span>
                      <span className="font-bold text-[#002878] uppercase">{formatWardBed(patient)}</span>
                    </div>

                    {/* Center Inpatient Info */}
                    <div className="flex flex-col justify-evenly flex-1 py-1 text-center space-y-1">
                      <h2 className="text-[16.5px] font-black text-black tracking-tight leading-tight uppercase truncate">
                        {patient.fullName || 'Patient Name'}
                      </h2>

                      <div className="text-[14px] font-bold text-black tracking-wide leading-none">
                        <span>CPR </span>
                        <strong className="font-mono font-black ml-1">{patient.idNumber || '—'}</strong>
                      </div>

                      <div className="text-[13px] font-bold text-black tracking-wide leading-none">
                        <span>{patient.age ? `${patient.age} YRS` : '— YRS'}</span>
                        <span className="mx-1.5 font-black">•</span>
                        <strong className="font-black">({patient.sex ? (patient.sex.toUpperCase().startsWith('M') ? 'M' : 'F') : '—'})</strong>
                        <span className="mx-1.5 font-black">•</span>
                        <strong className="font-black text-slate-800 uppercase">{(patient.nationality || 'BAHRAINI').toUpperCase()}</strong>
                      </div>

                      <div className="text-[13px] font-bold text-black leading-none truncate">
                        <span>C/O </span>
                        <strong className="font-black text-[#002878]">{getDoctorDisplay(patient.caringDoctor).full}</strong>
                      </div>

                      <div className="text-[13px] font-bold text-black tracking-tight leading-none pt-0.5">
                        <span>ALLERGY: </span>
                        <strong className="font-black uppercase text-red-700">{formatAllergy(patient.allergies)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  This card appears in the right column of the A4 sheet (Top-Right & Bottom-Right) for attaching directly to inpatient files and Kardex charts.
                </p>
              </div>
            )}

            {/* TAB 3: DEDICATED ID TAG PREVIEW (1.6x6.5 cm) */}
            {previewTab === 'id_tag' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Specimen & Wristband ID Tag (1.6 × 6.5 cm)
                  </span>
                  <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700">
                    16 × 65 mm
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-slate-950/80 rounded-lg border border-slate-700 space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">1:1 Physical Size Output</span>
                  <div className="flex items-center justify-center gap-4 py-1">
                    <IdTagCard patient={patient} id="form-preview-id-tag-1" />
                    <IdTagCard patient={patient} id="form-preview-id-tag-2" />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[10.5px] text-slate-300 space-y-1">
                  <div className="font-bold text-emerald-400">4-Row Precision Content Calibration:</div>
                  <div className="text-[10px] text-slate-300 space-y-0.5">
                    <div>• <strong>Row 1:</strong> Date ({formatShortDate(patient.dateOfAdmission)}) & Ward/Bed ({formatWardBed(patient)})</div>
                    <div>• <strong>Row 2:</strong> {patient.fullName || 'Patient Full Name'} (Bold Uppercase)</div>
                    <div>• <strong>Row 3:</strong> CPR {patient.idNumber || '—'} • {patient.age ? `${patient.age} YRS` : '— YRS'} ({patient.sex ? (patient.sex.toUpperCase().startsWith('M') ? 'M' : 'F') : '—'}) • {(patient.nationality || 'BAHRAINI').toUpperCase()}</div>
                    <div>• <strong>Row 4:</strong> C/O {getDoctorDisplay(patient.caringDoctor).full} • ALLERGY: {formatAllergy(patient.allergies)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
