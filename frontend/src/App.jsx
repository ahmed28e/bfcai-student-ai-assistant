import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import YearSelector from './components/YearSelector';
import QuickPrompts from './components/QuickPrompts';
import ChatWindow from './components/ChatWindow';
import SourcesModal from './components/SourcesModal';
import SettingsModal from './components/SettingsModal';
import { useChat } from './hooks/useChat';

export default function App() {
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const {
    years,
    selectedYear,
    setSelectedYear,
    messages,
    loading,
    allowWebSearch,
    setAllowWebSearch,
    currentYearData,
    handleSendMessage,
    handleClearChat
  } = useChat();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Top Navbar */}
      <Navbar 
        onOpenSources={() => setSourcesModalOpen(true)} 
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Hero Banner */}
        <HeroBanner />

        {/* Academic Year Selector (Dropdown / Pills) */}
        <YearSelector
          years={years}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
        />

        {/* Suggested Prompts for the Selected Year */}
        <QuickPrompts
          prompts={currentYearData?.quick_prompts}
          onSelectPrompt={handleSendMessage}
          disabled={loading}
        />

        {/* Main Chat Interface */}
        <ChatWindow
          messages={messages}
          loading={loading}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          selectedYear={selectedYear}
          allowWebSearch={allowWebSearch}
          onToggleWebSearch={() => setAllowWebSearch(!allowWebSearch)}
        />

      </main>

      {/* Sources Verification Modal */}
      <SourcesModal
        isOpen={sourcesModalOpen}
        onClose={() => setSourcesModalOpen(false)}
      />

      {/* AI & Dify Engine Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Bottom Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>
          تم التطوير كنموذج ريادي متقدم بالذكاء الاصطناعي و RAG لخدمة طلاب كلية الحاسبات والذكاء الاصطناعي - جامعة بنها (BFCAI)
        </p>
      </footer>

    </div>
  );
}
