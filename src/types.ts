export interface PatientDemographics {
  fullName: string;
  idNumber: string;
  age: number | string;
  sex: 'Male' | 'Female' | '';
  nationality: string;
  dateOfAdmission: string;
  wardNumber: string;
  bedNumber: string;
  wardAndBedNumber?: string;
  caringDoctor: string;
  hospitalName?: string;
  departmentUnit?: string;
  allergies?: string;
}

export interface NursingCarePlan {
  id: string;
  planNumber: 1 | 2;
  title: string;
  nandaCode?: string;
  diagnosis: string;
  domain?: string;
  dateOfOnset: string;
  relatedFactors: string;
  expectedOutcome: string;
  interventions: string;
  evaluation?: string;
  status?: 'Active' | 'Resolved' | 'Under Review';
  dateReviewed?: string;
  dateReviewedStaffSignature?: string;
  dateReviewed2?: string;
  dateReviewedStaffSignature2?: string;
  dateAchieved?: string;
  dateAchievedStaffSignature?: string;
}

export interface InpatientRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  patient: PatientDemographics;
  carePlan1: NursingCarePlan;
  carePlan2: NursingCarePlan;
}

export type ClinicalSpecialty =
  | 'CCU/ICU'
  | 'Medical'
  | 'Surgical'
  | 'Ophthalmology'
  | 'Oncology'
  | 'Gynaecology'
  | 'Paediatric'
  | 'ENT'
  | 'Orthopedic'
  | 'Vascular'
  | 'Burn'
  | 'Haematology'
  | 'NICU'
  | 'Psychiatry';

export interface NandaItem {
  code?: string;
  diagnosis: string;
  domain: string;
  category: ClinicalSpecialty | string;
  categories?: string[];
  classCategory?: string;
  definition: string;
  definingCharacteristics?: string[];
  suggestedRelatedFactors: string[];
  suggestedExpectedOutcomes: string[];
  suggestedInterventions: string[];
}
