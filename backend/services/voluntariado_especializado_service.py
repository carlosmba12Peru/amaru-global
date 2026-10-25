"""
Servicio Backend: voluntariado_especializado_service.py
Gestión, Registro y Asignación Telemétrica de la Red Tripartita de Voluntarios Especializados (COED Social AMARU).
Especialidades:
  1. VOLUNTARIO_GRD: Gestión del Riesgo de Desastres y Capacitación Comunitario (Ollas Comunes - Ley 31458).
  2. VOLUNTARIO_OCSE: Compras Públicas, Asesoría Legal y Expedientes D8 (Art. 27 Ley 30225).
  3. VOLUNTARIO_ACS_MINSA: Agentes Comunitarios de Salud (Triaje NTS-105 & Vectores).
"""

import json
import hashlib
import uuid
from typing import Dict, List, Optional
from datetime import datetime, timezone

# Catálogo simulado en memoria con capacidad de persistencia
BD_VOLUNTARIOS: Dict[str, Dict] = {}
BD_DESPACHOS: List[Dict] = []

class VoluntariadoEspecializadoService:
    """
    Servicio encargado de administrar la Red Tripartita de Voluntarios Especializados del COED Social AMARU.
    """

    @staticmethod
    def generar_codigo_zero_pii(dni: str, especialidad: str) -> str:
        """
        Genera un identificador opaco Zero-PII irreversible para el voluntario en campo.
        Ejemplo: VOL-OCSE-A7F92C3D
        """
        raw_string = f"{dni}:{especialidad}:AMARU_SALT_2026"
        hash_digest = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()[:8].upper()
        prefix = "VOL-GRD" if "GRD" in especialidad else ("VOL-OCSE" if "OCSE" in especialidad else "VOL-ACS")
        return f"{prefix}-{hash_digest}"

    @classmethod
    def registrar_voluntario(
        cls,
        nombre_completo: str,
        dni: str,
        especialidad: str,
        departamento: str,
        provincia: str,
        distrito: str,
        codigo_certificacion: str,
        telefono_contacto: str
    ) -> Dict:
        """
        Registra y certifica un nuevo voluntario especializado dentro de la red.
        """
        especialidades_validas = ["VOLUNTARIO_GRD", "VOLUNTARIO_OCSE", "VOLUNTARIO_ACS_MINSA"]
        if especialidad not in especialidades_validas:
            raise ValueError(f"Especialidad no válida. Debe ser una de: {especialidades_validas}")

        codigo_zero_pii = cls.generar_codigo_zero_pii(dni, especialidad)
        
        registro = {
            "voluntario_id": str(uuid.uuid4()),
            "codigo_zero_pii": codigo_zero_pii,
            "nombre_completo": nombre_completo,
            "especialidad": especialidad,
            "ubigeo_residencia": {
                "departamento": departamento,
                "provincia": provincia,
                "distrito": distrito
            },
            "codigo_certificacion": codigo_certificacion,
            "estado": "ACTIVO_DISPONIBLE",
            "misiones_completadas": 0,
            "fecha_registro": datetime.now(timezone.utc).isoformat()
        }
        
        BD_VOLUNTARIOS[codigo_zero_pii] = registro
        return registro

    @classmethod
    def obtener_voluntarios_por_especialidad(cls, especialidad: str) -> List[Dict]:
        """
        Filtra voluntarios activos por especialidad.
        """
        return [
            v for v in BD_VOLUNTARIOS.values()
            if v["especialidad"] == especialidad and v["estado"] in ["ACTIVO_DISPONIBLE", "EN_MISION"]
        ]

    @classmethod
    def despachar_voluntarios_ds124(cls, ubigeo_target: str, especialidades_requeridas: List[str] = None) -> Dict:
        """
        Algoritmo de emparejamiento geográfico (Spatial Matchmaking) que asigna voluntarios especializados
        a municipios declarados en Estado de Emergencia por D.S. 124-2026-PCM.
        """
        if especialidades_requeridas is None:
            especialidades_requeridas = ["VOLUNTARIO_OCSE", "VOLUNTARIO_GRD", "VOLUNTARIO_ACS_MINSA"]

        voluntarios_asignados = []
        for esp in especialidades_requeridas:
            candidatos = cls.obtener_voluntarios_por_especialidad(esp)
            if candidatos:
                # Seleccionar el primer candidato disponible y marcarlo en misión
                seleccionado = candidatos[0]
                seleccionado["estado"] = "EN_MISION"
                seleccionado["misiones_completadas"] += 1
                voluntarios_asignados.append(seleccionado)

        despacho = {
            "despacho_id": str(uuid.uuid4()),
            "ubigeo_destino": ubigeo_target,
            "fecha_despacho": datetime.now(timezone.utc).isoformat(),
            "estado_emergencia_ref": "D.S. N.° 124-2026-PCM",
            "total_voluntarios_asignados": len(voluntarios_asignados),
            "voluntarios": voluntarios_asignados
        }
        
        BD_DESPACHOS.append(despacho)
        return despacho

    @classmethod
    def obtener_resumen_red_voluntariado(cls) -> Dict:
        """
        Retorna el estado telemétrico global de la Red de Voluntarios.
        """
        total = len(BD_VOLUNTARIOS)
        grd = len([v for v in BD_VOLUNTARIOS.values() if v["especialidad"] == "VOLUNTARIO_GRD"])
        ocse = len([v for v in BD_VOLUNTARIOS.values() if v["especialidad"] == "VOLUNTARIO_OCSE"])
        acs = len([v for v in BD_VOLUNTARIOS.values() if v["especialidad"] == "VOLUNTARIO_ACS_MINSA"])
        
        return {
            "total_voluntarios_registrados": total,
            "desglose_por_especialidad": {
                "VOLUNTARIO_GRD": grd,
                "VOLUNTARIO_OCSE": ocse,
                "VOLUNTARIO_ACS_MINSA": acs
            },
            "total_despachos_realizados": len(BD_DESPACHOS),
            "cobertura_distrital_activa": len(set(d["ubigeo_destino"] for d in BD_DESPACHOS))
        }


# Inicialización de voluntarios demostrativos si la base está vacía
def _inicializar_semilla():
    if not BD_VOLUNTARIOS:
        VoluntariadoEspecializadoService.registrar_voluntario(
            nombre_completo="Dra. María Elena Quispe",
            dni="45892134",
            especialidad="VOLUNTARIO_OCSE",
            departamento="PIURA",
            provincia="PIURA",
            distrito="TAMBOGRANDE",
            codigo_certificacion="OCSE-CERT-2025-8849",
            telefono_contacto="+51968541230"
        )
        VoluntariadoEspecializadoService.registrar_voluntario(
            nombre_completo="Ing. Carlos Huamán",
            dni="70215489",
            especialidad="VOLUNTARIO_GRD",
            departamento="PIURA",
            provincia="PIURA",
            distrito="CURA MORI",
            codigo_certificacion="INDECI-GRD-2024-1102",
            telefono_contacto="+51974125896"
        )
        VoluntariadoEspecializadoService.registrar_voluntario(
            nombre_completo="Lic. Rosa Melgar",
            dni="41258963",
            especialidad="VOLUNTARIO_ACS_MINSA",
            departamento="PIURA",
            provincia="SULLANA",
            distrito="BELLAVISTA",
            codigo_certificacion="MINSA-ACS-PIURA-0491",
            telefono_contacto="+51951236874"
        )

_inicializar_semilla()
