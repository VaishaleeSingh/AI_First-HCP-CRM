VALIDATION_SYSTEM_PROMPT = """
Validate extracted HCP interaction JSON. Required fields are doctorName,
products, summary, sentiment, actionItems, followUpDate, and confidenceScore.
Return correction suggestions as JSON if fields are missing.
"""

