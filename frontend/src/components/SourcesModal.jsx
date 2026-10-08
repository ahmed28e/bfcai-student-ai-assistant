import React from 'react';
import { X, ExternalLink, Globe, Facebook, MessageSquare, ShieldCheck, Search, Database } from 'lucide-react';

export default function SourcesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const sourcesList = [
    {
      name: "الموقع الرسمي لكلية الحاسبات والذكاء الاصطناعي - جامعة بنها",
      url: "https://fci.bu.edu.eg/",
      type: "موقع الكلية الرسمي",
      description: "المصدر الأساسي للوائح الأكاديمية، الخطة الدراسية، تشكيلات مجالس الأقسام، ونظام الساعات المعتمدة.",
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      badge: "المصدر الرئيسي"
    },
    {
      name: "الصفحة الرسمية المعتمدة على فيسبوك (Official.BFCAI)",
      url: "https://www.facebook.com/Official.BFCAI",
      type: "صفحة الفيسبوك",
      description: "تنشر الإعلانات اليومية العاجلة، جداول الميدتيرم والفاينال، مواعيد سداد المصروفات، والأنشطة الطلابية.",
      icon: <Facebook className="w-5 h-5 text-blue-400" />,
      badge: "إعلانات حية"
    },
    {
      name: "قناة الواتساب الرسمية لتنبيهات الطلاب",
      url: "https://whatsapp.com/channel/0029VbDCrkm0Qean90DDeQ1Q",
      type: "قناة واتساب",
      description: "البث المباشر لأهم التنبيهات الفورية الخاصة باستلام الكارنيهات، كشوف السكاشن، ومواعيد تسليم المشاريع.",
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      badge: "تنبيهات فورية"
    },
    {
      name: "محرك بحث الويب (Google / DuckDuckGo / Tavily)",
      url: "https://google.com",
      type: "بحث الويب الحي",
      description: "خط الدفاع الاحتياطي: إذا لم يتوفر الجواب داخل مصادر الكلية أعلاه، يقوم الشات بوت بالبحث المباشر عبر جوجل.",
      icon: <Search className="w-5 h-5 text-amber-400" />,
      badge: "Fallback Search"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">المصادر المعتمدة الموثوقة للشات بوت</h3>
            <p className="text-xs text-slate-400">يتم استخراج كافة البيانات والإجابات من هذه المنصات بدقة وتوثيق</p>
          </div>
        </div>

        {/* RAG Workflow explanation */}
        <div className="mb-5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3 text-xs text-slate-300">
          <Database className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <span>
            <strong>آلية عمل الـ RAG:</strong> يبحث الشات بوت أولاً في قاعدة المعرفة المحلية المأخوذة من الكلية (موقع + فيسبوك + واتساب)، وإذا لم تكن الإجابة كافية، يتجه فوراً لمحرك بحث Google لدعم الإجابة وذكر المصدر.
          </span>
        </div>

        {/* Sources List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {sourcesList.map((src, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {src.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{src.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-semibold border border-slate-700">
                        {src.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {src.description}
                    </p>
                  </div>
                </div>

                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition-colors flex-shrink-0"
                >
                  <span>زيارة</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
