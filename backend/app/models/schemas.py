from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class AcademicYear(str, Enum):
    YEAR_1 = "الفرقة الأولى"
    YEAR_2 = "الفرقة الثانية"
    YEAR_3 = "الفرقة الثالثة"
    YEAR_4 = "الفرقة الرابعة"
    GENERAL = "عام (كافة الفرق)"

class SourceType(str, Enum):
    WEBSITE = "موقع الكلية الرسمي"
    FACEBOOK = "صفحة الفيسبوك الرسمية"
    WHATSAPP = "قناة الواتساب الرسمية"
    GOOGLE_SEARCH = "بحث الويب (جوجل)"
    INTERNAL_KNOWLEDGE = "لائحة الكلية وقواعد البيانات الداخلية"

class SourceDocument(BaseModel):
    title: str
    url: Optional[str] = None
    source_type: SourceType
    snippet: str
    relevance_score: Optional[float] = None

class MessageHistory(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="سؤال الطالب")
    academic_year: AcademicYear = Field(default=AcademicYear.GENERAL, description="الفرقة الدراسية للطالب")
    history: Optional[List[MessageHistory]] = Field(default_factory=list, description="تاريخ المحادثة السابقة")
    allow_web_search: bool = Field(default=True, description="السماح بالبحث عبر الإنترنت إذا لم تتوفر المعلومة محلياً")

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceDocument]
    academic_year: str
    used_web_search: bool = False
    confidence: Optional[str] = "high"

class HealthResponse(BaseModel):
    status: str
    llm_provider: str
    vector_store_documents: int
    environment: str

class YearOption(BaseModel):
    id: str
    name: str
    description: str
    departments: List[str]
    quick_prompts: List[str]
