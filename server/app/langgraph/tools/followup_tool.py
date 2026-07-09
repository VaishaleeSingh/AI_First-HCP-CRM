from datetime import date, timedelta


class FollowUpRecommendationTool:
    name = "followup_recommendation"

    def run(self, extraction: dict) -> dict:
        sentiment = extraction.get("sentiment", "neutral")
        products = extraction.get("products", [])
        base_days = 5 if sentiment == "positive" else 10
        return {
            "bestFollowUpDate": extraction.get("followUpDate") or (date.today() + timedelta(days=base_days)).isoformat(),
            "suggestedSamples": products,
            "suggestedProducts": products,
            "suggestedDiscussionTopics": [
                "Clinical outcome data",
                "Patient profile fit",
                "Sample feedback",
                "Competitor objections",
            ],
        }

