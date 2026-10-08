import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Globe, Bot, Sparkles, Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';

export default function ChatWindow({ 
  messages, 
  loading, 
  onSendMessage, 
  onClearChat,
  selectedYear,
  allowWebSearch,
  onToggleWebSearch
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || loading) return;

    onSendMessage(text);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[650px] shadow-2xl border border-slate-800 overflow-hidden">
      
      {/* Chat Top Toolbar */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400">
            <Bot className="w-3.5 h-3.5" />
            <span>المحادثة مخصصة لـ: {selectedYear}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Web Search Fallback */}
          <button
            type="button"
            onClick={onToggleWebSearch}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
              allowWebSearch
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
            title="تفعيل أو تعطيل البحث في جوجل عند عدم وجود الإجابة محلياً"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">بحث جوجل الاحتياطي:</span>
            <span>{allowWebSearch ? 'مفعّل' : 'معطّل'}</span>
          </button>

          {/* Clear Chat */}
          <button
            onClick={onClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 my-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-bfcai-500 flex items-center justify-center p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
              </div>
            </div>
            <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-none border border-slate-800 flex items-center gap-2 text-xs text-slate-300 shadow-md">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>جاري استخراج البيانات من مصادر كلية الحاسبات وبنها والتحقق...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/80">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`اكتب سؤالك هنا لـ ${selectedYear}... (مثال: ما هي شروط التدريب الصيفي؟)`}
            disabled={loading}
            className="w-full bg-slate-900 border border-slate-700/80 focus:border-sky-500 rounded-xl py-3 pr-4 pl-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none transition-colors max-h-32 leading-relaxed"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="absolute left-2.5 p-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky-600/30 flex items-center justify-center"
            title="إرسال"
          >
            <Send className="w-4 h-4 transform rotate-180" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500 mt-2">
          المساعد الذكي يستند إلى اللائحة الأكاديمية وصفحة الفيسبوك وقناة الواتساب الرسمية لكلية الحاسبات والذكاء الاصطناعي بنها.
        </p>
      </div>

    </div>
  );
}
