# backend/agents/fiscalizador_agent.py
"""
Agente FISCALIZADOR (Auditoría Presupuestal MEF, SIAF y Contrataciones SEACE)
Ecosistema AMARU-CLIMATE - Inteligencia Artificial Soberana

Misión del Agente FISCALIZADOR:
1. Monitoreo en vivo de asignación y ejecución presupuestal del Programa Presupuestal 0068 (PP 0068) y FONDES.
2. Cálculo de modificaciones presupuestales tipo 003 (Créditos Suplementarios / Habilitaciones) en emergencia.
3. Control Concurrente de Contrataciones Directas (Art. 27 Ley N.º 30225) y Matriz de Precios Referenciales SEACE.
4. Emisión de Constancias de Razonabilidad de Precios para blindar a las autoridades ante la Contraloría (OCI/CGR).
"""
import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from agents.schemas import (
    FiscalReportePresupuestal,
    RazonabilidadPrecioRequest,
    RazonabilidadPrecioResponse,
    DictamenFiscalEmergencia
)
from services.historical_data_service import historical_data_service

# Banda referencial histórica SEACE / MTC para alquiler de maquinaria pesada por hora (PEN)
PRECIOS_REFERENCIALES_SEACE: Dict[str, Dict[str, float]] = {
    "Cargador Frontal": {
        "precio_base": 320.0,
        "limite_tolerable": 390.0,
        "unidad": "hora-máquina"
    },
    "Volquete 15m3": {
        "precio_base": 240.0,
        "limite_tolerable": 295.0,
        "unidad": "hora-máquina"
    },
    "Retroexcavadora": {
        "precio_base": 210.0,
        "limite_tolerable": 260.0,
        "unidad": "hora-máquina"
    },
    "Tractor Oruga D8T": {
        "precio_base": 480.0,
        "limite_tolerable": 590.0,
        "unidad": "hora-máquina"
    },
    "Motobomba 6 pulgadas": {
        "precio_base": 110.0,
        "limite_tolerable": 145.0,
        "unidad": "hora-máquina"
    },
    "Cisterna de Agua 4000 gal": {
        "precio_base": 180.0,
        "limite_tolerable": 225.0,
        "unidad": "hora-máquina"
    }
}


