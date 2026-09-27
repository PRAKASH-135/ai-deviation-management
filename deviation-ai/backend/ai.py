import os
import json
from typing import TypedDict

from dotenv import load_dotenv
from groq import Groq

from langgraph.graph import StateGraph, START, END


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    raise ValueError(
        "GROQ_API_KEY not found. Please check your .env file."
    )


# ============================================================
# GROQ CLIENT
# ============================================================

client = Groq(api_key=API_KEY)


# ============================================================
# LANGGRAPH STATE
# ============================================================

class DeviationState(TypedDict):
    text: str
    result: dict


# ============================================================
# AI ANALYSIS NODE
# ============================================================

def analyze_deviation(state: DeviationState):

    deviation_text = state["text"]

    prompt = f"""
You are an AI assistant for a pharmaceutical
Deviation Management System.

Your task is to analyze the deviation report
and extract structured information.

Return ONLY valid JSON.

Required JSON fields:

site
date_of_occurrence
title
source
product
batch_number
description
impact
severity
reason

Severity MUST be one of:

Minor
Major
Critical

If some information is not available in the report,
use an empty string "".

For impact, briefly explain the possible impact
on product quality, safety, compliance, or production.

For reason, explain why the selected severity was chosen.

Deviation report:

{deviation_text}
"""

    # ========================================================
    # CALL GROQ
    # ========================================================

    response = client.chat.completions.create(

        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "system",
                "content": (
                    "You are a pharmaceutical "
                    "quality management AI assistant."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0,

        # Ask the model for JSON output
        response_format={
            "type": "json_object"
        }
    )

    content = response.choices[0].message.content

    # ========================================================
    # PARSE JSON
    # ========================================================

    try:

        result = json.loads(content)

    except json.JSONDecodeError:

        result = {
            "site": "",
            "date_of_occurrence": "",
            "title": "",
            "source": "",
            "product": "",
            "batch_number": "",
            "description": content,
            "impact": "",
            "severity": "",
            "reason": ""
        }

    # ========================================================
    # RETURN LANGGRAPH STATE
    # ========================================================

    return {
        "text": deviation_text,
        "result": result
    }


# ============================================================
# CREATE LANGGRAPH WORKFLOW
# ============================================================

graph = StateGraph(DeviationState)


# Add AI analysis node
graph.add_node(
    "analyze",
    analyze_deviation
)


# Workflow:
# START → analyze → END

graph.add_edge(
    START,
    "analyze"
)

graph.add_edge(
    "analyze",
    END
)


# Compile graph
workflow = graph.compile()


# ============================================================
# FUNCTION USED BY FASTAPI
# ============================================================

def process_deviation(text: str):

    result = workflow.invoke(
        {
            "text": text,
            "result": {}
        }
    )

    return result["result"]