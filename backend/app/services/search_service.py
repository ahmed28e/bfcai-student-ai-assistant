import logging
import httpx
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self):
        self.tavily_key = settings.TAVILY_API_KEY
        self.google_key = settings.GOOGLE_SEARCH_API_KEY
        self.google_cx = settings.GOOGLE_SEARCH_ENGINE_ID
        self.engine = settings.SEARCH_ENGINE.lower()

    async def search_web(self, query: str, academic_year: str = "", max_results: int = 3) -> List[Dict[str, Any]]:
        """
        يقوم بالبحث عبر الويب لدعم الإجابة عند عدم وجودها في قاعدة المعرفة المحلية.
        يضيف كلمات مفتاحية ذكية لتوجيه البحث نحو جامعة بنها وحاسبات ومعلومات بنها.
        """
        refined_query = f"{query} كلية الحاسبات والذكاء الاصطناعي بنها"

        # 1. إذا كان مفتاح Tavily متوفراً
        if self.tavily_key and self.engine == "tavily":
            results = await self._search_tavily(refined_query, max_results)
            if results:
                return results

        # 2. إذا كان مفتاح Google Custom Search متوفراً
        if self.google_key and self.google_cx and self.engine == "google_custom_search":
            results = await self._search_google(refined_query, max_results)
            if results:
                return results

        # 3. الافتراضي المجاني: DuckDuckGo Search
        return await self._search_duckduckgo(refined_query, max_results)

    async def _search_duckduckgo(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        results = []
        try:
            from duckduckgo_search import DDGS
            with DDGS() as ddgs:
                ddg_gen = ddgs.text(query, max_results=max_results, region="xa-ar")
                for r in ddg_gen:
                    results.append({
                        "title": r.get("title", "نتيجة بحث جوجل / الويب"),
                        "url": r.get("href", "https://google.com"),
                        "snippet": r.get("body", ""),
                        "source_type": "بحث الويب (جوجل)"
                    })
        except Exception as e:
            logger.warning(f"DuckDuckGo search error: {e}. Trying fallback HTTP search.")
            try:
                # Basic fallback if DDGS package has rate limits
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.get(
                        "https://html.duckduckgo.com/html/",
                        params={"q": query},
                        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
                    )
                    if resp.status_code == 200:
                        from bs4 import BeautifulSoup
                        soup = BeautifulSoup(resp.text, "html.parser")
                        links = soup.find_all("a", class_="result__snippet")[:max_results]
                        for link in links:
                            snippet = link.get_text(strip=True)
                            parent = link.find_parent("div", class_="result__body")
                            title_tag = parent.find("a", class_="result__url") if parent else None
                            url = title_tag.get("href") if title_tag else "https://fci.bu.edu.eg/"
                            results.append({
                                "title": "نتيجة بحث الويب المباشر",
                                "url": url,
                                "snippet": snippet,
                                "source_type": "بحث الويب (جوجل)"
                            })
            except Exception as ex2:
                logger.error(f"Fallback HTTP web search failed: {ex2}")

        return results

    async def _search_tavily(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        results = []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": self.tavily_key,
                        "query": query,
                        "search_depth": "basic",
                        "max_results": max_results
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    for item in data.get("results", []):
                        results.append({
                            "title": item.get("title", "نتيجة بحث الويب"),
                            "url": item.get("url", ""),
                            "snippet": item.get("content", ""),
                            "source_type": "بحث الويب (جوجل)"
                        })
        except Exception as e:
            logger.error(f"Tavily search failed: {e}")
        return results

    async def _search_google(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        results = []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {
                    "key": self.google_key,
                    "cx": self.google_cx,
                    "q": query,
                    "num": max_results,
                    "lr": "lang_ar"
                }
                res = await client.get("https://www.googleapis.com/customsearch/v1", params=params)
                if res.status_code == 200:
                    data = res.json()
                    for item in data.get("items", []):
                        results.append({
                            "title": item.get("title", ""),
                            "url": item.get("link", ""),
                            "snippet": item.get("snippet", ""),
                            "source_type": "بحث الويب (جوجل)"
                        })
        except Exception as e:
            logger.error(f"Google custom search failed: {e}")
        return results

search_service = SearchService()
