# Accora Core

**Your Business, With Intelligence.**

Accora Core is an AI-powered financial intelligence platform that transforms raw business data into understanding, predictions, alerts, and recommendations — helping small business owners, freelancers, and solo entrepreneurs make smarter decisions without a financial analyst.

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Frontend  | React 19, Vite 6, TypeScript, Tailwind CSS 4 |
| Backend   | Python 3.13, FastAPI, Pydantic v2   |
| Charts    | Recharts                            |
| Icons     | Lucide React                        |
| AI        | Mock provider (Alibaba Cloud ready)  |

## Project Structure

```
accora-core/
├── frontend/                 # React + Vite + TypeScript
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route-level page components
│       ├── layouts/          # Layout shells (sidebar, nav)
│       ├── services/         # API client
│       ├── hooks/            # Custom React hooks
│       └── types/            # TypeScript type definitions
│
├── backend/                  # Python FastAPI
│   └── app/
│       ├── api/              # Route definitions
│       ├── models/           # Pydantic data models
│       ├── schemas/          # Request/response schemas
│       ├── services/         # Business logic services
│       ├── ai/               # AI provider abstraction
│       ├── analytics/        # Financial analytics engine
│       ├── forecasting/      # Forecasting module
│       ├── core/             # Config, settings
│       └── data/             # Demo data generator
│
├── .env.example              # Environment variable template
└── README.md
```

## Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 20+** (LTS recommended)

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Copy environment config
cp ../.env.example ../.env

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.
API documentation at **http://localhost:8000/docs**.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**.

The Vite dev server proxies `/api` requests to the backend at `localhost:8000`.

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                | Default          | Description                                  |
| ----------------------- | ---------------- | -------------------------------------------- |
| `ACCORA_DEBUG`          | `true`           | Enable debug mode                            |
| `ACCORA_DEMO_MODE`      | `true`           | Use demo data                                |
| `ACCORA_AI_PROVIDER`    | `gemini`         | `gemini` (Google AI) or `mock` (offline)     |
| `ACCORA_GEMINI_API_KEY` | —                | Google Gemini API key (Free tier supported)  |
| `ACCORA_GEMINI_MODEL`   | `gemini-1.5-flash` | Gemini model (`gemini-1.5-flash`, `gemini-2.5-flash`, etc.) |

### Google Gemini AI Integration

Accora AI Co-Pilot uses Google Gemini to provide conversational intelligence, context-aware reasoning, multi-turn follow-ups, and proactive financial insights.

1. Obtain a free API key at **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2. In your `.env` file, set:
   ```bash
   ACCORA_AI_PROVIDER=gemini
   ACCORA_GEMINI_API_KEY=your_gemini_api_key_here
   ACCORA_GEMINI_MODEL=gemini-1.5-flash
   ```
3. Test your connection:
   ```bash
   python test_gemini_connection.py
   ```

## Current Status (Phase 1)

### Functional

- Landing page with premium design
- Application shell with sidebar navigation
- Financial dashboard with KPI cards and charts
- Business Health Score with visual breakdown
- AI Insights (mock provider with realistic responses)
- 12 months of realistic demo data
- Full API with CORS, health, metrics, AI endpoints

### Architecture Ready For

- AI Copilot chat (Phase 4)
- Forecasting (Phase 6)
- What-If Scenario Simulator (Phase 7)
- Reports (Phase 8)
- Transaction management UI (Phase 3+)
- Alibaba Cloud AI integration

## License

Private — Hackathon MVP
