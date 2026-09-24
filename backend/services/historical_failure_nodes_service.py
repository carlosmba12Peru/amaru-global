"""
Servicio C2 de Memoria Forense y Nodos de Falla Histórica FEN (1983, 1998, 2017, 2023)
AMARU-Climate Lab4 — Sistema Soberano de Gestión de Riesgo de Desastres
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Any

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "puntos_criticos_historicos_fen.json"

class HistoricalFailureNodesService:
    def __init__(self):
        self._nodos: List[Dict[str, Any]] = self._cargar_datos()

    def _cargar_datos(self) -> List[Dict[str, Any]]:
        if not DATA_PATH.exists():
            return []
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error cargando catálogo de nodos históricos: {e}")
            return []

    def listar_nodos(self, departamento: Optional[str] = None, tipo: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retorna la lista de los 18 nodos de falla histórica con filtros opcionales."""
        resultados = self._nodos
        if departamento:
            resultados = [n for n in resultados if n.get("departamento", "").lower() == departamento.lower()]
        if tipo:
            resultados = [n for n in resultados if n.get("tipo", "").lower() == tipo.lower()]
        return resultados

    def obtener_nodo_por_id(self, nodo_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene la ficha técnica de un nodo histórico por su ID canónico."""
        for n in self._nodos:
            if n.get("id") == nodo_id:
                return n
        return None

    def evaluar_amenaza_nodo(
        self,
        nodo_id: str,
        lluvia_actual_mm: Optional[float] = None,
        caudal_actual_m3s: Optional[float] = None,
        colmatacion_malla_pct: float = 0.0
    ) -> Dict[str, Any]:
        """
        Evalúa en tiempo real si un nodo está aproximándose o superando el umbral
        que provocó el desastre en 1983, 1998, 2017 o 2023.
        """
        nodo = self.obtener_nodo_por_id(nodo_id)
        if not nodo:
            return {"error": f"Nodo con ID '{nodo_id}' no encontrado en el catálogo histórico."}

        umbral_lluvia = nodo.get("umbral_critico_lluvia_mm", 30.0)
        umbral_caudal = nodo.get("umbral_critico_caudal_m3s", 100.0)
        tlag_min = nodo.get("tiempo_retardo_tlag_min", 45)
        tipo_nodo = nodo.get("tipo", "QUEBRADA_TORRENCIAL")

        lluvia = lluvia_actual_mm if lluvia_actual_mm is not None else 0.0
        caudal = caudal_actual_m3s if caudal_actual_m3s is not None else 0.0

        # Ratios de tensión respecto a eventos históricos
        ratio_lluvia = lluvia / umbral_lluvia if umbral_lluvia > 0 else 0.0
        ratio_caudal = caudal / umbral_caudal if umbral_caudal > 0 else 0.0
        ratio_maximo = max(ratio_lluvia, ratio_caudal)

        # Ajuste dinámico por colmatación de mallas o diques (Chosica/Chaclacayo)
        # Si la malla está al 80% colmatada, su capacidad de retención remanente es baja
        ratio_efectivo = ratio_maximo * (1.0 + (colmatacion_malla_pct / 100.0) * 0.5)

        # Determinación del semáforo operacional
        if ratio_efectivo >= 1.0:
            nivel = "ROJO_DESBORDE_INMINENTE"
            color = "ROJO"
            accion = "🚨 EVACUACIÓN INMEDIATA: Parámetros superan el umbral histórico de colapso. Disparar protocolo SISMATE."
        elif ratio_efectivo >= 0.70:
            nivel = "NARANJA_ALERTA_MAXIMA"
            color = "NARANJA"
            accion = "⚠️ ALERTA MÁXIMA: Monitoreo continuo 24/7. Preparar zonas seguras de evacuación vertical."
        elif ratio_efectivo >= 0.40:
            nivel = "AMARILLO_VIGILANCIA"
            color = "AMARILLO"
            accion = "🟡 VIGILANCIA PREVENTIVA: Despeje de cauce y aviso a comités comunitarios del COEL."
        else:
            nivel = "VERDE_ESTADO_NORMAL"
            color = "VERDE"
            accion = "🟢 CAUCE SECO / FLUJO ESTABLE: Sin peligro inmediato. Mantener mantenimiento preventivo."

        # Advertencia especial para cuencas secas durmientes (Caso Evangelina Chamorro / Malanche)
        aviso_cuenca_seca = None
        if tipo_nodo == "CUENCA_SECA_DURMIENTE" and ratio_lluvia >= 0.60:
            aviso_cuenca_seca = (
                f"🚨 ALERTA ESPECIAL CUENCA SECA ({nodo['nombre']}): Cuenca típicamente inactiva presentando recarga pluvial crítica. "
                f"Tiempo de viaje de la onda de lodo estimada en {tlag_min} minutos hacia la zona urbana y balneario."
            )

        return {
            "nodo_id": nodo_id,
            "nombre": nodo.get("nombre"),
            "tipo": tipo_nodo,
            "distrito": nodo.get("distrito"),
            "departamento": nodo.get("departamento"),
            "ubigeo": nodo.get("ubigeo"),
            "coordenadas": nodo.get("coordenadas"),
            "nivel_alerta": nivel,
            "color_semaforo": color,
            "porcentaje_umbral_alcanzado": round(ratio_efectivo * 100, 1),
            "tiempo_retardo_tlag_min": tlag_min,
            "lluvia_evaluada_mm": lluvia,
            "caudal_evaluado_m3s": caudal,
            "colmatacion_malla_pct": colmatacion_malla_pct,
            "umbral_critico_lluvia_mm": umbral_lluvia,
            "umbral_critico_caudal_m3s": umbral_caudal,
            "accion_recomendada": accion,
            "aviso_cuenca_seca": aviso_cuenca_seca,
            "eventos_historicos": nodo.get("eventos_historicos"),
            "leccion_historica": nodo.get("leccion_historica"),
            "evidencia_audiovisual": nodo.get("evidencia_audiovisual")
        }

historical_failure_service = HistoricalFailureNodesService()
