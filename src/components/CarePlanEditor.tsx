import React, { useState } from 'react';
import { NursingCarePlan, NandaItem } from '../types';
import { NANDA_DATABASE } from '../data/nandaData';
import { Search, Calendar, AlertTriangle, Target, ClipboardList, CheckCircle2, Copy, Sparkles, BookOpen, RefreshCw, Trash2, ArrowRightLeft, UserCheck, Award, RotateCcw } from 'lucide-react';

interface CarePlanEditorProps {
  plan: NursingCarePlan;
  planNumber: 1 | 2;
  onChange: (updated: NursingCarePlan) => void;
  onOpenNandaSearch: () => void;
  onSwapWithOtherPlan?: () => void;
  onClearPlan?: () => void;
}

export const CarePlanEditor: React.FC<CarePlanEditorProps> = ({
  plan,
  planNumber,
  onChange,
  onOpenNandaSearch,
  onSwapWithOtherPlan,
  onClearPlan,
}) => {
  const handleFieldChange = (field: keyof NursingCarePlan, value: any) => {
    onChange({
      ...plan,
      [field]: value,
    });
  };

  const setTodayOnset = () => {
    const today = new Date().toISOString().split('T')[0];
    handleFieldChange('dateOfOnset', today);
  };

  // Find matching NANDA in database to offer quick inline suggestions if available
  const matchedNanda = NANDA_DATABASE.find(
    (n) => n.diagnosis.toLowerCase() === plan.diagnosis.toLowerCase()
  );

  const appendSuggestion = (field: 'relatedFactors' | 'expectedOutcome' | 'interventions', text: string) => {
    const current = plan[field] || '';
    if (!current.trim()) {
      handleFieldChange(field, text);
    } else if (!current.includes(text)) {
      if (field === 'interventions') {
        const nextNumber = current.split('\n').filter(l => l.trim()).length + 1;
        handleFieldChange(field, `${current}\n${nextNumber}. ${text}`);
      } else {
        handleFieldChange(field, `${current}\n• ${text}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-xs ${
              planNumber === 1 ? 'bg-blue-600' : 'bg-slate-900'
            }`}
          >
            #{planNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Nursing Care Plan #{planNumber}
              </h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  planNumber === 1
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                {planNumber === 1 ? 'Priority Diagnosis 1' : 'Secondary Priority 2'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Formulated according to standard NANDA-I, NOC, and NIC inpatient nursing documentation
            </p>
          </div>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="flex items-center gap-2">
          {onClearPlan && (
            <button
              id={`clear-plan-${planNumber}-btn`}
              type="button"
              onClick={onClearPlan}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-all text-xs flex items-center gap-1.5 shadow-2xs"
              title={`Clear all fields in Care Plan #${planNumber}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Plan</span>
            </button>
          )}

          {onSwapWithOtherPlan && (
            <button
              id={`swap-plan-${planNumber}-btn`}
              type="button"
              onClick={onSwapWithOtherPlan}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="Swap priority order between Plan 1 and Plan 2"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Swap Priority (1 ⇄ 2)</span>
            </button>
          )}

          <button
            id={`open-nanda-modal-btn-${planNumber}`}
            type="button"
            onClick={onOpenNandaSearch}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search NANDA List</span>
          </button>
        </div>
      </div>

      {/* Editor Body Form */}
      <div className="p-6 space-y-6">
        {/* Row 1: Nursing Diagnosis & Date of Onset */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Diagnosis (8 Cols) */}
          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                2. Nursing Diagnosis (NANDA-I) *
              </label>
              <button
                type="button"
                onClick={onOpenNandaSearch}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Search className="w-3 h-3" /> Browse NANDA catalog
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                id={`plan-${planNumber}-diagnosis-input`}
                type="text"
                placeholder="Click 'Search NANDA List' or type diagnosis (e.g., Acute Pain, Impaired Gas Exchange)..."
                value={plan.diagnosis}
                onChange={(e) => handleFieldChange('diagnosis', e.target.value)}
                className="w-full pl-3.5 pr-28 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400 font-sans"
              />
              <button
                type="button"
                onClick={onOpenNandaSearch}
                className="absolute right-2 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-md border border-blue-200 transition-all"
              >
                Pick NANDA
              </button>
            </div>

            {plan.domain && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Domain:</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  {plan.domain}
                </span>
                {plan.nandaCode && (
                  <span className="font-mono text-slate-400">
                    [Code: #{plan.nandaCode}]
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Date of Onset (4 Cols) */}
          <div className="md:col-span-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                3. Date of Onset *
              </label>
              <button
                type="button"
                onClick={setTodayOnset}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Set Today
              </button>
            </div>
            <input
              id={`plan-${planNumber}-onset-date-input`}
              type="date"
              value={plan.dateOfOnset}
              onChange={(e) => handleFieldChange('dateOfOnset', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Section 4: Related Factors (Etiology) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              4. Related Factors (Etiology / Pathophysiology / "Related to...") *
            </label>
            <span className="text-[11px] text-slate-400">
              Underlying biological, surgical, or mechanical causes
            </span>
          </div>

          <textarea
            id={`plan-${planNumber}-related-factors-input`}
            rows={3}
            placeholder="e.g., Biological injury agent secondary to laparoscopic surgery; localized tissue inflammation and abdominal distention..."
            value={plan.relatedFactors}
            onChange={(e) => handleFieldChange('relatedFactors', e.target.value)}
            className="w-full p-3.5 bg-white border border-slate-300 rounded-lg text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all leading-relaxed placeholder:text-slate-400"
          />

          {/* Quick Suggestions for Related Factors if NANDA is matched */}
          {matchedNanda && matchedNanda.suggestedRelatedFactors.length > 0 && (
            <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Suggested Etiologies for {matchedNanda.diagnosis}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchedNanda.suggestedRelatedFactors.map((factor, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => appendSuggestion('relatedFactors', factor)}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-950 rounded-md border border-amber-200 font-medium text-[11px] text-left transition-all shadow-xs"
                  >
                    + {factor}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Expected Outcome (NOC) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              5. Expected Outcome (NOC / Measurable Goals & Timeframe) *
            </label>
            <span className="text-[11px] text-slate-400">
              SMART patient goals (Measurable, Achievable, Time-bound)
            </span>
          </div>

          <textarea
            id={`plan-${planNumber}-expected-outcome-input`}
            rows={3}
            placeholder="e.g., Patient will report pain reduction to ≤3/10 on NRS within 45 minutes of medication and demonstrate relaxed posture..."
            value={plan.expectedOutcome}
            onChange={(e) => handleFieldChange('expectedOutcome', e.target.value)}
            className="w-full p-3.5 bg-white border border-slate-300 rounded-lg text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all leading-relaxed placeholder:text-slate-400"
          />

          {/* Quick Suggestions for Expected Outcome if NANDA is matched */}
          {matchedNanda && matchedNanda.suggestedExpectedOutcomes.length > 0 && (
            <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Suggested Expected Outcomes for {matchedNanda.diagnosis}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchedNanda.suggestedExpectedOutcomes.map((outcome, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => appendSuggestion('expectedOutcome', outcome)}
                    className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-950 rounded-md border border-emerald-200 font-medium text-[11px] text-left transition-all shadow-xs"
                  >
                    + {outcome}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Nursing Interventions (NIC) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
              6. Nursing Interventions & Rationales (NIC) *
            </label>
            <span className="text-[11px] text-slate-400">
              Specific independent & collaborative nursing actions with frequencies
            </span>
          </div>

          <textarea
            id={`plan-${planNumber}-interventions-input`}
            rows={5}
            placeholder="1. Assess vital signs and pain intensity every 2-4 hours...&#10;2. Administer prescribed analgesics and monitor response...&#10;3. Reposition patient every 2 hours with pillow support..."
            value={plan.interventions}
            onChange={(e) => handleFieldChange('interventions', e.target.value)}
            className="w-full p-3.5 bg-white border border-slate-300 rounded-lg text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all leading-relaxed font-mono placeholder:text-slate-400"
          />

          {/* Quick Suggestions for Interventions if NANDA is matched */}
          {matchedNanda && matchedNanda.suggestedInterventions.length > 0 && (
            <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200 text-xs">
              <span className="font-bold text-blue-900 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" /> Suggested Interventions for {matchedNanda.diagnosis}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchedNanda.suggestedInterventions.map((intervention, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => appendSuggestion('interventions', intervention)}
                    className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-950 rounded-md border border-blue-200 font-medium text-[11px] text-left transition-all shadow-xs"
                  >
                    + {intervention}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Evaluation & Clinical Notes (Standard hospital care plan column) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              7. Evaluation / Nursing Progress Notes
            </label>
            <span className="text-[11px] text-slate-400">
              Shift assessment & response to interventions
            </span>
          </div>

          <textarea
            id={`plan-${planNumber}-evaluation-input`}
            rows={2}
            placeholder="e.g., Goal met: Patient reports pain score 2/10 after 30 min of analgesia. Vital signs stable, ambulating safely."
            value={plan.evaluation || ''}
            onChange={(e) => handleFieldChange('evaluation', e.target.value)}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Section 8: Clinical Sign-Off Audit Trail (Dates Reviewed & Date Achieved) */}
        <div className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Box 1: Dates Reviewed with Staff Signatures */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Dates Reviewed with Staff Signatures
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Routine Reviews</span>
            </div>

            {/* Review 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Date Reviewed #1</label>
                <input
                  id={`plan-${planNumber}-date-reviewed-1`}
                  type="date"
                  value={plan.dateReviewed || ''}
                  onChange={(e) => handleFieldChange('dateReviewed', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Staff Signature #1</label>
                <input
                  id={`plan-${planNumber}-staff-signature-1`}
                  type="text"
                  placeholder="e.g., S. Jenkins, RN"
                  value={plan.dateReviewedStaffSignature || ''}
                  onChange={(e) => handleFieldChange('dateReviewedStaffSignature', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Review 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Date Reviewed #2 (Follow-up)</label>
                <input
                  id={`plan-${planNumber}-date-reviewed-2`}
                  type="date"
                  value={plan.dateReviewed2 || ''}
                  onChange={(e) => handleFieldChange('dateReviewed2', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Staff Signature #2</label>
                <input
                  id={`plan-${planNumber}-staff-signature-2`}
                  type="text"
                  placeholder="e.g., M. Chen, MD"
                  value={plan.dateReviewedStaffSignature2 || ''}
                  onChange={(e) => handleFieldChange('dateReviewedStaffSignature2', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Box 2: Date Achieved with Staff Signature */}
          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  Date Achieved with Staff Signature
                </label>
                <span className="text-[10px] text-emerald-700 font-semibold">Goal Completion</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-emerald-900 uppercase mb-1">Date Achieved</label>
                  <input
                    id={`plan-${planNumber}-date-achieved`}
                    type="date"
                    value={plan.dateAchieved || ''}
                    onChange={(e) => handleFieldChange('dateAchieved', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-emerald-900 uppercase mb-1">Achieved Staff Signature</label>
                  <input
                    id={`plan-${planNumber}-achieved-signature`}
                    type="text"
                    placeholder="e.g., Staff Nurse Signature / RN"
                    value={plan.dateAchievedStaffSignature || ''}
                    onChange={(e) => handleFieldChange('dateAchievedStaffSignature', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-emerald-800 bg-white/80 p-2 rounded border border-emerald-200/80">
              <span className="font-semibold block">Print Footer Output:</span>
              <span>Automatically updates the standard bottom sign-off table on the A4 printable care plan sheet.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
