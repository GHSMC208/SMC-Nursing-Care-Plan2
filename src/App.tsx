import React, { useState, useEffect } from 'react';
import { PatientDemographics, NursingCarePlan, InpatientRecord, NandaItem } from './types';
import { PatientDemographicsForm } from './components/PatientDemographicsForm';
import { CarePlanEditor } from './components/CarePlanEditor';
import { NandaSearchModal } from './components/NandaSearchModal';
import { PrintableCarePlan } from './components/PrintableCarePlan';
import { PrintableBedsideCardSheet } from './components/PrintableBedsideCardSheet';
import { ResponsiveBedsideSheetView } from './components/ResponsiveBedsideSheetView';
import { PrintPreviewModal, PrintDocumentType } from './components/PrintPreviewModal';
import { SavedRecordsModal } from './components/SavedRecordsModal';
import governmentHospitalsLogo from './assets/images/bahrain_gov_hospitals_logo_1787046319692.jpg';
import {
  FileSpreadsheet,
  Printer,
  Eye,
  Plus,
  Save,
  RotateCcw,
  BookOpen,
  CheckCircle,
  FolderOpen,
  Sparkles,
  Download,
  Upload,
  ArrowRightLeft,
  Columns,
  Layers,
  Heart,
  Stethoscope,
  Info,
  AlertTriangle,
  ShieldCheck,
  Tag,
  FileText,
} from 'lucide-react';

const STORAGE_KEY = 'inpatient_nursing_care_plans_records';

const BLANK_INITIAL_PATIENT: PatientDemographics = {
  fullName: '',
  idNumber: '',
  age: '',
  sex: '',
  nationality: '',
  dateOfAdmission: '',
  wardNumber: '',
  bedNumber: '',
  wardAndBedNumber: '',
  caringDoctor: '',
  hospitalName: 'Salmaniya Medical Complex',
  departmentUnit: '',
  allergies: 'NKDA',
};

const BLANK_INITIAL_CARE_PLAN_1: NursingCarePlan = {
  id: 'cp1-initial',
  planNumber: 1,
  title: 'Priority Nursing Care Plan #1',
  nandaCode: '',
  diagnosis: '',
  domain: '',
  dateOfOnset: '',
  relatedFactors: '',
  expectedOutcome: '',
  interventions: '',
  evaluation: '',
  status: 'Active',
};

const BLANK_INITIAL_CARE_PLAN_2: NursingCarePlan = {
  id: 'cp2-initial',
  planNumber: 2,
  title: 'Secondary Nursing Care Plan #2',
  nandaCode: '',
  diagnosis: '',
  domain: '',
  dateOfOnset: '',
  relatedFactors: '',
  expectedOutcome: '',
  interventions: '',
  evaluation: '',
  status: 'Active',
};

