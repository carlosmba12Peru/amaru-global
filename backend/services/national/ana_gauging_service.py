import json
from pathlib import Path
from typing import Dict, Any, List, Optional

class AnaGaugingService:
    """
    Servicio de la Red Nacional de Estaciones Hidrológicas de Aforo Oficial (ANA / SENAMHI):
    Monitoreo de caudales instantáneos en metros cúbicos por segundo (m³/s) y evaluación
    de umbrales oficiales de alerta hidrológica (Amarillo, Naranja y Rojo Desborde).
    """

    def __init__(self):
        self.data_path = Path(__file__).parent.parent.parent / "data" / "estaciones_hidrologicas_aforo.json"
        self._cargar_estaciones()

    def _cargar_estaciones(self):
        if self.data_path.exists():
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.metadata = data.get("metadata", {})
                self.estaciones = data.get("estaciones_aforo_criticas", [])
        else:
            self.metadata = {}
            self.estaciones = []

    def listar_estaciones(self) -> List[Dict[str, Any]]:
        return self.estaciones

    def obtener_estacion(self, id_estacion: str) -> Optional[Dict[str, Any]]:
        return next((e for e in self.estaciones if e.get("id_estacion", "").lower() == id_estacion.lower()), None)

    def evaluar_estacion(
        self,
        id_estacion: str,
        caudal_observado_m3s: Optional[float] = None
    ) -> Dict[str, Any]:
        estacion = next((e for e in self.estaciones if e["id_estacion"].lower() == id_estacion.lower()), None)
        if not estacion:
            return {
                "estado": "NO_ENCONTRADA",
                "mensaje": f"Estación '{id_estacion}' no localizada en la red ANA."
            }

        caudal = caudal_observado_m3s if caudal_observado_m3s is not None else float(estacion.get("caudal_simulado_actual_m3s", 100.0))
        u_amarillo = float(estacion.get("umbral_amarillo_m3s", 500.0))
        u_naranja = float(estacion.get("umbral_naranja_m3s", 1000.0))
        u_rojo = float(estacion.get("umbral_rojo_desborde_m3s", 1500.0))

        if caudal >= u_rojo:
            nivel = "ROJO_DESBORDE"
            color = "#ef4444"
            accion = f"ALERTA ROJA POR DESBORDE INMINENTE: Caudal de {caudal:.1f} m³/s supera el umbral crítico ({u_rojo:.1f} m³/s). Evacuar fajas marginales."
        elif caudal >= u_naranja:
            nivel = "NARANJA_ALTO"
            color = "#f97316"
            accion = f"ALERTA NARANJA: Caudal de {caudal:.1f} m³/s en ascenso crítico hacia umbral de desborde ({u_rojo:.1f} m³/s). Alerta a defensas ribereñas."
        elif caudal >= u_amarillo:
            nivel = "AMARILLO_MEDIO"
            color = "#eab308"
            accion = f"VIGILANCIA AMARILLA: Caudal de {caudal:.1f} m³/s supera el nivel normal. Vigilancia continua de obras de encauzamiento."
        else:
            nivel = "VERDE_NORMAL"
            color = "#22c55e"
            accion = f"NIVEL NORMAL: Caudal de {caudal:.1f} m³/s dentro de los parámetros estacionales seguros."

        ratio_desborde_pct = round((caudal / u_rojo) * 100.0, 1)

        return {
            "id_estacion": estacion["id_estacion"],
            "nombre": estacion["nombre"],
            "rio": estacion["rio"],
            "cuenca": estacion["cuenca"],
            "departamento": estacion["departamento"],
            "provincia": estacion["provincia"],
            "distrito": estacion["distrito"],
            "latitud": estacion["latitud"],
            "longitud": estacion["longitud"],
            "caudal_evaluado_m3s": caudal,
            "umbral_amarillo_m3s": u_amarillo,
            "umbral_naranja_m3s": u_naranja,
            "umbral_rojo_desborde_m3s": u_rojo,
            "record_historico_1998_m3s": estacion.get("record_historico_1998_m3s"),
            "ratio_capacidad_desborde_pct": ratio_desborde_pct,
            "nivel_alerta": nivel,
            "color_hex": color,
            "accion_recomendada": accion,
            "impacto_urbano": estacion.get("impacto_urbano")
        }


ana_gauging_service = AnaGaugingService()
