# 🚀 دليل النشر والتشغيل (Deployment Guide)
## نشر مشروع BFCAI Student AI Assistant

يمكن تشغيل المشروع محلياً بسهولة أو نشره سحابياً مجاناً على منصات مثل Vercel، Render، وDocker.

---

### أولاً: التشغيل المحلي السريع (Local Development)

#### 1. متطلبات التشغيل:
- Python 3.10 أو أحدث.
- Node.js 18 أو أحدث.

#### 2. تشغيل الـ Backend (FastAPI):
```bash
cd backend

# إنشاء البيئة الافتراضية
python -m venv venv

# تفعيل البيئة (Windows):
venv\Scripts\activate
# أو (Linux/macOS):
# source venv/bin/activate

# تثبيت الحزم المطلوبة
pip install -r requirements.txt

# نسخ إعدادات البيئة
cp .env.example .env

# تشغيل خادم FastAPI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
سيكون الخادم متاحاً على الرابط: `http://localhost:8000`  
وواجهة الـ Swagger التفاعلية على: `http://localhost:8000/docs`

#### 3. تشغيل الـ Frontend (React + Vite):
افتح نافذة طرفية أخرى:
```bash
cd frontend

# تثبيت الحزم
npm install

# تشغيل خادم التطوير
npm run dev
```
ستكون الواجهة متاحة على الرابط: `http://localhost:5173`

---

### ثانياً: التشغيل بواسطة Docker Compose

```bash
# بناء وتشغيل الحاويات في الخلفية
docker-compose up --build -d

# إيقاف الحاويات
docker-compose down
```

---

### ثالثاً: النشر السحابي (Cloud Deployment)

#### 1. نشر الـ Backend على منصة Render أو Railway (مجاناً):
- اربط مستودع GitHub بحسابك على [Render](https://render.com).
- أنشئ خدمة **Web Service** جديدة واختر المسار `backend`.
- حدد أمر البناء (Build Command): `pip install -r requirements.txt`
- حدد أمر البدء (Start Command): `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- أضف متغيرات البيئة من ملف `.env` (مثل `GEMINI_API_KEY`).

#### 2. نشر الـ Frontend على منصة Vercel:
- اربط مستودع GitHub بحسابك على [Vercel](https://vercel.com).
- اختر المسار الجذري للمشروع: `frontend`.
- أضف متغير البيئة: `VITE_API_URL` برابط خادم الـ Backend على Render.
- اضغط **Deploy**.