export default function App() {
  // Current active patient demographics (starts completely empty)
  const [patient, setPatient] = useState<PatientDemographics>(BLANK_INITIAL_PATIENT);

  // Care Plan 1 (Priority 1)
  const [carePlan1, setCarePlan1] = useState<NursingCarePlan>(BLANK_INITIAL_CARE_PLAN_1);

  // Care Plan 2 (Priority 2)
  const [carePlan2, setCarePlan2] = useState<NursingCarePlan>(BLANK_INITIAL_CARE_PLAN_2);

  // Active Tab for editing on mobile/single view: 'demographics' | 'bedside-sheet' | 'plan1' | 'plan2' | 'split' | 'preview'
  const [activeTab, setActiveTab] = useState<'demographics' | 'bedside-sheet' | 'plan1' | 'plan2' | 'split' | 'preview'>('demographics');

  // NANDA Search Modal State
  const [nandaModalOpen, setNandaModalOpen] = useState(false);
  const [nandaTargetPlan, setNandaTargetPlan] = useState<1 | 2>(1);

  // Print Preview Modal, print scope, and document type
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printScope, setPrintScope] = useState<'both' | 'plan1' | 'plan2'>('both');
  const [printDocType, setPrintDocType] = useState<PrintDocumentType>('careplans');
  const [showBedsideDimensions, setShowBedsideDimensions] = useState<boolean>(true);

  // Saved Inpatients List
  const [savedRecords, setSavedRecords] = useState<InpatientRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: InpatientRecord[] = JSON.parse(stored);
        // Ensure hospital name and separate ward & bed numbers are initialized
        return parsed.map((r) => {
          let wardNumber = r.patient.wardNumber || '';
          let bedNumber = r.patient.bedNumber || '';
          if (!wardNumber && !bedNumber && r.patient.wardAndBedNumber) {
            const parts = r.patient.wardAndBedNumber.split(',');
            wardNumber = parts[0]?.trim() || '';
            bedNumber = parts[1]?.replace(/^Bed\s*/i, '').trim() || '';
          }
          return {
            ...r,
            patient: {
              ...r.patient,
              wardNumber,
              bedNumber,
              wardAndBedNumber: r.patient.wardAndBedNumber || (wardNumber && bedNumber ? `${wardNumber}, Bed ${bedNumber}` : wardNumber || bedNumber),
              hospitalName: r.patient.hospitalName || 'Salmaniya Medical Complex',
              allergies: r.patient.allergies !== undefined ? r.patient.allergies : 'NKDA (No Known Drug Allergies)',
            },
          };
        });
      }
    } catch (e) {
      console.error('Failed to load records from localStorage', e);
    }
    return [];
  });

  const [recordsModalOpen, setRecordsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to localStorage whenever savedRecords change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  }, [savedRecords]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load a record from saved records
  const handleLoadRecord = (record: InpatientRecord) => {
    setPatient(record.patient);
    setCarePlan1(record.carePlan1);
    setCarePlan2(record.carePlan2);
    showToast(`Loaded care plan: ${record.patient.fullName}`);
  };

  // Delete a record from saved records
  const handleDeleteRecord = (id: string) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('Record deleted from saved list');
  };

  // Import records
  const handleImportRecords = (newRecords: InpatientRecord[]) => {
    setSavedRecords((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const filteredNew = newRecords.filter((r) => !existingIds.has(r.id));
      return [...filteredNew, ...prev];
    });
    showToast(`Imported ${newRecords.length} care plan records`);
  };

  // Open NANDA search modal for a specific plan
  const handleOpenNandaSearch = (planNum: 1 | 2) => {
    setNandaTargetPlan(planNum);
    setNandaModalOpen(true);
  };

  // When NANDA is selected from modal
  const handleApplyNanda = (
    item: NandaItem,
    selectedRelatedFactors: string[],
    selectedOutcomes: string[],
    selectedInterventions: string[]
  ) => {
    const formattedFactors = selectedRelatedFactors.join('\n• ');
    const formattedOutcomes = selectedOutcomes.join('\n• ');
    const formattedInterventions = selectedInterventions
      .map((text, idx) => `${idx + 1}. ${text}`)
      .join('\n');

    const updater = (prev: NursingCarePlan): NursingCarePlan => ({
      ...prev,
      diagnosis: item.diagnosis,
      nandaCode: item.code || '',
      domain: item.domain,
      relatedFactors: `• ${formattedFactors}`,
      expectedOutcome: `• ${formattedOutcomes}`,
      interventions: formattedInterventions,
      dateOfOnset: prev.dateOfOnset || patient.dateOfAdmission || new Date().toISOString().split('T')[0],
    });

    if (nandaTargetPlan === 1) {
      setCarePlan1(updater);
      showToast(`Applied "${item.diagnosis}" to Care Plan #1`);
    } else {
      setCarePlan2(updater);
      showToast(`Applied "${item.diagnosis}" to Care Plan #2`);
    }
  };

  // Swap Plan 1 and Plan 2 priority
  const handleSwapPlans = () => {
    const temp1 = { ...carePlan1, planNumber: 2 as 1 | 2 };
    const temp2 = { ...carePlan2, planNumber: 1 as 1 | 2 };
    setCarePlan1(temp2);
    setCarePlan2(temp1);
    showToast('Swapped Priority between Care Plan #1 and #2');
  };

  // Clear Demographics only
  const handleClearDemographics = () => {
    setPatient(BLANK_INITIAL_PATIENT);
    showToast('Inpatient demographic fields cleared');
  };

  // Clear Care Plan 1
  const handleClearPlan1 = () => {
    setCarePlan1(BLANK_INITIAL_CARE_PLAN_1);
    showToast('Care Plan #1 fields cleared');
  };

  // Clear Care Plan 2
  const handleClearPlan2 = () => {
    setCarePlan2(BLANK_INITIAL_CARE_PLAN_2);
    showToast('Care Plan #2 fields cleared');
  };

  // Clear all fields (Demographics and both Care Plans)
  const handleClearAllFields = () => {
    setPatient(BLANK_INITIAL_PATIENT);
    setCarePlan1(BLANK_INITIAL_CARE_PLAN_1);
    setCarePlan2(BLANK_INITIAL_CARE_PLAN_2);
    showToast('All fields cleared');
  };

  // Create new blank inpatient record
  const handleNewRecord = () => {
    setPatient(BLANK_INITIAL_PATIENT);
    setCarePlan1(BLANK_INITIAL_CARE_PLAN_1);
    setCarePlan2(BLANK_INITIAL_CARE_PLAN_2);
    setActiveTab('demographics');
    showToast('New blank inpatient care plan initialized');
  };

  // Save current inpatient record to local records
  const handleSaveCurrentRecord = () => {
    if (!patient.fullName.trim()) {
      showToast('Please enter Patient Full Name before saving');
      setActiveTab('demographics');
      return;
    }

    const currentId = `rec-${Date.now()}`;
    const newRecord: InpatientRecord = {
      id: currentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient,
      carePlan1,
      carePlan2,
    };

    setSavedRecords((prev) => [newRecord, ...prev.filter((r) => r.patient.idNumber !== patient.idNumber)]);
    showToast(`Saved care plan for ${patient.fullName}`);
  };

  // Direct print trigger
  const handleDirectPrintCarePlans = () => {
    setPrintDocType('careplans');
    setTimeout(() => {
      window.print();
    }, 60);
  };

  const handleDirectPrintBedside = () => {
    setPrintDocType('bedside');
    setTimeout(() => {
      window.print();
    }, 60);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle className="w-4 h-4 text-blue-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Application Navigation Bar (Hidden on Print) */}
      <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <img
              src={governmentHospitalsLogo}
              alt="Government Hospitals Logo"
              className="w-10 h-10 object-contain shrink-0 rounded-lg bg-white p-0.5 border border-slate-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                Inpatient Care Plan Suite
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 hidden sm:inline">
                  Government Hospitals • SMC
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Standard NANDA-I taxonomy • Upper-right patient label • A4 Bedside & Door Card printouts
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2">
            <button
              id="saved-records-btn"
              type="button"
              onClick={() => setRecordsModalOpen(true)}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="View and manage saved inpatient care plans"
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Saved Drafts</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                {savedRecords.length}
              </span>
            </button>

            <button
              id="new-care-plan-btn"
              type="button"
              onClick={handleNewRecord}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="Create New Blank Care Plan"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">New Patient</span>
            </button>

            <button
              id="clear-all-fields-btn"
              type="button"
              onClick={handleClearAllFields}
              className="px-3 py-2 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-xs border border-slate-300 hover:border-rose-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="Clear all demographic and care plan fields"
            >
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span className="hidden md:inline">Clear All</span>
            </button>

            <button
              id="save-care-plan-btn"
              type="button"
              onClick={handleSaveCurrentRecord}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="Save to local patient records"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Save Draft</span>
            </button>

            <button
              id="preview-print-modal-btn"
              type="button"
              onClick={() => setPrintPreviewOpen(true)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title="Open Printable Care Plans & Bedside Card Preview"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Print Preview</span>
            </button>

            <button
              id="instant-bedside-print-btn"
              type="button"
              onClick={handleDirectPrintBedside}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title="Print Bedside & Door Card Sheet (A4 Landscape Layout)"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Print Bedside Sheet</span>
            </button>

            <button
              id="instant-print-btn"
              type="button"
              onClick={handleDirectPrintCarePlans}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5"
              title="Send Care Plans directly to browser print / save PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Care Plans</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Hidden on Print) */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Patient Summary Banner & View Mode Switcher */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
              Pt
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900">
                  {patient.fullName || 'Unnamed Inpatient'}
                </span>
                {patient.idNumber && (
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {patient.idNumber}
                  </span>
                )}
                {patient.wardAndBedNumber && (
                  <span className="text-xs text-blue-800 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {patient.wardAndBedNumber}
                  </span>
                )}
                {patient.allergies && (
                  patient.allergies.toLowerCase().includes('nkda') || patient.allergies.toLowerCase().includes('no known') ? (
                    <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      NKDA
                    </span>
                  ) : (
                    <span
                      className="text-xs text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1"
                      title={patient.allergies}
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Allergies: {patient.allergies.length > 25 ? `${patient.allergies.slice(0, 25)}...` : patient.allergies}
                    </span>
                  )
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Admitted: {patient.dateOfAdmission || 'Not set'} • Caring DR: {patient.caringDoctor || 'Not set'}
              </p>
            </div>
          </div>

          {/* Navigation View Mode Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs flex-wrap gap-1">
            <button
              id="nav-tab-demographics"
              type="button"
              onClick={() => setActiveTab('demographics')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'demographics'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Inpatient Details & Label
            </button>

            <button
              id="nav-tab-bedside-sheet"
              type="button"
              onClick={() => setActiveTab('bedside-sheet')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'bedside-sheet'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Bedside & Door Label Printout (Exact Attached Layout)"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>2. Bedside & Door Sheet (A4)</span>
            </button>

            <button
              id="nav-tab-plan1"
              type="button"
              onClick={() => setActiveTab('plan1')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'plan1'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Care Plan #1</span>
              {carePlan1.diagnosis && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
              )}
            </button>

            <button
              id="nav-tab-plan2"
              type="button"
              onClick={() => setActiveTab('plan2')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'plan2'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Care Plan #2</span>
              {carePlan2.diagnosis && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              )}
            </button>

            <button
              id="nav-tab-split"
              type="button"
              onClick={() => setActiveTab('split')}
              className={`hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'split'
                  ? 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View both Care Plans side-by-side"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual Split View</span>
            </button>

            <button
              id="nav-tab-preview"
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View full A4 Printable Sheets"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 Print View</span>
            </button>
          </div>
        </div>

        {/* View Section 1: Demographics */}
        {activeTab === 'demographics' && (
          <div className="space-y-6">
            <PatientDemographicsForm
              patient={patient}
              onChange={setPatient}
              onReset={handleClearDemographics}
              onOpenPrintPreview={(docType) => {
                setPrintDocType(docType);
                setPrintPreviewOpen(true);
              }}
            />

            <div className="flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setPrintDocType('bedside');
                  setActiveTab('bedside-sheet');
                }}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>View Bedside & Door Card Sheet (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('plan1')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <span>Proceed to Care Plan #1 Editor</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>
        )}

        {/* View Section 1.5: Bedside & Door Card Sheet (A4 Landscape Layout) */}
        {activeTab === 'bedside-sheet' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="text-sm font-bold text-slate-900">
                    A4 Landscape Bedside, Door & Kardex Identification Sheet
                  </span>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    Exact Hospital Sizes (9×7 cm & 1.6×6.5 cm)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Single A4 landscape sheet (27×14 cm grid) containing 4 card types ready to cut: Bedside Cards, Doctor Door Signs, File Attached Kardex Cards, and Vertical Specimen/Wristband ID Tags.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBedsideDimensions(!showBedsideDimensions)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    showBedsideDimensions
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                      : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                  }`}
                  title="Toggle 9x7cm and 1.6x6.5cm dimension markers"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{showBedsideDimensions ? 'Dimension Rulers: On' : 'Dimension Rulers: Off'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrintDocType('bedside');
                    setPrintPreviewOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Interactive Zoom Preview</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectPrintBedside}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print A4 Bedside Sheet</span>
                </button>
              </div>
            </div>

            {/* Specifications Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>1. Bedside Cards</span>
                  <span className="text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">9 × 7 cm</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>[Name, Caring Dr]</strong>: Top-left patient wall/bedhead card & top-middle / bottom-left doctor door clipboards.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>2. File Attached Cards</span>
                  <span className="text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">9 × 7 cm</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>[Admission, Ward, Bed, Name, ID, Age, Sex, Caring Dr, Allergy]</strong>: Top-right & bottom-right inpatient file cards.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>3. Vertical ID Tags</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">1.6 × 6.5 cm</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>[Full Inpatient Info + Allergy]</strong>: 2 rotated vertical strips for lab test tubes, blood tubes, and wristbands.
                </p>
              </div>
            </div>

            {/* Rendered Bedside Sheet */}
            <div className="w-full flex flex-col items-center">
              <ResponsiveBedsideSheetView
                patient={patient}
                showDimensionBadges={showBedsideDimensions}
                onToggleDimensions={() => setShowBedsideDimensions(!showBedsideDimensions)}
              />
            </div>

            {/* Bottom Nav */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setActiveTab('demographics')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs"
              >
                ← Edit Inpatient Demographic Fields
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('plan1')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <span>Go to Care Plan #1</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>
        )}

        {/* View Section 2: Care Plan 1 */}
        {activeTab === 'plan1' && (
          <div className="space-y-6">
            <CarePlanEditor
              plan={carePlan1}
              planNumber={1}
              onChange={setCarePlan1}
              onOpenNandaSearch={() => handleOpenNandaSearch(1)}
              onSwapWithOtherPlan={handleSwapPlans}
              onClearPlan={handleClearPlan1}
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('demographics')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs"
              >
                ← Edit Inpatient Label Details
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('plan2')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <span>Proceed to Care Plan #2</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>
        )}

        {/* View Section 3: Care Plan 2 */}
        {activeTab === 'plan2' && (
          <div className="space-y-6">
            <CarePlanEditor
              plan={carePlan2}
              planNumber={2}
              onChange={setCarePlan2}
              onOpenNandaSearch={() => handleOpenNandaSearch(2)}
              onSwapWithOtherPlan={handleSwapPlans}
              onClearPlan={handleClearPlan2}
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('plan1')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs"
              >
                ← Back to Care Plan #1
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrintDocType('careplans');
                  setPrintPreviewOpen(true);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Open Printable Care Plans</span>
              </button>
            </div>
          </div>
        )}

        {/* View Section 4: Dual Split View (Large screens) */}
        {activeTab === 'split' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CarePlanEditor
                plan={carePlan1}
                planNumber={1}
                onChange={setCarePlan1}
                onOpenNandaSearch={() => handleOpenNandaSearch(1)}
                onSwapWithOtherPlan={handleSwapPlans}
                onClearPlan={handleClearPlan1}
              />
              <CarePlanEditor
                plan={carePlan2}
                planNumber={2}
                onChange={setCarePlan2}
                onOpenNandaSearch={() => handleOpenNandaSearch(2)}
                onSwapWithOtherPlan={handleSwapPlans}
                onClearPlan={handleClearPlan2}
              />
            </div>
          </div>
        )}

        {/* View Section 5: Inline A4 Print Preview */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Control Bar for Print View */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-slate-800">
                  Standard A4 (210 × 297mm) Inpatient Documentation Sheets
                </span>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  • Care Plans (Portrait) & Bedside Cards (Landscape)
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setPrintDocType('bedside')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      printDocType === 'bedside' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Bedside Sheet (A4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintDocType('careplans')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      printDocType === 'careplans' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Care Plans (A4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintDocType('both_types')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      printDocType === 'both_types' ? 'bg-slate-900 text-white shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    All Documents
                  </button>
                </div>

                {printDocType === 'careplans' && (
                  <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs">
                    <button
                      type="button"
                      onClick={() => setPrintScope('both')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        printScope === 'both' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      Both Plans
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintScope('plan1')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        printScope === 'plan1' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      Plan 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintScope('plan2')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        printScope === 'plan2' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
                      }`}
                    >
                      Plan 2
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (printDocType === 'bedside') handleDirectPrintBedside();
                    else handleDirectPrintCarePlans();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Selected Sheets</span>
                </button>
              </div>
            </div>

            {/* Rendered A4 sheets */}
            <div className="space-y-8 flex flex-col items-center">
              {/* Bedside Sheet */}
              {(printDocType === 'bedside' || printDocType === 'both_types') && (
                <div className="w-full">
                  <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center justify-between px-1">
                    <span>DOCUMENT: INPATIENT BEDSIDE, DOOR & KARDEX CARDS (A4 LANDSCAPE)</span>
                    <span className="font-mono text-[11px]">All 6 Cards Fully Visible & Dimension Checked</span>
                  </div>
                  <ResponsiveBedsideSheetView
                    patient={patient}
                    showDimensionBadges={showBedsideDimensions}
                    onToggleDimensions={() => setShowBedsideDimensions(!showBedsideDimensions)}
                  />
                </div>
              )}

              {/* Care Plans */}
              {(printDocType === 'careplans' || printDocType === 'both_types') && (
                <>
                  {(printScope === 'both' || printScope === 'plan1') && (
                    <div className="w-full max-w-[210mm]">
                      <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between px-1">
                        <span>PAGE 1: NURSING CARE PLAN #1 (A4 PORTRAIT)</span>
                        <span className="text-blue-700 font-mono text-[11px]">Upper-Right Patient Label Included</span>
                      </div>
                      <div className="bg-white rounded-xs shadow-md border border-slate-200 overflow-hidden">
                        <PrintableCarePlan
                          patient={patient}
                          carePlan={carePlan1}
                          planNumber={1}
                          totalPlans={printScope === 'both' ? 2 : 1}
                        />
                      </div>
                    </div>
                  )}

                  {(printScope === 'both' || printScope === 'plan2') && (
                    <div className="w-full max-w-[210mm]">
                      <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between px-1">
                        <span>PAGE 2: NURSING CARE PLAN #2 (A4 PORTRAIT)</span>
                        <span className="text-blue-700 font-mono text-[11px]">Upper-Right Patient Label Included</span>
                      </div>
                      <div className="bg-white rounded-xs shadow-md border border-slate-200 overflow-hidden">
                        <PrintableCarePlan
                          patient={patient}
                          carePlan={carePlan2}
                          planNumber={2}
                          totalPlans={printScope === 'both' ? 2 : 1}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <NandaSearchModal
        isOpen={nandaModalOpen}
        onClose={() => setNandaModalOpen(false)}
        onSelectNanda={handleApplyNanda}
        currentDiagnosis={nandaTargetPlan === 1 ? carePlan1.diagnosis : carePlan2.diagnosis}
      />

      <PrintPreviewModal
        isOpen={printPreviewOpen}
        onClose={() => setPrintPreviewOpen(false)}
        patient={patient}
        carePlan1={carePlan1}
        carePlan2={carePlan2}
        printScope={printScope}
        onPrintScopeChange={setPrintScope}
        activeDocType={printDocType}
        onDocTypeChange={setPrintDocType}
      />

      <SavedRecordsModal
        isOpen={recordsModalOpen}
        onClose={() => setRecordsModalOpen(false)}
        savedRecords={savedRecords}
        currentPatientIdNumber={patient.idNumber}
        onLoadRecord={handleLoadRecord}
        onDeleteRecord={handleDeleteRecord}
        onImportRecords={handleImportRecords}
        onNewPatient={handleNewRecord}
      />

      {/* DEDICATED PRINT-ONLY CONTAINER */}
      {/* This is permanently rendered for browser print (@media print) to ensure crisp printout matching exact layouts and sizes */}
      <div className="hidden print:block print-only-container">
        {(printDocType === 'bedside' || printDocType === 'both_types') && (
          <div className={printDocType === 'both_types' ? 'printable-sheet page-break-after' : 'printable-landscape-sheet'}>
            <PrintableBedsideCardSheet patient={patient} isPrintOnly={true} />
          </div>
        )}
        {(printDocType === 'careplans' || printDocType === 'both_types') && (
          <>
            {(printScope === 'both' || printScope === 'plan1') && (
              <PrintableCarePlan
                patient={patient}
                carePlan={carePlan1}
                planNumber={1}
                totalPlans={printScope === 'both' ? 2 : 1}
              />
            )}
            {(printScope === 'both' || printScope === 'plan2') && (
              <PrintableCarePlan
                patient={patient}
                carePlan={carePlan2}
                planNumber={2}
                totalPlans={printScope === 'both' ? 2 : 1}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

