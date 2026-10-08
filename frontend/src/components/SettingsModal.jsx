import React, { useState, useEffect } from 'react';
import { X, Key, Bot, Sparkles, Check, Server, Shield } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSaveSettings }) {
  const [engineType, setEngineType] = useState('embedded'); // 'embedded', 'gemini', 'dify'
  const [geminiKey, setGeminiKey] = useState('');
  const [difyKey, setDifyKey] = useState('');
  const [difyUrl, setDifyUrl] = useState('https://api.dify.ai/v1');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedEngine = localStorage.getItem('bfcai_engine_type') || 'embedded';
    const savedGemini = localStorage.getItem('bfcai_gemini_key') || '';
    const savedDifyKey = localStorage.getItem('bfcai_dify_key') || '';
    const savedDifyUrl = localStorage.getItem('bfcai_dify_url') || 'https://api.dify.ai/v1';

    setEngineType(savedEngine);
    setGeminiKey(savedGemini);
    setDifyKey(savedDifyKey);
    setDifyUrl(savedDifyUrl);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('bfcai_engine_type', engineType);
    localStorage.setItem('bfcai_gemini_key', geminiKey.trim());
    localStorage.setItem('bfcai_dify_key', difyKey.trim());
    localStorage.setItem('bfcai_dify_url', difyUrl.trim());

    if (onSaveSettings) {
      onSaveSettings({ engineType, geminiKey, difyKey, difyUrl });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">إعدادات محرك الذكاء الاصطناعي و Dify</h3>
            <p className="text-xs text-slate-400">اختر طريقة تشغيل وتوليد الإجابات</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Engine Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">نمط التشغيل المعتمد:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEngineType('embedded')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  engineType === 'embedded'
                    ? 'bg-sky-600/20 border-sky-500 text-sky-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                المحرك المدمج
                <span className="block text-[10px] text-slate-500 font-normal mt-0.5">مجاني وسريع</span>
              </button>

              <button
                type="button"
                onClick={() => setEngineType('dify')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  engineType === 'dify'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                مشروع Dify
                <span className="block text-[10px] text-slate-500 font-normal mt-0.5">لوحة تحكم + وكلاء</span>
              </button>

              <button
                type="button"
                onClick={() => setEngineType('gemini')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  engineType === 'gemini'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Google Gemini
                <span className="block text-[10px] text-slate-500 font-normal mt-0.5">مفتاح API مباشر</span>
              </button>
            </div>
          </div>

          {/* Dify Settings */}
          {engineType === 'dify' && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/50 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ربط Dify Chatbot API:</span>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Dify API Key (App Key):</label>
                <input
                  type="password"
                  value={difyKey}
                  onChange={(e) => setDifyKey(e.target.value)}
                  placeholder="app-xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Dify Base URL:</label>
                <input
                  type="text"
                  value={difyUrl}
                  onChange={(e) => setDifyUrl(e.target.value)}
                  placeholder="https://api.dify.ai/v1"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[10px] text-indigo-400">
                احصل على مفتاح التطبيق من منصة Dify (قسم API Access في تطبيقك).
              </p>
            </div>
          )}

          {/* Gemini Settings */}
          {engineType === 'gemini' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <Key className="w-3.5 h-3.5" />
                <span>مفتاح Google Gemini API:</span>
              </div>
              <div>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-emerald-400">
                يتم حفظ المفتاح محلياً في متصفحك فقط، ويتصل مباشرة بنموذج Gemini 1.5 Flash.
              </p>
            </div>
          )}

          {/* Embedded Engine Info */}
          {engineType === 'embedded' && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-sky-400">⚡ المحرك المدمج الذكي لكلية الحاسبات:</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                يعمل ذاتياً 100% دون الحاجة لأي خوادم خارجية أو مفاتيح API، ويحتوي على كافة بيانات الكلية واللائحة لجميع الفرق الأربعة.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" /> حفظ آمن في المتصفح
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 transition-all shadow-md shadow-sky-600/20"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>تم الحفظ!</span>
                  </>
                ) : (
                  <span>حفظ وتفعيل</span>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
