# 🏛️ بنية وتصميم النظام (System Architecture)
## BFCAI Student AI Assistant (RAG System)

يقوم المشروع على معمارية معيارية حديثة تفصل بين واجهة المستخدم (Frontend)، خادم الخدمات الذكية (Backend API)، خطوط معالجة وتغذية البيانات (Data Ingestion Pipeline)، ومحرك الـ RAG المدعوم بقاعدة المتجهات ومحرك البحث الاحتياطي.

---

### 1. المخطط البياني لسير العمل (Workflow Diagram)

```mermaid
flowchart TD
    User["طالب الكلية (Frontend User)"] --> UI["واجهة المستخدم (React + Tailwind)"]
    UI -- "1. السؤال + الفرقة الدراسية المختارة" --> API["FastAPI Backend (/api/chat)"]
    
    subgraph Data_Ingestion ["خط معالجة البيانات وتحديث المعرفة"]
        WebScrape["موقع الكلية الرسمي\n(fci.bu.edu.eg)"]
        FBPosts["منشورات فيسبوك\n(Official.BFCAI)"]
        WAChat["تنبيهات قناة الواتساب\n(Channel Export)"]
        Cleaner["منظف ومطبع النصوص العربية\n(Arabic Cleaner & Chunker)"]
        
        WebScrape --> Cleaner
        FBPosts --> Cleaner
        WAChat --> Cleaner
        Cleaner --> ChromaDB[("قاعدة المتجهات ChromaDB")]
    end

    subgraph RAG_Engine ["محرك RAG ومعالجة الاستفسار"]
        API --> QueryVector["توليد متجهات السؤال\n(Embedding Model)"]
        QueryVector --> ChromaDB
        ChromaDB -- "وثائق الكلية المطابقة" --> Evaluator{"هل توجد إجابة محلية كافية؟"}
        
        Evaluator -- "نعم (Relevance >= 0.35)" --> PromptBuilder["بناء موجه النظام مع سياق الفرقة"]
        Evaluator -- "لا (وثائق غير كافية)" --> WebSearch["بحث الويب الحي\n(Google / DuckDuckGo / Tavily)"]
        WebSearch --> PromptBuilder
        
        PromptBuilder --> LLM["نموذج اللغة الكبير\n(Gemini 1.5 Flash / GPT-4o-mini)"]
        LLM --> Response["صياغة الإجابة النهائية وتوثيق المصادر"]
    end

    Response --> API
    API -- "2. الإجابة + روابط المصادر + مؤشرات الفرقة" --> UI
    UI --> User
```

---

### 2. المكونات الرئيسية (Core Components)

1. **طبقة العرض والواجهة (Frontend - React + Vite + Tailwind CSS):**
   - اختيار الفرقة الدراسية (الفرقة الأولى، الثانية، الثالثة، الرابعة، عام) لتخصيص سياق الردود.
   - نافذة محادثة شبيهة بـ ChatGPT مع دعم التنسيق البرمجي (Markdown) واللغة العربية (RTL).
   - عرض المصادر المعتمدة لكل إجابة على حدة (Website, Facebook, WhatsApp, Google Search).
   - أسئلة مقترحة سريعة (Quick Prompts) مخصصة لكل فرقة.

2. **طبقة الخادم وواجهات البرمجة (Backend - FastAPI):**
   - غير متزامن (Asynchronous / Asyncio) لضمان سرعة فائقة في معالجة طلبات الطلاب المتزامنة.
   - التحقق من صحة البيانات باستخدام Pydantic V2.
   - إتاحة نقاط اتصال RESTful للدردشة، الصحة، الفرق، والمصادر.

3. **قاعدة البيانات المتجهة (Vector Store - ChromaDB):**
   - تخزين مستمر محلياً (Persistent On-Disk).
   - دعم التصفية الدلالية (Metadata Filtering) حسب الفرقة الدراسية (`year`).

4. **محرك البحث الحي الاحتياطي (Web Search Fallback Service):**
   - يعمل كخط دفاع ثانٍ في حال لم يتم العثور على إجابة في قاعدة المعرفة المحلية المعتمدة.
   - يدعم DuckDuckGo بدون مفاتيح، مع إمكانية التبديل إلى Tavily أو Google Custom Search JSON API.

5. **نماذج اللغة الكبيرة (LLMs):**
   - دعم مباشر لـ Google Gemini (`gemini-1.5-flash`) لسرعته الفائقة ودعمه الممتاز للغة العربية.
   - دعم OpenAI (`gpt-4o-mini`).
   - وضع تشغيل محلي بدون مفاتيح (Mock Fallback) لضمان التجربة الفورية دون إعدادات معقدة.