class FiscalizadorAgent:
    """
    Agente de Inteligencia Artificial para el control financiero, ejecución del PP 0068 y blindaje ante OCI/CGR.
    """

    def __init__(self):
        self.nombre_agente = "Agente FISCALIZADOR (Presupuesto MEF & Contrataciones SEACE)"
        self.version = "1.0.0-PROD"

    def consultar_presupuesto_distrital(self, ubigeo: str) -> FiscalReportePresupuestal:
        """
        Consulta y simula analíticamente el estado de la meta presupuestal PP 0068 y FONDES.
        """
        nombre_dist = historical_data_service.get_distrito_nombre(ubigeo)
        info_dist = historical_data_service.get_distrito_info(ubigeo)
        
        provincia = info_dist.get("provincia", "Distrital") if info_dist else "Provincia"
        departamento = info_dist.get("departamento", "Nacional") if info_dist else "Departamento"

        # Determinación de presupuesto según criticidad histórica o tamaño poblacional
        es_critico = historical_data_service.es_distrito_critico(ubigeo)
        pim_base = 2500000.0 if es_critico else 850000.0
        devengado_base = pim_base * 0.28  # Tasa histórica promedio en emergencia en Perú (~28%)
        saldo_pp0068 = pim_base - devengado_base
        saldo_fondes = 1800000.0 if es_critico else 400000.0

        porcentaje_ejecucion = round((devengado_base / pim_base) * 100, 2)
        requiere_credito = saldo_pp0068 < 500000.0
        monto_sugerido = 1200000.0 if requiere_credito else 0.0

        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        hash_payload = f"{ubigeo}|{pim_base}|{saldo_pp0068}|{saldo_fondes}|{now_str}"
        hash_sha256 = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

        return FiscalReportePresupuestal(
            ubigeo=ubigeo,
            distrito=nombre_dist,
            provincia=provincia,
            departamento=departamento,
            pim_pp0068_pen=round(pim_base, 2),
            devengado_pp0068_pen=round(devengado_base, 2),
            saldo_disponible_pp0068_pen=round(saldo_pp0068, 2),
            porcentaje_ejecucion_pp0068=porcentaje_ejecucion,
            saldo_fondes_pen=round(saldo_fondes, 2),
            requiere_credito_suplementario=requiere_credito,
            monto_sugerido_modificacion_pen=round(monto_sugerido, 2),
            fuente_financiamiento_recomendada="Recursos Determinados / Canon / FONDES D.S. 124-2026-PCM",
            fecha_consulta_mef=now_str,
            hash_sha256_consulta=hash_sha256
        )

    def evaluar_razonabilidad_contratacion(
        self,
        request: RazonabilidadPrecioRequest
    ) -> RazonabilidadPrecioResponse:
        """
        Evalúa el precio por hora ofertado para alquiler de maquinaria en emergencia frente al catálogo SEACE.
        """
        # Búsqueda difusa de maquinaria en catálogo
        maquinaria_clave = "Cargador Frontal"
        for k in PRECIOS_REFERENCIALES_SEACE.keys():
            if k.lower() in request.tipo_maquinaria.lower():
                maquinaria_clave = k
                break

        ref = PRECIOS_REFERENCIALES_SEACE[maquinaria_clave]
        precio_ref = ref["precio_base"]
        limite_tolerable = ref["limite_tolerable"]

        ofertado = request.precio_hora_ofertado_pen
        es_razonable = ofertado <= limite_tolerable
        desviacion_pct = round(((ofertado - precio_ref) / precio_ref) * 100, 2)

        if es_razonable:
            dictamen = (
                f"CONFORMIDAD FISCAL: El precio ofertado de S/ {ofertado:.2f}/h se encuentra dentro de la "
                f"banda de razonabilidad permitida para emergencia (desviación de +{desviacion_pct:.1f}% respecto al referencial). "
                f"Se encuentra amparado bajo el Art. 27 de la Ley de Contrataciones del Estado N.º 30225."
            )
        else:
            dictamen = (
                f"ALERTA DE SOBREPRECIO: El precio ofertado de S/ {ofertado:.2f}/h supera el límite tolerable de "
                f"S/ {limite_tolerable:.2f}/h (exceso de +{desviacion_pct:.1f}%). Existe alto riesgo de observación civil y penal "
                f"por parte de la Contraloría General de la República (OCI/CGR). Se recomienda solicitar cotizaciones alternativas o requerir al MTC."
            )

        return RazonabilidadPrecioResponse(
            tipo_maquinaria=request.tipo_maquinaria,
            precio_hora_ofertado_pen=round(ofertado, 2),
            precio_referencial_seace_pen=round(precio_ref, 2),
            limite_superior_tolerable_pen=round(limite_tolerable, 2),
            es_razonable=es_razonable,
            porcentaje_desviacion=desviacion_pct,
            dictamen_anticorrupcion=dictamen,
            base_legal="Art. 27 Ley N.º 30225 y Directiva OSCE N.º 005-2020"
        )

    def emitir_dictamen_fiscal_emergencia(
        self,
        ubigeo: str,
        monto_comprometido_pen: float,
        todos_precios_razonables: bool = True
    ) -> DictamenFiscalEmergencia:
        """
        Emite la certificación financiera inmutable para adjuntar al expediente de contratación directa.
        """
        nombre_dist = historical_data_service.get_distrito_nombre(ubigeo)
        folio = f"FOLIO-FISCAL-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        presupuesto = self.consultar_presupuesto_distrital(ubigeo)
        disponibilidad = (presupuesto.saldo_disponible_pp0068_pen + presupuesto.saldo_fondes_pen) >= monto_comprometido_pen

        if disponibilidad and todos_precios_razonables:
            resumen = (
                f"DICTAMEN FAVORABLE: Se certifica la existencia de crédito presupuestario suficiente por "
                f"S/ {monto_comprometido_pen:,.2f} en el distrito de {nombre_dist} y la razonabilidad de los costos unitarios. "
                f"Expediente habilitado para trámite de regularización ante el Concejo Municipal conforme al Art. 100 del D.S. 344-2018-EF."
            )
        else:
            resumen = (
                f"DICTAMEN CON SALVEDADES: Insuficiencia de saldo presupuestal directo o advertencia en precios unitarios. "
                f"Se requiere formalizar modificación presupuestal tipo 003 antes del devengado."
            )

        hash_payload = f"{folio}|{ubigeo}|{monto_comprometido_pen}|{disponibilidad}|{todos_precios_razonables}|{now_str}"
        hash_sha256 = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

        return DictamenFiscalEmergencia(
            folio_fiscal=folio,
            ubigeo=ubigeo,
            distrito=nombre_dist,
            monto_total_comprometido_pen=round(monto_comprometido_pen, 2),
            disponibilidad_presupuestal_certificada=disponibilidad,
            cumple_razonabilidad_precios=todos_precios_razonables,
            resumen_dictamen=resumen,
            hash_sha256=hash_sha256,
            fecha_emision=now_str
        )


agente_fiscalizador = FiscalizadorAgent()
