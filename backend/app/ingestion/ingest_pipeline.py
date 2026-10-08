import os
import json
import logging
from typing import List, Dict, Any
from app.ingestion.scraper import FacebookDataProcessor, WhatsAppExportProcessor, BFCAIWebsiteScraper
from app.ingestion.data_cleaner import ArabicDataCleaner
from app.services.vector_store import vector_store_service
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_ingestion_pipeline(scrape_live_website: bool = False):
    """
    خط معالجة وتغذية قاعدة المعرفة المتجهة (Vector DB Ingestion Pipeline)
    يقوم بجمع البيانات من:
    1. اللائحة والمقررات الأكاديمية (Curriculum & Bylaws)
    2. منشورات صفحة الفيسبوك الرسمية (Facebook Posts)
    3. رسائل وتنبيهات قناة الواتساب (WhatsApp Channel Export)
    4. الموقع الرسمي للكلية (BFCAI Official Website)
    """
    logger.info("Starting BFCAI Ingestion Pipeline...")
    all_documents: List[Dict[str, Any]] = []

    base_raw_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "raw")

    # 1. تحميل اللائحة والمقررات الدراسية
    bylaws_file = os.path.join(base_raw_dir, "bfcai_bylaws_curriculum.json")
    if os.path.exists(bylaws_file):
        try:
            with open(bylaws_file, "r", encoding="utf-8") as f:
                bylaws_data = json.load(f)
                for item in bylaws_data:
                    clean_content = ArabicDataCleaner.clean_text(item["content"])
                    chunks = ArabicDataCleaner.chunk_text(clean_content, chunk_size=300, overlap=50)
                    for idx, chunk in enumerate(chunks):
                        all_documents.append({
                            "id": f"{item['id']}_chunk_{idx}",
                            "text": chunk,
                            "metadata": {
                                "title": item["title"],
                                "url": settings.BFCAI_WEBSITE_URL,
                                "source_type": "لائحة الكلية وقواعد البيانات الداخلية",
                                "year": item.get("year", "عام")
                            }
                        })
            logger.info(f"Loaded bylaws: {len(bylaws_data)} topics.")
        except Exception as e:
            logger.error(f"Error reading bylaws: {e}")

    # 2. تحميل منشورات الفيسبوك
    fb_file = os.path.join(base_raw_dir, "facebook_posts_sample.json")
    if os.path.exists(fb_file):
        fb_docs = FacebookDataProcessor.process_posts_json(fb_file)
        all_documents.extend(fb_docs)
        logger.info(f"Loaded Facebook posts: {len(fb_docs)} posts.")

    # 3. تحميل رسائل وتنبيهات الواتساب
    wa_file = os.path.join(base_raw_dir, "whatsapp_channel_sample.txt")
    if os.path.exists(wa_file):
        wa_docs = WhatsAppExportProcessor.process_chat_export(wa_file)
        all_documents.extend(wa_docs)
        logger.info(f"Loaded WhatsApp announcements: {len(wa_docs)} messages.")

    # 4. سحب صفحات حية من موقع الكلية إن طلب ذلك
    if scrape_live_website:
        logger.info("Scraping live official college website...")
        scraper = BFCAIWebsiteScraper(settings.BFCAI_WEBSITE_URL)
        pages_to_scrape = [
            settings.BFCAI_WEBSITE_URL,
            f"{settings.BFCAI_WEBSITE_URL.rstrip('/')}/index.php/students",
            f"{settings.BFCAI_WEBSITE_URL.rstrip('/')}/index.php/departments"
        ]
        for url in pages_to_scrape:
            page_data = scraper.scrape_page(url)
            if page_data and page_data.get("content"):
                chunks = ArabicDataCleaner.chunk_text(page_data["content"], chunk_size=350, overlap=50)
                for idx, chunk in enumerate(chunks):
                    all_documents.append({
                        "id": f"web_{abs(hash(url))}_{idx}",
                        "text": chunk,
                        "metadata": {
                            "title": page_data["title"],
                            "url": url,
                            "source_type": "موقع الكلية الرسمي",
                            "year": "عام"
                        }
                    })

    # 5. التخزين في ChromaDB
    if all_documents:
        vector_store_service.add_documents(all_documents)
        logger.info(f"Successfully indexed {len(all_documents)} documents into ChromaDB Vector Store!")
    else:
        logger.warning("No documents were found to ingest.")

    return len(all_documents)

if __name__ == "__main__":
    count = run_ingestion_pipeline(scrape_live_website=False)
    print(f"Pipeline finished! Total documents indexed: {count}")
