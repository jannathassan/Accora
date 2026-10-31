"""Tests for Google Gemini AI Provider and multi-turn conversational chat."""

import json
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.ai.gemini import GeminiAIProvider
from app.ai.provider import get_ai_provider
from app.core.config import settings
from app.main import app
from app.models.financial import ChatMessage, ChatRequest


@pytest.mark.anyio
async def test_gemini_fallback_when_no_key():
    """GeminiAIProvider should fall back gracefully to MockAIProvider when key is missing."""
    provider = GeminiAIProvider(api_key="")
    req = ChatRequest(message="What is my cash runway?", history=[])
    res = await provider.chat(req, context="Revenue: PKR 1,000,000\nExpenses: PKR 500,000\nCash balance: PKR 2,000,000")
    assert res.answer
    assert "cash" in res.answer.lower() or "balance" in res.answer.lower()
    assert len(res.evidence) > 0


@pytest.mark.anyio
async def test_gemini_json_cleaning():
    """Verify markdown fences are cleanly stripped from model output."""
    provider = GeminiAIProvider(api_key="mock_key")
    raw_json_in_markdown = """```json
    {
      "answer": "You have a solid 4 months of runway.",
      "evidence": ["Cash balance is PKR 2M", "Burn rate is PKR 500k"],
      "interpretation": "Your liquidity is within safe operating margins.",
      "recommendation": "Maintain buffer and accelerate collection of pending invoices.",
      "follow_ups": ["Can I hire someone?", "How can I cut expenses?"]
    }
    ```"""
    cleaned = provider._clean_json_text(raw_json_in_markdown)
    assert not cleaned.startswith("```")
    assert not cleaned.endswith("```")
    data = json.loads(cleaned)
    assert data["answer"] == "You have a solid 4 months of runway."
    assert len(data["evidence"]) == 2


@pytest.mark.anyio
async def test_gemini_chat_successful_call():
    """Test full chat response parsing when Gemini API returns valid JSON."""
    provider = GeminiAIProvider(api_key="test_key_123", model_id="gemini-1.5-flash")
    mock_payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": json.dumps({
                                "answer": "Based on your records, your net profit margin is 32%.",
                                "evidence": ["Revenue: PKR 1.5M", "Expenses: PKR 1.02M", "Profit: PKR 480K"],
                                "interpretation": "A 32% margin gives strong operational stability for an agency.",
                                "recommendation": "Reinvest surplus into growth marketing.",
                                "follow_ups": ["Can I afford a new hire?", "What are my overdue invoices?"]
                            })
                        }
                    ],
                    "role": "model",
                },
                "finishReason": "STOP",
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_payload

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        req = ChatRequest(
            message="What is my margin?",
            history=[
                ChatMessage(role="user", content="Hi!"),
                ChatMessage(role="model", content="Salam! How can I assist you with your finances today?"),
            ],
        )
        res = await provider.chat(req, context="Revenue: PKR 1.5M\nExpenses: PKR 1.02M")
        assert res.answer == "Based on your records, your net profit margin is 32%."
        assert len(res.evidence) == 3
        assert res.interpretation == "A 32% margin gives strong operational stability for an agency."
        assert len(res.follow_ups) == 2


def test_ai_status_endpoint():
    """Verify /api/v1/ai/status endpoint responds with provider metadata."""
    with TestClient(app) as client:
        resp = client.get("/api/v1/ai/status")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data
        assert "provider" in data
        assert "model" in data
        assert "configured" in data
