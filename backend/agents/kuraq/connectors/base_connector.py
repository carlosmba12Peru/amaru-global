# backend/agents/kuraq/connectors/base_connector.py
"""
Clase base abstracta para los conectores de ingesta del Agente KURAQ.
Provee cabeceras estándar para evitar bloqueos WAF, medición de latencia,
firmado criptográfico SHA-256 (NTP-ISO/IEC 27037:2012) y manejo de salud.
"""
import time
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx

STANDARD_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 AMARU-CLIMATE/1.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "es-PE,es;q=0.9,en;q=0.8"
}


class BaseSourceConnector:
    def __init__(
        self,
        source_id: str,
        nombre: str,
        ente: str,
        tier: str,
        endpoint: str,
        frecuencia_minutos: int,
        categoria: str
    ):
        self.source_id = source_id
        self.nombre = nombre
        self.ente = ente
        self.tier = tier
        self.endpoint = endpoint
        self.frecuencia_minutos = frecuencia_minutos
        self.categoria = categoria

        # Estado en memoria
        self.ultimo_estado: str = "NO_INICIALIZADO"
        self.ultima_latencia_ms: float = 0.0
        self.ultimo_chequeo_utc: Optional[str] = None
        self.ultimo_sync_utc: Optional[str] = None
        self.ultimo_hash_sha256: Optional[str] = None
        self.ultimo_payload_resumen: Dict[str, Any] = {}

    def calculate_sha256(self, data: bytes) -> str:
        """Calcula el hash inmutable SHA-256 de los datos descargados."""
        return hashlib.sha256(data).hexdigest()

    async def check_health(self, timeout: float = 6.0) -> Dict[str, Any]:
        """
        Realiza un sondeo de disponibilidad (HEAD o GET ligero) y mide la latencia.
        """
        start = time.perf_counter()
        now_iso = datetime.now(timezone.utc).isoformat()
        self.ultimo_chequeo_utc = now_iso

        try:
            async with httpx.AsyncClient(timeout=timeout, headers=STANDARD_HEADERS, follow_redirects=True) as client:
                try:
                    resp = await client.head(self.endpoint)
                    if resp.status_code in [403, 405]:
                        resp = await client.get(self.endpoint)
                except Exception:
                    resp = await client.get(self.endpoint)

                lat = round((time.perf_counter() - start) * 1000, 1)
                self.ultima_latencia_ms = lat

                if resp.status_code == 200:
                    self.ultimo_estado = "OPERATIVO_EN_LINEA"
                elif resp.status_code in [301, 302, 307, 308]:
                    self.ultimo_estado = "OPERATIVO_REDIRECCION"
                elif resp.status_code in [403, 429]:
                    self.ultimo_estado = "DEGRADADO_WAF_LIMIT"
                else:
                    self.ultimo_estado = f"DEGRADADO_HTTP_{resp.status_code}"

                return {
                    "source_id": self.source_id,
                    "nombre": self.nombre,
                    "ente": self.ente,
                    "tier": self.tier,
                    "endpoint": self.endpoint,
                    "estado": self.ultimo_estado,
                    "http_status": resp.status_code,
                    "latencia_ms": lat,
                    "timestamp_utc": now_iso
                }
        except httpx.TimeoutException:
            lat = round((time.perf_counter() - start) * 1000, 1)
            self.ultimo_estado = "TIMEOUT_LATENCIA_ALTA"
            self.ultima_latencia_ms = lat
            return {
                "source_id": self.source_id,
                "nombre": self.nombre,
                "ente": self.ente,
                "tier": self.tier,
                "endpoint": self.endpoint,
                "estado": self.ultimo_estado,
                "http_status": 0,
                "latencia_ms": lat,
                "timestamp_utc": now_iso
            }
        except Exception as e:
            lat = round((time.perf_counter() - start) * 1000, 1)
            self.ultimo_estado = "CAIDO_OFFLINE"
            self.ultima_latencia_ms = lat
            return {
                "source_id": self.source_id,
                "nombre": self.nombre,
                "ente": self.ente,
                "tier": self.tier,
                "endpoint": self.endpoint,
                "estado": self.ultimo_estado,
                "http_status": 0,
                "latencia_ms": lat,
                "error": str(e),
                "timestamp_utc": now_iso
            }

    async def sync(self) -> Dict[str, Any]:
        """
        Método de sincronización de datos que cada conector especializado debe implementar.
        """
        raise NotImplementedError("Cada conector debe implementar su propio método sync()")
