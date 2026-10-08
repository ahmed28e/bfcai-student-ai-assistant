import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function QuickPrompts({ prompts, onSelectPrompt, disabled }) {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
        <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
        <span>أسئلة شائعة ومقترحة لهذه الفرقة:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            disabled={disabled}
            className="flex items-center gap-1.5 text-xs text-right py-1.5 px-3 rounded-full bg-slate-800/80 hover:bg-sky-950/60 text-slate-300 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/40 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none group shadow-sm"
          >
            <span>{prompt}</span>
            <ArrowLeft className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors transform group-hover:-translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
