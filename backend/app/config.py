import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # "gemini", "openai", "mock"
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_MODEL: str = "gpt-4o-mini"

    # ChromaDB Settings
    CHROMA_PERSIST_DIRECTORY: str = "./data/chroma_db"
    CHROMA_COLLECTION_NAME: str = "bfcai_knowledge_base"
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"

    # Web Search Fallback
    WEB_SEARCH_ENABLED: bool = True
    SEARCH_ENGINE: str = "duckduckgo"  # "duckduckgo", "tavily", "google_custom_search"
    TAVILY_API_KEY: Optional[str] = os.getenv("TAVILY_API_KEY", "")
    GOOGLE_SEARCH_API_KEY: Optional[str] = os.getenv("GOOGLE_SEARCH_API_KEY", "")
    GOOGLE_SEARCH_ENGINE_ID: Optional[str] = os.getenv("GOOGLE_SEARCH_ENGINE_ID", "")

    # BFCAI Official URLs
    BFCAI_WEBSITE_URL: str = "https://fci.bu.edu.eg/"
    BFCAI_FACEBOOK_URL: str = "https://www.facebook.com/Official.BFCAI"
    BFCAI_WHATSAPP_CHANNEL_URL: str = "https://whatsapp.com/channel/0029VbDCrkm0Qean90DDeQ1Q"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
