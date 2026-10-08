import { useState, useEffect } from 'react';
import { sendMessage, fetchAcademicYears } from '../services/api';

const DEFAULT_WELCOME_MESSAGE = {
  role: 'assistant',
  content: `أهلاً بك يا بطل في **المساعد الذكي لطلاب كلية الحاسبات والذكاء الاصطناعي - جامعة بنها (BFCAI)** 🎓!

أنا هنا للإجابة على جميع استفساراتك بناءً على:
1. 🌐 **الموقع الرسمي للكلية** ولائحة الساعات المعتمدة.
2. 📘 **الصفحة الرسمية المعتمدة على فيسبوك** (Official.BFCAI).
3. 💬 **قناة الواتساب الرسمية** لتنبيهات الطلاب الفورية.
4. 🔍 **بحث جوجل الحي** كدعم إضافي عند عدم توفر المعلومة في مصادر الكلية.

اختر فرقتك الدراسية من الأعلى لتخصيص الإجابة، أو اختر سؤالاً من الأسئلة المقترحة بالأسفل لنبدأ فوراً!`,
  sources: [
    {
      title: "كلية الحاسبات والذكاء الاصطناعي - جامعة بنها",
      url: "https://fci.bu.edu.eg/",
      source_type: "موقع الكلية الرسمي",
      snippet: "الموقع المعتمد لجامعة بنها"
    }
  ],
  timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
};

export function useChat() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('الفرقة الأولى');
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [allowWebSearch, setAllowWebSearch] = useState(true);

  useEffect(() => {
    async function loadYears() {
      const data = await fetchAcademicYears();
      if (data && data.length > 0) {
        setYears(data);
      }
    }
    loadYears();
  }, []);

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      academicYear: selectedYear,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendMessage(text, selectedYear, messages, allowWebSearch);
      
      const botMsg = {
        role: 'assistant',
        content: res.answer,
        sources: res.sources || [],
        academicYear: res.academic_year || selectedYear,
        usedWebSearch: res.used_web_search || false,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'حدث خطأ غير متوقع أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.',
          sources: [],
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
  };

  const currentYearData = years.find((y) => y.name === selectedYear) || years[0];

  return {
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
  };
}
