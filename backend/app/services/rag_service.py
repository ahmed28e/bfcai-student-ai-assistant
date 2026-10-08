import logging
from typing import List, Dict, Any
from app.models.schemas import ChatRequest, ChatResponse, SourceDocument, SourceType, AcademicYear
from app.services.vector_store import vector_store_service
from app.services.search_service import search_service
from app.services.llm_service import llm_service
from app.config import settings

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.min_relevance_threshold = 0.35

    async def answer_question(self, request: ChatRequest) -> ChatResponse:
        query = request.message.strip()
        year_str = request.academic_year.value
        sources: List[SourceDocument] = []
        used_web_search = False

        # 1. البحث في قاعدة المعرفة المحلية المعتمدة (ChromaDB)
        local_results = vector_store_service.search(
            query=query,
            academic_year=year_str,
            top_k=4
        )

        has_good_local_match = False
        context_snippets = []

        if local_results:
            for item in local_results:
                relevance = item.get("relevance_score", 0.0)
                meta = item.get("metadata", {})
                
                # تصنيف مصدر البيانات
                stype_str = meta.get("source_type", "موقع الكلية الرسمي")
                source_enum = SourceType.WEBSITE
                if "فيسبوك" in stype_str:
                    source_enum = SourceType.FACEBOOK
                elif "واتساب" in stype_str:
                    source_enum = SourceType.WHATSAPP
                elif "لائحة" in stype_str:
                    source_enum = SourceType.INTERNAL_KNOWLEDGE

                source_doc = SourceDocument(
                    title=meta.get("title", "وثيقة من مصادر كلية الحاسبات بنها"),
                    url=meta.get("url", settings.BFCAI_WEBSITE_URL),
                    source_type=source_enum,
                    snippet=item["content"][:250] + "...",
                    relevance_score=relevance
                )
                sources.append(source_doc)
                context_snippets.append(f"[{source_enum.value}] {meta.get('title', '')}: {item['content']}")

                if relevance >= self.min_relevance_threshold:
                    has_good_local_match = True

        # 2. في حال عدم العثور على إجابة كافية محلياً، تفعيل البحث الحي عبر الويب (Google / DuckDuckGo / Tavily)
        if (not has_good_local_match or len(sources) == 0) and request.allow_web_search and settings.WEB_SEARCH_ENABLED:
            logger.info("Local documents insufficient. Triggering web search fallback.")
            web_results = await search_service.search_web(query=query, academic_year=year_str, max_results=3)
            if web_results:
                used_web_search = True
                for wr in web_results:
                    sources.append(SourceDocument(
                        title=wr["title"],
                        url=wr.get("url", "https://google.com"),
                        source_type=SourceType.GOOGLE_SEARCH,
                        snippet=wr["snippet"][:250] + "...",
                        relevance_score=0.75
                    ))
                    context_snippets.append(f"[بحث الويب - جوجل] {wr['title']}: {wr['snippet']}")

        # 3. إعداد سياق النظام والفرقة الدراسية
        system_prompt = self._build_system_prompt(year_str)
        user_prompt = self._build_user_prompt(query, context_snippets, year_str, request.history)

        # 4. توليد الإجابة عبر نموذج اللغة LLM
        answer = await llm_service.generate_response(system_prompt, user_prompt)

        return ChatResponse(
            answer=answer,
            sources=sources,
            academic_year=year_str,
            used_web_search=used_web_search,
            confidence="high" if (has_good_local_match or used_web_search) else "medium"
        )

    def _build_system_prompt(self, academic_year: str) -> str:
        return f"""أنت "المساعد الذكي لطلاب كلية الحاسبات والذكاء الاصطناعي - جامعة بنها (BFCAI)".
تم تطويرك لتقديم إجابات موثوقة، دقيقة، وودية لطلاب الكلية وفقاً للائحة الساعات المعتمدة والقنوات الرسمية.

الطالب الذي تتحدث معه حالياً ينتمي إلى: [{academic_year}].
تعليمات وإرشادات هامة:
1. استند حصرياً وبشكل أساسي إلى السياق المزود لك من مصادر الكلية الرسمية (موقع الكلية، صفحة الفيسبوك الرسمية، قناة الواتساب المعتمدة).
2. إذا تم دعم الإجابة عبر نتائج بحث الويب، وضح ذلك للطالب بأسلوب احترافي.
3. خصص إجابتك دائماً بما يناسب الفرقة الدراسية للطالب ({academic_year}). على سبيل المثال:
   - الفرقة الأولى: ركز على مواد العلوم الأساسية، البرمجة التمهيدية، نظام الإرشاد الأكاديمي، وحساب الـ GPA.
   - الفرقة الثانية: ركز على مواد هياكل البيانات، قواعد البيانات، وشروط التشعيب في الأقسام.
   - الفرقة الثالثة: ركز على الأقسام التخصصية (CS, IS, IT, AI)، متطلبات التدريب الصيفي، واختيار التخصص.
   - الفرقة الرابعة: ركز على متطلبات التخرج، مشاريع التخرج، التدريب الميداني، وإجراءات استخراج الشهادات.
4. استخدم لغة عربية فصحى مبسطة وواضحة، مع تنسيق النقاط والقوائم (Markdown) لتسهيل القراءة.
5. كن مشجعاً وداعماً للطلاب وأجب بكل رحابة صدر واحترافية.
"""

    def _build_user_prompt(self, query: str, context_snippets: List[str], academic_year: str, history: Any) -> str:
        context_text = "\n---\n".join(context_snippets) if context_snippets else "لم يتم العثور على مستندات محددة ذات صلة مباشرة."
        
        history_text = ""
        if history:
            history_text = "تاريخ المحادثة السابقة:\n"
            for h in history[-3:]: # آخر 3 رسائل
                history_text += f"- {h.role}: {h.content}\n"

        return f"""الفرقة الدراسية للطالب: {academic_year}

السياق المستخرج من مصادر الكلية:
{context_text}

{history_text}
سؤال الطالب:
{query}

أجب على السؤال بدقة مستعيناً بالسياق واللوائح المناسبة لفرقته الدراسية."""

rag_service = RAGService()
