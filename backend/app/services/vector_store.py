import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings

logger = logging.getLogger(__name__)

class VectorStoreService:
    def __init__(self):
        self.persist_directory = settings.CHROMA_PERSIST_DIRECTORY
        os.makedirs(self.persist_directory, exist_ok=True)
        
        # Initialize ChromaDB persistent client
        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        
        # Default embedding function
        self.collection_name = settings.CHROMA_COLLECTION_NAME
        self.collection = self._get_or_create_collection()

    def _get_or_create_collection(self):
        try:
            # We use standard chromadb default embedding function or sentence-transformer if available
            return self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "BFCAI Knowledge Base for Faculty of Computers and AI - Benha University"}
            )
        except Exception as e:
            logger.error(f"Error initializing Chroma collection: {e}")
            raise e

    def add_documents(self, documents: List[Dict[str, Any]]):
        """
        documents format:
        [
            {
                "id": "doc_1",
                "text": "المحتوى النصي...",
                "metadata": {
                    "title": "عنوان المقال",
                    "source_type": "موقع الكلية الرسمي",
                    "url": "https://fci.bu.edu.eg/...",
                    "year": "الفرقة الأولى"
                }
            }
        ]
        """
        if not documents:
            return

        ids = [doc["id"] for doc in documents]
        texts = [doc["text"] for doc in documents]
        metadatas = [doc.get("metadata", {}) for doc in documents]

        # Chroma requires metadata values to be str, int, float, or bool
        cleaned_metadatas = []
        for meta in metadatas:
            clean = {}
            for k, v in meta.items():
                if v is None:
                    clean[k] = ""
                elif isinstance(v, (str, int, float, bool)):
                    clean[k] = v
                else:
                    clean[k] = str(v)
            cleaned_metadatas.append(clean)

        self.collection.upsert(
            ids=ids,
            documents=texts,
            metadatas=cleaned_metadatas
        )
        logger.info(f"Upserted {len(documents)} documents to ChromaDB.")

    def search(self, query: str, academic_year: Optional[str] = None, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        البحث الدلالي مع إمكانية التصفية حسب الفرقة الدراسية
        """
        try:
            count = self.collection.count()
            if count == 0:
                logger.warning("Vector store is empty.")
                return []

            where_filter = None
            if academic_year and academic_year not in ["عام (كافة الفرق)", "عام"]:
                # Flexible filtering or preference
                where_filter = {"$or": [{"year": academic_year}, {"year": "عام"}]}

            results = self.collection.query(
                query_texts=[query],
                n_results=min(top_k, count),
                where=where_filter if where_filter else None
            )

            # If filtered query returns nothing, try without filter
            if not results or not results.get("documents") or len(results["documents"][0]) == 0:
                results = self.collection.query(
                    query_texts=[query],
                    n_results=min(top_k, count)
                )

            formatted_results = []
            if results and results.get("documents") and len(results["documents"]) > 0:
                docs = results["documents"][0]
                metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
                distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

                for doc, meta, dist in zip(docs, metas, distances):
                    # convert distance to normalized score (smaller distance in L2/cosine = higher relevance)
                    relevance = round(max(0.0, 1.0 - (dist / 2.0)), 3)
                    formatted_results.append({
                        "content": doc,
                        "metadata": meta,
                        "relevance_score": relevance
                    })

            return formatted_results
        except Exception as e:
            logger.error(f"Search failed in ChromaDB: {e}")
            return []

    def get_count(self) -> int:
        try:
            return self.collection.count()
        except Exception:
            return 0

vector_store_service = VectorStoreService()
