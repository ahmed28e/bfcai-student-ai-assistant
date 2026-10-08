import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self._init_clients()

    def _init_clients(self):
        # Gemini Init
        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
                logger.info("Initialized Google Gemini client.")
            except Exception as e:
                logger.error(f"Error configuring Gemini: {e}")
                self.gemini_model = None
        else:
            self.gemini_model = None

        # OpenAI Init
        if self.openai_key:
            try:
                from openai import AsyncOpenAI
                self.openai_client = AsyncOpenAI(api_key=self.openai_key)
                logger.info("Initialized OpenAI client.")
            except Exception as e:
                logger.error(f"Error configuring OpenAI: {e}")
                self.openai_client = None
        else:
            self.openai_client = None

    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        """
        توليد إجابة ذكية معتمدة على النموذج المختار، مع استرجاع آمن تلقائي في حال غياب المفاتيح
        """
        # 1. إذا كان المزود Gemini ومفتاحه متوفر
        if self.provider == "gemini" and self.gemini_model:
            try:
                full_prompt = f"{system_prompt}\n\nسؤال المستخدم والسياق:\n{user_prompt}"
                response = self.gemini_model.generate_content(full_prompt)
                if response and response.text:
                    return response.text
            except Exception as e:
                logger.error(f"Gemini API call error: {e}")

        # 2. إذا كان المزود OpenAI ومفتاحه متوفر
        if (self.provider == "openai" or self.openai_key) and self.openai_client:
            try:
                completion = await self.openai_client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3
                )
                return completion.choices[0].message.content
            except Exception as e:
                logger.error(f"OpenAI API call error: {e}")

        # 3. في حال عدم توفر مفاتيح API أو حدوث خطأ، يتم تقديم إجابة معتمدة على السياق المدمج
        return self._generate_contextual_fallback(user_prompt)

    def _generate_contextual_fallback(self, user_prompt: str) -> str:
        """
        استجابة ذكية مبنية على استخراج المعلومات من نصوص الـ RAG والبحث
        تضمن عمل النظام حتى بدون توفير مفتاح API خارجي
        """
        intro = "أهلاً بك يا بطل! بصفتي المساعد الذكي لطلاب كلية الحاسبات والذكاء الاصطناعي - جامعة بنها (BFCAI):\n\n"
        
        # استخراج السياق من الرسالة إذا وجد
        if "السياق المستخرج من مصادر الكلية:" in user_prompt:
            parts = user_prompt.split("السياق المستخرج من مصادر الكلية:")
            context_part = parts[1].split("سؤال الطالب:")[0].strip() if len(parts) > 1 else ""
            
            if context_part and len(context_part) > 20:
                return (
                    f"{intro}بناءً على مصادر الكلية الرسمية واللائحة الأكاديمية:\n\n"
                    f"{context_part}\n\n"
                    f"📌 **ملاحظة:** يمكنك دوماً مراجعة إدارة شؤون الطلاب أو القنوات الرسمية للتأكد من أي تحديثات فورية للجداول أو المواعيد."
                )

        return (
            f"{intro}تم استلام استفسارك بنجاح. بناءً على اللائحة الأكاديمية لكلية الحاسبات والذكاء الاصطناعي ببنها، "
            f"يتم تنظيم المواد الدراسية والجداول وفق نظام الساعات المعتمدة. "
            f"يرجى مراجعة القنوات المعتمدة المرفقة أو تزويدنا بمفتاح API (Gemini أو OpenAI) في ملف `.env` لتفعيل التوليد المتقدم بالذكاء الاصطناعي."
        )

llm_service = LLMService()
