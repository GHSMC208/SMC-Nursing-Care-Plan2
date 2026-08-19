import React, { useState, useRef } from 'react';
import { InpatientRecord } from '../types';
import { FolderOpen, X, Trash2, Download, Upload, Clock, User, Calendar, Bed, ArrowRight, RotateCcw, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SavedRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedRecords: InpatientRecord[];
  currentPatientIdNumber?: string;
  onLoadRecord: (record: InpatientRecord) => void;
  onDeleteRecord: (id: string) => void;
  onImportRecords: (records: InpatientRecord[]) => void;
  onNewPatient: () => void;
}

export const SavedRecordsModal: React.FC<SavedRecordsModalProps> = ({
  isOpen,
  onClose,
  savedRecords,
  currentPatientIdNumber,
  onLoadRecord,
  onDeleteRecord,
  onImportRecords,
  onNewPatient,
}) => {
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filtered = savedRecords.filter((rec) => {
    const term = search.toLowerCase();
    const wardStr = (rec.patient.wardNumber || '').toLowerCase();
    const bedStr = (rec.patient.bedNumber || '').toLowerCase();
    const wardBedStr = (rec.patient.wardAndBedNumber || '').toLowerCase();
    const allergyStr = (rec.patient.allergies || '').toLowerCase();

    return (
      rec.patient.fullName.toLowerCase().includes(term) ||
      rec.patient.idNumber.toLowerCase().includes(term) ||
      wardStr.includes(term) ||
      bedStr.includes(term) ||
      wardBedStr.includes(term) ||
      allergyStr.includes(term) ||
      rec.carePlan1.diagnosis.toLowerCase().includes(term) ||
      rec.carePlan2.diagnosis.toLowerCase().includes(term)
    );
  });

  const handleExportAll = () => {
    const dataStr = JSON.stringify(savedRecords, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nursing_care_plans_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportRecords(parsed);
        } else if (parsed && parsed.patient && parsed.carePlan1) {
          onImportRecords([parsed]);
        }
      } catch (err) {
        console.error('Failed to parse JSON file', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      id="saved-records-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="saved-records-modal-container"
        className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Saved Inpatient Care Plans
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {savedRecords.length} Records
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Switch between inpatient profiles or backup/restore records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onNewPatient();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>New Inpatient</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search by patient name, MRN, ward, or diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportAll}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="Export all saved care plans as JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export All (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="Import JSON care plans backup"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Record List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">No saved care plan records match your search</p>
              <p className="text-xs text-slate-400 mt-1">Try another search keyword or create a new inpatient</p>
            </div>
          ) : (
            filtered.map((record) => {
              const isCurrent = record.patient.idNumber === currentPatientIdNumber;
              return (
                <div
                  key={record.id}
                  className={`p-4 rounded-lg border transition-all flex flex-wrap items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {record.patient.fullName || 'Unnamed Inpatient'}
                      </span>
                      {record.patient.idNumber && (
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                          {record.patient.idNumber}
                        </span>
                      )}
                      {(record.patient.wardNumber || record.patient.bedNumber || record.patient.wardAndBedNumber) && (
                        <span className="text-[11px] text-blue-800 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {record.patient.wardNumber && record.patient.bedNumber
                            ? `${record.patient.wardNumber}, Bed ${record.patient.bedNumber}`
                            : record.patient.wardNumber || (record.patient.bedNumber ? `Bed ${record.patient.bedNumber}` : record.patient.wardAndBedNumber)}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                          Active In Workspace
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Admitted: {record.patient.dateOfAdmission || '—'}</span>
                      <span>•</span>
                      <span>DR: {record.patient.caringDoctor || '—'}</span>
                      <span>•</span>
                      <span>Age: {record.patient.age || '—'} / {record.patient.sex}</span>
                      {record.patient.allergies && (
                        <>
                          <span>•</span>
                          {record.patient.allergies.toLowerCase().includes('nkda') || record.patient.allergies.toLowerCase().includes('no known') ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> NKDA
                            </span>
                          ) : (
                            <span className="text-rose-700 font-bold flex items-center gap-1" title={record.patient.allergies}>
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Allergies: {record.patient.allergies.length > 20 ? `${record.patient.allergies.slice(0, 20)}...` : record.patient.allergies}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Care Plans Snapshot */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {record.carePlan1.diagnosis && (
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                          #1: {record.carePlan1.diagnosis}
                        </span>
                      )}
                      {record.carePlan2.diagnosis && (
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                          #2: {record.carePlan2.diagnosis}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadRecord(record);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>Load Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete saved record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>All patient drafts are stored locally in your browser session.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
