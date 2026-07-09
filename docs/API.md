# API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

### `POST /auth/login`

Request:

```json
{
  "email": "aarav.mehta@pharma.example",
  "password": "Welcome123"
}
```

Response:

```json
{
  "accessToken": "development-token-1",
  "tokenType": "bearer",
  "user": {
    "id": 1,
    "name": "Aarav Mehta",
    "email": "aarav.mehta@pharma.example",
    "territory": "Mumbai Central"
  }
}
```

## HCP

- `GET /hcp?search=sharma&sort=name_asc&page=1`
- `GET /hcp/{doctorId}`
- `POST /hcp`

## Interactions

- `GET /interactions`
- `POST /interactions`
- `PUT /interactions/{interactionId}`
- `DELETE /interactions/{interactionId}`

## AI Agent

### `POST /agent/process`

Request:

```json
{
  "message": "Today I met Dr Sharma. We discussed our diabetes medicine. He liked the new trial data. Requested samples. Visit again next Tuesday.",
  "doctorId": 1,
  "saveRequested": false
}
```

Response:

```json
{
  "extraction": {
    "doctorName": "Dr. Sharma",
    "hospital": "Apollo Health City",
    "products": ["GlucoZen XR"],
    "summary": "Today I met Dr Sharma...",
    "sentiment": "positive",
    "actionItems": ["Arrange requested samples", "Send relevant clinical data"],
    "followUpDate": "2026-07-14",
    "keywords": ["diabetes", "discussed", "requested"],
    "medicalEntities": ["diabetes", "trial data", "samples"],
    "confidenceScore": 0.78
  },
  "response": "The interaction was extracted and is ready for representative review.",
  "savedInteractionId": null
}
```

## Follow-ups And Dashboard

- `GET /followups`
- `GET /dashboard`
