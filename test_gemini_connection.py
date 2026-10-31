"""Script to verify your Google Gemini API key connection with Accora AI Co-Pilot."""

import asyncio
import os
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Add backend directory to sys.path so app imports work
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv

# Load root .env and backend/.env
load_dotenv()
load_dotenv(backend_dir / ".env")

api_key = (
    os.environ.get("ACCORA_GEMINI_API_KEY")
    or os.environ.get("GEMINI_API_KEY")
    or ""
).strip()

if not api_key:
    print("[!] No Gemini API key found in .env or environment.")
    print("    Please add your key to .env:")
    print("    ACCORA_GEMINI_API_KEY=your_actual_api_key_here\n")
    print("    Get a free key from Google AI Studio: https://aistudio.google.com/app/apikey")
    sys.exit(1)

masked_key = f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else "***"
print(f"[*] Found Gemini API Key: {masked_key}")

from app.ai.gemini import GeminiAIProvider
from app.models.financial import ChatRequest, ChatMessage


async def test_connection():
    provider = GeminiAIProvider(api_key=api_key)
    print("[*] Sending test financial inquiry to Google Gemini API...")

    req = ChatRequest(
        message="Can I afford to hire a part-time accountant for PKR 40,000 per month?",
        history=[
            ChatMessage(role="user", content="Salam! I run a retail shop in Lahore."),
            ChatMessage(role="model", content="Salam! I am ready to review your financial numbers. How can I help?"),
        ],
    )
    context = (
        "Business: Lahore Retail Store (Retail)\n"
        "Currency: PKR\n"
        "Opening Cash Balance: PKR 850,000\n"
        "Monthly Revenue: PKR 420,000\n"
        "Monthly Expenses: PKR 260,000\n"
        "Current Cash Balance: PKR 910,000\n"
        "Monthly Profit: PKR 160,000 (Margin 38%)\n"
        "Unpaid Invoices: None\n"
        "Loan Balance: PKR 0"
    )

    try:
        res = await provider.chat(req, context)
        print("\n" + "=" * 60)
        print("[SUCCESS] Google Gemini is connected and functional!")
        print("=" * 60)
        print(f"\n[Answer]:\n{res.answer}\n")

        if res.evidence:
            print("[Evidence / What I Found]:")
            for e in res.evidence:
                print(f"   * {e}")

        if res.interpretation:
            print(f"\n[Why It Matters]:\n   {res.interpretation}")

        if res.recommendation:
            print(f"\n[Recommendation]:\n   {res.recommendation}")

        if res.follow_ups:
            print("\n[Suggested Follow-ups]:")
            for f in res.follow_ups:
                print(f"   ? {f}")
        print("\n" + "=" * 60)

    except Exception as exc:
        print(f"\n[ERROR] Failed connecting to Gemini API: {exc}")
        print("   Please check that your API key is valid and has active quotas at https://aistudio.google.com")


if __name__ == "__main__":
    asyncio.run(test_connection())
