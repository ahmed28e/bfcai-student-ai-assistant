import React from 'react';
import { GraduationCap, Database, Globe, Search, Layers } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-800/80 p-5 sm:p-6 mb-6 shadow-xl">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <GraduationCap className="w-3.5 h-3.5" /> مخصص لطلاب الفرق الأربعة
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Database className="w-3.5 h-3.5" /> قاعدة معرفة RAG + ChromaDB
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Globe className="w-3.5 h-3.5" /> بحث حي جوجل لدعم الإجابات
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
          مرشدك الأكاديمي الذكي لكل ما يخص كلية الحاسبات والذكاء الاصطناعي بنها 🎓
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          اطرح أي سؤال عن اللائحة، الساعات المعتمدة، المواد الدراسية، شروط التشعيب للأقسام، التدريب الصيفي، ومشاريع التخرج. يتم استخراج الإجابات من مصادر الكلية الرسمية وتخصيصها لفرقتك الدراسية فوراً.
        </p>
      </div>
    </div>
  );
}
