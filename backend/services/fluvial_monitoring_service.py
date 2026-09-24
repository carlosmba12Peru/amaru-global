"""
Servicio C2 de Monitoreo Fluvial y Alerta Temprana de Desbordes del Norte (SAT-FLUV-NORTE)
AMARU-CLIMATE Lab4 — Comando y Control Hidrológico de Grandes Cuencas
"""

import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Any

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "cuencas_rios_norte_aforo.json"

class FluvialMonitoringService:
    def __init__(self):
        self._datos = self._cargar_datos()

    def _cargar_datos(self) -> Dict[str, Any]:
        if not DATA_PATH.exists():
            return {"cuencas_fluviales_norte": [], "represas_principales": []}
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[Error FluvialMonitoringService] No se pudo cargar catálogo hidrológico: {e}")
            return {"cuencas_fluviales_norte": [], "represas_principales": []}

    def listar_cuencas(self) -> List[Dict[str, Any]]:
        """Retorna las 8 cuencas aluviales del norte con sus estaciones."""
        return self._datos.get("cuencas_fluviales_norte", [])

    def listar_represas(self) -> List[Dict[str, Any]]:
        """Retorna el estado de llenado y descarga de las principales represas reguladoras."""
        return self._datos.get("represas_principales", [])

    def obtener_estacion(self, id_estacion: str) -> Optional[Dict[str, Any]]:
        """Busca una estación de aforo por su ID canónico en todas las cuencas."""
        for c in self._datos.get("cuencas_fluviales_norte", []):
            for e in c.get("estaciones_aforo", []):
                if e.get("id_estacion", "").lower() == id_estacion.lower():
                    # Agregar contexto de la cuenca
                    res = dict(e)
                    res["id_cuenca"] = c.get("id_cuenca")
                    res["nombre_cuenca"] = c.get("nombre")
                    res["departamento"] = c.get("departamento")
                    res["ciudades_vulnerables"] = c.get("ciudades_vulnerables")
                    return res
        return None

    def evaluar_estacion(
        self,
        id_estacion: str,
        caudal_evaluado_m3s: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Evalúa en tiempo real o simulado si el caudal de un río supera los umbrales
        oficiales de la ANA/SENAMHI y calcula el tiempo de tránsito de la onda hacia las ciudades.
        """
        estacion = self.obtener_estacion(id_estacion)
        if not estacion:
            return {"error": f"Estación '{id_estacion}' no localizada en la red fluvial del norte."}

        caudal = caudal_evaluado_m3s if caudal_evaluado_m3s is not None else float(estacion.get("caudal_actual_m3s", 100.0))
        u_amarillo = float(estacion.get("umbral_amarillo_m3s", 500.0))
        u_naranja = float(estacion.get("umbral_naranja_m3s", 1000.0))
        u_rojo = float(estacion.get("umbral_rojo_desborde_m3s", 1500.0))
        record_1998 = float(estacion.get("record_historico_1998_m3s", u_rojo * 1.5))

        ratio_capacidad_pct = round((caudal / u_rojo) * 100.0, 1)

        if caudal >= u_rojo:
            nivel = "ROJO_DESBORDE"
            color = "#ef4444"
            accion = (
                f"🚨 ALERTA ROJA: Caudal de {caudal:.1f} m³/s supera el umbral crítico de desborde ({u_rojo:.1f} m³/s). "
                f"EVACUACIÓN TÁCTICA INMEDIATA de fajas marginales en {', '.join(estacion.get('ciudades_vulnerables', [])[:3])}."
            )
        elif caudal >= u_naranja:
            nivel = "NARANJA_ALTO"
            color = "#f97316"
            accion = (
                f"⚠️ ALERTA NARANJA: Caudal de {caudal:.1f} m³/s en ascenso acelerado hacia umbral de desborde ({u_rojo:.1f} m³/s). "
                f"Preposicionar maquinaria pesada, motobombas y reforzar diques de defensa ribereña."
            )
        elif caudal >= u_amarillo:
            nivel = "AMARILLO_VIGILANCIA"
            color = "#eab308"
            accion = (
                f"🟡 VIGILANCIA AMARILLA: Caudal de {caudal:.1f} m³/s sobre el promedio estacional. "
                f"Monitoreo continuo de hidrogramas y coordinación con juntas de usuarios de riego."
            )
        else:
            nivel = "VERDE_NORMAL"
            color = "#22c55e"
            accion = f"🟢 CAUDAL NORMAL: {caudal:.1f} m³/s dentro de la capacidad hidráulica segura del cauce."

        # Tiempos de tránsito de onda aguas abajo
        tiempos_transito = {}
        for k, v in estacion.items():
            if k.startswith("tiempo_transito_hacia_"):
                ciudad_clave = k.replace("tiempo_transito_hacia_", "").replace("_horas", "").capitalize()
                tiempos_transito[ciudad_clave] = {
                    "horas_estimadas": v,
                    "minutos_estimados": int(v * 60)
                }

        # Generar firma criptográfica para trazabilidad COEN
        cadena_firma = f"{id_estacion}:{caudal}:{nivel}:{u_rojo}"
        hash_sha256 = hashlib.sha256(cadena_firma.encode("utf-8")).hexdigest()

        return {
            "id_estacion": estacion.get("id_estacion"),
            "nombre": estacion.get("nombre"),
            "cuenca": estacion.get("nombre_cuenca"),
            "departamento": estacion.get("departamento"),
            "lat": estacion.get("lat"),
            "lon": estacion.get("lon"),
            "caudal_evaluado_m3s": caudal,
            "umbral_amarillo_m3s": u_amarillo,
            "umbral_naranja_m3s": u_naranja,
            "umbral_rojo_desborde_m3s": u_rojo,
            "record_historico_1998_m3s": record_1998,
            "ratio_capacidad_desborde_pct": ratio_capacidad_pct,
            "nivel_alerta": nivel,
            "color_hex": color,
            "accion_recomendada": accion,
            "ciudades_vulnerables": estacion.get("ciudades_vulnerables", []),
            "tiempos_transito_aguas_abajo": tiempos_transito,
            "sello_criptografico_sha256": hash_sha256
        }

    def resumen_situacional_norte(self) -> Dict[str, Any]:
        """Genera un resumen situacional consolidado para la sala de crisis COEN."""
        cuencas = self.listar_cuencas()
        represas = self.listar_represas()

        estaciones_alerta = []
        total_estaciones = 0

        for c in cuencas:
            for e in c.get("estaciones_aforo", []):
                total_estaciones += 1
                ev = self.evaluar_estacion(e["id_estacion"])
                if ev.get("nivel_alerta") in ["ROJO_DESBORDE", "NARANJA_ALTO", "AMARILLO_VIGILANCIA"]:
                    estaciones_alerta.append(ev)

        # Ordenar por ratio de capacidad descendente
        estaciones_alerta.sort(key=lambda x: x.get("ratio_capacidad_desborde_pct", 0), reverse=True)

        return {
            "total_cuencas_monitoreadas": len(cuencas),
            "total_estaciones_activas": total_estaciones,
            "total_represas_reguladoras": len(represas),
            "estaciones_en_alerta": estaciones_alerta,
            "represas": represas,
            "estado_general_costa_norte": "ALERTA_PREVENTIVA" if estaciones_alerta else "NORMAL"
        }

fluvial_monitoring_service = FluvialMonitoringService()
