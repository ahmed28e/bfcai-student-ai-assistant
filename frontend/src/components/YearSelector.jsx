import React from 'react';
import { Calendar, Layers, CheckCircle2, ChevronDown } from 'lucide-react';

export default function YearSelector({ years, selectedYear, onSelectYear }) {
  const currentYearData = years.find(y => y.name === selectedYear) || years[0];

  return (
    <div className="glass-card rounded-xl p-4 mb-5 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">اختر فرقتك الدراسية لتخصيص الإجابات:</h3>
            <p className="text-xs text-slate-400">يقوم الذكاء الاصطناعي بتخصيص اللائحة والمقررات تبعاً لفرقتك</p>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className="sm:hidden relative">
          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(e.target.value)}
            className="w-full bg-slate-900 border border-sky-500/30 rounded-lg py-2 px-3 text-sm text-sky-300 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {years.map((y) => (
              <option key={y.id} value={y.name} className="bg-slate-900 text-white">
                {y.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-sky-400 absolute left-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Desktop & Tablet Buttons / Pills */}
      <div className="hidden sm:grid sm:grid-cols-5 gap-2">
        {years.map((year) => {
          const isSelected = selectedYear === year.name;
          return (
            <button
              key={year.id}
              onClick={() => onSelectYear(year.name)}
              className={`relative flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 border ${
                isSelected
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-sky-400 shadow-md shadow-sky-600/30 scale-[1.02]'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-200" />}
              <span>{year.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Year Extra Info */}
      {currentYearData && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-sky-400 font-semibold">نبذة الفرقة:</span>
            <span>{currentYearData.description}</span>
          </div>
          {currentYearData.departments && currentYearData.departments.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-indigo-400 font-semibold">الأقسام:</span>
              <span className="text-slate-300 font-medium">
                {currentYearData.departments.join(' • ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
