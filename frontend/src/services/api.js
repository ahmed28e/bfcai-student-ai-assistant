const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function sendMessage(message, academicYear, history = [], allowWebSearch = true) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        academic_year: academicYear,
        history: history.map(h => ({ role: h.role, content: h.content })),
        allow_web_search: allowWebSearch,
      }),
    });

    if (!response.ok) {
      throw new Error(`خطأ في استجابة الخادم: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Chat API Error:', error);
    // Offline / Network fallback message
    return {
      answer: `⚠️ تعذر الاتصال بخادم الـ Backend على الرابط (${API_BASE_URL}). \n\nتأكد من تشغيل خادم FastAPI عبر الأمر: \n\`\`\`bash\nuvicorn app.main:app --reload\n\`\`\`\n\nالسؤال المطلوب كان: "${message}" مخصصاً لـ: "${academicYear}".`,
      sources: [
        {
          title: "الموقع الرسمي لكلية الحاسبات والذكاء الاصطناعي بنها",
          url: "https://fci.bu.edu.eg/",
          source_type: "موقع الكلية الرسمي",
          snippet: "يرجى التحقق من القنوات الرسمية أثناء انقطاع اتصال الخادم المحلي."
        }
      ],
      academic_year: academicYear,
      used_web_search: false,
      confidence: "low"
    };
  }
}

export async function fetchAcademicYears() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/years`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Using default academic years:', err);
  }

  // Default fallback if server not running yet
  return [
    {
      id: "year_1",
      name: "الفرقة الأولى",
      description: "مرحلة الإعداد العام، البرمجة التمهيدية C++، ونظام الساعات المعتمدة",
      departments: ["عام"],
      quick_prompts: [
        "ما هي مواد الفصل الدراسي الأول بالفرقة الأولى؟",
        "كيف يتم حساب المعدل التراكمي GPA وشروط الإنذار الأكاديمي؟",
        "أين تقع مدرجات الفرقة الأولى وكيف استلم الكارنيه الجامعي؟"
      ]
    },
    {
      id: "year_2",
      name: "الفرقة الثانية",
      description: "هياكل البيانات، البرمجة الشيئية OOP، قواعد البيانات والتشعيب",
      departments: ["عام تمهيدي للتشعيب"],
      quick_prompts: [
        "ما هي شروط وضوابط التشعيب للأقسام في نهاية الفرقة الثانية؟",
        "ما هي المواد المقررة في الفصل الدراسي الثاني؟",
        "كيف استعد لمادة هياكل البيانات والخوارزميات؟"
      ]
    },
    {
      id: "year_3",
      name: "الفرقة الثالثة",
      description: "التخصص بالأقسام الأربعة، البرامج النوعية، والتدريب الصيفي الإجباري",
      departments: ["علوم الحاسب CS", "نظم المعلومات IS", "تكنولوجيا المعلومات IT", "الذكاء الاصطناعي AI"],
      quick_prompts: [
        "ما هي شروط وضوابط التدريب الصيفي الإجباري المعتمد؟",
        "ما هي الفروق الجوهرية بين أقسام الكلية ومجالات عمل كل قسم؟",
        "ما هي المواد التخصصية لقسم الذكاء الاصطناعي وقسم علوم الحاسب؟"
      ]
    },
    {
      id: "year_4",
      name: "الفرقة الرابعة",
      description: "سنة التخرج ومشاريع التخرج والتدريب الميداني وإنهاء الدراسة",
      departments: ["علوم الحاسب CS", "نظم المعلومات IS", "تكنولوجيا المعلومات IT", "الذكاء الاصطناعي AI"],
      quick_prompts: [
        "ما هي ضوابط اختيار فكرة مشروع التخرج وتكوين الفريق؟",
        "ما هي إجراءات إخلاء الطرف واستخراج شهادة التخرج المؤقتة؟",
        "كم عدد الساعات المعتمدة المطلوبة للتخرج؟"
      ]
    },
    {
      id: "general",
      name: "عام (كافة الفرق)",
      description: "معلومات عامة وشاملة عن الكلية وإداراتها وجداول الامتحانات والأنشطة",
      departments: ["إدارة الكلية، شؤون الطلاب، رعاية الشباب"],
      quick_prompts: [
        "أين يقع مقر كلية الحاسبات والذكاء الاصطناعي ببنها؟",
        "ما هي ضوابط الامتحانات والأعذار المرضية المعتمدة؟",
        "ما هي القنوات والروابط الرسمية المعتمدة للكلية؟"
      ]
    }
  ];
}

export async function fetchOfficialSources() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sources`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Sources fetch fallback:', e);
  }
  return {
    website: {
      title: "الموقع الرسمي لكلية الحاسبات والذكاء الاصطناعي - جامعة بنها",
      url: "https://fci.bu.edu.eg/",
      badge: "موقع رسمي"
    },
    facebook: {
      title: "الصفحة الرسمية المعتمدة على فيسبوك (Official.BFCAI)",
      url: "https://www.facebook.com/Official.BFCAI",
      badge: "فيسبوك رسمي"
    },
    whatsapp_channel: {
      title: "قناة الواتساب الرسمية لتنبيهات الطلاب",
      url: "https://whatsapp.com/channel/0029VbDCrkm0Qean90DDeQ1Q",
      badge: "قناة واتساب معتمدة"
    }
  };
}
