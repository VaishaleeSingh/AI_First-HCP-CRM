from langgraph.graph import END, StateGraph

from app.langgraph.nodes.context import context_node
from app.langgraph.nodes.database import database_node
from app.langgraph.nodes.extract import entity_extraction_node
from app.langgraph.nodes.input import input_node
from app.langgraph.nodes.intent import intent_detection_node
from app.langgraph.nodes.logging import logging_node
from app.langgraph.nodes.memory import memory_node
from app.langgraph.nodes.response import response_node
from app.langgraph.nodes.router import router_node
from app.langgraph.nodes.summary import summarization_node
from app.langgraph.nodes.tool_router import tool_router_node
from app.langgraph.nodes.validate import validation_node
from app.langgraph.state import AgentState


def build_agent_graph():
    workflow = StateGraph(AgentState)
    workflow.add_node("input", input_node)
    workflow.add_node("router", router_node)
    workflow.add_node("intent_detection", intent_detection_node)
    workflow.add_node("context", context_node)
    workflow.add_node("entity_extraction", entity_extraction_node)
    workflow.add_node("summarization", summarization_node)
    workflow.add_node("validation", validation_node)
    workflow.add_node("tool_router", tool_router_node)
    workflow.add_node("database", database_node)
    workflow.add_node("memory", memory_node)
    workflow.add_node("logging", logging_node)
    workflow.add_node("response", response_node)

    workflow.set_entry_point("input")
    workflow.add_edge("input", "router")
    workflow.add_edge("router", "intent_detection")
    workflow.add_edge("intent_detection", "context")
    workflow.add_edge("context", "entity_extraction")
    workflow.add_edge("entity_extraction", "summarization")
    workflow.add_edge("summarization", "validation")
    workflow.add_edge("validation", "tool_router")
    workflow.add_edge("tool_router", "database")
    workflow.add_edge("database", "memory")
    workflow.add_edge("memory", "logging")
    workflow.add_edge("logging", "response")
    workflow.add_edge("response", END)
    return workflow.compile()

