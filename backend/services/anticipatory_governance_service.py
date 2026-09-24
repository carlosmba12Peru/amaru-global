import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class PreposicionamientoInsumos(BaseModel):
    motobombas_4_pulgadas: int
    motobombas_6_pulgadas: int
    almacenes_itinerantes: int
    calaminas_unidades: int
    bobinas_plastico_pesado: int
    vacunas_dengue_leptospirosis: int
    sueros_antiofidicos: int
    plantas_potabilizadoras_moviles: int
    costo_estimado_pen: float
    estado_despliegue: str  # PRE_APROBADO, EN_TRANSITO, EN_POSICION

class PlanGobernanzaAnticipatoria(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    ubigeo: str
    distrito: str
    departamento: str
    poblacion_protegida: int
    anomalia_tsm_nino12: float
    nivel_advertencia: str  # NORMAL, VIGILANCIA, ADVERTENCIA_TEMPRANA, EMERGENCIA_ANTICIPADA
    trigger_presupuestal_activo: bool
    fase_accion_anticipada: str
    insumos_requeridos: PreposicionamientoInsumos
    marco_financiero: str
    directiva_ceplan_sendai: str


class AnticipatoryGovernanceService:
    """
    Motor de Gobernanza y Acción Anticipatoria (CAF / PUCP / Marco de Sendai 2026):
    Cruza la anomalía de la TSM en la región Niño 1+2 (DHN/ENFEN/NOAA) con la vulnerabilidad
    demográfica de los distritos del D.S. 124-2026-PCM y el FONDES para calcular el cubicaje
    paramétrico de ayuda humanitaria e insumos de defensa antes del impacto pluvial.
    """

    def __init__(self):
        self.base_data_path = Path(__file__).parent.parent / "data"
        self._cargar_distritos()

    def _cargar_distritos(self):
        ds124_path = self.base_data_path / "distritos_emergencia_ds_124_2026_pcm.json"
        if ds124_path.exists():
            with open(ds124_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.distritos = {d["ubigeo"]: d for d in data.get("distritos_declarados", [])}
        else:
            self.distritos = {}

    def evaluar_plan_anticipatorio_distrital(
        self,
        ubigeo: str,
        anomalia_tsm_nino12: float = 1.6
    ) -> PlanGobernanzaAnticipatoria:
        distrito_data = self.distritos.get(ubigeo)
        distrito_nombre = distrito_data.get("distrito", "DISTRITO") if distrito_data else "DISTRITO CAPITAL"
        departamento = distrito_data.get("departamento", "LIMA") if distrito_data else "LIMA"
        poblacion = distrito_data.get("poblacion_estimada", 30000) if distrito_data else 30000

        # 1. Definición del Nivel de Advertencia y Triggers
        if anomalia_tsm_nino12 >= 2.0:
            nivel = "EMERGENCIA_ANTICIPADA"
            trigger_activo = True
            fase = "Despliegue Inmediato de Almacenes Itinerantes y Evacuación Preventiva de Quebradas Críticas"
            factor_escala = 2.5
        elif anomalia_tsm_nino12 >= 1.5:
            nivel = "ADVERTENCIA_TEMPRANA"
            trigger_activo = True
            fase = "Pre-aprobación de Fondos de Contingencia y Traslado Preventivo de Bienes de Ayuda Humanitaria (BAH)"
            factor_escala = 1.8
        elif anomalia_tsm_nino12 >= 0.8:
            nivel = "VIGILANCIA"
            trigger_activo = False
            fase = "Escaneo Continuo de Horizontes y Mantenimiento de Descolmatación de Cuencas"
            factor_escala = 1.0
        else:
            nivel = "NORMAL"
            trigger_activo = False
            fase = "Monitoreo Basal de Rutina"
            factor_escala = 0.5

        # 2. Factor Territorial y Demográfico
        # Factores multiplicadores por exposición en cuencas de costa norte
        es_costa_norte = departamento in ["PIURA", "TUMBES", "LAMBAYEQUE", "LA LIBERTAD"]
        factor_territorio = 1.5 if es_costa_norte else 1.0
        ratio_pob = max(0.5, poblacion / 25000.0)

        # 3. Cubicaje Paramétrico de Insumos
        # Estimación de requerimientos logísticos mínimos
        motobombas_4 = int(max(2, round(4 * factor_escala * ratio_pob * factor_territorio)))
        motobombas_6 = int(max(1, round(2 * factor_escala * ratio_pob * factor_territorio)))
        almacenes = int(max(1, round(1 * factor_escala * (1.2 if es_costa_norte else 0.8))))
        calaminas = int(round(5000 * factor_escala * ratio_pob * factor_territorio))
        bobinas = int(round(30 * factor_escala * ratio_pob))
        vacunas = int(round(2500 * factor_escala * ratio_pob * (1.5 if es_costa_norte else 0.8)))
        sueros = int(round(40 * factor_escala * (1.8 if es_costa_norte else 0.5)))
        plantas_potab = int(max(1, round(1 * factor_escala * ratio_pob * (1.4 if es_costa_norte else 0.8))))

        # 4. Estimación Presupuestal en PEN (Soles)
        costo_pen = (
            motobombas_4 * 8500.0 +
            motobombas_6 * 19500.0 +
            almacenes * 45000.0 +
            calaminas * 42.0 +
            bobinas * 380.0 +
            vacunas * 35.0 +
            sueros * 280.0 +
            plantas_potab * 65000.0
        )

        insumos = PreposicionamientoInsumos(
            motobombas_4_pulgadas=motobombas_4,
            motobombas_6_pulgadas=motobombas_6,
            almacenes_itinerantes=almacenes,
            calaminas_unidades=calaminas,
            bobinas_plastico_pesado=bobinas,
            vacunas_dengue_leptospirosis=vacunas,
            sueros_antiofidicos=sueros,
            plantas_potabilizadoras_moviles=plantas_potab,
            costo_estimado_pen=round(costo_pen, 2),
            estado_despliegue="EN_POSICION" if trigger_activo else "PRE_APROBADO"
        )

        return PlanGobernanzaAnticipatoria(
            ubigeo=ubigeo,
            distrito=distrito_nombre,
            departamento=departamento,
            poblacion_protegida=poblacion,
            anomalia_tsm_nino12=anomalia_tsm_nino12,
            nivel_advertencia=nivel,
            trigger_presupuestal_activo=trigger_activo,
            fase_accion_anticipada=fase,
            insumos_requeridos=insumos,
            marco_financiero="Programa Presupuestal 0068 (PP 0068) y Fondo para Intervenciones ante la Ocurrencia de Desastres Naturales (FONDES)",
            directiva_ceplan_sendai="Doctrina CAF / PUCP 2026 - Preposicionamiento FEN Basado en Triggers Físicos del Océano"
        )

    def resumen_nacional_preposicionamiento(self, anomalia_tsm_nino12: float = 1.6) -> Dict[str, Any]:
        """Retorna un consolidado paramétrico para los departamentos prioritarios del DS 124."""
        departamentos_clave = ["PIURA", "LAMBAYEQUE", "TUMBES", "LA LIBERTAD", "LIMA", "ICA", "ANCASH"]
        resumen_dept = {}

        for dept in departamentos_clave:
            # Buscar un ubigeo representativo
            ubigeo_rep = "150101"
            for u, d in self.distritos.items():
                if d.get("departamento") == dept:
                    ubigeo_rep = u
                    break
            
            plan = self.evaluar_plan_anticipatorio_distrital(ubigeo_rep, anomalia_tsm_nino12)
            resumen_dept[dept] = {
                "departamento": dept,
                "nivel_advertencia": plan.nivel_advertencia,
                "motobombas_sugeridas": plan.insumos_requeridos.motobombas_4_pulgadas + plan.insumos_requeridos.motobombas_6_pulgadas,
                "calaminas_unidades": plan.insumos_requeridos.calaminas_unidades,
                "presupuesto_estimado_pen": plan.insumos_requeridos.costo_estimado_pen
            }

        return {
            "anomalia_tsm_evaluada": anomalia_tsm_nino12,
            "total_departamentos_monitoreados": len(departamentos_clave),
            "resumen_por_region": resumen_dept
        }


anticipatory_governance_service = AnticipatoryGovernanceService()
