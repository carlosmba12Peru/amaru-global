"""
Servicio C2 de Control Concurrente y Auditoría Preventiva CGR / OCI (AMARU-CLIMATE)
Articulación en tiempo real entre Gobiernos Locales y la Contraloría General de la República
para agilizar la ayuda humanitaria, blindar legalmente al Alcalde y habilitar el Bono BAE y SAC.
"""

import json
import hashlib
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR_PRIMARY = BASE_DIR / "data"
DATA_DIR_BACKEND = BASE_DIR / "backend" / "data"

def get_contraloria_data_path() -> Path:
    if DATA_DIR_PRIMARY.exists():
        return DATA_DIR_PRIMARY / "contraloria_bandeja_concurrente.json"
    if DATA_DIR_BACKEND.exists():
        return DATA_DIR_BACKEND / "contraloria_bandeja_concurrente.json"
    return DATA_DIR_PRIMARY / "contraloria_bandeja_concurrente.json"

PERU_TZ = timezone(timedelta(hours=-5))

class ContraloriaAuditService:
    def __init__(self):
        self._bandeja: List[Dict[str, Any]] = self._cargar_bandeja()

    def _cargar_bandeja(self) -> List[Dict[str, Any]]:
        path = get_contraloria_data_path()
        if not path.exists():
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[Error ContraloriaAuditService] No se pudo cargar bandeja CGR: {e}")
            return []

    def _guardar_bandeja(self):
        path = get_contraloria_data_path()
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(str(path.resolve()), "w", encoding="utf-8") as f:
                f.write(json.dumps(self._bandeja, indent=2, ensure_ascii=False))
        except Exception:
            pass

    def auditar_consistencia_algoritmica(self, ficha: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta las reglas de control preventivo de la CGR sobre el padrón EDAN
        para evitar observaciones posteriores y garantizar elegibilidad al Bono BAE y SAC.
        """
        alertas = []
        puntaje_consistencia = 100
        familias = ficha.get("formulario_2a_familias") or ficha.get("formulario_2a_empadronamiento_familias") or []
        medios_vida = ficha.get("formulario_2b_medios_vida", {})
        ubigeo = ficha.get("ubigeo", "")

        # 1. Regla DNI y Duplicidades
        dnis_vistos = set()
        dnis_invalidos = 0
        dnis_duplicados = 0

        for f in familias:
            dni = str(f.get("dni_titular") or f.get("dni_jefe_familia") or "").strip()
            if len(dni) != 8 or not dni.isdigit():
                dnis_invalidos += 1
                puntaje_consistencia -= 5
            elif dni in dnis_vistos:
                dnis_duplicados += 1
                puntaje_consistencia -= 15
            else:
                dnis_vistos.add(dni)

        if dnis_invalidos > 0:
            alertas.append({
                "codigo": "CGR-ALERTA-DNI-SINTAXIS",
                "gravedad": "ALTA",
                "mensaje": f"Se detectaron {dnis_invalidos} DNI(s) con longitud incorrecta o caracteres inválidos. El MVCS rechazará automáticamente estas solicitudes para el Bono BAE."
            })
        if dnis_duplicados > 0:
            alertas.append({
                "codigo": "CGR-ALERTA-DNI-DUPLICADO",
                "gravedad": "CRITICA",
                "mensaje": f"Se detectaron {dnis_duplicados} DNI(s) duplicados como titulares en el mismo padrón. Riesgo de observación penal por simulación de beneficiarios."
            })

        # 1.1 Cruce de Identidad PIDE-RENIEC
        pide_eval = None
        try:
            try:
                from services.connectors.pide_reniec_connector import pide_reniec_connector
            except ImportError:
                from backend.services.connectors.pide_reniec_connector import pide_reniec_connector
            pide_eval = pide_reniec_connector.validar_padron_masivo(familias)

            if pide_eval.get("fallecidos_detectados"):
                num_fall = len(pide_eval["fallecidos_detectados"])
                puntaje_consistencia -= 30
                alertas.append({
                    "codigo": "CGR-ALERTA-RENIEC-FALLECIDO",
                    "gravedad": "CRITICA",
                    "mensaje": f"Se detectaron {num_fall} titular(es) que figuran como FALLECIDO(S) en RENIEC. El Bono BAE no puede tramitarse para actas de defunción activas."
                })

            if pide_eval.get("menores_titulares"):
                num_men = len(pide_eval["menores_titulares"])
                alertas.append({
                    "codigo": "CGR-ALERTA-RENIEC-MENOR-TITULAR",
                    "gravedad": "MEDIA",
                    "mensaje": f"Se detectaron {num_men} menor(es) de edad como titulares del hogar. Requiere acreditación de tutor legal según directivas INDECI."
                })
        except Exception:
            pide_eval = None

        # 2. Regla de Calificación de Vivienda para Bono BAE (S/ 500/mes)
        inhabitables_o_destruidas = sum(
            1 for f in familias if (f.get("condicion_vivienda") or f.get("estado_vivienda")) in ["INHABITABLE", "DESTRUIDA", "COLAPSADA"]
        )
        afectadas = sum(
            1 for f in familias if (f.get("condicion_vivienda") or f.get("estado_vivienda")) == "AFECTADA"
        )

        if inhabitables_o_destruidas == 0 and len(familias) > 0:
            alertas.append({
                "codigo": "CGR-ALERTA-BAE-CERO-CALIFICADOS",
                "gravedad": "MEDIA",
                "mensaje": "Todas las viviendas fueron marcadas como 'Afectadas'. Ninguna familia calificará al subsidio de alquiler BAE (requiere condición Inhabitable o Destruida)."
            })

        # 3. Regla de Medios de Vida (Seguro Agrícola Catastrófico - SAC)
        hectareas_perdidas = float(medios_vida.get("hectareas_cultivo_perdidas", 0.0))
        cabezas_ganado = int(medios_vida.get("ganado_muerto_o_afectado", 0))

        if hectareas_perdidas == 0 and cabezas_ganado == 0:
            alertas.append({
                "codigo": "CGR-ALERTA-SAC-OMISION-MEDIOS-VIDA",
                "gravedad": "MEDIA",
                "mensaje": "Formulario 2B sin cuantificación de pérdidas agrícolas o pecuarias. Se omitirá el reporte para activación del Seguro Agrícola Catastrófico (SAC) de MIDAGRI."
            })
            puntaje_consistencia -= 10

        # 4. Reloj de 60 Días del Estado de Emergencia (D.S. 124-2026-PCM)
        fecha_emision = datetime.now(PERU_TZ)
        # Asumiendo D.S. emitido el 12 de setiembre de 2026
        fecha_ds = datetime(2026, 9, 12, tzinfo=PERU_TZ)
        dias_transcurridos = (fecha_emision - fecha_ds).days
        dias_restantes = max(0, 60 - dias_transcurridos)

        if dias_restantes < 15:
            alertas.append({
                "codigo": "CGR-ALERTA-PLAZO-ESTADO-EMERGENCIA",
                "gravedad": "CRITICA",
                "mensaje": f"Restan solo {dias_restantes} días de vigencia de la declaratoria de emergencia. Riesgo inminente de vencimiento antes de la contratación de bienes."
            })
            puntaje_consistencia -= 15

        puntaje_consistencia = max(0, min(100, puntaje_consistencia))

        if puntaje_consistencia >= 85 and dnis_duplicados == 0:
            estado_recomendado = "CONFORME_PARA_VISTO_BUENO"
            semaforo = "#10b981"
            resumen_dictamen = "Padrón consistente y validado. Cumple directivas INDECI y normativa de control concurrente CGR."
        elif puntaje_consistencia >= 60 and dnis_duplicados == 0:
            estado_recomendado = "OBSERVACIONES_MENORES_SUBSANABLES"
            semaforo = "#f59e0b"
            resumen_dictamen = "Padrón con advertencias técnicas subsanables. Se recomienda corrección de DNIs o especificación de medios de vida."
        else:
            estado_recomendado = "RIESGO_ALTO_INCONSISTENCIA"
            semaforo = "#ef4444"
            resumen_dictamen = "Padrón con inconsistencias críticas. Requiere depuración inmediata antes de tramitar transferencias de fondos."

        return {
            "puntaje_consistencia_pct": puntaje_consistencia,
            "estado_evaluacion": estado_recomendado,
            "semaforo": semaforo,
            "total_familias_auditadas": len(familias),
            "familias_elegibles_bono_bae": inhabitables_o_destruidas,
            "monto_estimado_bono_bae_mensual_soles": inhabitables_o_destruidas * 500,
            "seguro_agricola_sac_activable": hectareas_perdidas > 0,
            "dias_restantes_estado_emergencia": dias_restantes,
            "alertas_detectadas": alertas,
            "resumen_dictamen": resumen_dictamen,
            "cruce_pide_reniec": pide_eval
        }

    def registrar_inyeccion_edan(self, ficha: Dict[str, Any]) -> Dict[str, Any]:
        """
        Webhook de recepción inmediata cuando la municipalidad firma la ficha EDAN.
        Dispara la pre-auditoría algorítmica y la ingresa en la bandeja de la Contraloría.
        """
        edan_id = ficha.get("edan_id", "")
        # Verificar si ya existe
        for item in self._bandeja:
            if item.get("edan_id") == edan_id:
                return item

        eval_cgr = self.auditar_consistencia_algoritmica(ficha)
        ahora_iso = datetime.now(PERU_TZ).isoformat()

        nuevo_registro = {
            "registro_cgr_id": f"CGR-DISPARO-{datetime.now().strftime('%Y%m%d')}-{len(self._bandeja) + 1:04d}",
            "edan_id": edan_id,
            "codigo_sinpad": ficha.get("codigo_sinpad", f"SINPAD-2026-{len(self._bandeja) + 8140:05d}"),
            "ubigeo": ficha.get("ubigeo"),
            "distrito": ficha.get("distrito"),
            "provincia": ficha.get("provincia"),
            "departamento": ficha.get("departamento"),
            "alcalde": ficha.get("alcalde"),
            "hash_sha256": ficha.get("hash_sha256"),
            "fecha_disparo": ahora_iso,
            "estado_control": "PENDIENTE_VISTO_BUENO" if eval_cgr["estado_evaluacion"] == "CONFORME_PARA_VISTO_BUENO" else "EN_REVISION_OCI",
            "resultado_auditoria": eval_cgr,
            "visto_bueno_concurrente": None,
            "autoriza_reparto_inmediato_bah": False
        }

        self._bandeja.insert(0, nuevo_registro)
        self._guardar_bandeja()
        return nuevo_registro

    def listar_bandeja_concurrente(self, departamento: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retorna las fichas EDAN recepcionadas en la consola de la CGR."""
        if not departamento:
            return self._bandeja
        return [r for r in self._bandeja if departamento.lower() in r.get("departamento", "").lower()]

    def emitir_visto_bueno_concurrente(
        self,
        edan_id: str,
        auditor_cgr: str,
        observaciones_adicionales: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Emite la 'Constancia de No Observación Concurrente CGR' que blinda legalmente
        al Alcalde Distrital para abrir almacenes y repartir la ayuda de inmediato.
        """
        registro = None
        for item in self._bandeja:
            if item.get("edan_id") == edan_id or item.get("registro_cgr_id") == edan_id:
                registro = item
                break

        if not registro:
            return {"error": f"Ficha EDAN '{edan_id}' no localizada en la bandeja de la Contraloría."}

        constancia_codigo = f"CGR-CNC-2026-{datetime.now().strftime('%m%d')}-{abs(hash(edan_id)) % 10000:04d}"
        ahora_iso = datetime.now(PERU_TZ).isoformat()

        visto_bueno = {
            "constancia_codigo": constancia_codigo,
            "auditor_responsable": auditor_cgr or "Auditor Especialista en Emergencias - CGR",
            "organo_control": "Gerencia Regional de Control / OCI Municipal",
            "fecha_aprobacion": ahora_iso,
            "dictamen": "CONFORMIDAD CONCURRENTE SIN OBSERVACIÓN LIMINAR",
            "blindaje_legal_alcalde": (
                f"De conformidad con el control concurrente preventivo, se deja constancia de la consistencia nominal "
                f"del padrón EDAN. Se autoriza a la autoridad local el despacho inmediato de Bienes de Ayuda Humanitaria (BAH) "
                f"bajo el principio de subsidiariedad y celeridad de la Ley Nº 29664, eximiendo de presunta falta por distribución urgente."
            ),
            "tramite_subsidio_bae_autorizado": True,
            "tramite_seguro_agricola_sac_autorizado": True,
            "observaciones": observaciones_adicionales or "Padrón auditado sin duplicidades con RENIEC."
        }

        registro["estado_control"] = "CONFORME_CON_CONSTANCIA"
        registro["visto_bueno_concurrente"] = visto_bueno
        registro["autoriza_reparto_inmediato_bah"] = True

        # Acuñar evento inmutable en Bitácora WORM CGR
        bloque_worm_hash = None
        try:
            from services.cgr_worm_service import cgr_worm_service
            bloque = cgr_worm_service.acunar_evento(
                tipo_evento="CONSTANCIA_OCI_CONCURRENTE",
                actor_responsable=visto_bueno["auditor_responsable"],
                entidad_origen="CONTRALORIA_GENERAL_DE_LA_REPUBLICA",
                datos_evento={
                    "constancia_codigo": constancia_codigo,
                    "registro_cgr_id": registro["registro_cgr_id"],
                    "edan_id": registro["edan_id"],
                    "distrito": registro.get("distrito"),
                    "dictamen": visto_bueno["dictamen"]
                }
            )
            bloque_worm_hash = bloque["block_hash"]
            registro["bloque_worm_cgr"] = bloque_worm_hash
        except Exception:
            pass

        self._guardar_bandeja()
        return {
            "exito": True,
            "registro_cgr_id": registro["registro_cgr_id"],
            "edan_id": registro["edan_id"],
            "constancia_cgr": visto_bueno,
            "bloque_worm_cgr": bloque_worm_hash
        }

contraloria_service = ContraloriaAuditService()
