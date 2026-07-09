from app.services.groq_client import GroqClient


def test_fallback_extracts_structured_interaction_without_api_key():
    client = GroqClient()
    extraction = client._fallback_extract(
        "Today I met Dr Sharma. We discussed diabetes medicine. He liked trial data and requested samples. Visit again next Tuesday.",
        {"hospital": "Apollo Health City"},
    )

    assert extraction["doctorName"] == "Dr. Sharma"
    assert extraction["hospital"] == "Apollo Health City"
    assert "GlucoZen XR" in extraction["products"]
    assert extraction["sentiment"] == "positive"
    assert "Arrange requested samples" in extraction["actionItems"]
    assert extraction["confidenceScore"] > 0.7

