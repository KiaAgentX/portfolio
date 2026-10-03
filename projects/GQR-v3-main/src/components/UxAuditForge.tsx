import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  HelpCircle, 
  Award, 
  CheckCircle, 
  CheckSquare, 
  Square, 
  BookOpen, 
  Zap, 
  ShieldAlert, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UX_100_QUESTIONS, UXQuestion } from '../data/uxQuestions';

export default function UxAuditForge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gqr_ux_checked_questions');
      if (stored) {
        setCheckedIds(JSON.parse(stored));
      } else {
        // Default check some to make it look alive
        const initial = [1, 3, 21, 24, 41, 44, 61, 81, 83];
        setCheckedIds(initial);
        localStorage.setItem('gqr_ux_checked_questions', JSON.stringify(initial));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleCheck = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('gqr_ux_checked_questions', JSON.stringify(next));
      return next;
    });
  };

  const markAllOfCategory = (category: string) => {
    const idsToToggle = filteredQuestions.map(q => q.id);
    setCheckedIds(prev => {
      let next = [...prev];
      idsToToggle.forEach(id => {
        if (!next.includes(id)) next.push(id);
      });
      localStorage.setItem('gqr_ux_checked_questions', JSON.stringify(next));
      return next;
    });
  };

  const resetAllChecks = () => {
    setCheckedIds([]);
    localStorage.setItem('gqr_ux_checked_questions', JSON.stringify([]));
  };

  // Group options
  const categories = ['All', 'Real-time Visualization', 'Typography & Aesthetic', 'Performance & Layout', 'Smart Heuristics', 'Risk & Usability'];

  const filteredQuestions = UX_100_QUESTIONS.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.solution.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const completionPercent = ((checkedIds.length / UX_100_QUESTIONS.length) * 100).toFixed(0);

  // Visual highlights for categories
  const getCategoryStats = (cat: string) => {
    const questions = UX_100_QUESTIONS.filter(q => cat === 'All' || q.category === cat);
    const checked = questions.filter(q => checkedIds.includes(q.id));
    return {
      total: questions.length,
      checked: checked.length,
      percent: questions.length ? Math.round((checked.length / questions.length) * 100) : 0
    };
  };

  return (
    <div className="space-y-6" id="ux-audit-forge-container">
      {/* Upper Descriptive Header Banner */}
      <div className="bg-panel-dark border border-border-medium rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-brand-orange/15 text-brand-orange text-[9.5px] font-mono rounded font-semibold uppercase tracking-wider">
              System Audit
            </span>
            <span className="text-zinc-500 text-xs font-mono">• 100 Pillars of Craft</span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand-orange" />
            <span>Greek Oracle UI/UX Forge Arena</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl font-sans leading-relaxed">
            The 100 fundamental, self-reflective diagnostic design questions on optimizing trading terminal experiences. Use this quantitative map to audit and benchmark visual layout structures.
          </p>
        </div>

        {/* Global completion score widget */}
        <div className="bg-[#0e0c0a] border border-brand-orange/20 rounded-xl p-4.5 flex items-center gap-4.5 shrink-0 w-full md:w-auto shadow-lg">
          <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="27" stroke="rgba(255,255,255,0.03)" strokeWidth="4.5" fill="transparent" />
              <circle 
                cx="32" 
                cy="32" 
                r="27" 
                stroke="#f27d26" 
                strokeWidth="4.5" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 27}
                strokeDashoffset={2 * Math.PI * 27 * (1 - checkedIds.length / 100)}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute text-brand-orange font-mono font-extrabold text-sm">{completionPercent}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-mono text-zinc-400 uppercase tracking-wider">Audit Progress</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              <strong className="text-brand-orange font-bold font-sans text-xs">{checkedIds.length}</strong> of 100 standards passed
            </span>
            <button 
              onClick={resetAllChecks}
              className="text-[10px] text-zinc-650 hover:text-brand-orange transition-all mt-1 flex items-center gap-1 cursor-pointer underline"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Reset Standards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Bento Cells Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat, idx) => {
          const stats = getCategoryStats(cat);
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`p-3.5 rounded-xl border transition-all text-left relative overflow-hidden flex flex-col justify-between h-24 cursor-pointer ${
                isSelected 
                  ? 'bg-brand-orange/5 border-brand-orange/40 shadow-md shadow-brand-orange/5' 
                  : 'bg-panel-dark border-border-dark hover:border-zinc-700/80'
              }`}
            >
              <span className={`text-[11px] font-sans font-semibold leading-tight ${isSelected ? 'text-brand-orange' : 'text-zinc-350'}`}>
                {cat === 'All' ? 'Complete Catalog' : cat}
              </span>
              <div className="mt-3 space-y-1">
                <span className="text-xs font-mono font-bold text-white block">
                  {stats.checked}/{stats.total}
                </span>
                <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-brand-orange h-1 rounded-full transitions-all" 
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Toolbar - Live Filtering & Bulk Command */}
      <div className="bg-[#0c0c0d] border border-border-dark rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search through 100 quantitative UI rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-panel-dark border border-border-dark pl-9.5 pr-4 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-brand-orange"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {selectedCategory !== 'All' && (
            <button
              onClick={() => markAllOfCategory(selectedCategory)}
              className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-border-dark text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5 text-brand-orange" />
              <span>Pass Entire Category</span>
            </button>
          )}
          <span className="px-3 py-1.5 bg-[#121213] text-zinc-450 border border-border-dark/60 text-[10.5px] font-mono rounded-lg flex items-center justify-center">
            Matching: {filteredQuestions.length} Items
          </span>
        </div>
      </div>

      {/* 100 Standards Interactive Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <AnimatePresence>
          {filteredQuestions.map((q) => {
            const isChecked = checkedIds.includes(q.id);
            const isExpanded = expandedId === q.id;
            return (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden group ${
                  isChecked 
                    ? 'bg-panel-dark/50 border-brand-orange/20 hover:border-brand-orange/35' 
                    : 'bg-panel-dark/30 border-border-dark hover:border-[#333]'
                } ${isExpanded ? 'ring-1 ring-brand-orange/30' : ''}`}
              >
                {/* Visual marker */}
                <div className="flex items-start gap-3.5 justify-between">
                  <div className="flex items-start gap-2.5">
                    <button 
                      onClick={(e) => toggleCheck(q.id, e)}
                      className="mt-0.5 text-zinc-500 hover:text-brand-orange transition-all cursor-pointer shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4.5 w-4.5 text-brand-orange glow-orange-sm" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-zinc-600 group-hover:text-zinc-500" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-brand-orange">
                          #{String(q.id).padStart(3, '0')}
                        </span>
                        <span className="px-1.5 py-0.5 bg-zinc-850 text-zinc-400 text-[8.5px] font-mono rounded">
                          {q.category}
                        </span>
                        <span className="text-[9px] text-zinc-650 flex items-center gap-0.5">
                          <Zap className="h-2.5 w-2.5" /> Imp: {q.impactScore}/10
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold tracking-tight text-zinc-250 font-sans mt-1 leading-snug">
                        {q.question}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Solution Drawer */}
                <AnimatePresence>
                  {(isExpanded || isChecked) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3.5 pt-3 border-t border-border-dark/60 pl-7 text-[12px] text-zinc-400 font-sans leading-relaxed"
                    >
                      <div className="flex items-start gap-1 text-xs text-[#d1cfa9]">
                        <BookOpen className="h-3.5 w-3.5 text-brand-orange mt-0.5 shrink-0" />
                        <span>
                          <strong>Engine Strategy:</strong> {q.solution}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Direct action indicator on corner of card */}
                {!isChecked && !isExpanded && (
                  <div className="absolute bottom-2.5 right-3 text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-all font-mono">
                    Click to view layout strategy
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredQuestions.length === 0 && (
        <div className="p-12 text-center bg-panel-dark border border-border-dark rounded-xl space-y-3">
          <ShieldAlert className="h-10 w-10 text-zinc-600 mx-auto" />
          <h4 className="text-sm text-zinc-300 font-bold font-sans">No matching parameters</h4>
          <p className="text-zinc-500 text-xs font-sans max-w-md mx-auto">
            No standards or questions fit your search queries. Try refining your keywords or toggling the categories selectors.
          </p>
        </div>
      )}
    </div>
  );
}
