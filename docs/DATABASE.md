# Database Design

```mermaid
erDiagram
  USERS ||--o{ INTERACTIONS : creates
  USERS ||--o{ CHAT_HISTORY : sends
  USERS ||--o{ AUDIT_LOGS : performs
  HOSPITALS ||--o{ DOCTORS : employs
  DOCTORS ||--o{ INTERACTIONS : has
  DOCTORS ||--o{ FOLLOW_UPS : receives
  INTERACTIONS ||--o{ FOLLOW_UPS : creates
  INTERACTIONS ||--o{ CHAT_HISTORY : includes
  INTERACTIONS ||--o{ AGENT_LOGS : produces
  INTERACTIONS ||--o{ AUDIT_LOGS : changes
  INTERACTIONS ||--o{ INTERACTION_PRODUCTS : discusses
  PRODUCTS ||--o{ INTERACTION_PRODUCTS : linked
```

## Tables

- `users`: field representative identity and territory.
- `hospitals`: normalized hospital records.
- `doctors`: HCP profile linked to hospital.
- `products`: product catalog and therapeutic area.
- `interactions`: structured visit records and AI enrichment.
- `interaction_products`: normalized interaction/product relationship.
- `follow_ups`: recommendations and pending actions.
- `chat_history`: representative/assistant messages and extraction payloads.
- `agent_logs`: LangGraph node-level trace records.
- `audit_logs`: version history for create, update, and delete actions.
- `settings`: configurable enterprise behavior.
