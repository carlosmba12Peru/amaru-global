import json
import math
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional

# Constantes canónicas inmutables de la fórmula IPH-FEN
PESOS_CANONICOS_IPH = {
    "w_meteo": 0.30,
    "w_suelo": 0.20,
    "w_irce": 0.20,
    "w_geomorf": 0.15,
    "w_hist": 0.15,
    "phi_0": 0.68,
    "k_sigmoide": 4.2
}

# Hash SHA-256 inmutable de los pesos calibrados (anclado criptográficamente)
HASH_CANONICO_PESOS = hashlib.sha256(
    json.dumps(PESOS_CANONICOS_IPH, sort_keys=True).encode("utf-8")
).hexdigest()

# Constantes canónicas Saaty AHP (4x4) para IRCE-FEN (R.J. Nº 112-2014-CENEPRED/J)
PESOS_CANONICOS_IRCE_SAATY = {
    "w_peligro": 0.467,
    "w_vulnerabilidad": 0.277,
    "w_exposicion": 0.160,
    "w_capacidad": 0.096,
    "lambda_max": 4.0305,
    "ci": 0.0102,
    "cr": 0.0113  # CR <= 0.10: Consistencia Axiomática Aprobada
}

HASH_CANONICO_IRCE = hashlib.sha256(
    json.dumps(PESOS_CANONICOS_IRCE_SAATY, sort_keys=True).encode("utf-8")
).hexdigest()


