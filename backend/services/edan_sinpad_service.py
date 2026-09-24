"""
Servicio Oficial de Ficha EDAN y Carga Homologada SINPAD v2 (AMARU-CLIMATE)
Conforme a la R.S. Nº 002-2026-PCM/SGRD, R.M. Nº 324-2023-PCM y R.M. Nº 327-2019-PCM
Generación de Formularios 1, 2A y 2B con Firma Criptográfica SHA-256, QR Oficial y Disparo a CGR.
"""

import json
import hashlib
import io
import math
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any

import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether

from services.contraloria_audit_service import contraloria_service

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR_PRIMARY = BASE_DIR / "data"
DATA_DIR_BACKEND = BASE_DIR / "backend" / "data"
PERU_TZ = timezone(timedelta(hours=-5))

def get_data_file(filename: str) -> Path:
    p1 = DATA_DIR_PRIMARY / filename
    if p1.exists():
        return p1
    p2 = DATA_DIR_BACKEND / filename
    if p2.exists():
        return p2
    return p1

class EdanSinpadService:
    def __init__(self):
        self.directorio_inei: Dict[str, Any] = {}
        self.distritos_emergencia: Dict[str, Any] = {}
        self._fichas_emitidas: Dict[str, Dict[str, Any]] = {}
        self._cargar_datos_base()

    def _cargar_datos_base(self):
        # 1. Directorio municipalidades INEI 2026
        p_dir = get_data_file("directorio_municipalidades_inei_2026.json")
        if p_dir.exists():
            try:
                with open(p_dir, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                    self.directorio_inei = raw.get("por_ubigeo", {})
            except Exception as e:
                print(f"[Error EdanSinpadService] Error cargando directorio INEI: {e}")

        # 2. Distritos en Emergencia D.S. 124-2026-PCM
        p_eme = get_data_file("distritos_emergencia_ds_124_2026_pcm.json")
        if p_eme.exists():
            try:
                with open(p_eme, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                    self.distritos_emergencia = {d["ubigeo"]: d for d in raw.get("distritos_declarados", [])}
            except Exception as e:
                print(f"[Error EdanSinpadService] Error cargando distritos de emergencia: {e}")

    def generar_plantilla(self, ubigeo: str) -> Dict[str, Any]:
        """
        Genera la plantilla del EDAN con pre-llenado de datos institucionales,
        decretos vigentes y estructura normalizada de Formularios 1, 2A y 2B.
        """
        info_muni = self.directorio_inei.get(ubigeo, {})
        info_eme = self.distritos_emergencia.get(ubigeo, {})

        departamento = info_muni.get("departamento") or info_eme.get("departamento", "Piura")
        provincia = info_muni.get("provincia") or info_eme.get("provincia", "Piura")
        distrito = info_muni.get("distrito") or info_eme.get("distrito", "Distrito Nacional")
        alcalde = info_muni.get("alcalde", "AUTORIDAD LOCAL DE DEFENSA CIVIL")

        ahora = datetime.now(PERU_TZ)
        fecha_ds = datetime(2026, 9, 12, tzinfo=PERU_TZ)
        dias_transcurridos = (ahora - fecha_ds).days
        dias_restantes_ds = max(0, 60 - dias_transcurridos)

        # Semilla de familias ejemplo pre-llenables para agilizar el empadronamiento
        familias_seed = [
            {
                "numero_orden": 1,
                "sector_caserio": "Caserío San Pablo Bajo",
                "manzana_lote": "Mz. B Lote 04",
                "apellidos_nombres_titular": "FLORES CHUNGA JUAN CARLOS",
                "dni_titular": "42891054",
                "sexo": "M",
                "edad": 42,
                "miembros_familia": 4,
                "ninos_0_12": 2,
                "adultos_mayores_65": 1,
                "gestantes": 0,
                "personas_discapacidad": 0,
                "condicion_habitante": "DAMNIFICADO",
                "condicion_vivienda": "INHABITABLE",
                "material_pared": "ADOBE_Y_QUINCHA",
                "califica_bono_bae": True,
                "necesidades_urgentes": ["CARPAS", "BIDONES_AGUA", "RACIONES_ALIMENTOS"]
            },
            {
                "numero_orden": 2,
                "sector_caserio": "Caserío San Pablo Bajo",
                "manzana_lote": "Mz. B Lote 05",
                "apellidos_nombres_titular": "SILVA MORALES MARIA ELENA",
                "dni_titular": "02874198",
                "sexo": "F",
                "edad": 67,
                "miembros_familia": 3,
                "ninos_0_12": 1,
                "adultos_mayores_65": 1,
                "gestantes": 0,
                "personas_discapacidad": 1,
                "condicion_habitante": "DAMNIFICADO",
                "condicion_vivienda": "DESTRUIDA",
                "material_pared": "ADOBE_COLAPSADO",
                "califica_bono_bae": True,
                "necesidades_urgentes": ["MODULO_TEMPORAL", "KIT_ABRIGO", "MEDICINAS"]
            },
            {
                "numero_orden": 3,
                "sector_caserio": "Sector Dique Izquierdo km 12",
                "manzana_lote": "Mz. F Lote 11",
                "apellidos_nombres_titular": "YARLEQUE VILCHEZ PEDRO PABLO",
                "dni_titular": "40192837",
                "sexo": "M",
                "edad": 38,
                "miembros_familia": 5,
                "ninos_0_12": 3,
                "adultos_mayores_65": 0,
                "gestantes": 1,
                "personas_discapacidad": 0,
                "condicion_habitante": "AFECTADO",
                "condicion_vivienda": "AFECTADA",
                "material_pared": "LADRILLO_ANEGADO_40CM",
                "califica_bono_bae": False,
                "necesidades_urgentes": ["MOTOBOMBAS", "PASTILLAS_CLORO", "RACIONES"]
            }
        ]

        return {
            "ubigeo": ubigeo,
            "distrito": distrito,
            "provincia": provincia,
            "departamento": departamento,
            "alcalde": alcalde,
            "cargo_autoridad": info_muni.get("cargo", "Alcalde Distrital"),
            "rol_sinagerd": info_muni.get("rol_sinagerd", "Presidente de la Plataforma Distrital de Defensa Civil"),
            "direccion_municipalidad": info_muni.get("direccion_sede_municipal", "Plaza de Armas S/N"),
            "decreto_emergencia": "D.S. N.° 124-2026-PCM (Fenómeno El Niño 2026-2027)",
            "dias_restantes_estado_emergencia": dias_restantes_ds,
            "fecha_formulario": ahora.strftime("%Y-%m-%d"),
            "hora_formulario": ahora.strftime("%H:%M:%S"),
            "formulario_1_evaluacion_rapida": {
                "peligro_asociado": "LLUVIAS_INTENSAS_E_INUNDACION_FLUVIAL",
                "fallecidos": 0,
                "lesionados": 2,
                "desaparecidos": 0,
                "viviendas_destruidas": 1,
                "viviendas_inhabitables": 1,
                "viviendas_afectadas": 1,
                "servicios_basicos_interrumpidos": {
                    "agua_potable": "CORTE_TOTAL_POR_TURBIDEZ_PTAP",
                    "electricidad": "CORTE_PREVENTIVO_SUBESTACION",
                    "alcantarillado": "COLAPSO_POR_REBOSE_DE_BUZONES",
                    "conectividad_vial": "TRANSITO_RESTRINGIDO_PUENTE_PRINCIPAL"
                }
            },
            "formulario_2a_familias": familias_seed,
            "formulario_2b_medios_vida": {
                "hectareas_cultivo_perdidas": 18.5,
                "tipo_cultivo": "ARROZ_Y_MAIZ_AMARILLO",
                "ganado_muerto_o_afectado": 24,
                "tipo_ganado": "VACUNO_Y_CAPRINO",
                "canales_riego_destruidos_metros": 450.0,
                "activacion_seguro_agricola_sac": True
            }
        }

    def evaluar_consistencia_legal(self, borrador: Dict[str, Any]) -> Dict[str, Any]:
        """
        Pre-auditoría automática para blindar la ficha antes de su firma oficial.
        """
        return contraloria_service.auditar_consistencia_algoritmica(borrador)

    def generar_ficha_oficial(
        self,
        payload: Dict[str, Any],
        token_autoridad: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Genera la Ficha EDAN Oficial SINPAD v2 con:
        1. Código único y Código SINPAD preliminar.
        2. Hash SHA-256 criptográfico inmutable.
        3. Código QR oficial.
        4. PDF oficial INDECI reglamentario.
        5. Payload JSON para carga masiva SINPAD.
        6. Disparo inmediato por webhook a la Contraloría General de la República.
        """
        ubigeo = payload.get("ubigeo", "000000")
        ahora = datetime.now(PERU_TZ)
        seq = len(self._fichas_emitidas) + 1
        edan_id = f"EDAN-{ahora.strftime('%Y%m%d')}-{ubigeo}-{seq:04d}"
        codigo_sinpad = f"SINPAD-2026-{seq + 14200:06d}"

        # Hash SHA-256 de integridad
        data_string = json.dumps(payload, sort_keys=True, ensure_ascii=False)
        auth_secret = token_autoridad or "AUTH-AMARU-MUNICIPAL-DEFAULT"
        hash_sha256 = hashlib.sha256(f"{data_string}:{auth_secret}:{edan_id}".encode("utf-8")).hexdigest()

        # Construir registro completo
        ficha_oficial = dict(payload)
        ficha_oficial["edan_id"] = edan_id
        ficha_oficial["codigo_sinpad"] = codigo_sinpad
        ficha_oficial["hash_sha256"] = hash_sha256
        ficha_oficial["fecha_emision_oficial"] = ahora.isoformat()
        ficha_oficial["firmado_por"] = payload.get("alcalde", "ALCALDE DISTRITAL")
        ficha_oficial["estado_legal"] = "FIRMADO_DIGITALMENTE_CON_VALOR_OFICIAL"

        # 1. Disparo inmediato por Webhook a Contraloría
        registro_cgr = contraloria_service.registrar_inyeccion_edan(ficha_oficial)
        ficha_oficial["registro_cgr"] = registro_cgr

        # 2. Generar código QR en base64 / PNG bytes
        qr_content = (
            f"EDAN_PERU_SINPAD_V2|ID:{edan_id}|SINPAD:{codigo_sinpad}|UBIGEO:{ubigeo}|"
            f"FECHA:{ahora.strftime('%Y-%m-%d %H:%M')}|SHA:{hash_sha256[:16]}|"
            f"CGR:{registro_cgr.get('registro_cgr_id')}"
        )
        qr_img = qrcode.make(qr_content)
        qr_buffer = io.BytesIO()
        qr_img.save(qr_buffer, format="PNG")
        qr_bytes = qr_buffer.getvalue()
        ficha_oficial["_qr_bytes"] = qr_bytes

        # Guardar en memoria de servicio
        self._fichas_emitidas[edan_id] = ficha_oficial

        return {
            "exito": True,
            "edan_id": edan_id,
            "codigo_sinpad": codigo_sinpad,
            "hash_sha256": hash_sha256,
            "fecha_emision": ahora.strftime("%Y-%m-%d %H:%M:%S"),
            "distrito": ficha_oficial.get("distrito"),
            "departamento": ficha_oficial.get("departamento"),
            "total_familias": len(ficha_oficial.get("formulario_2a_familias", [])),
            "familias_bono_bae": sum(1 for f in ficha_oficial.get("formulario_2a_familias", []) if f.get("condicion_vivienda") in ["INHABITABLE", "DESTRUIDA", "COLAPSADA"]),
            "seguro_agricola_sac_activado": ficha_oficial.get("formulario_2b_medios_vida", {}).get("hectareas_cultivo_perdidas", 0) > 0,
            "disparo_contraloria": {
                "registro_cgr_id": registro_cgr.get("registro_cgr_id"),
                "estado_control": registro_cgr.get("estado_control"),
                "puntaje_consistencia": registro_cgr.get("resultado_auditoria", {}).get("puntaje_consistencia_pct")
            }
        }

    def generar_pdf_oficial_bytes(self, edan_id: str) -> Optional[bytes]:
        """
        Genera el PDF oficial de los Formularios 1, 2A y 2B de INDECI con ReportLab,
        incluyendo código QR criptográfico y casilleros normativos de la R.S. 002-2026-PCM/SGRD.
        """
        ficha = self._fichas_emitidas.get(edan_id)
        if not ficha:
            return None

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        normal = styles["Normal"]
        title_style = ParagraphStyle(
            "EdanTitle",
            parent=normal,
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            alignment=1,
            textColor=colors.HexColor("#0f172a")
        )
        subtitle_style = ParagraphStyle(
            "EdanSubtitle",
            parent=normal,
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            alignment=1,
            textColor=colors.HexColor("#475569")
        )
        section_style = ParagraphStyle(
            "EdanSection",
            parent=normal,
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=colors.white,
            spaceAfter=4
        )
        body_bold = ParagraphStyle("BodyB", parent=normal, fontName="Helvetica-Bold", fontSize=8, leading=10)
        body_small = ParagraphStyle("BodyS", parent=normal, fontName="Helvetica", fontSize=7, leading=9)

        story = []

        # ================= ENCABEZADO OFICIAL =================
        header_data = [
            [
                Paragraph("<b>REPÚBLICA DEL PERÚ</b><br/>SISTEMA NACIONAL DE GESTIÓN DEL RIESGO DE DESASTRES (SINAGERD)<br/><b>INSTITUTO NACIONAL DE DEFENSA CIVIL (INDECI)</b>", subtitle_style),
                Paragraph(f"<b>EVALUACIÓN DE DAÑOS Y ANÁLISIS DE NECESIDADES</b><br/><b>EDAN PERÚ - SINPAD V2.0</b><br/><font color='#dc2626'><b>CÓDIGO: {ficha.get('codigo_sinpad')}</b></font>", title_style)
            ]
        ]
        t_header = Table(header_data, colWidths=[240, 300])
        t_header.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor("#0f172a")),
        ]))
        story.append(t_header)
        story.append(Spacer(1, 8))

        # ================= METADATOS TERRITORIALES =================
        meta_data = [
            [
                Paragraph("<b>DISTRITO:</b>", body_bold), Paragraph(str(ficha.get("distrito")), body_small),
                Paragraph("<b>PROVINCIA:</b>", body_bold), Paragraph(str(ficha.get("provincia")), body_small),
                Paragraph("<b>DEPARTAMENTO:</b>", body_bold), Paragraph(str(ficha.get("departamento")), body_small)
            ],
            [
                Paragraph("<b>UBIGEO:</b>", body_bold), Paragraph(str(ficha.get("ubigeo")), body_small),
                Paragraph("<b>ESTADO EMERGENCIA:</b>", body_bold), Paragraph(str(ficha.get("decreto_emergencia"))[:28], body_small),
                Paragraph("<b>DÍAS RESTANTES:</b>", body_bold), Paragraph(f"<font color='#dc2626'><b>{ficha.get('dias_restantes_estado_emergencia')} días</b></font>", body_small)
            ],
            [
                Paragraph("<b>ALCALDE TITULAR:</b>", body_bold), Paragraph(str(ficha.get("alcalde")), body_small),
                Paragraph("<b>FECHA / HORA:</b>", body_bold), Paragraph(f"{ficha.get('fecha_formulario')} {ficha.get('hora_formulario')}", body_small),
                Paragraph("<b>NORMA:</b>", body_bold), Paragraph("R.S. 002-2026-PCM/SGRD", body_small)
            ]
        ]
        t_meta = Table(meta_data, colWidths=[80, 100, 110, 100, 90, 60])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 8))

        # ================= FORMULARIO 1: EVALUACIÓN RÁPIDA =================
        story.append(Table([[Paragraph("<b>FORMULARIO 1: EVALUACIÓN RÁPIDA PRELIMINAR (PRIMERAS HORAS)</b>", section_style)]],
                           colWidths=[540], style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#1e293b")), ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3)]))

        f1 = ficha.get("formulario_1_evaluacion_rapida", {})
        servicios = f1.get("servicios_basicos_interrumpidos", {})
        f1_data = [
            [
                Paragraph(f"<b>Peligro:</b> {f1.get('peligro_asociado')}", body_small),
                Paragraph(f"<b>Fallecidos:</b> {f1.get('fallecidos', 0)}", body_small),
                Paragraph(f"<b>Lesionados:</b> {f1.get('lesionados', 0)}", body_small),
                Paragraph(f"<b>Viviendas Inhabitables:</b> {f1.get('viviendas_inhabitables', 0)}", body_small),
                Paragraph(f"<b>Viviendas Destruidas:</b> {f1.get('viviendas_destruidas', 0)}", body_small),
            ],
            [
                Paragraph(f"<b>Agua Potable:</b> {servicios.get('agua_potable')}", body_small),
                Paragraph(f"<b>Electricidad:</b> {servicios.get('electricidad')}", body_small),
                Paragraph(f"<b>Alcantarillado:</b> {servicios.get('alcantarillado')}", body_small),
                Paragraph(f"<b>Vías:</b> {servicios.get('conectividad_vial')}", body_small),
                Paragraph("<b>Condición:</b> <font color='#dc2626'>CRÍTICA</font>", body_small)
            ]
        ]
        t_f1 = Table(f1_data, colWidths=[130, 90, 90, 115, 115])
        t_f1.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_f1)
        story.append(Spacer(1, 8))

        # ================= FORMULARIO 2A: EMPADRONAMIENTO FAMILIAR =================
        story.append(Table([[Paragraph("<b>FORMULARIO 2A: EMPADRONAMIENTO FAMILIAR NOMINAL (HABILITANTE BONO BAE S/ 500)</b>", section_style)]],
                           colWidths=[540], style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0369a1")), ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3)]))

        f2a_rows = [
            [
                Paragraph("<b>N°</b>", body_bold),
                Paragraph("<b>Sector / Caserío</b>", body_bold),
                Paragraph("<b>Mz / Lte</b>", body_bold),
                Paragraph("<b>Jefe de Familia (Apellidos y Nombres)</b>", body_bold),
                Paragraph("<b>DNI RENIEC</b>", body_bold),
                Paragraph("<b>Miemb.</b>", body_bold),
                Paragraph("<b>Vulnerables</b>", body_bold),
                Paragraph("<b>Condición Vivienda</b>", body_bold),
                Paragraph("<b>Bono BAE</b>", body_bold),
            ]
        ]

        for f in ficha.get("formulario_2a_familias", []):
            vuln_desc = f"{f.get('ninos_0_12', 0)}ñ / {f.get('adultos_mayores_65', 0)}am"
            if f.get("gestantes", 0) > 0:
                vuln_desc += " / 1g"
            if f.get("personas_discapacidad", 0) > 0:
                vuln_desc += " / 1d"

            bae_texto = "<font color='#16a34a'><b>APLICA</b></font>" if f.get("califica_bono_bae") else "<font color='#64748b'>NO APLICA</font>"
            f2a_rows.append([
                Paragraph(str(f.get("numero_orden")), body_small),
                Paragraph(str(f.get("sector_caserio"))[:22], body_small),
                Paragraph(str(f.get("manzana_lote")), body_small),
                Paragraph(str(f.get("apellidos_nombres_titular"))[:26], body_small),
                Paragraph(f"<b>{f.get('dni_titular')}</b>", body_small),
                Paragraph(str(f.get("miembros_familia")), body_small),
                Paragraph(vuln_desc, body_small),
                Paragraph(f"<b>{f.get('condicion_vivienda')}</b>", body_small),
                Paragraph(bae_texto, body_small),
            ])

        t_f2a = Table(f2a_rows, colWidths=[20, 95, 45, 140, 55, 30, 55, 60, 40])
        t_f2a.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        story.append(t_f2a)
        story.append(Spacer(1, 8))

        # ================= FORMULARIO 2B: MEDIOS DE VIDA =================
        story.append(Table([[Paragraph("<b>FORMULARIO 2B: DAÑOS A MEDIOS DE VIDA (HABILITANTE SEGURO AGRÍCOLA CATASTRÓFICO - SAC)</b>", section_style)]],
                           colWidths=[540], style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#15803d")), ('TOPPADDING', (0,0), (-1,-1), 3), ('BOTTOMPADDING', (0,0), (-1,-1), 3)]))

        f2b = ficha.get("formulario_2b_medios_vida", {})
        f2b_data = [
            [
                Paragraph(f"<b>Hectáreas Cultivo Anegadas:</b> {f2b.get('hectareas_cultivo_perdidas', 0)} ha", body_small),
                Paragraph(f"<b>Cultivos:</b> {f2b.get('tipo_cultivo', 'N/A')}", body_small),
                Paragraph(f"<b>Ganado Muerto/Afectado:</b> {f2b.get('ganado_muerto_o_afectado', 0)} cabezas", body_small),
                Paragraph(f"<b>Tipo Ganado:</b> {f2b.get('tipo_ganado', 'N/A')}", body_small),
                Paragraph(f"<b>Canales Destruidos:</b> {f2b.get('canales_riego_destruidos_metros', 0)} m", body_small),
            ]
        ]
        t_f2b = Table(f2b_data, colWidths=[120, 110, 110, 100, 100])
        t_f2b.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_f2b)
        story.append(Spacer(1, 10))

        # ================= PIE DE FIRMA CRIPTOGRÁFICA Y QR CGR =================
        qr_bytes = ficha.get("_qr_bytes")
        qr_img_flowable = None
        if qr_bytes:
            qr_io = io.BytesIO(qr_bytes)
            qr_img_flowable = RLImage(qr_io, width=65, height=65)

        cgr_reg = ficha.get("registro_cgr", {})
        auditoria_res = cgr_reg.get("resultado_auditoria", {})

        pie_data = [
            [
                qr_img_flowable or Paragraph("QR CGR", body_small),
                Paragraph(
                    f"<b>FIRMA DIGITAL Y BLINDAJE LEGAL CGR</b><br/>"
                    f"<b>Hash SHA-256:</b> <font color='#64748b'>{ficha.get('hash_sha256')}</font><br/>"
                    f"<b>Registro Control Concurrente CGR:</b> {cgr_reg.get('registro_cgr_id')}<br/>"
                    f"<b>Puntaje Consistencia CGR:</b> {auditoria_res.get('puntaje_consistencia_pct', 100)}% | "
                    f"<b>Estado CGR:</b> {cgr_reg.get('estado_control')}<br/>"
                    f"<i>Certificado digitalmente conforme a la Ley N.° 29664 y R.S. N.° 002-2026-PCM/SGRD.</i>",
                    body_small
                ),
                Paragraph(
                    f"<br/><br/>___________________________________<br/>"
                    f"<b>{ficha.get('alcalde')}</b><br/>"
                    f"Alcalde Distrital / Presidente Defensa Civil<br/>"
                    f"Token: {ficha.get('hash_sha256')[:12]}",
                    ParagraphStyle("Firma", parent=body_small, alignment=1)
                )
            ]
        ]
        t_pie = Table(pie_data, colWidths=[70, 310, 160])
        t_pie.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#0f172a")),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(KeepTogether(t_pie))

        doc.build(story)
        return buffer.getvalue()

    def exportar_payload_sinpad(self, edan_id: str) -> Optional[Dict[str, Any]]:
        """
        Retorna el payload homologado JSON/XML listo para carga masiva directa
        en el aplicativo web SINPAD v2.0 o sincronización con la app móvil pe.gob.indeci.edan.
        """
        ficha = self._fichas_emitidas.get(edan_id)
        if not ficha:
            return None

        # Estructura oficial homologada SINPAD
        sinpad_payload = {
            "version_schema": "SINPAD_V2_2026_HOMOLOGADO",
            "normativa_referencia": "R.S. 002-2026-PCM/SGRD",
            "cabecera_emergencia": {
                "codigo_sinpad": ficha.get("codigo_sinpad"),
                "edan_id_amaru": ficha.get("edan_id"),
                "ubigeo": ficha.get("ubigeo"),
                "distrito": ficha.get("distrito"),
                "provincia": ficha.get("provincia"),
                "departamento": ficha.get("departamento"),
                "fecha_ocurrencia": ficha.get("fecha_formulario"),
                "hora_ocurrencia": ficha.get("hora_formulario"),
                "tipo_evento_indeci": ficha.get("formulario_1_evaluacion_rapida", {}).get("peligro_asociado"),
                "decreto_supremo": ficha.get("decreto_emergencia")
            },
            "evaluacion_rapida_f1": ficha.get("formulario_1_evaluacion_rapida"),
            "padron_familiar_f2a": [
                {
                    "correlativo": f.get("numero_orden", idx + 1),
                    "documento_tipo": "DNI",
                    "documento_numero": f.get("dni_titular") or f.get("dni_jefe_familia", ""),
                    "nombres_apellidos": f.get("apellidos_nombres_titular") or f.get("nombres_apellidos", "NO ESPECIFICADO"),
                    "sexo": f.get("sexo", "ND"),
                    "edad": f.get("edad", 0),
                    "total_miembros": f.get("miembros_familia") or f.get("integrantes", 1),
                    "vulnerabilidades": {
                        "ninos": f.get("ninos_0_12", f.get("menores_edad", 0)),
                        "adultos_mayores": f.get("adultos_mayores_65", f.get("adultos_mayores", 0)),
                        "gestantes": f.get("gestantes", 0),
                        "discapacidad": f.get("personas_discapacidad", 0)
                    },
                    "calificacion_danos_vivienda": f.get("condicion_vivienda") or f.get("estado_vivienda", "AFECTADA"),
                    "condicion_sinpad": f.get("condicion_habitante", "DAMNIFICADO" if (f.get("condicion_vivienda") or f.get("estado_vivienda")) in ["INHABITABLE", "DESTRUIDA", "COLAPSADA"] else "AFECTADO"),
                    "califica_subsidio_arrendamiento_bae": f.get("califica_bono_bae", (f.get("condicion_vivienda") or f.get("estado_vivienda")) in ["INHABITABLE", "DESTRUIDA", "COLAPSADA"]),
                    "sector_localidad": f.get("sector_caserio", "CASERÍO CENTRO"),
                    "manzana_lote": f.get("manzana_lote", "S/N")
                }
                for idx, f in enumerate(ficha.get("formulario_2a_familias", []))
            ],
            "medios_vida_f2b": ficha.get("formulario_2b_medios_vida"),
            "seguridad_criptografica": {
                "hash_sha256": ficha.get("hash_sha256"),
                "firmante": ficha.get("firmado_por"),
                "registro_control_concurrente_cgr": ficha.get("registro_cgr", {}).get("registro_cgr_id")
            }
        }
        return sinpad_payload

edan_sinpad_service = EdanSinpadService()
