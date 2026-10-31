"""Google Gemini AI service provider for Accora AI Co-Pilot.

Integrates Google Generative Language API (Gemini models) to provide:
- Context-grounded multi-turn conversational chat
- Proactive AI financial insights
- Strategic scenario / what-if simulations
- Executive business health commentary and summaries
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx

from app.analytics.engine import compute_health_score
from app.core.config import settings
from app.models.financial import (
    AIInsight,
    BusinessHealthScore,
    BusinessSummary,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    FinancialMetrics,
    InsightSeverity,
    InsightType,
    Invoice,
    InvoiceStatus,
    Transaction,
    WhatIfRequest,
    WhatIfResult,
)

logger = logging.getLogger("accora.ai.gemini")


class GeminiAIProvider:
    """Production provider using Google Gemini API."""

    def __init__(
        self,
        api_key: str | None = None,
        model_id: str | None = None,
        endpoint: str | None = None,
    ) -> None:
        raw_key = (api_key or settings.gemini_api_key or "").strip()
        if raw_key.lower().startswith("api key "):
            raw_key = raw_key[8:].strip()
        elif raw_key.lower().startswith("bearer "):
            raw_key = raw_key[7:].strip()
        self.api_key = raw_key
        raw_model = (model_id or settings.gemini_model_id or "gemini-3.5-flash-lite").strip()
        if raw_model in ("gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"):
            raw_model = "gemini-3.5-flash-lite"
        self.model_id = raw_model
        self.endpoint = (endpoint or settings.gemini_endpoint or "").strip()
        self._fallback_provider: Any = None

    @property
    def fallback(self) -> Any:
        """Lazy load the mock provider as a safe resilience fallback."""
        if self._fallback_provider is None:
            from app.ai.provider import MockAIProvider
            self._fallback_provider = MockAIProvider()
        return self._fallback_provider

    def _get_api_url(self, model: str) -> str:
        """Build the Google Gemini API endpoint URL."""
        base = self.endpoint.rstrip("/") if self.endpoint else "https://generativelanguage.googleapis.com"
        return f"{base}/v1beta/models/{model}:generateContent?key={self.api_key}"

    async def _call_gemini(
        self,
        system_instruction: str,
        contents: list[dict[str, Any]],
        temperature: float = 0.3,
        json_output: bool = True,
    ) -> str:
        """Execute async HTTP request to Google Gemini API with fallback model retry."""
        if not self.api_key:
            raise ValueError("Google Gemini API key is missing. Please set ACCORA_GEMINI_API_KEY in your .env file.")

        models_to_try = [self.model_id]
        # Common free tier fallback models if the primary model is not found or throttled
        for fb in ("gemini-3.5-flash-lite", "gemini-3-flash-preview", "gemini-flash-latest", "gemini-3.1-flash-lite-preview", "gemini-2.5-flash"):
            if fb not in models_to_try:
                models_to_try.append(fb)

        gen_config: dict[str, Any] = {"temperature": temperature}
        if json_output:
            gen_config["responseMimeType"] = "application/json"

        last_error: Exception | None = None

        for model in models_to_try:
            url = self._get_api_url(model)
            payload = {
                "systemInstruction": {
                    "parts": [{"text": system_instruction}]
                },
                "contents": contents,
                "generationConfig": gen_config,
            }

            try:
                async with httpx.AsyncClient(timeout=35.0) as client:
                    resp = await client.post(
                        url,
                        json=payload,
                        headers={"Content-Type": "application/json"},
                    )

                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
                    raise ValueError(f"Gemini API returned empty candidate response: {data}")

                # If 404 (model not found in v1beta for this key), try next model
                if resp.status_code == 404:
                    logger.warning(f"Model {model} returned 404. Attempting alternative Gemini model.")
                    continue

                # Any other error
                error_body = resp.text
                logger.error(f"Gemini API error ({resp.status_code}): {error_body}")
                raise RuntimeError(f"Gemini API call failed [{resp.status_code}]: {error_body}")

            except httpx.RequestError as exc:
                logger.warning(f"Network error calling Gemini model {model}: {exc}")
                last_error = exc
            except Exception as exc:
                last_error = exc

        if last_error:
            raise last_error
        raise RuntimeError("Failed to communicate with Google Gemini API across all candidate models.")

    def _clean_json_text(self, text: str) -> str:
        """Strip markdown code fence blocks if returned by the model."""
        s = text.strip()
        if s.startswith("```"):
            s = re.sub(r"^```(?:json)?\s*", "", s, flags=re.IGNORECASE)
            s = re.sub(r"\s*```$", "", s)
        return s.strip()

    # -----------------------------------------------------------------------
    # 1. Conversational Chat
    # -----------------------------------------------------------------------

    async def chat(self, request: ChatRequest, context: str) -> ChatResponse:
        """Process a conversational query with financial context and multi-turn history."""
        # Check if API key is present
        if not self.api_key:
            logger.info("No Gemini API key provided. Falling back to deterministic analytical provider.")
            return await self.fallback.chat(request, context)

        system_instruction = (
            "You are Accora AI Co-Pilot, an elite, highly intelligent, and empathetic financial "
            "intelligence assistant for small businesses, freelancers, and startups. "
            "Your job is to provide clear, actionable, context-aware answers strictly grounded in "
            "the user's actual financial records.\n\n"
            "ACTIVE FINANCIAL CONTEXT:\n"
            f"{context}\n\n"
            "INSTRUCTIONS:\n"
            "1. Answer the user query directly with business intelligence and empathy.\n"
            "2. Ground your reasoning in the actual numbers (revenue, expenses, cash balances, "
            "unpaid invoices, loans, profit margins, trends) from the context above.\n"
            "3. Support multi-turn questions: if the user asks a follow-up (e.g. 'why?', 'can I cut that?', "
            "'what about next month?'), refer back to the conversation history naturally.\n"
            "4. NEVER invent or hallucinate financial transactions not supported by the context.\n"
            "5. Respond strictly in valid JSON matching this schema:\n"
            "{\n"
            '  "answer": "Direct, conversational, and helpful answer to the user query.",\n'
            '  "evidence": ["2 to 4 bullet points citing exact figures or facts from records"],\n'
            '  "interpretation": "A 1-2 sentence explanation of why this matters for the business.",\n'
            '  "recommendation": "1-2 concrete, high-leverage action steps the user should take.",\n'
            '  "follow_ups": ["3 relevant follow-up questions the user might ask next"]\n'
            "}"
        )

        # Build alternating contents for Gemini
        gemini_contents: list[dict[str, Any]] = []
        last_role: str | None = None

        for msg in request.history:
            role = "model" if msg.role in ("model", "assistant", "ai", "accora") else "user"
            content_text = msg.content.strip()
            if not content_text:
                continue

            if gemini_contents and last_role == role:
                gemini_contents[-1]["parts"][0]["text"] += f"\n{content_text}"
            else:
                gemini_contents.append({
                    "role": role,
                    "parts": [{"text": content_text}],
                })
                last_role = role

        # Ensure first turn is user
        if gemini_contents and gemini_contents[0]["role"] != "user":
            gemini_contents = gemini_contents[1:]

        # Append current message
        current_msg = request.message.strip() or "Provide a general business financial health overview."
        if gemini_contents and last_role == "user":
            gemini_contents[-1]["parts"][0]["text"] += f"\n{current_msg}"
        else:
            gemini_contents.append({
                "role": "user",
                "parts": [{"text": current_msg}],
            })

        try:
            raw_response = await self._call_gemini(
                system_instruction=system_instruction,
                contents=gemini_contents,
                temperature=0.3,
                json_output=True,
            )

            cleaned = self._clean_json_text(raw_response)
            data = json.loads(cleaned)

            answer = str(data.get("answer", "")).strip() or "Here is what I found in your records."
            evidence = [str(e).strip() for e in data.get("evidence", []) if str(e).strip()]
            interpretation = str(data.get("interpretation", "")).strip()
            recommendation = str(data.get("recommendation", "")).strip()
            follow_ups = [str(f).strip() for f in data.get("follow_ups", []) if str(f).strip()]

            if not follow_ups:
                follow_ups = [
                    "What are my highest expenses?",
                    "How can I improve my profit margin?",
                    "What is my cash runway?",
                ]

            return ChatResponse(
                answer=answer,
                evidence=evidence,
                interpretation=interpretation,
                recommendation=recommendation,
                follow_ups=follow_ups,
            )

        except Exception as exc:
            logger.warning(f"Gemini chat processing encountered error: {exc}. Falling back to analytical engine.")
            fallback_res = await self.fallback.chat(request, context)
            # Add note indicating fallback
            return fallback_res

    # -----------------------------------------------------------------------
    # 2. AI Insights
    # -----------------------------------------------------------------------

    async def generate_insights(
        self, metrics: list[FinancialMetrics], transactions: list[Transaction]
    ) -> list[AIInsight]:
        """Proactively detect risks, anomalies, and opportunities using Gemini."""
        if not metrics or not self.api_key:
            return await self.fallback.generate_insights(metrics, transactions)

        latest = metrics[-1]
        summary_lines = [
            f"Period: {latest.period}",
            f"Revenue: {latest.revenue:,.0f} (Change: {latest.revenue_change_pct:+.1f}%)",
            f"Expenses: {latest.expenses:,.0f} (Change: {latest.expenses_change_pct:+.1f}%)",
            f"Profit: {latest.profit:,.0f} (Margin: {latest.margin * 100:.1f}%)",
            f"Cash Flow: {latest.cash_flow:,.0f}",
            f"Cash Balance: {latest.cash_balance:,.0f}",
            "Expense Breakdown:",
        ]
        for cat, amt in sorted(latest.expense_breakdown.items(), key=lambda x: -x[1])[:5]:
            summary_lines.append(f"  {cat}: {amt:,.0f}")

        system_instruction = (
            "You are Accora Financial Intelligence Engine. Analyze the following business performance data "
            "and generate 2 to 4 high-impact, actionable insights categorized as RISK, OPPORTUNITY, or TREND.\n\n"
            "Return JSON array matching:\n"
            "[\n"
            "  {\n"
            '    "type": "risk" | "opportunity" | "trend" | "positive",\n'
            '    "severity": "low" | "medium" | "high",\n'
            '    "title": "Short punchy title",\n'
            '    "explanation": "Clear explanation of what is occurring and why",\n'
            '    "evidence": ["Supporting metric 1", "Supporting metric 2"],\n'
            '    "recommendation": "Concrete action for the business owner"\n'
            "  }\n"
            "]"
        )

        contents = [{
            "role": "user",
            "parts": [{"text": "\n".join(summary_lines)}],
        }]

        try:
            raw = await self._call_gemini(
                system_instruction=system_instruction,
                contents=contents,
                temperature=0.2,
                json_output=True,
            )
            cleaned = self._clean_json_text(raw)
            parsed = json.loads(cleaned)
            if not isinstance(parsed, list):
                parsed = parsed.get("insights", [])

            insights: list[AIInsight] = []
            type_map = {
                "risk": InsightType.RISK,
                "opportunity": InsightType.OPPORTUNITY,
                "trend": InsightType.TREND,
                "positive": InsightType.POSITIVE,
            }
            sev_map = {
                "low": InsightSeverity.LOW,
                "medium": InsightSeverity.MEDIUM,
                "high": InsightSeverity.HIGH,
            }

            for item in parsed:
                t = type_map.get(str(item.get("type", "")).lower(), InsightType.TREND)
                s = sev_map.get(str(item.get("severity", "")).lower(), InsightSeverity.MEDIUM)
                insights.append(
                    AIInsight(
                        type=t,
                        severity=s,
                        title=str(item.get("title", "Financial Observation")),
                        explanation=str(item.get("explanation", "")),
                        evidence=[str(e) for e in item.get("evidence", [])],
                        recommendation=str(item.get("recommendation", "")),
                    )
                )

            if insights:
                return insights
        except Exception as exc:
            logger.warning(f"Gemini generate_insights failed: {exc}. Falling back to default.")

        return await self.fallback.generate_insights(metrics, transactions)

    # -----------------------------------------------------------------------
    # 3. Business Health Analysis
    # -----------------------------------------------------------------------

    async def analyze_health(
        self, metrics: list[FinancialMetrics], transactions: list[Transaction]
    ) -> BusinessHealthScore:
        """Compute and explain business health score."""
        base_score = compute_health_score(metrics, transactions)
        if not self.api_key:
            return await self.fallback.analyze_health(metrics, transactions)

        latest = metrics[-1] if metrics else None
        if not latest:
            return base_score

        system_instruction = (
            "You are Accora AI Co-Pilot. Write a concise, 2-sentence executive interpretation and a "
            "1-sentence recommendation for the business based on their computed health score metrics.\n"
            "Return JSON: {\"interpretation\": \"...\", \"recommendation\": \"...\"}"
        )
        prompt = (
            f"Overall Health Score: {base_score.overall:.0f}/100 ({base_score.grade})\n"
            f"Liquidity: {base_score.liquidity:.0f}, Profitability: {base_score.profitability:.0f}, "
            f"Efficiency: {base_score.efficiency:.0f}, Solvency: {base_score.solvency:.0f}\n"
            f"Latest Revenue: {latest.revenue:,.0f}, Expenses: {latest.expenses:,.0f}, Cash: {latest.cash_balance:,.0f}"
        )

        try:
            raw = await self._call_gemini(
                system_instruction=system_instruction,
                contents=[{"role": "user", "parts": [{"text": prompt}]}],
                temperature=0.3,
                json_output=True,
            )
            cleaned = self._clean_json_text(raw)
            data = json.loads(cleaned)
            interp = str(data.get("interpretation", "")).strip()
            rec = str(data.get("recommendation", "")).strip()
            if interp:
                base_score.ai_interpretation = interp
            if rec:
                base_score.ai_recommendation = rec
        except Exception as exc:
            logger.warning(f"Gemini analyze_health commentary failed: {exc}")

        return base_score

    # -----------------------------------------------------------------------
    # 4. What-If Scenario Analysis
    # -----------------------------------------------------------------------

    async def what_if_analysis(
        self, request: WhatIfRequest, metrics: list[FinancialMetrics]
    ) -> WhatIfResult:
        """Run a what-if scenario and interpret results with Gemini."""
        # Use fallback deterministic calculations for base projections
        base_result = await self.fallback.what_if_analysis(request, metrics)
        if not self.api_key or not metrics:
            return base_result

        latest = metrics[-1]
        system_instruction = (
            "You are Accora Financial Strategist. Analyze this simulated business scenario.\n"
            "Return JSON: {\"ai_interpretation\": \"2-sentence financial interpretation\", \"recommendation\": \"1-sentence action step\"}"
        )
        prompt = (
            f"Scenario: {request.description} ({request.scenario_type})\n"
            f"Current: Revenue {latest.revenue:,.0f}, Expenses {latest.expenses:,.0f}, Profit {latest.profit:,.0f}\n"
            f"Projected: Revenue {base_result.projected_revenue:,.0f}, Expenses {base_result.projected_expenses:,.0f}, "
            f"Profit {base_result.projected_profit:,.0f}, Cash Flow {base_result.projected_cash_flow:,.0f}\n"
            f"Projected Health Score: {base_result.projected_health_score:.0f}"
        )

        try:
            raw = await self._call_gemini(
                system_instruction=system_instruction,
                contents=[{"role": "user", "parts": [{"text": prompt}]}],
                temperature=0.3,
                json_output=True,
            )
            cleaned = self._clean_json_text(raw)
            data = json.loads(cleaned)
            ai_interp = str(data.get("ai_interpretation", "")).strip()
            rec = str(data.get("recommendation", "")).strip()
            if ai_interp:
                base_result.ai_interpretation = ai_interp
            if rec:
                base_result.recommendation = rec
        except Exception as exc:
            logger.warning(f"Gemini what_if_analysis commentary failed: {exc}")

        return base_result

    # -----------------------------------------------------------------------
    # 5. Business Summary
    # -----------------------------------------------------------------------

    async def generate_business_summary(
        self, metrics: list[FinancialMetrics], invoices: list[Invoice]
    ) -> BusinessSummary:
        """Generate an executive business summary with Gemini."""
        if not metrics or not self.api_key:
            return await self.fallback.generate_business_summary(metrics, invoices)

        latest = metrics[-1]
        overdue = [inv for inv in invoices if inv.status == InvoiceStatus.OVERDUE]
        overdue_total = sum(inv.total for inv in overdue)

        system_instruction = (
            "You are Accora Chief Financial Officer AI. Generate an executive business performance summary.\n"
            "Return JSON:\n"
            "{\n"
            '  "ai_summary": "Comprehensive 3-4 sentence narrative covering revenue, margin, and cash health.",\n'
            '  "highlights": ["2-3 positive achievements or strengths"],\n'
            '  "concerns": ["1-3 financial warning signs or inefficiencies"],\n'
            '  "recommendations": ["2-3 high-priority strategic steps"]\n'
            "}"
        )

        prompt = (
            f"Latest Period: {latest.period}\n"
            f"Revenue: {latest.revenue:,.0f} (Growth: {latest.revenue_change_pct:+.1f}%)\n"
            f"Expenses: {latest.expenses:,.0f} (Growth: {latest.expenses_change_pct:+.1f}%)\n"
            f"Profit Margin: {latest.margin * 100:.1f}%\n"
            f"Cash Balance: {latest.cash_balance:,.0f}\n"
            f"Overdue Invoices: {len(overdue)} totaling {overdue_total:,.0f}"
        )

        try:
            raw = await self._call_gemini(
                system_instruction=system_instruction,
                contents=[{"role": "user", "parts": [{"text": prompt}]}],
                temperature=0.3,
                json_output=True,
            )
            cleaned = self._clean_json_text(raw)
            data = json.loads(cleaned)

            period_str = f"{metrics[0].period} to {latest.period}" if len(metrics) > 1 else latest.period
            return BusinessSummary(
                period=period_str,
                ai_summary=str(data.get("ai_summary", "")).strip(),
                highlights=[str(h) for h in data.get("highlights", [])],
                concerns=[str(c) for c in data.get("concerns", [])],
                recommendations=[str(r) for r in data.get("recommendations", [])],
            )
        except Exception as exc:
            logger.warning(f"Gemini generate_business_summary failed: {exc}")

        return await self.fallback.generate_business_summary(metrics, invoices)