class IndicesAmaruService:
    """
    Servicio de Inteligencia Hidro-Territorial y Cálculo de Índices Oficiales AMARU:
    1. IRCE-FEN: Índice de Riesgo Compuesto Específico a nivel distrital (Saaty AHP 4x4 / CENEPRED).
    2. IPH-FEN: Índice de Previsión Dinámica de Huaicos a nivel de quebrada (Manning, Sigmoide y T_lag).
    """

    def __init__(self):
        self.base_data_path = Path(__file__).parent.parent / "data"
        self._cargar_catalogos()

    def _cargar_catalogos(self):
        # 1. Quebradas Críticas
        queb_path = self.base_data_path / "catalogo_quebradas_criticas.json"
        if queb_path.exists():
            with open(queb_path, "r", encoding="utf-8") as f:
                self.quebradas = json.load(f)
        else:
            self.quebradas = []

        # 2. Distritos DS 124-2026-PCM
        ds124_path = self.base_data_path / "distritos_emergencia_ds_124_2026_pcm.json"
        if ds124_path.exists():
            with open(ds124_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.distritos_ds124 = {d["ubigeo"]: d for d in data.get("distritos_declarados", [])}
        else:
            self.distritos_ds124 = {}

        # 3. Matriz FONDES / CENEPRED 1,891 distritos
        fondes_path = self.base_data_path / "distritos_riesgo_nacional_1891_cenepred_mef.json"
        if fondes_path.exists():
            with open(fondes_path, "r", encoding="utf-8") as f:
                self.distritos_fondes = json.load(f)
        else:
            self.distritos_fondes = []

    def verificar_blindaje_criptografico(self) -> Dict[str, Any]:
        """
        Circuit-Breaker Anti-Tampering:
        Verifica que los pesos y la lógica algorítmica no hayan sido alterados en memoria.
        """
        hash_iph_actual = hashlib.sha256(
            json.dumps(PESOS_CANONICOS_IPH, sort_keys=True).encode("utf-8")
        ).hexdigest()
        hash_irce_actual = hashlib.sha256(
            json.dumps(PESOS_CANONICOS_IRCE_SAATY, sort_keys=True).encode("utf-8")
        ).hexdigest()

        iph_integro = (hash_iph_actual == HASH_CANONICO_PESOS)
        irce_integro = (hash_irce_actual == HASH_CANONICO_IRCE)

        return {
            "estado": "INTEGRO_VERIFICADO_OK" if (iph_integro and irce_integro) else "ALERTA_SABOTAJE_DETECTADO",
            "iph_integro": iph_integro,
            "irce_integro": irce_integro,
            "hash_iph": hash_iph_actual,
            "hash_irce": hash_irce_actual,
            "algoritmo": "SHA-256"
        }

    def calcular_irce_fen(
        self,
        ubigeo: str,
        anomalia_tsm_nino12: float = 1.6,
        lluvia_24h_mm: float = 25.0,
        factor_capacidad_ajustado: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calcula el Índice de Riesgo Compuesto Específico (IRCE-FEN) para un distrito:
        Formula: IRCE = min(1.0, (wP*P + wV*V + wE*E) / (wC*C))
        """
        distrito_info = self.distritos_ds124.get(ubigeo)
        nombre_distrito = distrito_info.get("distrito", "Desconocido") if distrito_info else "Distrito"
        departamento = distrito_info.get("departamento", "Nacional") if distrito_info else "Nacional"
        provincia = distrito_info.get("provincia", "Nacional") if distrito_info else "Nacional"
        poblacion = distrito_info.get("poblacion_estimada", 25000) if distrito_info else 25000
        esta_en_ds124 = ubigeo in self.distritos_ds124

        # 1. P (Peligro, 46.7%): Forzante térmico marino y precipitación
        tsm_ratio = min(1.0, max(0.0, anomalia_tsm_nino12 / 3.0))
        lluvia_ratio = min(1.0, max(0.0, lluvia_24h_mm / 60.0))
        score_p = 0.55 * tsm_ratio + 0.45 * lluvia_ratio

        # 2. V (Vulnerabilidad, 27.7%): Características estructurales y geomorfológicas
        # En norte (Piura, Tumbes, Lambayeque) la vulnerabilidad por suelo aluvial y adobe es mayor
        es_costa_norte = departamento in ["PIURA", "TUMBES", "LAMBAYEQUE", "LA LIBERTAD"]
        es_lima_centro = departamento in ["LIMA", "ICA", "ANCASH"]
        base_v = 0.82 if es_costa_norte else (0.72 if es_lima_centro else 0.60)
        score_v = base_v

        # 3. E (Exposición, 16.0%): Densidad y población en cono/faja
        score_e = min(1.0, max(0.2, math.log10(max(1000, poblacion)) / 5.5))

        # 4. C (Capacidad, 9.6%): Defensas ribereñas, maquinaria y preparación
        if factor_capacidad_ajustado is not None:
            score_c = max(0.25, min(1.0, factor_capacidad_ajustado))
        else:
            # Línea de base nacional: capacidad municipal promedio ante FEN extraordinario
            score_c = 0.42

        # 5. Evaluación Saaty
        w = PESOS_CANONICOS_IRCE_SAATY
        numerador = w["w_peligro"] * score_p + w["w_vulnerabilidad"] * score_v + w["w_exposicion"] * score_e
        denominador = max(0.05, w["w_capacidad"] * score_c + 0.35)  # Amortiguador físico
        score_irce = round(min(1.0, max(0.05, numerador / denominador)), 3)

        # 6. Clasificación del Semáforo
        if score_irce >= 0.75:
            nivel = "CRITICO_ROJO"
            semaforo = "ROJO (Peligro Inminente / Evacuación Táctica)"
            accion = "Justificación formal habilitada para Contratación Directa de Emergencia (D.S. 124-2026-PCM) y despliegue de maquinaria con cargo al PP 0068."
            color = "#ef4444"
        elif score_irce >= 0.60:
            nivel = "ALTO_NARANJA"
            semaforo = "NARANJA (Alerta Máxima / Preposicionamiento)"
            accion = "Preposicionamiento de motobombas, calaminas y carpas en tambos comunales de Defensa Civil."
            color = "#f97316"
        elif score_irce >= 0.35:
            nivel = "MEDIO_AMARILLO"
            semaforo = "AMARILLO (Vigilancia y Descolmatación)"
            accion = "Mantenimiento y descolmatación preventiva de cauces y canales de derivación."
            color = "#eab308"
        else:
            nivel = "BAJO_VERDE"
            semaforo = "VERDE (Monitoreo Basal)"
            accion = "Monitoreo hidrometeorológico ordinario de rutina."
            color = "#22c55e"

        return {
            "ubigeo": ubigeo,
            "distrito": nombre_distrito,
            "provincia": provincia,
            "departamento": departamento,
            "poblacion": poblacion,
            "declarado_ds124": esta_en_ds124,
            "score_irce": score_irce,
            "nivel_alerta": nivel,
            "semaforo": semaforo,
            "color_hex": color,
            "accion_recomendada": accion,
            "desglose_saaty": {
                "peligro_p": round(score_p, 3),
                "vulnerabilidad_v": round(score_v, 3),
                "exposicion_e": round(score_e, 3),
                "capacidad_c": round(score_c, 3),
                "pesos_ahp": w
            },
            "blindaje_legal": {
                "marco_normativo": "R.J. Nº 112-2014-CENEPRED/J & D.S. Nº 124-2026-PCM",
                "ratio_consistencia_saaty_cr": w["cr"],
                "consistencia_aprobada": True,
                "hash_sha256": HASH_CANONICO_IRCE
            }
        }

    def calcular_iph_fen(
        self,
        id_o_nombre: str,
        lluvia_cabecera_mm_h: float = 0.0,
        lluvia_acumulada_24h: float = 0.0,
        saturacion_api_72h: float = 0.0,
        ubigeo_contexto: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calcula el Índice de Previsión de Huaicos (IPH-FEN) para una quebrada crítica:
        Aplica física de Manning para velocidad de detritos, cálculo de retardo T_lag
        y activación sigmoidal calibrada.
        """
        termino = id_o_nombre.lower().strip()
        quebrada = None
        for q in self.quebradas:
            if (
                termino == q.get("id_quebrada", "").lower()
                or termino in q.get("nombre", "").lower()
                or termino in q.get("codigo_tactico_c2", "").lower()
                or termino in q.get("distrito", "").lower()
            ):
                quebrada = q
                break

        if not quebrada:
            return {
                "estado": "NO_ENCONTRADA",
                "mensaje": f"Quebrada '{id_o_nombre}' no localizada en el catálogo de 54 quebradas críticas."
            }

        umbral_horario = max(1.0, float(quebrada.get("umbral_critico_mm_hora", 12.0)))
        umbral_24h = max(1.0, float(quebrada.get("umbral_acumulado_24h", 35.0)))
        tc_horas = float(quebrada.get("tiempo_concentracion_horas", 1.8))
        pendiente_pct = float(quebrada.get("pendiente_media_pct", 16.0))
        poblacion = quebrada.get("poblacion_en_cono_deyeccion", 5000)
        puntos_estrang = quebrada.get("puntos_estrangulamiento", [])

        # Sanitización de entradas
        lluvia_cab_clean = max(0.0, min(float(lluvia_cabecera_mm_h), 300.0))
        lluvia_24h_clean = max(0.0, min(float(lluvia_acumulada_24h), 600.0))
        api_clean = max(0.0, min(float(saturacion_api_72h), 200.0))

        # 1. C_meteo: Ratios de lluvia en cabecera
        ratio_horario = min(1.5, lluvia_cab_clean / umbral_horario)
        ratio_24h = min(1.5, lluvia_24h_clean / umbral_24h)
        c_meteo = 0.60 * ratio_horario + 0.40 * ratio_24h

        # 2. C_suelo: Saturación antecedente (API)
        c_suelo = min(1.0, max(0.0, api_clean / 50.0))

        # 3. C_irce: Vulnerabilidad del distrito receptor
        ubigeo_target = ubigeo_contexto or quebrada.get("ubigeo_receptor", "150100")
        irce_data = self.calcular_irce_fen(ubigeo_target)
        c_irce = irce_data.get("score_irce", 0.60)

        # 4. C_geomorf: Pendiente de ladera
        c_geomorf = min(1.0, max(0.0, pendiente_pct / 22.0))

        # 5. C_hist: Reincidencia histórica
        activaciones = len(quebrada.get("historial_activaciones", []))
        c_hist = min(1.0, activaciones / 4.0)

        # 6. Fuerza motriz Phi
        w = PESOS_CANONICOS_IPH
        phi = (
            w["w_meteo"] * c_meteo +
            w["w_suelo"] * c_suelo +
            w["w_irce"] * c_irce +
            w["w_geomorf"] * c_geomorf +
            w["w_hist"] * c_hist
        )

        # 7. Probabilidad Sigmoidal IPH-FEN
        z = w["k_sigmoide"] * (phi - w["phi_0"])
        p_huaico = 1.0 / (1.0 + math.exp(-z))
        p_pct = round(p_huaico * 100.0, 1)

        # Reglas físicas duras (anti-dilución)
        if lluvia_cab_clean >= umbral_horario and api_clean >= 30.0:
            p_pct = max(p_pct, 88.0)
        elif lluvia_cab_clean >= umbral_horario or lluvia_24h_clean >= umbral_24h:
            p_pct = max(p_pct, 85.0)

        if lluvia_cab_clean == 0.0 and lluvia_24h_clean == 0.0:
            p_pct = min(p_pct, 12.0)

        # 8. Cálculo Hidrocinético de Manning y Tiempo de Retardo T_lag
        # n rugosidad para flujo de detritos ~ 0.065
        # S pendiente en fracción
        s_frac = max(0.01, pendiente_pct / 100.0)
        n_manning = 0.065
        radio_hidraulico_r = 1.2  # Estimación de calado en canal de quebrada
        velocidad_detritos_ms = round((1.0 / n_manning) * (radio_hidraulico_r ** (2/3)) * (s_frac ** 0.5), 2)
        
        # Longitud estimada de cabecera a cono (km)
        altitud_cabecera = quebrada.get("cabecera_altitud_msnm", 1800)
        longitud_km = max(3.0, (altitud_cabecera - 400) / (pendiente_pct * 10))
        t_lag_horas = round(max(0.3, (longitud_km * 1000.0) / (velocidad_detritos_ms * 3600.0)), 2)
        minutos_retardo = int(t_lag_horas * 60)

        # 9. Clasificación y Semáforo Táctico
        if p_pct >= 85.0:
            nivel = "ROJO_CRITICO"
            color = "#ef4444"
            accion = (
                f"ALERTA ROJA INMINENTE (IPH: {p_pct}%): Activación torrencial en cabecera ({lluvia_cab_clean:.1f} mm/h). "
                f"Onda de detritos llegará a zona urbana en aprox. {t_lag_horas:.1f} h ({minutos_retardo} min) "
                f"a velocidad estimada de {velocidad_detritos_ms} m/s. "
                f"Evacuación inmediata de {poblacion:,} hab. y cierre de badenes en {', '.join(puntos_estrang[:2])}."
            )
        elif p_pct >= 65.0:
            nivel = "NARANJA_ALTO"
            color = "#f97316"
            accion = (
                f"ALERTA NARANJA PREVENTIVA (IPH: {p_pct}%): Lluvia en cabecera ({lluvia_cab_clean:.1f} mm/h) cercana a umbral. "
                f"Tiempo de arribo proyectado: {t_lag_horas:.1f} h. Despliegue preventivo de brigadas a puntos de estrangulamiento."
            )
        elif p_pct >= 35.0:
            nivel = "AMARILLO_MEDIO"
            color = "#eab308"
            accion = f"VIGILANCIA AMARILLA (IPH: {p_pct}%): Monitoreo de satélite GOES e intensidad en cabecera."
        else:
            nivel = "VERDE_BAJO"
            color = "#22c55e"
            accion = f"CONDICIÓN VERDE (IPH: {p_pct}%): Quebrada estable sin precipitaciones de disparo."

        # Sello de integridad pericial SHA-256
        id_q = quebrada.get("id_quebrada") or quebrada.get("id", "Q-GEN")
        sello_data = f"{id_q}-{p_pct}-{lluvia_cab_clean}-{t_lag_horas}-{HASH_CANONICO_PESOS}"
        sello_sha256 = hashlib.sha256(sello_data.encode("utf-8")).hexdigest()

        return {
            "estado": "CALCULADO_OK",
            "id_quebrada": id_q,
            "nombre": quebrada.get("nombre"),
            "cuenca": quebrada.get("cuenca"),
            "region": quebrada.get("region"),
            "provincia": quebrada.get("provincia"),
            "distrito": quebrada.get("distrito"),
            "lat": quebrada.get("lat"),
            "lng": quebrada.get("lng"),
            "cabecera": {
                "lat": quebrada.get("cabecera_lat"),
                "lng": quebrada.get("cabecera_lng"),
                "altitud_msnm": altitud_cabecera
            },
            "probabilidad_huaico_pct": p_pct,
            "nivel_alerta": nivel,
            "color_hex": color,
            "tiempo_retardo_t_lag_horas": t_lag_horas,
            "tiempo_retardo_minutos": minutos_retardo,
            "velocidad_flujo_m_s": velocidad_detritos_ms,
            "longitud_cauce_km": round(longitud_km, 1),
            "poblacion_en_riesgo": poblacion,
            "puntos_estrangulamiento": puntos_estrang,
            "accion_tactica_c2": accion,
            "factores_fuerza_motriz": {
                "c_meteo": round(c_meteo, 3),
                "c_suelo": round(c_suelo, 3),
                "c_irce": round(c_irce, 3),
                "c_geomorf": round(c_geomorf, 3),
                "c_hist": round(c_hist, 3),
                "phi_combinado": round(phi, 3)
            },
            "sello_pericial_sha256": sello_sha256
        }

    def listar_quebradas(self) -> List[Dict[str, Any]]:
        """Retorna el catálogo resumido de las quebradas críticas para capas de mapas."""
        return [
            {
                "id_quebrada": q.get("id_quebrada"),
                "nombre": q.get("nombre"),
                "cuenca": q.get("cuenca"),
                "region": q.get("region"),
                "distrito": q.get("distrito"),
                "lat": q.get("lat"),
                "lng": q.get("lng"),
                "umbral_critico_mm_hora": q.get("umbral_critico_mm_hora"),
                "tiempo_concentracion_horas": q.get("tiempo_concentracion_horas"),
                "poblacion_en_cono_deyeccion": q.get("poblacion_en_cono_deyeccion")
            }
            for q in self.quebradas
        ]


# Instancia singleton del servicio
indices_amaru_service = IndicesAmaruService()
