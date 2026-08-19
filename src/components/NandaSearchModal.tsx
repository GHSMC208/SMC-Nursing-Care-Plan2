import React, { useState, useMemo, useEffect } from 'react';
import { NandaItem, ClinicalSpecialty } from '../types';
import { NANDA_DATABASE, NANDA_CATEGORIES, NANDA_DOMAINS } from '../data/nandaData';
import {
  Search,
  X,
  Check,
  BookOpen,
  Filter,
  Eye,
  Flame,
  Baby,
  Brain,
  Scissors,
  Stethoscope,
  Activity,
  HeartPulse,
  Droplets,
  Shield,
  Layers,
  HelpCircle,
  Wind,
  Sparkles,
  ChevronRight,
  CheckSquare,
  Square,
  Grid,
  Tag,
  CheckCircle2,
  FolderOpen,
  SlidersHorizontal,
  Bookmark,
  ArrowRight
} from 'lucide-react';

interface NandaSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNanda: (
    item: NandaItem,
    selectedRelatedFactors: string[],
    selectedOutcomes: string[],
    selectedInterventions: string[]
  ) => void;
  currentDiagnosis?: string;
}

interface SpecialtyGroup {
  name: string;
  badgeColor: string;
  categories: ClinicalSpecialty[];
}

const SPECIALTY_GROUPS: SpecialtyGroup[] = [
  {
    name: 'Critical & Perioperative',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    categories: ['CCU/ICU', 'Surgical', 'Vascular', 'Burn'],
  },
  {
    name: 'Inpatient & Sub-Specialties',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    categories: ['Medical', 'Orthopedic', 'Oncology', 'Haematology'],
  },
  {
    name: 'Maternal & Paediatrics',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    categories: ['Paediatric', 'NICU', 'Gynaecology'],
  },
  {
    name: 'Sensory & Neuro-Psychiatry',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    categories: ['ENT', 'Ophthalmology', 'Psychiatry'],
  },
];

