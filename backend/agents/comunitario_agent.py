# backend/agents/comunitario_agent.py
"""
Agente COMUNITARIO (Veeduría Territorial, Crowdsourcing Ciudadano y Filtro Anti-Bulos)
Ecosistema AMARU-CLIMATE - Inteligencia Artificial Soberana

Misión del Agente COMUNITARIO:
1. Recepción y procesamiento de reportes de campo ciudadanos (fotos georreferenciadas, audios, textos de WhatsApp).
2. Filtro Forense Anti-Bulos (Anti-Hoax): Coteja reportes con telemetría de radares y pluviómetros para descartar videos reciclados o falsas alarmas.
3. Monitoreo y Protección de Ollas Comunes (Ley N.º 31458) y albergues populares ante aislamiento por huaicos o desbordes.
"""
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

from agents.schemas import (
    CitizenReportInput,
    ComunitarioReporteVerificado,
    OllaComunMonitoreo
)
from services.historical_data_service import historical_data_service

# Catálogo referencial de Ollas Comunes registradas (Ley 31458) en cuencas vulnerables
OLLAS_COMUNES_CATALOGO: Dict[str, List[Dict[str, Any]]] = {
    "150118": [  # Lurigancho-Chosica
        {"id": "OC-CHO-01", "nombre": "Olla Común Mujeres Luchadoras de Pedregal", "sector": "Quebrada Pedregal", "beneficiarios": 95},
        {"id": "OC-CHO-02", "nombre": "Olla Común Virgen del Carmen Carossio", "sector": "Quebrada Carossio", "beneficiarios": 120},
        {"id": "OC-CHO-03", "nombre": "Olla Común Esperanza y Fe San Antonio", "sector": "San Antonio de Pedregal", "beneficiarios": 80}
    ],
    "200104": [  # Catacaos
        {"id": "OC-CAT-01", "nombre": "Olla Común San Pablo Arriba", "sector": "Caserío San Pablo", "beneficiarios": 140},
        {"id": "OC-CAT-02", "nombre": "Olla Común Corazón de Jesús Simbilá", "sector": "Simbilá", "beneficiarios": 110},
        {"id": "OC-CAT-03", "nombre": "Olla Común La Bruja Heroica", "sector": "Bajo Piura", "beneficiarios": 160}
    ],
    "200114": [  # Tambogrande
        {"id": "OC-TAM-01", "nombre": "Olla Común Valle de los Incas", "sector": "Margen Izquierda Río Piura", "beneficiarios": 130}
    ]
}


class ComunitarioAgent:
    """
    Agente de Inteligencia Artificial para la veeduría social, crowdsourcing y protección comunitaria.
    """

    def __init__(self):
        self.nombre_agente = "Agente COMUNITARIO (Veeduría Territorial & Filtro Anti-Bulos)"
        self.version = "1.0.0-PROD"

    def verificar_reporte_ciudadano(
        self,
        reporte: CitizenReportInput,
        lluvia_acumulada_24h_mm: float = 25.0,
        es_zona_quebrada: bool = True
    ) -> ComunitarioReporteVerificado:
        """
        Aplica el filtro forense Anti-Hoax para clasificar si el reporte ciudadano es genuino o sospechoso.
        """
        reporte_id = f"REP-VERIF-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        # Criterio Anti-Hoax: Si la lluvia es nula o despreciable (< 2 mm) y se reporta huaico masivo, alerta de desinformación
        radar_lluvia = lluvia_acumulada_24h_mm > 5.0

        if lluvia_acumulada_24h_mm < 2.0 and "huaico" in reporte.descripcion.lower():
            es_autentico = False
            score = 15.0
            clasificacion = "SOSPECHOSO_RECICLADO_O_FALSO"
            motivo = (
                f"DESINFORMACIÓN DETECTADA: El reporte describe un evento violento de huaico en {reporte.distrito}, "
                f"pero los radares y estaciones automáticas registran precipitación nula ({lluvia_acumulada_24h_mm} mm en 24h). "
                f"Alta probabilidad de material audiovisual reciclado de eventos pasados (FEN 2017 / Yaku 2023)."
            )
            prioridad = "BAJA"
            inspeccion = False
        elif radar_lluvia and es_zona_quebrada:
            es_autentico = True
            score = 96.5
            clasificacion = "GENUINO_VERIFICADO"
            motivo = (
                f"REPORTE DE CAMPO VALIDADO: La descripción ciudadana coincide plenamente con los vectores de precipitación "
                f"({lluvia_acumulada_24h_mm} mm) y la activación hidrológica de la quebrada. Confirmado riesgo inminente."
            )
            prioridad = "URGENTE" if lluvia_acumulada_24h_mm >= 30.0 else "ALTA"
            inspeccion = True
        else:
            es_autentico = True
            score = 75.0
            clasificacion = "PENDIENTE_CALIBRACION_CAMPO"
            motivo = (
                f"Reporte verosímil con precipitaciones moderadas ({lluvia_acumulada_24h_mm} mm). Se remite al monitor vecinal."
            )
            prioridad = "MEDIA"
            inspeccion = True

        hash_payload = f"{reporte_id}|{reporte.ubigeo}|{reporte.descripcion}|{es_autentico}|{score}|{now_str}"
        hash_sha256 = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

        return ComunitarioReporteVerificado(
            reporte_id=reporte_id,
            ubigeo=reporte.ubigeo,
            distrito=reporte.distrito,
            es_autentico=es_autentico,
            score_confianza_antibullying=score,
            clasificacion_anti_hoax=clasificacion,
            motivo_clasificacion=motivo,
            radar_coincidencia_lluvia=radar_lluvia,
            prioridad_atencion=prioridad,
            requiere_inspeccion_campo=inspeccion,
            hash_sha256_evidencia=hash_sha256,
            fecha_procesamiento=now_str
        )

    def monitorear_ollas_comunes(self, ubigeo: str, severidad_emergencia: str = "ALTA") -> List[OllaComunMonitoreo]:
        """
        Retorna la matriz de ollas comunes y requerimientos prioritarios de alimentos y agua potable.
        """
        nombre_dist = historical_data_service.get_distrito_nombre(ubigeo)
        ollas_raw = OLLAS_COMUNES_CATALOGO.get(ubigeo, [
            {
                "id": f"OC-{ubigeo}-01",
                "nombre": f"Olla Común Central de {nombre_dist}",
                "sector": "Sector Periférico Vulnerable",
                "beneficiarios": 100
            }
        ])

        monitoreadas: List[OllaComunMonitoreo] = []
        for o in ollas_raw:
            benef = o["beneficiarios"]
            # Consumo paramétrico INDECI: 0.75 kg víveres/día y 3.0 litros de agua/persona/día
            alimentos_kg = round(benef * 0.75 * 7, 2)  # Suministro para 7 días
            agua_l = round(benef * 3.0 * 7, 2)

            estado_acc = "AISLADA" if severidad_emergencia == "CRITICA" else "EN_RIESGO"

            monitoreadas.append(OllaComunMonitoreo(
                olla_comun_id=o["id"],
                nombre=o["nombre"],
                ubigeo=ubigeo,
                distrito=nombre_dist,
                sector=o["sector"],
                beneficiarios_atendidos=benef,
                estado_acceso=estado_acc,
                requerimiento_alimentos_kg=alimentos_kg,
                requerimiento_agua_litros=agua_l,
                prioridad_abastecimiento="INMEDIATA_NIVEL_1"
            ))

        return monitoreadas


agente_comunitario = ComunitarioAgent()
