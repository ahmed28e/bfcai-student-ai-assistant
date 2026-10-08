import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  User, 
  Bot, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  Facebook, 
  MessageSquare, 
  BookOpen, 
  Sparkles,
  Info
} from 'lucide-react';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSourceIcon = (sourceType) => {
    if (sourceType.includes('فيسبوك')) {
      return <Facebook className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (sourceType.includes('واتساب')) {
      return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (sourceType.includes('جوجل') || sourceType.includes('الويب')) {
      return <Globe className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <BookOpen className="w-3.5 h-3.5 text-sky-400" />;
  };

  const getSourceBadgeColor = (sourceType) => {
    if (sourceType.includes('فيسبوك')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (sourceType.includes('واتساب')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (sourceType.includes('جوجل') || sourceType.includes('الويب')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  };

  return (
    <div className={`flex gap-3 sm:gap-4 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <User className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-bfcai-500 flex items-center justify-center text-white shadow-md shadow-sky-600/30 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-sky-400" />
            </div>
          </div>
        )}
      </div>

      {/* Message Content Container */}
      <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Header meta */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-slate-300">
            {isUser ? 'أنت (طالب BFCAI)' : 'المساعد الذكي للكلية'}
          </span>
          {message.academicYear && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
              {message.academicYear}
            </span>
          )}
          {message.usedWebSearch && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" /> بحث جوجل الحي
            </span>
          )}
          <span className="text-[10px] text-slate-500">
            {message.timestamp || ''}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-tr-none shadow-md shadow-indigo-900/30'
              : 'glass-panel text-slate-100 rounded-tl-none border border-slate-800 shadow-lg'
          }`}
        >
          {/* Markdown Output */}
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:text-sky-300 prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Assistant Action Bar */}
          {!isUser && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 hover:text-sky-300 transition-colors"
                title="نسخ الإجابة"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">نسخ النص</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>إجابة مدعومة بتقنية RAG</span>
              </div>
            </div>
          )}
        </div>

        {/* Source Citations (Only for assistant messages if available) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="w-full mt-2 space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-1">
              <Info className="w-3 h-3 text-sky-400" />
              <span>المصادر المعتمدة المستند إليها:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {message.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/30 transition-all text-right group"
                >
                  <span className="mt-0.5">{getSourceIcon(src.source_type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getSourceBadgeColor(src.source_type)}`}>
                        {src.source_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium truncate mt-0.5 group-hover:text-sky-300 transition-colors">
                      {src.title}
                    </p>
                    {src.snippet && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {src.snippet}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-sky-400 flex-shrink-0 mt-1 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
