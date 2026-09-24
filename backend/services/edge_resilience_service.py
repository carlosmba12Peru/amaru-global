import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List

class EdgeResilienceService:
    """
    Manejador de Resiliencia Off-Grid y Sincronización en Desastres:
    Permite el almacenamiento local de fichas de emergencia y reportes
    cuando la red de internet o satélite se corta en el distrito.
    """

    def __init__(self):
        self.buffer_path = Path(__file__).parent.parent / "data" / "buffer_offline_eventos.json"
        self._inicializar_buffer()

    def _inicializar_buffer(self):
        if not self.buffer_path.exists():
            with open(self.buffer_path, "w", encoding="utf-8") as f:
                json.dump([], f)

    def guardar_evento_offline(self, tipo_evento: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        evento = {
            "id_evento_local": f"EVT-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}",
            "tipo": tipo_evento,
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "payload": payload,
            "estado_sincronizacion": "PENDIENTE_SYNC"
        }

        with open(self.buffer_path, "r", encoding="utf-8") as f:
            try:
                eventos = json.load(f)
            except Exception:
                eventos = []

        eventos.append(evento)

        with open(self.buffer_path, "w", encoding="utf-8") as f:
            json.dump(eventos, f, indent=2, ensure_ascii=False)

        return {
            "estado": "GUARDADO_EN_BUFFER_OFFLINE",
            "id_evento_local": evento["id_evento_local"],
            "total_eventos_pendientes": len(eventos)
        }

    def listar_eventos_pendientes(self) -> List[Dict[str, Any]]:
        with open(self.buffer_path, "r", encoding="utf-8") as f:
            try:
                eventos = json.load(f)
            except Exception:
                eventos = []
        return eventos

    def vaciar_y_sincronizar_buffer(self) -> Dict[str, Any]:
        eventos = self.listar_eventos_pendientes()
        total = len(eventos)

        # Simula el vaciado tras envío exitoso a servidor central
        with open(self.buffer_path, "w", encoding="utf-8") as f:
            json.dump([], f)

        return {
            "estado": "SINCRONIZACION_COMPLETA",
            "eventos_procesados": total,
            "timestamp_sync": datetime.now(timezone.utc).isoformat()
        }


edge_resilience_service = EdgeResilienceService()
