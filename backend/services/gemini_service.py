# backend/services/gemini_service.py
import os
import json
from typing import Dict, Any
import google.generativeai as genai

# Configuración del SDK
api_key = os.getenv("GOOGLE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

async def generate_report(ubigeo: str) -> Dict[str, Any]:
    """
    Genera diagnóstico técnico y mensaje bilingüe (español + quechua/aymara)
    a partir del ubigeo. Si el SDK no está configurado, devuelve un mock.
    """
    prompt = f"""
    {{
        "ubigeo": "{ubigeo}",
        "request": "diagnóstico técnico y mensaje en español y lengua originaria"
    }}
    """
    try:
        response = model.generate_content(prompt)
        # Asumimos que Gemini devuelve JSON bien formado
        return json.loads(response.text)
    except Exception:
        # Mock de respuesta estructurada
        return {
            "technical_report": "Reporte técnico de ejemplo para " + ubigeo,
            "spanish_message": "Alerta: riesgo de inundación. Tome medidas de evacuación.",
            "native_message": "Alertakuna: ñawpaq llank’aykuna tukuykunallapam.",
            "action": "Activar brigada de rescate local"
        }
