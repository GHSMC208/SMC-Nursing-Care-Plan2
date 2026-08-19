import { NandaItem, ClinicalSpecialty } from '../types';
import { CCU_ICU_NANDA } from './categories/ccuIcu';
import { MEDICAL_NANDA } from './categories/medical';
import { SURGICAL_NANDA } from './categories/surgical';
import { OPHTHALMOLOGY_NANDA } from './categories/ophthalmology';
import { ONCOLOGY_NANDA } from './categories/oncology';
import { GYNAECOLOGY_NANDA } from './categories/gynaecology';
import { PAEDIATRIC_NANDA } from './categories/paediatric';
import { ENT_NANDA } from './categories/ent';
import { ORTHOPEDIC_NANDA } from './categories/orthopedic';
import { VASCULAR_NANDA } from './categories/vascular';
import { BURN_NANDA } from './categories/burn';
import { HAEMATOLOGY_NANDA } from './categories/haematology';
import { NICU_NANDA } from './categories/nicu';
import { PSYCHIATRY_NANDA } from './categories/psychiatry';

export const NANDA_CATEGORIES: ('All Categories' | ClinicalSpecialty)[] = [
  'All Categories',
  'CCU/ICU',
  'Medical',
  'Surgical',
  'Ophthalmology',
  'Oncology',
  'Gynaecology',
  'Paediatric',
  'ENT',
  'Orthopedic',
  'Vascular',
  'Burn',
  'Haematology',
  'NICU',
  'Psychiatry',
];

export const NANDA_DOMAINS = [
  'All Domains',
  'Comfort & Pain',
  'Safety & Protection',
  'Cardiopulmonary & Oxygenation',
  'Nutrition & Hydration',
  'Elimination & Exchange',
  'Activity & Rest',
  'Neuro & Coping',
  'Health Promotion & Knowledge',
];

export const NANDA_DATABASE: NandaItem[] = [
  ...CCU_ICU_NANDA,
  ...MEDICAL_NANDA,
  ...SURGICAL_NANDA,
  ...OPHTHALMOLOGY_NANDA,
  ...ONCOLOGY_NANDA,
  ...GYNAECOLOGY_NANDA,
  ...PAEDIATRIC_NANDA,
  ...ENT_NANDA,
  ...ORTHOPEDIC_NANDA,
  ...VASCULAR_NANDA,
  ...BURN_NANDA,
  ...HAEMATOLOGY_NANDA,
  ...NICU_NANDA,
  ...PSYCHIATRY_NANDA,
];
