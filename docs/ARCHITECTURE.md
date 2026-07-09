# Architecture

The module uses a layered backend and a feature-oriented frontend.

```mermaid
flowchart TD
  Browser["React + Redux Toolkit"] --> Axios["Axios API Client"]
  Axios --> Routes["FastAPI Routers"]
  Routes --> Controllers["Controllers"]
  Controllers --> Services["Services"]
  Services --> Repositories["Repositories"]
  Repositories --> DB[("PostgreSQL")]
  Services --> Agent["AgentService"]
  Agent --> Graph["LangGraph Workflow"]
  Graph --> Nodes["Input, Router, Intent, Context, Extract, Summary, Validate, Tool Router, Database, Memory, Logging, Response"]
  Nodes --> Tools["Log, Edit, Search HCP, Summary, Follow-up"]
  Nodes --> Groq["Groq gemma2-9b-it"]
```

## Backend Boundaries

- Routers only parse HTTP inputs and delegate.
- Controllers translate route intent into service calls.
- Services coordinate business rules and transactions.
- Repositories own SQLAlchemy persistence.
- LangGraph nodes own AI workflow orchestration.
- Tools expose reusable CRM actions to the agent layer.

## Frontend Boundaries

- `pages/` compose workflows.
- `components/` hold reusable UI primitives and domain widgets.
- `redux/slices/` owns state per domain.
- `services/` owns Axios calls.
- `utils/validators/` owns Zod validation.
