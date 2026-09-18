# backend/services/telegram_service.py
import os
import httpx
from typing import Dict, Any

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
BASE_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

async def send_alert(ubigeo: str, report: Dict[str, Any]) -> None:
    """
    Envía el mensaje bilingüe a los canales definidos en el catálogo.
    Si el token no está definido, solo escribe en log.
    """
    message = f"{report.get('spanish_message')}\n\n{report.get('native_message')}"
    chat_id = os.getenv("TELEGRAM_CHANNEL_ID", "-1001234567890")  # fallback

    if not TELEGRAM_TOKEN:
        print("[Telegram mock] ", message)
        return

    async with httpx.AsyncClient() as client:
        await client.post(
            f"{BASE_URL}/sendMessage",
            json={"chat_id": chat_id, "text": message, "parse_mode": "HTML"},
            timeout=10,
        )
