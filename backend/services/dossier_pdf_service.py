# backend/services/dossier_pdf_service.py
"""
Servicio Generador de Dossiers Ejecutivos en PDF Oficial (Módulo 4.1 - Fase 4)
Produce documentos PDF A4 institucionales de alta fidelidad para sustento técnico-legal
de contrataciones directas por emergencia y declaratorias distritales ante el FEN 2026-2027.
Incluye:
- Sello criptográfico QR con Hash SHA-256 de verificación pública.
- Cono de análogos meteorológicos y Factor Multiplicador M_FEN.
- Catálogo de puentes e infraestructura en riesgo según memoria CAF.
- Vistos y considerandos legales de AMARU-LEX (D.S. 124-2026-PCM, Ley 30225).
- Anexo de Control Preventivo Concurrente según criterios de la Contraloría (CGR).
- Bloque formal de firmas del Alcalde y Secretario Técnico de Defensa Civil.
"""

import os
import io
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional

import qrcode
from PIL import Image as PILImage

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

from services.historical_data_service import historical_service
from services.historical_analog_engine import analog_engine
from services.legal_framework_service import legal_service


class NumberedCanvas(canvas.Canvas):
    """
    Canvas personalizado para paginación dinámica 'Página X de Y',
    membrete de corrida y pie de página de blindaje legal SINAGERD.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 7)
        self.setFillColor(colors.HexColor("#4A5568"))

        # Encabezado secundario en páginas posteriores a la portada
        if self._pageNumber > 1:
            self.drawString(36, 810, "SISTEMA COEN DIGITAL | INFORME TÉCNICO OFICIAL DE GESTIÓN DEL RIESGO (FASE 4)")
            self.drawRightString(A4[0] - 36, 810, f"D.S. Nº 124-2026-PCM | EXPEDIENTE GRD-FEN-2026")
            self.setStrokeColor(colors.HexColor("#CBD5E0"))
            self.setLineWidth(0.5)
            self.line(36, 804, A4[0] - 36, 804)

        # Pie de página inmutable
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(36, 32, A4[0] - 36, 32)
        
        self.drawString(36, 22, "Documento Técnico Oficial bajo el amparo de la Ley Nº 29664 (SINAGERD) y D.S. Nº 124-2026-PCM.")
        self.drawRightString(A4[0] - 36, 22, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()


class DossierPDFService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Configuración de tipografía y estilos institucionales."""
        self.style_title = ParagraphStyle(
            'DocTitle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#1A202C"),
            alignment=1  # Centrado
        )
        self.style_subtitle = ParagraphStyle(
            'DocSubtitle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#7B1113"),  # Carmesí institucional
            alignment=1
        )
        self.style_h1 = ParagraphStyle(
            'SectionH1',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#1A365D"),  # Azul institucional
            spaceBefore=8,
            spaceAfter=4
        )
        self.style_body = ParagraphStyle(
            'BodyRegular',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#2D3748")
        )
        self.style_body_bold = ParagraphStyle(
            'BodyBold',
            parent=self.style_body,
            fontName='Helvetica-Bold'
        )
        self.style_badge_red = ParagraphStyle(
            'BadgeRed',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#991B1B"),
            alignment=1
        )
        self.style_badge_orange = ParagraphStyle(
            'BadgeOrange',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#C05621"),
            alignment=1
        )
        self.style_legal_notice = ParagraphStyle(
            'LegalNotice',
            parent=self.styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#4A5568")
        )
        self.style_table_header = ParagraphStyle(
            'TableHeader',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7.5,
            leading=9,
            textColor=colors.white,
            alignment=1
        )
        self.style_table_cell = ParagraphStyle(
            'TableCell',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=7.5,
            leading=9.5,
            textColor=colors.HexColor("#1A202C")
        )

    def _generate_qr_image(self, verify_url: str) -> RLImage:
        """Genera un código QR en memoria y lo devuelve como flowable de ReportLab."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=4,
            border=1
        )
        qr.add_data(verify_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#1A202C", back_color="white")

        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        return RLImage(img_byte_arr, width=2.4 * cm, height=2.4 * cm)

    async def generate_dossier_pdf(
        self,
        ubigeo: str,
        alcalde_nombre: str = "Sr. Alcalde Distrital",
        secretario_nombre: str = "Ing. Secretario Técnico GRD",
        cip_registro: str = "CIP Nº 189423 / Reg. CENEPRED Nº 0042",
        incluir_resolucion: bool = True
    ) -> Dict[str, Any]:
        """
        Genera el Dossier Ejecutivo en PDF Oficial para un distrito específico.
        Retorna el stream de bytes PDF, el Hash SHA-256 generado y metadatos.
        """
        # 1. Obtener Memoria Histórica del Distrito
        distrito_data = historical_service.get_historical_district_memory(ubigeo)
        if not distrito_data:
            distrito_data = historical_service.get_district_full_profile(ubigeo)

        distrito_nombre = distrito_data.get("distrito") or distrito_data.get("nombre") or f"Distrito {ubigeo}"
        departamento = distrito_data.get("departamento") or "LIMA"
        provincia = distrito_data.get("provincia") or "LIMA"
        comisarias_pnp = distrito_data.get("comisarias_pnp") or historical_service.get_comisarias_por_ubigeo(ubigeo)
        albergues_minedu = distrito_data.get("albergues_temporales_indeci") or historical_service.get_albergues_temporales_indeci(ubigeo)
        muni_inei = distrito_data.get("autoridad_municipal_inei") or historical_service.get_municipalidad_por_ubigeo(ubigeo) or {}
        alcalde_titular = muni_inei.get("alcalde", "ALCALDE EN FUNCIONES")
        cargo_titular = muni_inei.get("cargo", "Alcalde Distrital")
        sede_municipal = muni_inei.get("direccion_sede_municipal", "Palacio Municipal")

        # 2. Evaluar Motor Predictivo de Análogos Atmosféricos
        eval_analogo = await analog_engine.evaluate_district_analog(ubigeo)
        dia_critico = eval_analogo.get("dia_critico_evaluado", {})
        horizonte = eval_analogo.get("horizonte_evaluado_7dias", [])
        cuenca_info = eval_analogo.get("cuenca_estrategica", {})
        puentes_vulnerables = [
            i for i in eval_analogo.get("infraestructura_amenazada_caf", [])
            if i.get("tipo") == "PUENTE_VULNERABLE"
        ]

        # 3. Extraer Estado Legal AMARU-LEX
        legal_status = legal_service.get_district_legal_status(
            ubigeo,
            distrito_nombre=distrito_nombre,
            departamento=departamento
        )
        decreto_base = legal_status.get("decreto_base", "D.S. Nº 124-2026-PCM")
        facultades = legal_status.get("facultades_otorgadas", [])

        # 4. Cálculo Criptográfico SHA-256 Inmutable
        now = datetime.now()
        fecha_emision_str = now.strftime("%d/%m/%Y %H:%M:%S")
        fecha_corta = now.strftime("%d/%m/%Y")
        correlativo_inf = f"{now.strftime('%m%d')}-2026-MD{distrito_nombre.upper()[:3]}/GGRD"

        lluvia_extrema = dia_critico.get("lluvia_extrema_estimada_mm", 0.0)
        factor_fen = dia_critico.get("factor_amplificacion_fen", 1.0)
        lead_time = dia_critico.get("horas_anticipacion", 48)
        similitud_pct = dia_critico.get("similitud_analoga_pct", 0.0)
        analogo_nombre = dia_critico.get("evento_analogo_referencia", "Patrón FEN Histórico")
        nivel_alerta = dia_critico.get("nivel_alerta_anticipada", "NARANJA")

        raw_payload = f"{ubigeo}|{distrito_nombre}|{correlativo_inf}|{fecha_emision_str}|{lluvia_extrema}|{factor_fen}|{len(puentes_vulnerables)}"
        sha256_hash = hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

        verify_url = f"https://coen.gob.pe/verificar?doc={sha256_hash[:16]}&ubigeo={ubigeo}"
        qr_flowable = self._generate_qr_image(verify_url)

        # 5. Construcción del Documento ReportLab
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=40,
            rightMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        elements = []

        # =====================================================================
        # ENCABEZADO INSTITUCIONAL Y SELLO QR
        # =====================================================================
        header_table_data = [
            [
                Paragraph(
                    f"<b>MUNICIPALIDAD DISTRITAL DE {distrito_nombre.upper()}</b><br/>"
                    f"<font size=7 color='#4A5568'>PLATAFORMA DISTRITAL DE DEFENSA CIVIL • GT-GRD (LEY Nº 29664)</font><br/>"
                    f"<font size=6.5 color='#2D3748'><b>TITULAR (INEI 2026):</b> {alcalde_titular.upper()} ({cargo_titular.upper()})</font><br/>"
                    f"<font size=6.5 color='#718096'>PROVINCIA: {provincia.upper()} | DEPARTAMENTO: {departamento.upper()} | UBIGEO: {ubigeo} | SEDE COED: {sede_municipal.upper()}</font><br/>"
                    f"<font size=7 color='#7B1113'><b>AMPARO: {decreto_base.upper()} - LEY Nº 29664 (SINAGERD)</b></font>",
                    self.style_body
                ),
                qr_flowable,
                Paragraph(
                    f"<b>SELLO QR OFICIAL</b><br/>"
                    f"<font size=6.5 color='#4A5568'>Verificación Pública Inmutable</font><br/>"
                    f"<font size=6 color='#718096'><b>SHA-256:</b><br/>{sha256_hash[:20]}...</font><br/>"
                    f"<font size=6 color='#2B6CB0'>coen.gob.pe/verificar</font>",
                    self.style_body
                )
            ]
        ]
        t_header = Table(header_table_data, colWidths=[10.5 * cm, 2.6 * cm, 4.4 * cm])
        t_header.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(t_header)
        elements.append(Spacer(1, 4 * mm))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#7B1113"), spaceBefore=0, spaceAfter=4))

        # TÍTULO DEL INFORME
        elements.append(Paragraph(f"INFORME TÉCNICO VINCULANTE Nº {correlativo_inf}", self.style_title))
        elements.append(Paragraph("EVALUACIÓN PREDICTIVA DE AMENAZA FEN, CONO DE ANÁLOGOS Y SUSTENTO PARA CONTRATACIÓN DIRECTA DE EMERGENCIA", self.style_subtitle))
        elements.append(Spacer(1, 3 * mm))

        # =====================================================================
        # RESUMEN EJECUTIVO DE CRITICIDAD Y SEMÁFORO
        # =====================================================================
        alert_style = self.style_badge_red if nivel_alerta == "ROJA" else self.style_badge_orange
        crit_box_data = [
            [
                Paragraph(f"<b>NIVEL DE AMENAZA:</b><br/>{nivel_alerta}", alert_style),
                Paragraph(f"<b>LEAD TIME (ANTICIPACIÓN):</b><br/>{lead_time} Horas", self.style_body_bold),
                Paragraph(f"<b>LLUVIA EXTREMA FEN:</b><br/>{lluvia_extrema} mm/24h", self.style_body_bold),
                Paragraph(f"<b>FACTOR AMPLIFICACIÓN:</b><br/>x{factor_fen} (M_FEN)", self.style_body_bold),
                Paragraph(f"<b>SIMILITUD HISTÓRICA:</b><br/>{similitud_pct}%", self.style_body_bold),
            ]
        ]
        bg_crit = colors.HexColor("#FED7D7") if nivel_alerta == "ROJA" else colors.HexColor("#FEEBC8")
        border_crit = colors.HexColor("#E53E3E") if nivel_alerta == "ROJA" else colors.HexColor("#DD6B20")
        t_crit = Table(crit_box_data, colWidths=[3.5 * cm, 3.5 * cm, 3.5 * cm, 3.5 * cm, 3.5 * cm])
        t_crit.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_crit),
            ('BOX', (0, 0), (-1, -1), 1, border_crit),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_crit)
        elements.append(Spacer(1, 3 * mm))

        # =====================================================================
        # SECCIÓN 1: DIAGNÓSTICO METEOROLÓGICO Y CONO DE ANÁLOGOS ATMOSFÉRICOS
        # =====================================================================
        elements.append(Paragraph("1. DIAGNÓSTICO METEOROLÓGICO Y SIMILITUD DE ANÁLOGOS ATMOSFÉRICOS", self.style_h1))
        
        desc_analogo = (
            f"La telemetría viva provista por el modelo numérico ECMWF IFS 9km (Open-Meteo Pro) cruzada "
            f"con el Catálogo Maestro FEN (CAF / SENAMHI / CENEPRED) determina que la atmósfera proyectada para las "
            f"próximas {lead_time} horas en la cuenca <b>{cuenca_info.get('nombre', 'Local')}</b> presenta un "
            f"grado de coincidencia del <b>{similitud_pct}%</b> con el evento análogo <b>{analogo_nombre}</b>. "
            f"Debido a la orografía y el debilitamiento de vientos alisios, se aplica el <b>Factor Multiplicador M_FEN de {factor_fen}</b> "
            f"sobre la lluvia base pronosticada ({dia_critico.get('lluvia_proyectada_openmeteo_mm', 0)} mm), "
            f"arrojando una estimación de impacto extremo de <b>{lluvia_extrema} mm/24h</b>."
        )
        elements.append(Paragraph(desc_analogo, self.style_body))
        elements.append(Spacer(1, 2 * mm))

        # Tabla del horizonte de 7 días
        horizonte_table_data = [
            [
                Paragraph("<b>Día</b>", self.style_table_header),
                Paragraph("<b>Fecha</b>", self.style_table_header),
                Paragraph("<b>Horas Ant.</b>", self.style_table_header),
                Paragraph("<b>T. Max / Min</b>", self.style_table_header),
                Paragraph("<b>Lluvia ECMWF</b>", self.style_table_header),
                Paragraph("<b>Factor M_FEN</b>", self.style_table_header),
                Paragraph("<b>Lluvia Est. FEN</b>", self.style_table_header),
                Paragraph("<b>Alerta</b>", self.style_table_header)
            ]
        ]
        for d in horizonte[:6]:
            color_alerta = colors.HexColor("#E53E3E") if d.get("nivel_alerta_anticipada") == "ROJA" else (
                colors.HexColor("#DD6B20") if d.get("nivel_alerta_anticipada") == "NARANJA" else colors.HexColor("#319795")
            )
            horizonte_table_data.append([
                Paragraph(f"Día +{d.get('dia_numero')}", self.style_table_cell),
                Paragraph(f"{d.get('fecha')} ({d.get('dia_semana')})", self.style_table_cell),
                Paragraph(f"{d.get('horas_anticipacion')}h", self.style_table_cell),
                Paragraph(f"{d.get('temperatura_max')}° / {d.get('temperatura_min')}°", self.style_table_cell),
                Paragraph(f"{d.get('lluvia_proyectada_openmeteo_mm')} mm", self.style_table_cell),
                Paragraph(f"x{d.get('factor_amplificacion_fen')}", self.style_table_cell),
                Paragraph(f"<b>{d.get('lluvia_extrema_estimada_mm')} mm</b>", self.style_table_cell),
                Paragraph(f"<b><font color='{color_alerta.hexval()}'>{d.get('nivel_alerta_anticipada')}</font></b>", self.style_table_cell)
            ])

        t_horizonte = Table(horizonte_table_data, colWidths=[1.8 * cm, 2.7 * cm, 1.8 * cm, 2.5 * cm, 2.3 * cm, 2.0 * cm, 2.3 * cm, 2.1 * cm])
        t_horizonte.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1A365D")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ]))
        elements.append(t_horizonte)
        elements.append(Spacer(1, 3 * mm))

        # =====================================================================
        # SECCIÓN 2: PUENTES E INFRAESTRUCTURA CRÍTICA EN RIESGO SEVERO (CAF)
        # =====================================================================
        elements.append(Paragraph("2. INVENTARIO DE PUENTES E INFRAESTRUCTURA CRÍTICA EN RIESGO (CAF / CENEPRED)", self.style_h1))
        
        if puentes_vulnerables:
            puentes_data = [
                [
                    Paragraph("<b>Infraestructura / Puente</b>", self.style_table_header),
                    Paragraph("<b>Tipo Estructural</b>", self.style_table_header),
                    Paragraph("<b>Peligro Físico Documentado (Memoria CAF)</b>", self.style_table_header),
                    Paragraph("<b>Acción Operativa Requerida</b>", self.style_table_header)
                ]
            ]
            for p in puentes_vulnerables[:4]:
                puentes_data.append([
                    Paragraph(f"<b>{p.get('nombre', 'Puente Estratégico')}</b>", self.style_table_cell),
                    Paragraph("Viga Concreto / Metálico", self.style_table_cell),
                    Paragraph(p.get("riesgo_historico", "Socavación severa de estribos y sobrepaso de rasante."), self.style_table_cell),
                    Paragraph("Enrocado de protección y cierre preventivo de vía pesada.", self.style_table_cell)
                ])
            t_puentes = Table(puentes_data, colWidths=[4.2 * cm, 3.2 * cm, 5.8 * cm, 4.3 * cm])
            t_puentes.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#7B1113")),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
                ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ]))
            elements.append(t_puentes)
        else:
            elements.append(Paragraph("No se registran puentes vulnerables con daño histórico inminente en el cauce principal; sin embargo, se recomienda vigilancia en badenes y quebradas tributarias.", self.style_body))
        
        elements.append(Spacer(1, 3 * mm))

        # =====================================================================
        # SECCIÓN 3: DISPOSITIVO POLICIAL Y ALBERGUES TEMPORALES (PNP / MINEDU / LEY 29664)
        # =====================================================================
        elements.append(Paragraph("3. DISPOSITIVO DE SEGURIDAD Y ALBERGUES TEMPORALES (PNP / MINEDU / LEY 29664)", self.style_h1))
        
        if comisarias_pnp:
            comi_primaria = comisarias_pnp[0]
            desc_pnp = (
                f"De conformidad con el <b>Artículo 67 de la Ley Nº 29664 (SINAGERD)</b> y el D.S. Nº 012-2025-IN, "
                f"la custodia del orden público, la seguridad perimetral en albergues y la ejecución inmediata del cierre "
                f"preventivo de puentes y vías ante semáforo aluvial/fluvial ROJO quedan asignados a la "
                f"<b>{comi_primaria.get('nombre')}</b> (Código Oficial PNP: <b>{comi_primaria.get('cod_cpnp')}</b>, "
                f"Categoría: <b>Tipo {comi_primaria.get('tipo_comisaria')}</b>), articulando la evacuación ciudadana en "
                f"<b>{comi_primaria.get('sectores_patrullaje_cuadrante', 3)} sectores tácticos de patrullaje</b>."
            )
            elements.append(Paragraph(desc_pnp, self.style_body))
        else:
            elements.append(Paragraph("La coordinación de seguridad, control del orden público y cierre de vías se canaliza a través de la División Policial de la jurisdicción provincial respectiva.", self.style_body))
        
        if albergues_minedu:
            elements.append(Spacer(1, 1.5 * mm))
            elements.append(Paragraph("<b>Albergues Temporales Habilitados (Padrón Oficial MINEDU / ESCALE - SIGMED 2026):</b>", self.style_body))
            alb_data = [
                [
                    Paragraph("<b>Cód. Local</b>", self.style_table_header),
                    Paragraph("<b>Institución Educativa (I.E.)</b>", self.style_table_header),
                    Paragraph("<b>Nivel / Modalidad</b>", self.style_table_header),
                    Paragraph("<b>Dirección Oficial</b>", self.style_table_header),
                    Paragraph("<b>Custodia Policial</b>", self.style_table_header)
                ]
            ]
            comi_nombre = comisarias_pnp[0].get("nombre", "Comisaría PNP") if comisarias_pnp else "Comisaría PNP Sector"
            for alb in albergues_minedu[:3]:
                alb_data.append([
                    Paragraph(str(alb.get("codigo_local", "N/A")), self.style_table_cell),
                    Paragraph(f"<b>{alb.get('nombre_ie', 'I.E.')[:28]}</b>", self.style_table_cell),
                    Paragraph(str(alb.get("nivel_modalidad", "Primaria/Secundaria"))[:20], self.style_table_cell),
                    Paragraph(str(alb.get("direccion", "Urbano"))[:32], self.style_table_cell),
                    Paragraph(comi_nombre[:22], self.style_table_cell)
                ])
            t_alb = Table(alb_data, colWidths=[2.2 * cm, 4.8 * cm, 3.2 * cm, 4.3 * cm, 3.0 * cm])
            t_alb.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2B6CB0")),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
                ('TOPPADDING', (0, 0), (-1, -1), 2),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ]))
            elements.append(t_alb)

        elements.append(Spacer(1, 2 * mm))

        # =====================================================================
        # SECCIÓN 4: MARCO LEGAL Y AMPARO PARA CONTRATACIÓN DIRECTA (AMARU-LEX)
        # =====================================================================
        elements.append(Paragraph("4. BLINDAJE LEGAL Y FACULTADES VINCULANTES (AMARU-LEX)", self.style_h1))
        
        legal_text = (
            f"El distrito de <b>{distrito_nombre}</b> se encuentra comprendido dentro de la declaratoria de "
            f"<b>{decreto_base}</b>. De conformidad con el <b>Artículo 27 literal b) del Texto Único Ordenado de la Ley Nº 30225</b> "
            f"(Ley de Contrataciones del Estado) y el <b>Artículo 100 de su Reglamento</b>, la presente entidad pública "
            f"queda legalmente facultada para contratar de forma directa con un proveedor determinado los servicios de "
            f"maquinaria pesada, combustible diésel y materiales de defensa ribereña, dispensando el concurso público regular.<br/>"
            f"<b>Plazo de Regularización:</b> Las actuaciones contractuales e informes sustentatorios se regularizan ante el "
            f"SEACE dentro de los diez (10) días hábiles siguientes a la entrega de la prestación o inicio del servicio."
        )
        elements.append(Paragraph(legal_text, self.style_body))
        elements.append(Spacer(1, 2 * mm))

        # =====================================================================
        # SECCIÓN 5: ANEXO DE CONTROL PREVENTIVO CONCURRENTE (CRITERIOS CGR)
        # =====================================================================
        elements.append(Paragraph("5. CRITERIOS DE CONTROL PREVENTIVO CONCURRENTE (INFORME Nº 10671-2026-CG/AGR-SOP)", self.style_h1))
        
        cgr_warning = (
            "<b>ADVERTENCIA DE RESPONSABILIDAD FUNCIONAL (CONTRALORÍA GENERAL DE LA REPÚBLICA):</b><br/>"
            "El Operativo Nacional de Control Concurrente 2026 determinó que el 58% de Fichas de la ANA no fueron gestionadas, "
            "configurando omisión de funciones bajo la Ley Nº 29664. Con la emisión del presente informe y la movilización de recursos, "
            "la Municipalidad acredita debida diligencia previa ante el Órgano de Control Institucional (OCI).<br/>"
            "• <b>Trazabilidad de Combustible:</b> Todo abastecimiento de diésel B5 exigirá fotocomprobante de horómetro diario.<br/>"
            "• <b>Geoseguimiento:</b> La maquinaria pesada operará con geolocalización activa registrada en el sistema COEN Digital."
        )
        t_cgr_data = [[Paragraph(cgr_warning, self.style_legal_notice)]]
        t_cgr = Table(t_cgr_data, colWidths=[17.5 * cm])
        t_cgr.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EDF2F7")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#4A5568")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t_cgr)
        elements.append(Spacer(1, 5 * mm))

        # =====================================================================
        # SECCIÓN 6: BLOQUE OFICIAL DE FIRMAS Y SUSCRIPCIÓN
        # =====================================================================
        elements.append(KeepTogether([
            Paragraph("6. SUSCRIPCIÓN Y APROBACIÓN TÉCNICA", self.style_h1),
            Spacer(1, 10 * mm),
            Table(
                [
                    [
                        Paragraph(
                            "________________________________________<br/>"
                            f"<b>{alcalde_nombre.upper()}</b><br/>"
                            f"Alcalde de la Municipalidad Distrital de {distrito_nombre}<br/>"
                            "Presidente de la Plataforma de Defensa Civil",
                            ParagraphStyle('SignL', parent=self.style_body, alignment=1)
                        ),
                        Paragraph(
                            "________________________________________<br/>"
                            f"<b>{secretario_nombre.upper()}</b><br/>"
                            "Subgerente de Gestión del Riesgo de Desastres<br/>"
                            f"<font size=7 color='#4A5568'>{cip_registro}</font>",
                            ParagraphStyle('SignR', parent=self.style_body, alignment=1)
                        )
                    ]
                ],
                colWidths=[8.7 * cm, 8.8 * cm]
            )
        ]))

        # Construir el PDF con NumberedCanvas
        doc.build(elements, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return {
            "ubigeo": ubigeo,
            "distrito": distrito_nombre,
            "correlativo": correlativo_inf,
            "sha256_hash": sha256_hash,
            "verify_url": verify_url,
            "pdf_bytes": pdf_bytes,
            "tamanio_bytes": len(pdf_bytes),
            "nivel_alerta": nivel_alerta,
            "lead_time": lead_time,
            "lluvia_extrema_mm": lluvia_extrema,
            "puentes_en_riesgo": len(puentes_vulnerables),
            "fecha_emision": fecha_emision_str
        }


# Instancia singleton accesible globalmente
dossier_service = DossierPDFService()
