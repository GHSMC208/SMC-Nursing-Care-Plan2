import React from 'react';
import { PatientDemographics, NursingCarePlan } from '../types';
import governmentHospitalsLogo from '../assets/images/bahrain_gov_hospitals_logo_1787046319692.jpg';

interface PrintableCarePlanProps {
  patient: PatientDemographics;
  carePlan: NursingCarePlan;
  planNumber: 1 | 2;
  totalPlans?: number;
}

export const PrintableCarePlan: React.FC<PrintableCarePlanProps> = ({
  patient,
  carePlan,
  planNumber,
  totalPlans = 2,
}) => {
  const isMultiPage = planNumber < totalPlans;

  return (
    <div
      id={`printable-care-plan-sheet-${planNumber}`}
      className={`printable-sheet bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] mx-auto p-6 sm:p-8 border border-slate-300 shadow-md print:shadow-none print:border-0 print:p-0 print:m-0 print:max-w-none print:w-full print:min-h-[275mm] flex flex-col justify-between ${
        isMultiPage ? 'page-break-after' : ''
      }`}
    >
      {/* Top Section */}
      <div>
        {/* Top Header Grid: Left = Hospital Branding / Doc Title, Right = UPPER RIGHT INPATIENT IDENTIFICATION LABEL */}
        <div className="grid grid-cols-12 gap-3 pb-3 border-b-2 border-slate-900 print:border-black items-start">
          {/* Left / Center: Clinical Header with Government Hospitals Logo (7 Cols) */}
          <div className="col-span-7 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center gap-3.5">
              <img
                src={governmentHospitalsLogo}
                alt="Kingdom of Bahrain Government Hospitals Logo"
                className="w-20 h-20 object-contain shrink-0 rounded-xs"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10px] font-black text-red-700 print:text-black uppercase tracking-wider leading-none">
                  KINGDOM OF BAHRAIN • GOVERNMENT HOSPITALS
                </div>
                <div className="text-slate-950 print:text-black font-black tracking-tight text-base sm:text-lg uppercase leading-tight">
                  {patient.hospitalName || 'SALMANIYA MEDICAL COMPLEX'}
                </div>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-300 print:border-slate-400">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-xs print:bg-black">
                  NURSING CARE PLAN
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 print:text-black">
                  PLAN #{planNumber} OF {totalPlans}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 print:text-slate-700 mt-0.5 font-medium">
                Standard NANDA-I, NOC & NIC Inpatient Nursing Documentation Record
              </p>
            </div>
          </div>

          {/* Right: UPPER RIGHT INPATIENT IDENTIFICATION LABEL (5 Cols) */}
          {/* User specification: "a label at the right upper side containing [date of admission, ward and bed number, patient full name, ID number, age, sex, nationality, caring DR]" */}
          <div className="col-span-5">
            <div
              id={`upper-right-label-plan-${planNumber}`}
              className="border-2 border-slate-900 print:border-black p-2 bg-slate-50/70 print:bg-white rounded-xs space-y-1 text-slate-900 print:text-black"
            >
              <div className="flex items-center justify-between border-b border-slate-400 print:border-black pb-0.5">
                <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-800 print:text-black">
                  PATIENT IDENTIFICATION LABEL
                </span>
                <span className="text-[8.5px] font-mono font-bold text-blue-900 print:text-black">INPATIENT</span>
              </div>

              {/* Patient Full Name & ID Number */}
              <div className="flex justify-between items-baseline gap-1">
                <div className="min-w-0">
                  <span className="text-[7.5px] font-bold text-slate-500 print:text-slate-700 block uppercase leading-none">
                    PATIENT FULL NAME
                  </span>
                  <span className="font-black text-xs text-slate-950 print:text-black uppercase truncate block">
                    {patient.fullName || '—'}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[7.5px] font-bold text-slate-500 print:text-slate-700 block uppercase leading-none">
                    ID NUMBER (MRN)
                  </span>
                  <span className="font-mono font-bold text-[11px] text-slate-950 print:text-black">
                    {patient.idNumber || '—'}
                  </span>
                </div>
              </div>

              {/* Age, Sex, Nationality */}
              <div className="grid grid-cols-3 gap-1 border-t border-b border-slate-200 print:border-slate-400 py-0.5 text-[9.5px]">
                <div>
                  <span className="text-[7.5px] text-slate-500 print:text-slate-700 block uppercase leading-none">AGE</span>
                  <span className="font-bold">{patient.age ? `${patient.age} yrs` : '—'}</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-slate-500 print:text-slate-700 block uppercase leading-none">SEX</span>
                  <span className="font-bold">{patient.sex || '—'}</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-slate-500 print:text-slate-700 block uppercase leading-none">NATIONALITY</span>
                  <span className="font-bold truncate block">{patient.nationality || '—'}</span>
                </div>
              </div>

              {/* Ward No, Bed No, Date of Admission */}
              <div className="grid grid-cols-3 gap-1 text-[9.5px]">
                <div>
                  <span className="text-[7.5px] text-slate-500 print:text-slate-700 block uppercase leading-none">WARD NO.</span>
                  <span className="font-black text-slate-900 print:text-black truncate block">
                    {patient.wardNumber || (patient.wardAndBedNumber ? patient.wardAndBedNumber.split(',')[0]?.trim() : '—')}
                  </span>
                </div>
                <div>
                  <span className="text-[7.5px] text-slate-500 print:text-slate-700 block uppercase leading-none">BED NO.</span>
                  <span className="font-black text-slate-900 print:text-black truncate block">
                    {patient.bedNumber || (patient.wardAndBedNumber ? patient.wardAndBedNumber.split(',')[1]?.replace(/^Bed\s*/i, '').trim() : '—')}
                  </span>
                </div>
                <div>
                  <span className="text-[7.5px] text-slate-500 print:text-slate-700 block uppercase leading-none">ADMISSION</span>
                  <span className="font-bold truncate block">{patient.dateOfAdmission || '—'}</span>
                </div>
              </div>

              {/* Caring DR */}
              <div className="border-t border-slate-200 print:border-slate-400 pt-0.5 text-[9.5px]">
                <span className="text-[7.5px] text-slate-500 print:text-slate-700 block uppercase leading-none">CARING DOCTOR (DR)</span>
                <span className="font-bold text-slate-950 print:text-black truncate block">
                  {patient.caringDoctor || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Clinical Care Plan Body (Structured Table / Kardex Grid) */}
        <div className="mt-3 space-y-3">
          {/* Row 1: Diagnosis & Date of Onset Banner */}
          <div className="border-2 border-slate-900 print:border-black rounded-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center print:bg-black">
              <span>2. NURSING DIAGNOSIS (NANDA-I)</span>
              <span>3. DATE OF ONSET</span>
            </div>
            <div className="p-2.5 bg-white grid grid-cols-12 gap-2 items-center">
              <div className="col-span-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-slate-950 print:text-black uppercase">
                    {carePlan.diagnosis || '— [Diagnosis Not Selected] —'}
                  </span>
                  {carePlan.nandaCode && (
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 print:bg-white border border-slate-300 print:border-black rounded text-slate-800 print:text-black">
                      NANDA #{carePlan.nandaCode}
                    </span>
                  )}
                </div>
                {carePlan.domain && (
                  <p className="text-[10.5px] text-slate-600 print:text-slate-800 font-semibold mt-0.5">
                    Domain: {carePlan.domain}
                  </p>
                )}
              </div>
              <div className="col-span-4 text-right border-l border-slate-300 print:border-black pl-3">
                <span className="text-[8px] font-bold text-slate-500 print:text-slate-700 block uppercase">
                  Date of Onset / Identification
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 print:text-black font-mono">
                  {carePlan.dateOfOnset || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Related Factors (Etiology) */}
          <div className="border border-slate-900 print:border-black rounded-xs overflow-hidden">
            <div className="bg-slate-100 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-900 print:text-black border-b border-slate-300 print:border-black">
              4. RELATED FACTORS (Etiology / Pathophysiology / "Related To")
            </div>
            <div className="p-2.5 bg-white text-[11px] leading-relaxed text-slate-900 print:text-black whitespace-pre-line font-medium min-h-[44px]">
              {carePlan.relatedFactors || '— No related factors specified —'}
            </div>
          </div>

          {/* Row 3: Expected Outcome (NOC / Goals) */}
          <div className="border border-slate-900 print:border-black rounded-xs overflow-hidden">
            <div className="bg-slate-100 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-900 print:text-black border-b border-slate-300 print:border-black">
              5. EXPECTED OUTCOME (NOC / Measurable SMART Goals & Timeline)
            </div>
            <div className="p-2.5 bg-white text-[11px] leading-relaxed text-slate-900 print:text-black whitespace-pre-line font-medium min-h-[44px]">
              {carePlan.expectedOutcome || '— No expected outcome specified —'}
            </div>
          </div>

          {/* Row 4: Nursing Interventions (NIC) */}
          <div className="border-2 border-slate-900 print:border-black rounded-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider print:bg-black">
              6. NURSING INTERVENTIONS & RATIONALES (NIC / Action Plan)
            </div>
            <div className="p-2.5 bg-white text-[11px] leading-relaxed text-slate-900 print:text-black whitespace-pre-line font-mono min-h-[120px]">
              {carePlan.interventions || '— No nursing interventions specified —'}
            </div>
          </div>

          {/* Row 5: Evaluation & Progress Notes */}
          <div className="border border-slate-800 print:border-black rounded-xs overflow-hidden">
            <div className="bg-slate-100 px-3 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-800 print:text-black border-b border-slate-300 print:border-black">
              7. EVALUATION / NURSING PROGRESS SUMMARY
            </div>
            <div className="p-2 bg-white text-[10.5px] text-slate-800 print:text-black min-h-[38px] italic">
              {carePlan.evaluation || '— Pending continuous evaluation per clinical shift —'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Dates Reviewed with Staff Signatures & Date Achieved with Staff Signature */}
      <div className="mt-3 pt-2.5 border-t-2 border-slate-900 print:border-black space-y-2">
        <div className="grid grid-cols-12 gap-2.5 text-[9.5px]">
          {/* Left Column (7 cols): DATES REVIEWED WITH STAFF SIGNATURES */}
          <div className="col-span-7 border-2 border-slate-900 print:border-black rounded-xs overflow-hidden">
            <div className="bg-slate-900 text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider print:bg-black flex items-center justify-between">
              <span>DATES REVIEWED WITH STAFF SIGNATURES</span>
              <span className="font-normal text-[8px] opacity-90 print:opacity-100">Review & Ongoing Shift Sign-Off</span>
            </div>
            <div className="p-1.5 bg-white space-y-1.5">
              <table className="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr className="border-b border-slate-300 print:border-black text-[8px] uppercase text-slate-600 print:text-black font-bold bg-slate-50 print:bg-white">
                    <th className="py-0.5 px-1.5 w-24 border-r border-slate-300 print:border-black">Date Reviewed</th>
                    <th className="py-0.5 px-1.5 border-r border-slate-300 print:border-black">Staff Signature & Designation</th>
                    <th className="py-0.5 px-1.5 w-24">Plan Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 print:divide-black text-slate-900 print:text-black">
                  {/* Entry 1 */}
                  <tr className="h-6">
                    <td className="py-0.5 px-1.5 font-mono font-bold border-r border-slate-300 print:border-black">
                      {carePlan.dateReviewed || patient.dateOfAdmission || '___ / ___ / 2026'}
                    </td>
                    <td className="py-0.5 px-1.5 font-semibold border-r border-slate-300 print:border-black">
                      {carePlan.dateReviewedStaffSignature || ''}
                    </td>
                    <td className="py-0.5 px-1.5 text-[8.5px] font-medium text-slate-700 print:text-black">
                      {carePlan.status || 'Active - In Progress'}
                    </td>
                  </tr>
                  {/* Entry 2 */}
                  <tr className="h-6">
                    <td className="py-0.5 px-1.5 font-mono border-r border-slate-300 print:border-black text-slate-500 print:text-black">
                      {carePlan.dateReviewed2 || '___ / ___ / 2026'}
                    </td>
                    <td className="py-0.5 px-1.5 border-r border-slate-300 print:border-black text-slate-600 print:text-black font-semibold">
                      {carePlan.dateReviewedStaffSignature2 || ''}
                    </td>
                    <td className="py-0.5 px-1.5 text-[8.5px] text-slate-500 print:text-black">
                      Continued Care
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column (5 cols): DATE ACHIEVED WITH STAFF SIGNATURE */}
          <div className="col-span-5 border-2 border-slate-900 print:border-black rounded-xs overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-900 text-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider print:bg-black">
              DATE ACHIEVED WITH STAFF SIGNATURE
            </div>
            <div className="p-2 bg-white flex-1 flex flex-col justify-between space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[8px] font-bold text-slate-600 print:text-black uppercase block leading-none">
                    Date Achieved:
                  </span>
                  <div className="mt-1 font-mono font-bold text-[10px] text-slate-900 print:text-black border-b border-dashed border-slate-400 print:border-black pb-0.5 min-h-[16px]">
                    {carePlan.dateAchieved || '___ / ___ / 2026'}
                  </div>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-600 print:text-black uppercase block leading-none">
                    Outcome Status:
                  </span>
                  <div className="mt-1 text-[9px] font-semibold text-slate-800 print:text-black border-b border-dashed border-slate-400 print:border-black pb-0.5 min-h-[16px]">
                    {carePlan.dateAchieved ? 'Goal Fully Met' : 'Goal in Progress'}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[8px] font-bold text-slate-600 print:text-black uppercase block leading-none">
                  Staff Signature / Designation / Stamp:
                </span>
                <div className="mt-1.5 pt-1 border-t border-slate-400 print:border-black text-slate-900 print:text-black font-semibold text-[9.5px] min-h-[18px]">
                  {carePlan.dateAchievedStaffSignature || ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Standard and Accreditation Bar */}
        <div className="pt-1.5 flex items-center justify-between text-[8.5px] text-slate-600 print:text-black border-t border-slate-300 print:border-black font-mono">
          <span>{patient.hospitalName ? `${patient.hospitalName.toUpperCase()} • QUALITY DEPARTMENT` : 'SALMANIYA MEDICAL COMPLEX • QUALITY DEPARTMENT'}</span>
          <span>Care Plan #{planNumber} • Page {planNumber} of {totalPlans}</span>
        </div>
      </div>
    </div>
  );
};
