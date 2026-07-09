# Submission Notes

## Video Requirement Alignment

The video requires a split-screen Log Interaction screen:

- Left side: interaction details form.
- Right side: AI assistant chat.
- The representative should not fill the left form manually.
- The AI assistant should control and populate the left form.

This project implements that flow in:

```text
client/src/pages/Interaction/LogInteractionPage.tsx
```

The screen includes two entry modes:

- AI Chat Mode: the left form is AI controlled and populated by the `/api/agent/process` response.
- Structured Form: the representative can manually enter the interaction using editable CRM fields and save it directly through the FastAPI interaction endpoint.

The chat supports both initial logging and correction prompts.

## Example Log Flow

Representative prompt:

```text
Today I met with Dr. Smith and discussed product X efficiency.
The sentiment was positive and I shared the brochures.
```

LangGraph runs the interaction flow, extracts structured CRM fields, and returns a `formPatch`. The frontend applies that patch to the left-side form.

Expected filled fields:

- HCP name: Dr. Smith
- Product: Product X
- Sentiment: positive
- Materials: brochures shared
- Date: today

## Structured Form Flow

If the representative chooses `Structured Form`, the same interaction details panel becomes editable. The user can select an HCP, choose products, enter discussion notes, set follow-up, and save the log without using chat. This satisfies the assignment requirement for both structured and conversational logging.

## Example Edit Flow

Representative correction before saving:

```text
Sorry, the name was actually Dr. John and the sentiment was negative.
```

LangGraph routes this to the Edit Interaction behavior and returns a patch containing only the corrected fields. The frontend updates only those fields and preserves the rest of the form.

Representative correction after saving:

```text
Actually change the sentiment to negative and the follow-up date.
```

The frontend sends the saved `interactionId` back to `/api/agent/process`. LangGraph then invokes the real `EditInteractionTool`, updates the logged CRM record, syncs edited products when needed, and creates an audit entry through the repository layer.

## LangGraph Agent Role

The LangGraph agent manages the HCP interaction lifecycle:

```text
Input
Router
Intent Detection
Context
Entity Extraction
Summarization
Validation
Tool Router
Tool Execution
Memory
Logging
Response
```

The API route does not directly call the LLM. It delegates to `AgentService`, which invokes the LangGraph workflow.

## Required Tools

The project defines and routes five sales-related tools:

- Log Interaction: extracts natural language visit notes, summarizes the discussion, creates structured JSON, and can save the interaction.
- Edit Interaction: applies natural-language corrections as field-level patches before save, and updates the saved CRM record with audit history after save.
- Search HCP: retrieves doctor, hospital, specialization, and city context.
- Interaction Summary: summarizes prior HCP meetings and creates a timeline.
- Follow-up Recommendation: recommends next date, samples, products, and discussion topics.

Tool files live in:

```text
server/app/langgraph/tools/
```

The selected tool and tool results are returned to the frontend and displayed on the Log Interaction screen.

## Database Migrations

The project now includes an initial Alembic migration:

```text
server/alembic/versions/0001_initial_schema.py
```

The FastAPI startup path still creates tables for demo convenience, but the migration file gives reviewers a formal database setup path.

## Backend-Backed Screens

The dashboard and HCP list screens now call FastAPI services instead of relying only on frontend seed data:

```text
client/src/services/dashboard/dashboardService.ts
client/src/services/doctor/doctorService.ts
```

Seeded Redux data remains as a fallback so the demo does not render empty if the backend is not started.

## Authentication And Roles

Login now calls the FastAPI `/api/auth/login` endpoint instead of creating a fake frontend-only token. The backend issues a signed JWT containing the representative id, role, and territory. The protected `/api/auth/me` endpoint validates the bearer token and returns the current role-bearing user. The UI stores that token, attaches it to API requests, and shows the logged-in user's role in the navbar.

Demo credentials:

```text
aarav.mehta@pharma.example
Welcome123
```

## Verification Coverage

Focused backend tests cover:

- deterministic Groq fallback extraction
- LangGraph edit tool update behavior
- JWT role-bearing login
- bearer token validation for the current user
- invalid password rejection
- interaction deletion with preserved audit history

## LLM Usage

Groq is integrated through:

```text
server/app/services/groq_client.py
```

Primary model:

```text
gemma2-9b-it
```

Fallback model:

```text
llama-3.3-70b-versatile
```

If Groq is unavailable, a deterministic local fallback keeps the interview demo functional, but the production path is built around Groq and LangGraph.
