import logging
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.schemas import ChatRequest, ChatResponse, HealthResponse, YearOption
from app.services.rag_service import rag_service
from app.services.vector_store import vector_store_service
from app.ingestion.ingest_pipeline import run_ingestion_pipeline

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("bfcai_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Check if ChromaDB contains documents, if not run initial ingestion
    try:
        count = vector_store_service.get_count()
        logger.info(f"Existing documents in ChromaDB: {count}")
        if count == 0:
            logger.info("Vector DB is empty. Running initial ingestion automatically...")
            run_ingestion_pipeline(scrape_live_website=False)
            logger.info(f"Vector DB populated! Total docs: {vector_store_service.get_count()}")
    except Exception as e:
        logger.error(f"Error during initial startup ingestion: {e}")
    yield
    # Shutdown
    logger.info("Shutting down BFCAI AI Assistant Backend.")

app = FastAPI(
    title="BFCAI Student AI Assistant API",
    description="المساعد الذكي التفاعلي لطلاب كلية الحاسبات والذكاء الاصطناعي - جامعة بنها (RAG + ChromaDB + Live Web Search)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
async def root():
    return {
        "message": "مرحباً بكم في واجهة برمجة تطبيقات المساعد الذكي لكلية الحاسبات والذكاء الاصطناعي - جامعة بنها (BFCAI)",
        "docs": "/docs",
        "health": "/api/health",
        "official_sources": {
            "website": settings.BFCAI_WEBSITE_URL,
            "facebook": settings.BFCAI_FACEBOOK_URL,
            "whatsapp_channel": settings.BFCAI_WHATSAPP_CHANNEL_URL
        }
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Monitoring"])
async def health_check():
    return HealthResponse(
        status="healthy",
        llm_provider=settings.LLM_PROVIDER,
        vector_store_documents=vector_store_service.get_count(),
        environment=settings.ENVIRONMENT
    )

@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_with_bot(request: ChatRequest):
    """
    نقطة النهاية الرئيسية للمحادثة مع المساعد الذكي:
    - البحث في ChromaDB مع التصفية بالفرقة الدراسية
    - دعم الإجابة ببحث الويب (جوجل / DuckDuckGo / Tavily) عند الحاجة
    - صياغة إجابة ملائمة للفرقة الدراسية مع توثيق المصادر
    """
    try:
        response = await rag_service.answer_question(request)
        return response
    except Exception as e:
        logger.error(f"Error processing chat request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"حدث خطأ أثناء معالجة السؤال: {str(e)}")

@app.get("/api/years", response_model=List[YearOption], tags=["Academic"])
async def get_academic_years():
    """
    استرجاع بيانات الفرق الدراسية الأربعة والأسئلة الشائعة لكل فرقة
    """
    return [
        YearOption(
            id="year_1",
            name="الفرقة الأولى",
            description="مرحلة الإعداد العام والعلوم الأساسية وبرمجة C++ ونظام الساعات المعتمدة",
            departments=["عام - تمهيدي لكافة الطلاب"],
            quick_prompts=[
                "ما هي مواد الفصل الدراسي الأول بالفرقة الأولى؟",
                "كيف يتم حساب المعدل التراكمي GPA وشروط الإنذار الأكاديمي؟",
                "أين تقع مدرجات الفرقة الأولى وكيف استلم الكارنيه الجامعي؟"
            ]
        ),
        YearOption(
            id="year_2",
            name="الفرقة الثانية",
            description="هياكل البيانات، البرمجة الشيئية OOP، قواعد البيانات والتمهيد للتشعيب",
            departments=["عام مع التمهيد للتشعيب في نهاية العام"],
            quick_prompts=[
                "ما هي شروط وضوابط التشعيب للأقسام في نهاية الفرقة الثانية؟",
                "ما هي المواد المقررة في الفصل الدراسي الثاني؟",
                "كيف استعد لدراسة مادة هياكل البيانات والخوارزميات؟"
            ]
        ),
        YearOption(
            id="year_3",
            name="الفرقة الثالثة",
            description="مرحلة التخصص بالأقسام الأربعة، البرامج النوعية، والتدريب الصيفي الإجباري",
            departments=[
                "علوم الحاسب (CS)",
                "نظم المعلومات (IS)",
                "تكنولوجيا المعلومات (IT)",
                "الذكاء الاصطناعي (AI)",
                "البرامج النوعية (الأمن السيبراني، المعلوماتية الطبية، علوم البيانات)"
            ],
            quick_prompts=[
                "ما هي شروط وضوابط التدريب الصيفي الإجباري المعتمد؟",
                "ما هي الفروق الجوهرية بين أقسام الكلية ومجالات عمل كل قسم؟",
                "ما هي المواد التخصصية لقسم الذكاء الاصطناعي وقسم علوم الحاسب؟"
            ]
        ),
        YearOption(
            id="year_4",
            name="الفرقة الرابعة",
            description="سنة التخرج، مشاريع التخرج، التدريب الميداني وإجراءات إنهاء الدراسة",
            departments=[
                "علوم الحاسب (CS)",
                "نظم المعلومات (IS)",
                "تكنولوجيا المعلومات (IT)",
                "الذكاء الاصطناعي (AI)",
                "البرامج النوعية الخاصة"
            ],
            quick_prompts=[
                "ما هي ضوابط ومعايير اختيار فكرة مشروع التخرج وتكوين الفريق؟",
                "ما هي خطوات وإجراءات إخلاء الطرف واستخراج شهادة التخرج المؤقتة؟",
                "كم عدد الساعات المعتمدة المطلوبة للتخرج من الكلية؟"
            ]
        ),
        YearOption(
            id="general",
            name="عام (كافة الفرق)",
            description="معلومات عامة وشاملة عن الكلية وإداراتها وموقعها وجداول الامتحانات والأنشطة",
            departments=["إدارة الكلية، شؤون الطلاب، رعاية الشباب"],
            quick_prompts=[
                "أين يقع مقر كلية الحاسبات والذكاء الاصطناعي ببنها؟",
                "ما هي ضوابط الامتحانات والأعذار المرضية المعتمدة؟",
                "ما هي القنوات والروابط الرسمية المعتمدة للكلية؟"
            ]
        )
    ]

@app.get("/api/sources", tags=["Sources"])
async def get_official_sources():
    """
    استرجاع قائمة المصادر الرسمية المعتمدة للكلية
    """
    return {
        "website": {
            "title": "الموقع الرسمي لكلية الحاسبات والذكاء الاصطناعي - جامعة بنها",
            "url": settings.BFCAI_WEBSITE_URL,
            "badge": "موقع رسمي"
        },
        "facebook": {
            "title": "الصفحة الرسمية المعتمدة على فيسبوك (Official.BFCAI)",
            "url": settings.BFCAI_FACEBOOK_URL,
            "badge": "فيسبوك رسمي"
        },
        "whatsapp_channel": {
            "title": "قناة الواتساب الرسمية لتنبيهات الطلاب",
            "url": settings.BFCAI_WHATSAPP_CHANNEL_URL,
            "badge": "قناة واتساب معتمدة"
        },
        "web_search": {
            "title": "محرك بحث الويب (Google / DuckDuckGo / Tavily)",
            "status": "مفعل تلقائياً كخط دفاع ثانٍ عند غياب المعلومة محلياً"
        }
    }

@app.post("/api/ingest", tags=["Ingestion"])
async def trigger_ingestion(scrape_live: bool = False):
    """
    إعادة تشغيل خط معالجة البيانات وتحديث ChromaDB
    """
    try:
        count = run_ingestion_pipeline(scrape_live_website=scrape_live)
        return {
            "status": "success",
            "message": f"تمت معالجة وتحديث قاعدة المعرفة بنجاح. عدد المستندات المفهرسة: {count}",
            "total_documents": vector_store_service.get_count()
        }
    except Exception as e:
        logger.error(f"Ingestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
