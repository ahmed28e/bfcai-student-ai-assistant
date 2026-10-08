import React from 'react';
import { Sparkles, ExternalLink, BookOpen, ShieldCheck, Github } from 'lucide-react';

export default function Navbar({ onOpenSources }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Right side: Brand & Logo (in RTL: Right side is start) */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-bfcai-600 to-sky-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
              <img src="/bfcai_logo.svg" alt="BFCAI Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-sky-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                المساعد الذكي لطلاب BFCAI
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="w-3 h-3" /> إصدار 1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              كلية الحاسبات والذكاء الاصطناعي — جامعة بنها
            </p>
          </div>
        </div>

        {/* Left side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors shadow-sm"
            title="إعدادات الذكاء الاصطناعي و Dify"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">محرك الـ AI</span>
          </button>

          <button
            onClick={onOpenSources}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-colors shadow-sm"
            title="المصادر المعتمدة"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">المصادر المعتمدة</span>
          </button>

          <a
            href="https://github.com/ahmed28e/bfcai-student-ai-assistant"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 transition-colors"
            title="المشروع على GitHub"
          >
            <Github className="w-4 h-4" />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>

      </div>
    </header>
  );
}