export const NandaSearchModal: React.FC<NandaSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectNanda,
  currentDiagnosis = '',
}) => {
  const [browseMode, setBrowseMode] = useState<'specialty' | 'domain'>('specialty');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedDomain, setSelectedDomain] = useState<string>('All Domains');
  const [activeItem, setActiveItem] = useState<NandaItem>(NANDA_DATABASE[0]);

  // Selected suggestions for the active item
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Categories': NANDA_DATABASE.length };
    for (const cat of NANDA_CATEGORIES) {
      if (cat === 'All Categories') continue;
      counts[cat] = NANDA_DATABASE.filter(
        (item) => item.category === cat || (item.categories && item.categories.includes(cat))
      ).length;
    }
    return counts;
  }, []);

  // Count items per domain
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Domains': NANDA_DATABASE.length };
    for (const dom of NANDA_DOMAINS) {
      if (dom === 'All Domains') continue;
      counts[dom] = NANDA_DATABASE.filter((item) => item.domain === dom).length;
    }
    return counts;
  }, []);

  // When active item changes, reset selected items to default all
  const handleSelectActiveItem = (item: NandaItem) => {
    setActiveItem(item);
    setSelectedFactors(item.suggestedRelatedFactors || []);
    setSelectedOutcomes(item.suggestedExpectedOutcomes || []);
    setSelectedInterventions(item.suggestedInterventions || []);
  };

  // Filter diagnoses based on Category, Domain, and Search Term
  const filteredList = useMemo(() => {
    return NANDA_DATABASE.filter((item) => {
      // Category matching
      const matchesCategory =
        selectedCategory === 'All Categories' ||
        item.category === selectedCategory ||
        (item.categories && item.categories.includes(selectedCategory));

      // Domain matching
      const matchesDomain =
        selectedDomain === 'All Domains' || item.domain === selectedDomain;

      // Query matching
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.diagnosis.toLowerCase().includes(query) ||
        (item.code && item.code.includes(query)) ||
        item.category.toLowerCase().includes(query) ||
        (item.categories && item.categories.some((c) => c.toLowerCase().includes(query))) ||
        item.domain.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query) ||
        item.suggestedRelatedFactors.some((f) => f.toLowerCase().includes(query)) ||
        item.suggestedInterventions.some((i) => i.toLowerCase().includes(query));

      return matchesCategory && matchesDomain && matchesSearch;
    });
  }, [searchTerm, selectedCategory, selectedDomain]);

  // Initialize selection when modal opens or diagnosis matches
  useEffect(() => {
    if (isOpen) {
      const match = NANDA_DATABASE.find(
        (n) => n.diagnosis.toLowerCase() === currentDiagnosis.toLowerCase()
      );
      const initial = match || NANDA_DATABASE[0];
      handleSelectActiveItem(initial);
      if (initial && initial.category) {
        setSelectedCategory(initial.category);
      }
    }
  }, [isOpen, currentDiagnosis]);

  // Keyboard shortcut: close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleFactor = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
  };

  const toggleOutcome = (outcome: string) => {
    setSelectedOutcomes((prev) =>
      prev.includes(outcome) ? prev.filter((o) => o !== outcome) : [...prev, outcome]
    );
  };

  const toggleIntervention = (intervention: string) => {
    setSelectedInterventions((prev) =>
      prev.includes(intervention)
        ? prev.filter((i) => i !== intervention)
        : [...prev, intervention]
    );
  };

  const selectAllFactors = () => {
    if (!activeItem) return;
    if (selectedFactors.length === activeItem.suggestedRelatedFactors.length) {
      setSelectedFactors([]);
    } else {
      setSelectedFactors([...activeItem.suggestedRelatedFactors]);
    }
  };

  const selectAllOutcomes = () => {
    if (!activeItem) return;
    if (selectedOutcomes.length === activeItem.suggestedExpectedOutcomes.length) {
      setSelectedOutcomes([]);
    } else {
      setSelectedOutcomes([...activeItem.suggestedExpectedOutcomes]);
    }
  };

  const selectAllInterventions = () => {
    if (!activeItem) return;
    if (selectedInterventions.length === activeItem.suggestedInterventions.length) {
      setSelectedInterventions([]);
    } else {
      setSelectedInterventions([...activeItem.suggestedInterventions]);
    }
  };

  const handleApply = () => {
    if (!activeItem) return;
    onSelectNanda(
      activeItem,
      selectedFactors.length > 0 ? selectedFactors : activeItem.suggestedRelatedFactors,
      selectedOutcomes.length > 0 ? selectedOutcomes : activeItem.suggestedExpectedOutcomes,
      selectedInterventions.length > 0
        ? selectedInterventions
        : activeItem.suggestedInterventions
    );
    onClose();
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'CCU/ICU':
        return <Activity className="w-4 h-4 text-rose-600" />;
      case 'Medical':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'Surgical':
        return <Scissors className="w-4 h-4 text-amber-600" />;
      case 'Ophthalmology':
        return <Eye className="w-4 h-4 text-indigo-600" />;
      case 'Oncology':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'Gynaecology':
        return <HeartPulse className="w-4 h-4 text-pink-600" />;
      case 'Paediatric':
        return <Baby className="w-4 h-4 text-emerald-600" />;
      case 'ENT':
        return <Wind className="w-4 h-4 text-teal-600" />;
      case 'Orthopedic':
        return <Layers className="w-4 h-4 text-orange-600" />;
      case 'Vascular':
        return <HeartPulse className="w-4 h-4 text-red-600" />;
      case 'Burn':
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'Haematology':
        return <Droplets className="w-4 h-4 text-red-600" />;
      case 'NICU':
        return <Baby className="w-4 h-4 text-cyan-600" />;
      case 'Psychiatry':
        return <Brain className="w-4 h-4 text-violet-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'CCU/ICU':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medical':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Surgical':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Ophthalmology':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Oncology':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Gynaecology':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Paediatric':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ENT':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Orthopedic':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Vascular':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Burn':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'Haematology':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'NICU':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Psychiatry':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id="nanda-search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="nanda-search-modal-container"
        className="relative w-full max-w-7xl h-[92vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  NANDA-I Nursing Problem Catalog
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 hidden sm:inline">
                  14 Clinical Specialties • Organized Navigation
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Browse standardized inpatient nursing diagnoses by clinical department or NANDA-I functional domain
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="close-nanda-modal-btn"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Close window (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Mode Switcher Bar */}
        <div className="px-6 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="nanda-search-input"
              type="text"
              placeholder="Search diagnoses by name, code (e.g. 00132), etiology, or intervention..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setBrowseMode('specialty');
                setSelectedDomain('All Domains');
              }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                browseMode === 'specialty'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Clinical Specialties (14)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBrowseMode('domain');
                setSelectedCategory('All Categories');
              }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                browseMode === 'domain'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>NANDA Domains (8)</span>
            </button>
          </div>
        </div>

        {/* 3-Column Structured Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-slate-100/60">
          {/* COLUMN 1: Organized Category Sidebar (3 cols on desktop) */}
          <div className="md:col-span-3 border-r border-slate-200 bg-white overflow-y-auto flex flex-col divide-y divide-slate-100">
            {/* All Overview Option */}
            <div className="p-3 bg-slate-50/50">
              <button
                type="button"
                id="cat-all-btn"
                onClick={() => {
                  setSelectedCategory('All Categories');
                  setSelectedDomain('All Domains');
                }}
                className={`w-full px-3 py-2 rounded-lg font-bold text-xs flex items-center justify-between transition-all border ${
                  selectedCategory === 'All Categories' && selectedDomain === 'All Domains'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>All Inpatient Diagnoses</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'All Categories' && selectedDomain === 'All Domains'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {NANDA_DATABASE.length}
                </span>
              </button>
            </div>

            {/* Structured Specialty Categories Explorer */}
            {browseMode === 'specialty' ? (
              <div className="p-3 space-y-4">
                {SPECIALTY_GROUPS.map((group) => (
                  <div key={group.name} className="space-y-1.5">
                    {/* Group Header */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {group.name}
                      </span>
                    </div>

                    {/* Category Buttons in Group */}
                    <div className="space-y-1">
                      {group.categories.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        const count = categoryCounts[cat] || 0;
                        return (
                          <button
                            key={cat}
                            id={`category-btn-${cat.replace(/[\/\s]/g, '-').toLowerCase()}`}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setSelectedDomain('All Domains');
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between group border ${
                              isSelected
                                ? 'bg-blue-50 text-blue-900 border-blue-400 ring-1 ring-blue-400 font-bold shadow-xs'
                                : 'bg-white text-slate-700 border-transparent hover:border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="shrink-0">{getCategoryIcon(cat)}</span>
                              <span className="truncate">{cat}</span>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Structured Domain Explorer */
              <div className="p-3 space-y-2">
                <div className="px-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    NANDA-I Domains
                  </span>
                </div>
                <div className="space-y-1">
                  {NANDA_DOMAINS.map((domain) => {
                    if (domain === 'All Domains') return null;
                    const isSelected = selectedDomain === domain;
                    const count = domainCounts[domain] || 0;
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => {
                          setSelectedDomain(domain);
                          setSelectedCategory('All Categories');
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between group border ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 border-blue-400 ring-1 ring-blue-400 font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-transparent hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{domain}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: Filtered Diagnoses List (4 cols on desktop) */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/70 overflow-y-auto flex flex-col p-3 space-y-2">
            {/* List Header Filter Status */}
            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-500 border-b border-slate-200 pb-1.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">
                  {browseMode === 'specialty' ? selectedCategory : selectedDomain}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                  {filteredList.length} items
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Click to customize</span>
            </div>

            {/* List Items */}
            {filteredList.length === 0 ? (
              <div className="text-center py-12 px-4">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No diagnoses found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try clearing your search query or selecting "All Diagnoses".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All Categories');
                    setSelectedDomain('All Domains');
                  }}
                  className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg border border-blue-200"
                >
                  Reset Search & Filters
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredList.map((item) => {
                  const isActive = activeItem && activeItem.diagnosis === item.diagnosis;
                  return (
                    <button
                      key={`${item.diagnosis}-${item.category}`}
                      id={`nanda-item-${item.code || item.diagnosis.replace(/\s+/g, '-').toLowerCase()}`}
                      type="button"
                      onClick={() => handleSelectActiveItem(item)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-white border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top: Diagnosis & NANDA Code */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0">{getCategoryIcon(item.category)}</span>
                          <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                            {item.diagnosis}
                          </span>
                        </div>
                        {item.code && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            #{item.code}
                          </span>
                        )}
                      </div>

                      {/* Category & Domain Badges */}
                      <div className="flex flex-wrap items-center gap-1 text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200 truncate max-w-[140px]">
                          {item.domain}
                        </span>
                      </div>

                      {/* Snippet */}
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans">
                        {item.definition}
                      </p>

                      {/* Components Preview Counters */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                        <span className="text-amber-700 font-medium">
                          {item.suggestedRelatedFactors.length} etiologies
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">
                          {item.suggestedExpectedOutcomes.length} goals
                        </span>
                        <span>•</span>
                        <span className="text-blue-700 font-medium">
                          {item.suggestedInterventions.length} actions
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMN 3: Active Diagnosis Details & Care Plan Builder (5 cols on desktop) */}
          <div className="md:col-span-5 bg-white overflow-y-auto flex flex-col h-full">
            {activeItem ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Active Diagnosis Overview Banner */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${getCategoryBadgeClass(activeItem.category)}`}>
                        {getCategoryIcon(activeItem.category)}
                        {activeItem.category}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {activeItem.domain}
                      </span>
                    </div>
                    {activeItem.code && (
                      <span className="text-xs font-mono text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                        NANDA #{activeItem.code}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {activeItem.diagnosis}
                  </h3>

                  <div className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-0.5">Clinical Definition:</span>
                    {activeItem.definition}
                  </div>
                </div>

                {/* Section 1: Related Factors (Etiology) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        1. Related Factors (Etiology)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={selectAllFactors}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
                    >
                      {selectedFactors.length === activeItem.suggestedRelatedFactors.length
                        ? 'Clear All'
                        : 'Select All'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Select contributing pathophysiology, surgical factors, or causes:
                  </p>
                  <div className="space-y-1.5">
                    {activeItem.suggestedRelatedFactors.map((factor, idx) => {
                      const isChecked = selectedFactors.includes(factor);
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFactor(factor)}
                            className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 shrink-0"
                          />
                          <span className="leading-snug">{factor}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Expected Outcomes (NOC) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        2. Expected Outcomes (NOC Goals)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={selectAllOutcomes}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline"
                    >
                      {selectedOutcomes.length === activeItem.suggestedExpectedOutcomes.length
                        ? 'Clear All'
                        : 'Select All'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Select measurable SMART patient goals and timelines:
                  </p>
                  <div className="space-y-1.5">
                    {activeItem.suggestedExpectedOutcomes.map((outcome, idx) => {
                      const isChecked = selectedOutcomes.includes(outcome);
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOutcome(outcome)}
                            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                          />
                          <span className="leading-snug">{outcome}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Nursing Interventions (NIC) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        3. Nursing Interventions & Actions (NIC)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={selectAllInterventions}
                      className="text-[11px] font-bold text-blue-800 hover:text-blue-950 underline"
                    >
                      {selectedInterventions.length === activeItem.suggestedInterventions.length
                        ? 'Clear All'
                        : 'Select All'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Select independent, collaborative, and assessment nursing actions:
                  </p>
                  <div className="space-y-1.5">
                    {activeItem.suggestedInterventions.map((intervention, idx) => {
                      const isChecked = selectedInterventions.includes(intervention);
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleIntervention(intervention)}
                            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                          />
                          <span className="leading-snug">{intervention}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <BookOpen className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Select a diagnosis</p>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a problem from the middle list to configure etiologies, outcomes, and interventions.
                </p>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 shadow-sm">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>

              <button
                id="apply-nanda-to-plan-btn"
                type="button"
                onClick={handleApply}
                disabled={!activeItem}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Apply to Care Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NandaSearchModal;
