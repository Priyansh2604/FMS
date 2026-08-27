import json
import logging
import time
import asyncio
from datetime import datetime, timezone, timedelta

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Aura Intelligence, an expert AI financial advisor for Indian users.

You help with:
- Investment portfolio analysis and recommendations
- Tax planning and liability estimation (Indian income tax slabs, LTCG, STT)
- Budgeting and cash flow optimization
- Stock market insights (NSE/BSE, NIFTY, SENSEX)
- Mutual fund comparisons and SIP planning
- Expense tracking and categorization insights
- Risk assessment and asset allocation
- Personal finance decisions (EMI, insurance, gold, real estate)
- Financial news implications and market sentiment
- Loans: home loan, personal loan, car loan, education loan, balance transfer, prepayment strategy
- Insurance: health, term life, motor, family floater vs individual, claim process
- Spending optimization: credit card rewards, cashback, festival deals, cost-cutting
- Savings: FD/RD, emergency fund, PPF, NPS, gold savings
- Credit score management and credit card utilization
- Rental vs buying decisions
- Big-ticket purchase planning (car, home, education, wedding)

Rules:
- Always respond in a professional, concise tone.
- Use Indian Rupees (₹) for all monetary values.
- Reference real Indian financial instruments, tax laws, and market indices when relevant.
- If you don't have enough user data, ask clarifying questions.
- Keep responses under 300 words unless detail is specifically requested.
- Format financial numbers in Indian notation (lakhs, crores) where appropriate.
- Never fabricate specific stock prices or portfolio data — say "based on your latest data" instead.
- Always include a brief disclaimer when giving investment advice."""


async def _fetch_market_indices() -> list[dict]:
    """Fetch current market indices from Yahoo Finance via Node backend."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{settings.NODE_SERVER_URL}/api/market/indices"
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.debug("Failed to fetch indices for suggestions: %s", e)
    return []


