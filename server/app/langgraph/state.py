from typing import Any, TypedDict


class AgentState(TypedDict, total=False):
    message: str
    normalized_message: str
    doctor_id: int | None
    interaction_id: int | None
    user_id: int
    db: Any
    intent: str
    route: str
    context: dict[str, Any]
    extraction: dict[str, Any]
    validation_errors: list[str]
    selected_tool: str
    form_patch: dict[str, Any]
    tool_results: dict[str, Any]
    save_requested: bool
    saved_interaction_id: int | None
    response: str
    logs: list[dict[str, Any]]
