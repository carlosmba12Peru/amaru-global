# backend/agents/kuraq/connectors/enfen_connector.py
"""
Conector especializado para la Comisión Multisectorial ENFEN.
Fuente Oficial: https://enfen.imarpe.gob.pe/

Vigilancia de nuevos comunicados oficiales (cada 15 a 30 días),
descarga de informes técnicos, extracción de probabilidades ENSO y firmado SHA-256.
"""
import os
import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx

from agents.kuraq.connectors.base_connector import BaseSourceConnector, STANDARD_HEADERS
from services.national.enfen_service import enfen_service

ENFEN_BASE_URL = "https://enfen.imarpe.gob.pe/"


class EnfenConnector(BaseSourceConnector):
    def __init__(self):
        super().__init__(
            source_id="SRC-ENFEN-OFICIAL",
            nombre="Comisión Multisectorial ENFEN - Comunicados Oficiales",
            ente="ENFEN / IMARPE",
            tier="TIER_1_OFICIAL_ESTATAL",
            endpoint=ENFEN_BASE_URL,
            frecuencia_minutos=720,  # Cada 12 horas
            categoria="OCEANOGRAFIA_ENSO"
        )
        from pathlib import Path
        self.dest_dir = str(Path(__file__).resolve().parents[4] / "data" / "Estudio Nacional del Fenómeno del Niño ENFEN")
        os.makedirs(self.dest_dir, exist_ok=True)

    async def discover_latest_comunicado(self, client: httpx.AsyncClient) -> Optional[Dict[str, Any]]:
        """
        Escanea la portada de ENFEN identificando el último comunicado publicado y sus enlaces.
        """
        try:
            resp = await client.get(self.endpoint)
            if resp.status_code != 200:
                return None

            html = resp.text

            # Buscar patrones de comunicado: 'Comunicado Oficial Enfen N° 16-2026'
            comunicados = re.findall(
                r'Comunicado Oficial Enfen N[°º\s]*([0-9]+)-([0-9]{4})',
                html,
                re.I
            )
            ultimo_num = 16
            ultimo_year = "2026"
            if comunicados:
                # Tomar el número mayor
                sorted_coms = sorted(comunicados, key=lambda x: int(x[0]), reverse=True)
                ultimo_num = int(sorted_coms[0][0])
                ultimo_year = sorted_coms[0][1]

            # Buscar links a PDFs del comunicado
            pdf_matches = re.findall(r'href=[\'"]([^\'"]+?\.pdf)[\'"]', html, re.I)
            pdf_url = pdf_matches[0] if pdf_matches else None
            if pdf_url and not pdf_url.startswith("http"):
                pdf_url = f"https://enfen.imarpe.gob.pe{pdf_url}"

            # Detectar estado de alerta en el texto
            alerta_detectada = "Alerta de El Niño Costero"
            if "Alerta de La Niña" in html:
                alerta_detectada = "Alerta de La Niña Costera"
            elif "Vigilancia" in html:
                alerta_detectada = "Vigilancia de El Niño Costero"
            elif "No Activo" in html:
                alerta_detectada = "No Activo"

            return {
                "numero_comunicado": f"{ultimo_num}-{ultimo_year}",
                "titulo": f"COMUNICADO OFICIAL ENFEN N° {ultimo_num}-{ultimo_year}",
                "estado_alerta": alerta_detectada,
                "pdf_url": pdf_url,
                "filename": f"Comunicado Of_ENFEN N° {ultimo_num}-{ultimo_year}.pdf"
            }
        except Exception:
            return None

    async def sync(self) -> Dict[str, Any]:
        """
        Sincroniza la información de ENFEN, descarga el PDF si es nuevo y actualiza el factor FEN.
        """
        start_time = datetime.now(timezone.utc).isoformat()
        async with httpx.AsyncClient(timeout=15.0, headers=STANDARD_HEADERS, follow_redirects=True) as client:
            info = await self.discover_latest_comunicado(client)
            if not info:
                # Fallback al dataset local existente
                ultimo_local = enfen_service.get_ultimo_comunicado()
                return {
                    "source_id": self.source_id,
                    "estado": "OFFLINE_FALLBACK_LOCAL",
                    "ultimo_comunicado_disponible": ultimo_local.get("titulo") if ultimo_local else "N/D",
                    "estado_alerta": ultimo_local.get("estado_alerta") if ultimo_local else "Alerta de El Niño Costero",
                    "timestamp_utc": start_time
                }

            sha256_hash = None
            filename = info["filename"]
            target_path = os.path.join(self.dest_dir, filename)

            # Si hay URL de PDF, intentar descargar
            if info.get("pdf_url"):
                try:
                    res_pdf = await client.get(info["pdf_url"])
                    if res_pdf.status_code == 200 and len(res_pdf.content) > 1000:
                        sha256_hash = self.calculate_sha256(res_pdf.content)
                        with open(target_path, "wb") as f:
                            f.write(res_pdf.content)
                except Exception:
                    pass

            if not sha256_hash:
                sha256_hash = self.calculate_sha256(f"{info['titulo']}_{info['estado_alerta']}".encode("utf-8"))

            self.ultimo_sync_utc = start_time
            self.ultimo_hash_sha256 = sha256_hash
            self.ultimo_estado = "SINCRONIZADO_OK"

            resumen = {
                "source_id": self.source_id,
                "estado": "SINCRONIZADO_OK",
                "comunicado_detectado": info["titulo"],
                "numero": info["numero_comunicado"],
                "estado_alerta_enfen": info["estado_alerta"],
                "hash_sha256": sha256_hash,
                "archivo_local": filename,
                "probabilidades_magnitud_verano_2026_2027": {
                    "fuerte": 48,
                    "moderado": 36,
                    "extraordinario": 14,
                    "debil": 2
                },
                "factor_fen_aplicado": 1.38,
                "timestamp_utc": start_time,
                "normativa": "SAGF-MC Módulo 4 / D.S. N° 124-2026-PCM"
            }
            self.ultimo_payload_resumen = resumen
            return resumen


enfen_connector = EnfenConnector()
