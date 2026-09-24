"""
Servicio C2 de Infraestructura Vial Crítica y Puentes Históricamente Afectados (SUTRAN / MTC / CAF)
AMARU-CLIMATE Lab4 — Monitoreo de Ejes Viales Estratégicos y Puentes Colapsables
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Any

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "puentes_carreteras_historicos_fen.json"

class RoadInfrastructureService:
    def __init__(self):
        self._datos: List[Dict[str, Any]] = self._cargar_datos()

    def _cargar_datos(self) -> List[Dict[str, Any]]:
        if not DATA_PATH.exists():
            return []
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[Error RoadInfrastructureService] No se pudo cargar catálogo de infraestructura: {e}")
            return []

    def listar_infraestructura(
        self,
        departamento: Optional[str] = None,
        tipo: Optional[str] = None,
        eje_vial: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retorna la lista de puentes y carreteras críticas con filtros opcionales."""
        res = self._datos
        if departamento:
            res = [i for i in res if departamento.lower() in i.get("departamento", "").lower()]
        if tipo:
            res = [i for i in res if i.get("tipo", "").lower() == tipo.lower()]
        if eje_vial:
            res = [i for i in res if eje_vial.lower() in i.get("eje_vial", "").lower()]
        return res

    def obtener_por_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene la ficha forense completa de un puente o carretera por su ID."""
        for item in self._datos:
            if item.get("id") == item_id:
                return item
        return None

    def evaluar_riesgo_actual(
        self,
        item_id: str,
        lluvia_proyectada_24h_mm: Optional[float] = None,
        caudal_proyectado_m3s: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Evalúa el riesgo de colapso o interrupción de tránsito correlacionando
        el pronóstico meteorológico actual con el umbral físico de colapso histórico.
        """
        item = self.obtener_por_id(item_id)
        if not item:
            return {"error": f"Infraestructura '{item_id}' no localizada en el catálogo."}

        umbral_caudal = float(item.get("caudal_gatillo_m3s", 100.0))
        lluvia = lluvia_proyectada_24h_mm if lluvia_proyectada_24h_mm is not None else 0.0
        caudal = caudal_proyectado_m3s if caudal_proyectado_m3s is not None else (umbral_caudal * 0.4)

        ratio_estres = (caudal / umbral_caudal) if umbral_caudal > 0 else 0.0

        if ratio_estres >= 1.0 or lluvia >= 50.0:
            estado_transito = "TRANSITO_INTERRUMPIDO"
            color_semaforo = "#ef4444"
            nivel_riesgo = "PELIGRO_ESTRUCTURAL_INMINENTE"
            accion_mtc = (
                f"🚨 CORTE TOTAL DE TRÁNSITO: Caudal proyectado ({caudal:.1f} m³/s) excede el umbral de colapso ({umbral_caudal:.1f} m³/s). "
                f"Cierre preventivo de vía por la Policía de Carreteras y activación de ruta alterna: {item.get('ruta_alterna')}."
            )
        elif ratio_estres >= 0.70 or lluvia >= 30.0:
            estado_transito = "TRANSITO_RESTRINGIDO"
            color_semaforo = "#f97316"
            nivel_riesgo = "ALTO_RIESGO_SOCAVACION"
            accion_mtc = (
                f"⚠️ TRÁNSITO RESTRINGIDO: Monitoreo continuo de estribos y terraplén. "
                f"Paso alternado a un solo carril solo para vehículos livianos y ambulancias. Preposicionar maquinaria pesada."
            )
        elif ratio_estres >= 0.40 or lluvia >= 15.0:
            estado_transito = "TRANSITO_CON_PRECAUCION"
            color_semaforo = "#eab308"
            nivel_riesgo = "VIGILANCIA_ESTRUCTURAL"
            accion_mtc = (
                f"🟡 VIGILANCIA PREVENTIVA: Inspección visual de apoyos y remoción de palizada arrastrada aguas arriba."
            )
        else:
            estado_transito = "TRANSITO_NORMAL"
            color_semaforo = "#22c55e"
            nivel_riesgo = "CONDICION_ESTABLE"
            accion_mtc = f"🟢 TRÁNSITO NORMAL: Vía expedita y flujo vehicular continuo bajo parámetros seguros."

        return {
            "id": item.get("id"),
            "nombre": item.get("nombre"),
            "tipo": item.get("tipo"),
            "eje_vial": item.get("eje_vial"),
            "departamento": item.get("departamento"),
            "coordenadas": item.get("coordenadas"),
            "caudal_evaluado_m3s": caudal,
            "caudal_gatillo_historico_m3s": umbral_caudal,
            "ratio_estres_hidraulico_pct": round(ratio_estres * 100, 1),
            "estado_transitabilidad": estado_transito,
            "color_semaforo": color_semaforo,
            "nivel_riesgo": nivel_riesgo,
            "accion_recomendada_mtc": accion_mtc,
            "ruta_alterna": item.get("ruta_alterna"),
            "leccion_aprendida_caf": item.get("leccion_aprendida_caf"),
            "eventos_colapso": item.get("eventos_colapso"),
            "dias_incomunicacion_historicos": item.get("dias_incomunicacion"),
            "costo_reconstruccion_caf_usd": item.get("costo_reconstruccion_caf_usd"),
            "evidencia_audiovisual": item.get("evidencia_audiovisual")
        }

    def resumen_red_vial(self) -> Dict[str, Any]:
        """Consolidado general de la red vial crítica para la sala C2."""
        items = self.listar_infraestructura()
        puentes = [i for i in items if "PUENTE" in i.get("tipo", "")]
        carreteras = [i for i in items if "CARRETERA" in i.get("tipo", "")]

        return {
            "total_infraestructuras_criticas": len(items),
            "total_puentes_estrategicos": len(puentes),
            "total_ejes_carreteros": len(carreteras),
            "departamentos_cubiertos": list(set(i.get("departamento", "") for i in items)),
            "costo_total_historico_reparacion_caf_usd": sum(i.get("costo_reconstruccion_caf_usd", 0) for i in items),
            "infraestructuras": items
        }

road_infrastructure_service = RoadInfrastructureService()
