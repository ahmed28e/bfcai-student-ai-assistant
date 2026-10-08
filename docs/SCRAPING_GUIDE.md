# 🛡️ دليل التعامل مع عقبات سحب البيانات من فيسبوك وواتساب
## BFCAI Data Scraping & Ingestion Guide

يتطلب بناء نظام **RAG (Retrieval-Augmented Generation)** عالي الكفاءة تدفقاً مستمراً ودقيقاً للبيانات من مصادر الكلية الرسمية (صفحة الفيسبوك وقناة الواتساب). ومع ذلك، تفرض منصات التواصل الاجتماعي قيوداً أمنية وتقنية صارمة تمنع الـ Web Scraping التقليدي. 

يوضح هذا الدليل العقبات التقنية وكيفية تخطيها بأفضل الممارسات الهندسية.

---

### أولاً: عقبات فيسبوك (Facebook) وحلولها

#### 1. ما هي العقبات؟
* **الحظر والحماية من الروبوتات (Anti-Bot & Rate Limits):** تستخدم Meta خوارزميات متطورة لكشف عناوين IP التي تقوم بعمل Scraping وتفرض كابتشا (CAPTCHA) أو حظراً مؤقتاً/دائماً.
* **الواجهة الديناميكية (Dynamic Single Page App):** محتوى فيسبوك يتم تحميله ديناميكياً بواسطة React وGraphQL عبر Infinite Scroll، مما يجعل أدوات مثل `BeautifulSoup` و `requests` عاجزة عن استخراج المنشورات مباشرة دون تشغيل متصفح.
* **تغير بنية DOM المستمر:** تقوم فيسبوك بتوليد أسماء CSS Classes عشوائية (`obfuscated classes`) تتغير دورياً، مما يؤدي لانهيار أي Scraper يعتمد على محددات CSS ثابتة.

#### 2. كيف نتخطى هذه العقبات؟

##### أ) الحل الرسمي والأنظف: Meta Graph API
إذا كانت الكلية تمنح صلاحيات للمطور (أو يمكن إنشاء تطبيق على Meta for Developers):
* استخدام `Page Access Token` مع صلاحيات: `pages_read_engagement` و `pages_read_user_content`.
* طلب نقطة النهاية:
  ```http
  GET https://graph.facebook.com/v19.0/{page-id}/feed?fields=id,message,created_time,attachments&access_token={PAGE_ACCESS_TOKEN}
  ```
* كود بايثون للتحميل التلقائي:
  ```python
  import requests

  def fetch_facebook_page_posts(page_id, access_token):
      url = f"https://graph.facebook.com/v19.0/{page_id}/feed"
      params = {
          "fields": "id,message,created_time",
          "access_token": access_token,
          "limit": 25
      }
      res = requests.get(url, params=params)
      return res.json().get("data", [])
  ```

##### ب) Webhooks (الاستماع اللحظي للمنشورات)
بدلاً من الاستعلام الدوري (Polling)، يتم تسجيل Webhook في تطبيق Meta لإرسال المنشور الجديد تلقائياً إلى خادم FastAPI على مسار `/api/webhooks/facebook` فور نشره على الصفحة الرسمية وتحديث ChromaDB لحظياً.

##### ج) الحل البديل (في غياب الـ API): أدوات الأتمتة السحابية (Apify / Headless Playwright)
* استخدام خدمة متخصصة مثل **Apify Facebook Pages Scraper** أو سكريبت **Playwright** يدير جلسات المتصفح مع تدوير الـ Proxies وحفظ النتائج في ملف `facebook_posts_sample.json`.

---

### ثانياً: عقبات واتساب (WhatsApp) وحلولها

#### 1. ما هي العقبات؟
* **التشفير التام (End-to-End Encryption):** رسائل الواتساب مشفرة بالكامل بين الأطراف، ولا توجد واجهة ويب عامة يمكن قراءتها بـ HTTP GET عادي.
* **قنوات الواتساب (WhatsApp Channels):** على الرغم من أنها قنوات عامة أحادية الاتجاه، إلا أن تطبيق الويب يتطلب مصادقة (QR Code Login)، ولا توفر Meta حتى الآن Public REST API مجاني لقراءة القنوات.
* **خطر حظر الأرقام (Account Ban Risk):** استخدام مكتبات غير رسمية مثل Baileys أو Selenium لأتمتة حساب شخصي قد يعرض الرقم للحظر من شركة WhatsApp بتهمة السبام أو استخدام برمجيات غير معتمدة.

#### 2. كيف نتخطى هذه العقبات؟

##### أ) تصدير المحادثة النصية كملف `.txt` (Export Chat Without Media) — الطريقة الأكثر أماناً وموثوقية
تعتبر هذه الطريقة هي الخيار الأمثل والعملي الموصى به لإدارات الكليات:
1. يقوم مسؤول رعاية الشباب أو اتحاد الطلاب بالدخول إلى القناة أو المجموعة.
2. النقر على خيارات المحادثة -> **المزيد (More)** -> **تصدير المحادثة (Export Chat)** -> **بدون وسائط (Without Media)**.
3. ينتج ملف نصي منظم بالشكل:
   ```text
   [12/10/2024, 10:15:30 AM] قناة كلية الحاسبات بنها: تنبيه هام لطلاب الفرقة الثالثة بشأن جداول الميدتيرم...
   ```
4. يتم وضع الملف في المجلد `backend/data/raw/whatsapp_channel_sample.txt`.
5. يقوم سكريبت `WhatsAppExportProcessor` في مشروعنا بتحليل النصوص عبر التعبيرات القياسية (Regex)، استخراج التواريخ، ربط كل رسالة بالفرقة الدراسية المناسبة، وإرسالها فوراً إلى قاعدة ChromaDB.

##### ب) WhatsApp Business Cloud API & Webhooks
إذا كانت الكلية تمتلك حساب واتساب أعمال رسمي (Official Business Account):
* يتم تفعيل الـ Cloud API مجاناً (حتى 1000 محادثة شهرياً).
* يرسل الواتساب إشعارات الـ Webhooks إلى خادم الـ FastAPI لكل رسالة أو تنبيه يصدر عن الكلية، لتتم معالجته وتخزينه في الـ Vector DB فوراً.

##### ج) بناء جسر أتمتة عبر Telegram أو RSS
نظراً لأن تيليجرام يوفر **Bot API مجاني ومفتوح بالكامل** بدون قيود، تقوم العديد من الكليات بربط قناة الواتساب بقناة تيليجرام متزامنة (بواسطة بوتات إعادة توجيه)، مما يسمح بسحب المنشورات عبر Telegram Bot API بكل سهولة وبدون أي عقبات حظر.

---

### الخلاصة وتوصية التطوير
1. **في مرحلة التشغيل الحالية:** يعتمد نظامنا على معالجة ملفات التصدير النصية لرسائل الواتساب، وبيانات JSON لمنشورات الفيسبوك، بالإضافة لسحب الموقع الرسمي للكلية مباشرة.
2. **في مرحلة الإنتاج المتقدمة (Production):** يتم ربط Meta Graph API مع Facebook Webhook و WhatsApp Business API لتحويل التحديثات إلى خط إنتاج لحظي (Real-time Ingestion Stream).
