import json
import re
import logging
from typing import List, Dict, Any
import requests
from bs4 import BeautifulSoup
from app.ingestion.data_cleaner import ArabicDataCleaner

logger = logging.getLogger(__name__)

class BFCAIWebsiteScraper:
    """
    سحب محتوى الموقع الرسمي لكلية الحاسبات والذكاء الاصطناعي - جامعة بنها
    """
    def __init__(self, base_url: str = "https://fci.bu.edu.eg/"):
        self.base_url = base_url
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

    def scrape_page(self, url: str) -> Dict[str, Any]:
        try:
            response = requests.get(url, headers=self.headers, timeout=12)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, "html.parser")
                # إزالة الوسوم غير المرغوبة
                for s in soup(["script", "style", "nav", "footer"]):
                    s.decompose()

                title = soup.find("title").get_text(strip=True) if soup.find("title") else "صفحة كلية الحاسبات بنها"
                paragraphs = [p.get_text(strip=True) for p in soup.find_all(["p", "h1", "h2", "h3", "li"])]
                content = " ".join([p for p in paragraphs if len(p) > 15])
                
                return {
                    "url": url,
                    "title": title,
                    "content": content,
                    "source_type": "موقع الكلية الرسمي"
                }
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
        return {}


class FacebookDataProcessor:
    """
    معالجة منشورات صفحة الفيسبوك الرسمية (Official.BFCAI)
    يدعم ملفات JSON المستخرجة عبر Graph API أو Apify أو التصدير اليدوي
    """
    @staticmethod
    def process_posts_json(file_path: str) -> List[Dict[str, Any]]:
        documents = []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                posts = data if isinstance(data, list) else data.get("posts", [])

                for idx, post in enumerate(posts):
                    content = post.get("message") or post.get("text") or post.get("content", "")
                    if not content or len(content.strip()) < 20:
                        continue

                    # استنتاج الفرقة الدراسية من محتوى المنشور
                    year = "عام"
                    if "الفرقة الأولى" in content or "اولى" in content:
                        year = "الفرقة الأولى"
                    elif "الفرقة الثانية" in content or "ثانية" in content:
                        year = "الفرقة الثانية"
                    elif "الفرقة الثالثة" in content or "ثالثة" in content:
                        year = "الفرقة الثالثة"
                    elif "الفرقة الرابعة" in content or "رابعة" in content or "تخرج" in content:
                        year = "الفرقة الرابعة"

                    doc_id = f"fb_post_{post.get('id', idx)}"
                    documents.append({
                        "id": doc_id,
                        "text": content,
                        "metadata": {
                            "title": post.get("title", f"إعلان فيسبوك: {content[:40]}..."),
                            "url": post.get("url", "https://www.facebook.com/Official.BFCAI"),
                            "source_type": "صفحة الفيسبوك الرسمية",
                            "date": post.get("created_time", ""),
                            "year": year
                        }
                    })
        except Exception as e:
            logger.error(f"Error processing Facebook posts: {e}")
        return documents


class WhatsAppExportProcessor:
    """
    معالجة الرسائل المصدرة من قناة الواتساب الرسمية أو مجموعات الفرق الدراسية
    تنسيق ملفات المحادثات النصية: [DD/MM/YYYY, HH:MM:SS] Sender: Message
    """
    @staticmethod
    def process_chat_export(file_path: str) -> List[Dict[str, Any]]:
        documents = []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            current_message = []
            current_date = ""

            pattern = re.compile(r"^\[?(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|ص|م)?)\]?\s*(.*?):?\s*(.*)$")

            for line in lines:
                match = pattern.match(line)
                if match:
                    if current_message:
                        full_text = " ".join(current_message).strip()
                        if len(full_text) > 30 and "<Media omitted>" not in full_text and "تم حذف هذه الرسالة" not in full_text:
                            # تحديد الفرقة
                            year = "عام"
                            if "الفرقة الأولى" in full_text:
                                year = "الفرقة الأولى"
                            elif "الفرقة الثانية" in full_text:
                                year = "الفرقة الثانية"
                            elif "الفرقة الثالثة" in full_text:
                                year = "الفرقة الثالثة"
                            elif "الفرقة الرابعة" in full_text or "مشروع التخرج" in full_text:
                                year = "الفرقة الرابعة"

                            documents.append({
                                "id": f"wa_msg_{len(documents)+1}",
                                "text": full_text,
                                "metadata": {
                                    "title": f"تنبيه قناة الواتساب: {full_text[:35]}...",
                                    "url": "https://whatsapp.com/channel/0029VbDCrkm0Qean90DDeQ1Q",
                                    "source_type": "قناة الواتساب الرسمية",
                                    "date": current_date,
                                    "year": year
                                }
                            })
                    current_date = match.group(1)
                    current_message = [match.group(4)]
                else:
                    current_message.append(line.strip())

        except Exception as e:
            logger.error(f"Error processing WhatsApp export: {e}")
        return documents
