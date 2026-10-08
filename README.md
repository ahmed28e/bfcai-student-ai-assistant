# 🎓 المساعد الذكي لطلاب كلية الحاسبات والذكاء الاصطناعي - جامعة بنها (BFCAI)
### BFCAI Student AI Assistant | RAG, FastAPI, React & ChromaDB

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![ChromaDB](https://img.shields.io/badge/VectorDB-ChromaDB-FC521F)
![LangChain](https://img.shields.io/badge/Framework-LangChain-1C3C3C)

<p align="center">
  <b>منصة ذكاء اصطناعي تفاعلية متكاملة وشات بوت متخصص مبني بتقنية الـ RAG المتقدمة لخدمة طلاب كلية الحاسبات والذكاء الاصطناعي بجامعة بنها بفرقها الأربعة.</b>
</p>

<p align="center">
  <a href="https://ahmed28e.github.io/bfcai-student-ai-assistant/">
    <img src="https://img.shields.io/badge/🌐%20Live%20Demo-رابط%20التطبيق%20المباشر-success?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

[🌐 تجربة التطبيق مباشرة على الويب](https://ahmed28e.github.io/bfcai-student-ai-assistant/) • [📚 دليل تخطي عقبات السحب](docs/SCRAPING_GUIDE.md) • [🏛️ بنية وتصميم النظام](docs/ARCHITECTURE.md) • [🚀 دليل التشغيل والنشر](docs/DEPLOYMENT.md)

</div>

---

## 🌟 نظرة عامة على المشروع (Overview)

تم تصميم وتطوير هذا النظام ليكون **المرشد الأكاديمي الرقمي الذكي** لطلاب كلية الحاسبات والذكاء الاصطناعي بجامعة بنها (BFCAI). يقوم الشات بوت بالإجابة على استفسارات الطلاب الأكاديمية والإدارية حصرياً ومباشرة من المصادر الرسمية للكلية، وفي حال عدم العثور على المعلومة، يقوم بالاستعانة بمحرك بحث الويب الحي (Google Search) لدعم الإجابة وتوثيق المصدر.

### 🎯 المصادر الرسمية المعتمدة:
1. 🌐 **الموقع الرسمي للكلية:** [https://fci.bu.edu.eg/](https://fci.bu.edu.eg/)
2. 📘 **الصفحة الرسمية على فيسبوك:** [Official.BFCAI](https://www.facebook.com/Official.BFCAI)
3. 💬 **قناة الواتساب الرسمية للطلاب:** [قناة تنبيهات BFCAI المعتمدة](https://whatsapp.com/channel/0029VbDCrkm0Qean90DDeQ1Q)
4. 🔍 **محرك بحث جوجل (Google / DuckDuckGo / Tavily):** كخط دفاع ثانٍ واحتياطي عند غياب الإجابة محلياً.

---

## ✨ المميزات الرئيسية (Key Features)

* **🎓 تخصيص الإجابات حسب الفرقة الدراسية (Multi-Year Contextualization):**
  - **الفرقة الأولى:** مواد الإعداد العام، البرمجة التمهيدية C++، نظام الساعات المعتمدة وحساب المعدل التراكمي GPA والإنذارات.
  - **الفرقة الثانية:** هياكل البيانات، البرمجة كائنية التوجه OOP، قواعد البيانات، وشروط ومعايير التشعيب في نهاية العام.
  - **الفرقة الثالثة:** مواد الأقسام العلمية (CS, IS, IT, AI)، البرامج النوعية، وضوابط التدريب الصيفي الإجباري المعتمد (100 ساعة).
  - **الفرقة الرابعة:** ضوابط تشكيل فرق وأفكار مشاريع التخرج، التدريب الميداني، وإجراءات إخلاء الطرف واستخراج شهادات التخرج.
* **🧠 محرك RAG متطور (Retrieval-Augmented Generation):**
  - استخراج دلالي عبر تضمين المتجهات (Embeddings) والبحث في **ChromaDB**.
  - تقييم تلقائي لدقة الوثائق المسترجعة (Relevance Scoring).
* **🌐 بحث الويب الحي التلقائي (Fallback Web Search):**
  - تفعيل فوري للبحث عبر الإنترنت عند عدم كفاية البيانات المحلية لدعم السؤال، مع توثيق المصدر للشفافية والمصداقية.
* **💬 واجهة مستخدم عصرية تشبه ChatGPT:**
  - مبنية بأحدث معايير الويب (React 18 + Vite + Tailwind CSS + Lucide Icons).
  - دعم كامل للغة العربية والاتجاه (RTL) مع خط القاهرة (Cairo).
  - أزرار أسئلة شائعة تفاعلية (Quick Prompts) مخصصة لكل فرقة.
  - بطاقات توثيق المصادر (Source Citations Cards) ونسخ الإجابات بضغطة زر.
* **🛠️ استقلالية تامة وسهولة تشغيل:**
  - يعمل محلياً حتى بدون توفير مفاتيح API خارجية بفضل وضع الاستجابة الذكي المدمج (Mock Contextual Fallback).

---

## 📁 هيكل المشروع (Project Structure)

```text
bfcai-student-ai-assistant/
├── backend/                              # خادم FastAPI ومحرك الذكاء الاصطناعي
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                       # نقاط اتصال الـ API (Chat, Health, Years, Sources)
│   │   ├── config.py                     # إعدادات البيئة والمفاتيح (Pydantic Settings)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py                # نماذج البيانات والطلبات (Pydantic Models)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── vector_store.py           # إدارة قاعدة المتجهات ChromaDB والبحث الدلالي
│   │   │   ├── search_service.py         # محرك البحث الحي الاحتياطي (Google / DuckDuckGo / Tavily)
│   │   │   ├── llm_service.py            # ربط نماذج اللغة (Gemini 1.5 Flash / GPT-4o-mini)
│   │   │   └── rag_service.py            # تنسيق خط الـ RAG وتوليد الإجابات المخصصة
│   │   └── ingestion/
│   │       ├── __init__.py
│   │       ├── scraper.py                # أدوات سحب ومعالجة الموقع، الفيسبوك، والواتساب
│   │       ├── data_cleaner.py           # تنظيف وتطبيع النصوص العربية وتقسيمها (Chunking)
│   │       └── ingest_pipeline.py        # خط المعالجة الشامل لتغذية قاعدة المتجهات
│   ├── data/
│   │   ├── raw/                          # بيانات الكلية واللائحة ومنشورات القنوات
│   │   │   ├── bfcai_bylaws_curriculum.json
│   │   │   ├── facebook_posts_sample.json
│   │   │   └── whatsapp_channel_sample.txt
│   │   └── chroma_db/                    # قاعدة بيانات المتجهات الدائمة محلياً
│   ├── requirements.txt                  # مكتبات بايثون المطلوبة
│   ├── .env.example                      # نموذج متغيرات البيئة
│   └── Dockerfile                        # حاوية خادم الباك إند
├── frontend/                             # واجهة المستخدم التفاعلية (React + Vite)
│   ├── public/
│   │   └── bfcai_logo.svg                # شعار الكلية والذكاء الاصطناعي
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # الشريط العلوي وحالة الاتصال
│   │   │   ├── HeroBanner.jsx            # البانر التعريفي والتوجيهي
│   │   │   ├── YearSelector.jsx          # محدد الفرقة الدراسية المخصص
│   │   │   ├── QuickPrompts.jsx          # الأسئلة الشائعة المقترحة لكل فرقة
│   │   │   ├── ChatWindow.jsx            # نافذة المحادثة ومربع الإدخال
│   │   │   ├── ChatMessage.jsx           # فقاعات الرسائل والمصادر والتنسيق
│   │   │   └── SourcesModal.jsx          # نافذة المصادر الرسمية المعتمدة
│   │   ├── hooks/
│   │   │   └── useChat.js                # إدارة حالة المحادثة وسجل الرسائل
│   │   ├── services/
│   │   │   └── api.js                    # دوال الاتصال بالباك إند
│   │   ├── styles/
│   │   │   └── index.css                 # التنسيقات وتأثيرات الـ Glassmorphism
│   │   ├── App.jsx                       # المكون الرئيسي
│   │   └── main.jsx                      # نقطة بداية التطبيق
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docs/                                 # التوثيق المعماري والأدلة
│   ├── ARCHITECTURE.md                   # بنية النظام ومخططات التدفق
│   ├── SCRAPING_GUIDE.md                 # حلول وعقبات سحب بيانات فيسبوك وواتساب
│   └── DEPLOYMENT.md                     # دليل النشر والتشغيل السحابي
├── docker-compose.yml                    # تشغيل المشروع كاملاً بضغطة زر
├── .gitignore
├── LICENSE                               # رخصة MIT مفتوحة المصدر
└── README.md                             # دليل المشروع الشامل
```

---

## ⚡ التشغيل السريع (Quick Start)

### 1. استنساخ المستودع (Clone Repository):
```bash
git clone https://github.com/ahmed28e/bfcai-student-ai-assistant.git
cd bfcai-student-ai-assistant
```

### 2. تشغيل الـ Backend:
```bash
cd backend
python -m venv venv

# تفعيل البيئة:
# على Windows:
venv\Scripts\activate
# على Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# تشغيل الخادم
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
> الخادم سيعمل على `http://localhost:8000` وواجهة التوثيق على `http://localhost:8000/docs`.

### 3. تشغيل الـ Frontend:
في نافذة طرفية أخرى:
```bash
cd frontend
npm install
npm run dev
```
> الواجهة ستعمل فوراً على `http://localhost:5173`.

### 4. التشغيل عبر Docker Compose:
```bash
docker-compose up --build -d
```

---

## 🛡️ عقبات سحب البيانات من فيسبوك وواتساب وكيف تخطيناها

| المنصة | العقبة التقنية | الحل المطبق وأفضل الممارسات |
|---|---|---|
| **فيسبوك (Facebook)** | حظر الـ Scraping الآلي، كابتشا، تغيير الـ DOM دورياً | استخدام **Meta Graph API** الرسمي للحصول على المنشورات عبر `Page Access Token`، وتوفير معالج لملفات الـ JSON المصدرة، مع إمكانية ربط Webhook لحظي. |
| **واتساب (WhatsApp)** | التشفير التام (E2EE)، عدم وجود REST API عام للقنوات | الحل الأكثر أماناً: استخدام **تصدير المحادثات بدون وسائط (Export Chat)** كملف `.txt`، وتطوير معالج ذكي بالـ Regex يستخرج التنبيهات ويربطها بالفرق تلقائياً دون تعريض أي حساب للحظر. |
| **الموقع الرسمي للكلية** | صفحات ثابتة وتحديثات إخبارية | سحب آلي نظيف عبر `BeautifulSoup` مع إزالة الإعلانات والنصوص غير الضرورية وتطبيع الكلمات العربية. |

*(للاطلاع على الشرح التقني الشامل وأمثلة الأكواد، راجع [دليل سحب البيانات التفصيلي](docs/SCRAPING_GUIDE.md)).*

---

## 🛣️ خارطة الطريق والتطوير المستقبلي (Roadmap)

- [x] بناء معمارية الـ RAG مع ChromaDB.
- [x] واجهة محادثة ChatGPT عصرية تدعم اللغة العربية والفرق الدراسية الأربعة.
- [x] محرك بحث الويب الاحتياطي الحي (Google / DuckDuckGo / Tavily).
- [x] معالجة وتطبيع النصوص العربية وتصنيف البيانات وفق الفرق الدراسية.
- [ ] ربط نظام صوتي (Voice-to-Text & Text-to-Speech) باللغة العربية واللهجة المصرية.
- [ ] ربط Webhook مباشر مع الصفحة الرسمية على فيسبوك للتحديث اللحظي للمنشورات فور نشرها.
- [ ] تطبيق للهواتف الذكية عبر Flutter / React Native.
- [ ] لوحة تحكم إدارية (Admin Dashboard) للمشرفين لإضافة وتعديل لوائح الكلية مباشرة.

---

## 👨‍💻 المطور والمساهمة

تم تطوير المشروع بواسطة: **[ahmed28e](https://github.com/ahmed28e)**  
نرحب بجميع المساهمات والاقتراحات عبر الـ Pull Requests والـ Issues!

---

## 📄 الترخيص (License)

هذا المشروع مرخص تحت رخصة **[MIT](LICENSE)** - يحق للجميع استخدامه وتطويره بحرية.