async def _fetch_trending_stocks() -> list[dict]:
    """Fetch a few trending/top-movers from the watchlist."""
    symbols = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"]
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            tasks = [
                client.get(f"{settings.NODE_SERVER_URL}/api/market/quote/{s}")
                for s in symbols
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            stocks = []
            for r in results:
                if isinstance(r, httpx.Response) and r.status_code == 200:
                    stocks.append(r.json())
            return stocks
    except Exception as e:
        logger.debug("Failed to fetch trending stocks: %s", e)
    return []


def _build_market_summary(indices: list[dict], stocks: list[dict]) -> str:
    """Build a compact market summary string for the LLM prompt."""
    lines = []
    now_ist = datetime.now(timezone(timedelta(hours=5, minutes=30)))
    lines.append(f"Current time: {now_ist.strftime('%A, %d %B %Y, %I:%M %p IST')}")

    if indices:
        lines.append("\nMarket Indices:")
        for idx in indices[:5]:
            chg = idx.get("changePercent", 0)
            direction = "up" if chg >= 0 else "down"
            lines.append(f"  {idx['name']}: {idx.get('price', 'N/A')} ({direction} {abs(chg):.2f}%)")

    if stocks:
        gainers = [s for s in stocks if s.get("changePercent", 0) > 0]
        losers = [s for s in stocks if s.get("changePercent", 0) < 0]
        if gainers:
            lines.append("\nTop gainers today:")
            for s in sorted(gainers, key=lambda x: x.get("changePercent", 0), reverse=True)[:3]:
                lines.append(f"  {s.get('symbol','')}: +{s['changePercent']:.2f}%")
        if losers:
            lines.append("\nTop losers today:")
            for s in sorted(losers, key=lambda x: x.get("changePercent", 0))[:3]:
                lines.append(f"  {s.get('symbol','')}: {s['changePercent']:.2f}%")

    # Market hours context
    hour = now_ist.hour
    minute = now_ist.minute
    weekday = now_ist.weekday()
    if weekday >= 5:
        lines.append("\nNote: Markets are closed (weekend).")
    elif 9 <= hour < 15 or (hour == 15 and minute <= 30):
        lines.append("\nNote: Markets are currently open (NSE/BSE trading hours).")
    elif hour < 9:
        lines.append("\nNote: Pre-market session. Markets open at 9:15 AM IST.")
    else:
        lines.append("\nNote: Markets closed for the day.")

    return "\n".join(lines)


async def generate_suggestions(user_id: str | None = None) -> list[str]:
    """Generate 6 dynamic, context-aware suggestion prompts using live market data + LLM."""
    # Fetch live data in parallel
    indices_task = _fetch_market_indices()
    stocks_task = _fetch_trending_stocks()
    indices, stocks = await asyncio.gather(indices_task, stocks_task)

    market_summary = _build_market_summary(indices, stocks)

    now_ist = datetime.now(timezone(timedelta(hours=5, minutes=30)))
    month = now_ist.month

    # Tax-season awareness
    tax_context = ""
    if month in (3, 4):
        tax_context = "It's end of financial year / start of new FY — tax planning is very relevant."
    elif month in (6, 7):
        tax_context = "First advance tax installment is due July 15 — remind about advance tax."
    elif month in (9, 10):
        tax_context = "Second advance tax installment is due September 15."
    elif month in (12, 1):
        tax_context = "Year-end tax saving and new year financial planning are top of mind."

    prompt = f"""Based on the following live Indian market data and the current date, generate exactly 6 short, actionable financial question prompts (each under 14 words) that an Indian user would find most useful RIGHT NOW.

{market_summary}
{tax_context}

Topic mix requirements (cover ALL these areas across the 6 prompts):
1. Market/stocks — based on today's index movement (buying opportunity, profit booking, risk)
2. Spending/budgeting — smart spending tips, expense tracking, cost-cutting, festival/seasonal spending
3. Loans & EMI — home loan vs rent, prepaying loans, balance transfer, personal loan alternatives, car loan tips
4. Insurance — health insurance, term life, when to upgrade, family floater vs individual
5. Tax planning — savings under 80C, NPS, ELSS, advance tax, new vs old regime
6. Saving/investing basics — SIP, RD/FD, gold, emergency fund, credit card rewards optimization

Rules for the prompts:
- Make them specific and timely — reference actual market conditions shown above when relevant
- If market is down, include a prompt about buying opportunities or risk management
- If market is up, include a prompt about booking profits or portfolio review
- Include seasonal context (festivals, year-end, tax deadlines, monsoon spending, etc.)
- Use natural conversational language an Indian user would type
- All monetary values in ₹ (Indian Rupees)

Return ONLY a JSON array of exactly 6 strings. No explanation. Example format:
["prompt 1", "prompt 2", "prompt 3", "prompt 4", "prompt 5", "prompt 6"]"""

    # Call LLM to generate suggestions
    provider = settings.LLM_PROVIDER.lower()
    if provider == "openrouter":
        url = "https://openrouter.ai/api/v1/chat/completions"
        api_key = settings.OPENROUTER_API_KEY
        model = settings.OPENROUTER_MODEL
    elif provider == "tokenrouter":
        url = "https://tokenrouter.ai/api/v1/chat/completions"
        api_key = settings.TOKENROUTER_API_KEY
        model = settings.TOKENROUTER_MODEL
    else:
        # Fallback static suggestions
        return [
            "What's the market outlook today?",
            "Should I prepay my home loan?",
            "How to build an emergency fund?",
            "Health vs term insurance — which first?",
            "Best SIP for ₹5,000 monthly?",
            "How to cut monthly expenses?",
        ]

    if not api_key:
        return [
            "What's the market outlook today?",
            "Should I prepay my home loan?",
            "How to build an emergency fund?",
            "Health vs term insurance — which first?",
            "Best SIP for ₹5,000 monthly?",
            "How to cut monthly expenses?",
        ]

    messages = [{"role": "user", "content": prompt}]
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.8,
        "max_tokens": 256,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"].strip()
            # Parse JSON array from LLM response
            # Handle cases where LLM wraps in markdown code block
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            suggestions = json.loads(content)
            if isinstance(suggestions, list) and len(suggestions) >= 4:
                return [str(s) for s in suggestions[:6]]
    except Exception as e:
        logger.warning("Failed to generate dynamic suggestions: %s", e)

    # Fallback
    return [
        "What's the market outlook today?",
        "Should I prepay my home loan?",
        "How to build an emergency fund?",
        "Health vs term insurance — which first?",
        "Best SIP for ₹5,000 monthly?",
        "How to cut monthly expenses?",
    ]


async def chat_completion(messages: list[dict], user_id: str | None = None) -> str:
    provider = settings.LLM_PROVIDER.lower()

    if provider == "openrouter":
        url = "https://openrouter.ai/api/v1/chat/completions"
        api_key = settings.OPENROUTER_API_KEY
        model = settings.OPENROUTER_MODEL
    elif provider == "tokenrouter":
        url = "https://tokenrouter.ai/api/v1/chat/completions"
        api_key = settings.TOKENROUTER_API_KEY
        model = settings.TOKENROUTER_MODEL
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")

    if not api_key:
        raise ValueError(f"{provider.upper()}_API_KEY is not configured")

    system_msg = {"role": "system", "content": SYSTEM_PROMPT}
    all_messages = [system_msg] + messages

    payload = {
        "model": model,
        "messages": all_messages,
        "temperature": 0.7,
        "max_tokens": 1024,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    logger.info("Chat request: provider=%s model=%s msgs=%d", provider, model, len(messages))
    start = time.time()

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()

    elapsed_ms = int((time.time() - start) * 1000)
    data = resp.json()
    content = data["choices"][0]["message"]["content"].strip()
    logger.info("Chat response received in %dms (%d chars)", elapsed_ms, len(content))

    return content
