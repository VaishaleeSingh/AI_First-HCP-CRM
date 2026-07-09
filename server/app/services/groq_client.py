import json
import re
from datetime import date, timedelta
from typing import Any

from app.config.settings import get_settings
from app.langgraph.prompts.entity_prompt import ENTITY_EXTRACTION_SYSTEM_PROMPT
from app.langgraph.prompts.summary_prompt import SUMMARY_SYSTEM_PROMPT


class GroqClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    def extract_interaction(self, message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        prompt = {
            "message": message,
            "context": context or {},
            "required_json_keys": [
                "doctorName",
                "hospital",
                "products",
                "summary",
                "sentiment",
                "actionItems",
                "followUpDate",
                "keywords",
                "medicalEntities",
                "confidenceScore",
            ],
        }
        llm_result = self._complete_json(ENTITY_EXTRACTION_SYSTEM_PROMPT, json.dumps(prompt))
        if llm_result:
            return self._normalize_extraction(llm_result, message, context)
        return self._fallback_extract(message, context)

    def summarize(self, message: str) -> str:
        llm_result = self._complete_json(SUMMARY_SYSTEM_PROMPT, message)
        if llm_result and isinstance(llm_result.get("summary"), str):
            return llm_result["summary"]
        return self._fallback_summary(message)

    def _complete_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any] | None:
        if not self.settings.groq_api_key:
            return None

        for model in [self.settings.groq_model, self.settings.groq_fallback_model]:
            result = self._complete_json_with_model(system_prompt, user_prompt, model)
            if result is not None:
                return result
        return None

    def _complete_json_with_model(self, system_prompt: str, user_prompt: str, model: str) -> dict[str, Any] | None:
        try:
            from groq import Groq

            client = Groq(api_key=self.settings.groq_api_key)
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            content = completion.choices[0].message.content
            return json.loads(content or "{}")
        except Exception:
            return None

    def _normalize_extraction(
        self,
        payload: dict[str, Any],
        message: str,
        context: dict[str, Any] | None,
    ) -> dict[str, Any]:
        fallback = self._fallback_extract(message, context)
        return {
            "doctorName": str(payload.get("doctorName") or fallback["doctorName"]),
            "hospital": str(payload.get("hospital") or fallback["hospital"]),
            "products": self._normalize_list(payload.get("products"), fallback["products"]),
            "summary": str(payload.get("summary") or fallback["summary"]),
            "sentiment": self._normalize_sentiment(payload.get("sentiment"), fallback["sentiment"]),
            "actionItems": self._normalize_list(payload.get("actionItems"), fallback["actionItems"]),
            "followUpDate": self._normalize_date(payload.get("followUpDate"), fallback["followUpDate"]),
            "keywords": self._normalize_list(payload.get("keywords"), fallback["keywords"]),
            "medicalEntities": self._normalize_list(
                payload.get("medicalEntities"),
                fallback["medicalEntities"],
            ),
            "confidenceScore": self._normalize_confidence(
                payload.get("confidenceScore"),
                fallback["confidenceScore"],
            ),
        }

    @staticmethod
    def _normalize_list(value: Any, fallback: list[str]) -> list[str]:
        if isinstance(value, list):
            items = value
        elif isinstance(value, str):
            items = re.split(r"[,;]\s*", value)
        else:
            items = []

        cleaned = [str(item).strip() for item in items if str(item).strip()]
        return cleaned or fallback

    @staticmethod
    def _normalize_sentiment(value: Any, fallback: str) -> str:
        normalized = str(value or fallback).lower()
        if "positive" in normalized:
            return "positive"
        if "negative" in normalized:
            return "negative"
        return "neutral"

    @staticmethod
    def _normalize_date(value: Any, fallback: str) -> str:
        raw = str(value or "").strip()
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw):
            try:
                date.fromisoformat(raw)
                return raw
            except ValueError:
                return fallback
        return fallback

    @staticmethod
    def _normalize_confidence(value: Any, fallback: float) -> float:
        try:
            confidence = float(value)
        except (TypeError, ValueError):
            confidence = fallback

        if confidence > 1 and confidence <= 100:
            confidence = confidence / 100
        return min(max(confidence, 0), 1)

    def _fallback_extract(self, message: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        doctor_name = self._extract_doctor_name(message) or context_get(context, "doctorName", "Unknown doctor")
        hospital = context_get(context, "hospital", "Unknown hospital")
        products = self._extract_products(message)
        summary = self._fallback_summary(message)
        lower = message.lower()
        sentiment = "positive" if any(word in lower for word in ["liked", "positive", "interested", "agreed"]) else "neutral"
        if any(word in lower for word in ["concern", "negative", "rejected", "not interested"]):
            sentiment = "negative"
        action_items = self._extract_action_items(message)
        follow_up = self._extract_follow_up_date(message)
        keywords = sorted({word for word in re.findall(r"[A-Za-z]{5,}", lower)})[:10]
        medical_entities = [
            entity
            for entity in ["diabetes", "cardiology", "trial data", "samples", "adherence", "renal"]
            if entity in lower
        ]

        return {
            "doctorName": doctor_name,
            "hospital": hospital,
            "products": products or ["GlucoZen XR"],
            "summary": summary,
            "sentiment": sentiment,
            "actionItems": action_items,
            "followUpDate": follow_up,
            "keywords": keywords,
            "medicalEntities": medical_entities,
            "confidenceScore": 0.78 if doctor_name != "Unknown doctor" else 0.62,
        }

    @staticmethod
    def _fallback_summary(message: str) -> str:
        cleaned = " ".join(message.split())
        if len(cleaned) <= 220:
            return cleaned
        return f"{cleaned[:217]}..."

    @staticmethod
    def _extract_doctor_name(message: str) -> str | None:
        match = re.search(r"\bDr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", message)
        return f"Dr. {match.group(1)}" if match else None

    @staticmethod
    def _extract_products(message: str) -> list[str]:
        lower = message.lower()
        product_map = {
            "diabetes": "GlucoZen XR",
            "glucozen": "GlucoZen XR",
            "cardia": "CardiaPlus",
            "heart": "CardiaPlus",
            "respira": "RespiraClear",
            "pulmonary": "RespiraClear",
            "neuro": "NeuroCalm",
            "immun": "Immunova",
        }
        products = {product for keyword, product in product_map.items() if keyword in lower}
        product_match = re.search(r"\bproduct\s+([a-z0-9-]+)\b", lower)
        if product_match:
            products.add(f"Product {product_match.group(1).upper()}")
        return sorted(products)

    @staticmethod
    def _extract_action_items(message: str) -> list[str]:
        lower = message.lower()
        items = []
        if "sample" in lower:
            items.append("Arrange requested samples")
        if "brochure" in lower:
            items.append("Mark brochures as shared")
        if "data" in lower or "trial" in lower:
            items.append("Send relevant clinical data")
        if "visit" in lower or "follow" in lower:
            items.append("Schedule follow-up visit")
        return items or ["Review visit notes and confirm next step"]

    @staticmethod
    def _extract_follow_up_date(message: str) -> str:
        lower = message.lower()
        today = date.today()
        weekday_map = {
            "monday": 0,
            "tuesday": 1,
            "wednesday": 2,
            "thursday": 3,
            "friday": 4,
            "saturday": 5,
            "sunday": 6,
        }
        for weekday, index in weekday_map.items():
            if weekday in lower:
                days_ahead = (index - today.weekday()) % 7
                days_ahead = days_ahead or 7
                return (today + timedelta(days=days_ahead)).isoformat()
        if "next week" in lower:
            return (today + timedelta(days=7)).isoformat()
        return (today + timedelta(days=5)).isoformat()


def context_get(context: dict[str, Any] | None, key: str, default: Any) -> Any:
    if not context:
        return default
    return context.get(key, default)
