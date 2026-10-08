import re
from typing import List

class ArabicDataCleaner:
    @staticmethod
    def clean_text(text: str) -> str:
        """
        تنظيف وتطبيع النصوص العربية وإزالة الرموز الزائدة
        """
        if not text:
            return ""

        # إزالة وسوم HTML إذا وجدت
        text = re.sub(r"<[^>]+>", " ", text)
        
        # إزالة التشكيل العربي
        tashkeel_pattern = re.compile(r"[\u0617-\u061A\u064B-\u0652]")
        text = re.sub(tashkeel_pattern, "", text)

        # إزالة التطويل (الكشيدة)
        text = re.sub(r"ـ+", "", text)

        # توحيد أشكال الهمزة والألف والياء
        text = re.sub(r"[إأآا]", "ا", text)
        text = re.sub(r"ى", "ي", text)
        text = re.sub(r"ؤ", "و", text)
        text = re.sub(r"ئ", "ي", text)

        # إزالة الروابط المكررة والمسافات الزائدة
        text = re.sub(r"http\S+", "", text)
        text = re.sub(r"\s+", " ", text).strip()

        return text

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 80) -> List[str]:
        """
        تقسيم النصوص الطويلة إلى أجزاء دلالية مع تداخل لضمان سياق RAG قوي
        """
        if not text:
            return []

        words = text.split()
        if len(words) <= chunk_size:
            return [text]

        chunks = []
        step = chunk_size - overlap
        for i in range(0, len(words), step):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk:
                chunks.append(chunk)
            if i + chunk_size >= len(words):
                break

        return chunks
