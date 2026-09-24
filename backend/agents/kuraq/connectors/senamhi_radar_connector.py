# backend/agents/kuraq/connectors/senamhi_radar_connector.py
"""
Conector para los Radares Meteorológicos Banda C del SENAMHI (Piura e Ica).
Fuente Oficial: https://www.senamhi.gob.pe/main.php?p=satelites-radares
"""
from datetime import datetime, timezone
from typing import Dict, Any
from agents.kuraq.connectors.base_connector import BaseSourceConnector
from services.national.senamhi_radar_service import senamhi_radar_service


class SenamhiRadarConnector(BaseSourceConnector):
    def __init__(self, localidad: str = "PIU"):
        nombre = f"SENAMHI - Radar Doppler Banda C ({'Piura - FEN Norte' if localidad == 'PIU' else 'Ica - Costa Sur'})"
        super().__init__(
            source_id=f"SRC-SENAMHI-RADAR-{localidad}",
            nombre=nombre,
            ente="SENAMHI",
            tier="TIER_1_OFICIAL_ESTATAL",
            endpoint="https://www.senamhi.gob.pe/main.php?p=satelites-radares",
            frecuencia_minutos=10,
            categoria="METEOROLOGIA_RADAR_NOWCASTING"
        )
        self.localidad = localidad

    async def sync(self) -> Dict[str, Any]:
        start_time = datetime.now(timezone.utc).isoformat()
        try:
            data = await senamhi_radar_service.get_radar_scans(
                localidad=self.localidad,
                producto="HRef_QC",
                nivel="E00p5",
                bypass_cache=True
            )
            raw_summary = f"{self.localidad}_{data.get('total_frames')}_{data.get('ultimo_escaneo')}"
            sha256_hash = self.calculate_sha256(raw_summary.encode("utf-8"))

            self.ultimo_sync_utc = start_time
            self.ultimo_hash_sha256 = sha256_hash
            self.ultimo_estado = "SINCRONIZADO_OK"

            resumen = {
                "source_id": self.source_id,
                "localidad": self.localidad,
                "estado": "SINCRONIZADO_OK",
                "total_frames_activos": data.get("total_frames", 0),
                "ultimo_escaneo_radar": data.get("ultimo_escaneo"),
                "hash_sha256": sha256_hash,
                "nowcasting_cobertura_km": 250,
                "timestamp_utc": start_time
            }
            self.ultimo_payload_resumen = resumen
            return resumen
        except Exception as e:
            self.ultimo_estado = "ERROR_SINCRONIZACION"
            return {
                "source_id": self.source_id,
                "estado": "ERROR_SINCRONIZACION",
                "error": str(e),
                "timestamp_utc": start_time
            }


senamhi_radar_piura_connector = SenamhiRadarConnector("PIU")
senamhi_radar_ica_connector = SenamhiRadarConnector("ICA")
