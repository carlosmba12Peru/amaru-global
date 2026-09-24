# backend/services/historical_analog_engine.py
"""
Motor Predictivo de Análogos Atmosféricos del Fenómeno El Niño (COEN-Digital)
Conecta la telemetría viva a 7 días de Open-Meteo Pro (ECMWF IFS 9km, CAPE, Suelo 4 Capas, Viento)
con las firmas precursoras documentadas en el Catálogo Maestro FEN (CAF / SENAMHI / CENEPRED).

Capacidades:
1. Matching de Patrón Análogo: Determina si el pronóstico al Día +5 o +6 replica la atmósfera previa a 1983, 1998 o 2017.
2. Factor Multiplicador FEN: Compensa la subestimación de modelos numéricos globales en el desierto costero.
3. Alerta Temprana con Lead Time: Emite alertas estratégicas con hasta 144 horas de anticipación.
4. Mapeo de Infraestructura Crítica de la CAF: Asocia la amenaza a puentes y bocatomas vulnerables identificados.
5. Acoplamiento Bipolar Costa Norte ◄► Sierra Sur: Activa alertas inversas para el Altiplano.
"""

import os
import json
import math
from typing import Dict, Any, List, Optional
from datetime import datetime

from services.historical_data_service import historical_service
from services.meteo_service_pro import MeteoServicePro

class HistoricalAnalogEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(HistoricalAnalogEngine, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        self._climatology_cache = {}

    # Representantes por cuenca para el Radar Nacional
    CUENCA_REPRESENTATIVES = {
        "CUENCA-TUMBES": {"ubigeo": "240101", "distrito": "Tumbes"},
        "CUENCA-ZARUMILLA": {"ubigeo": "240301", "distrito": "Zarumilla"},
        "INTERCUENCAS-BOQUERON-MANCORA": {"ubigeo": "240201", "distrito": "Zorritos"},
        "CUENCA-CHIRA": {"ubigeo": "200601", "distrito": "Sullana"},
        "CUENCA-PIURA-BAJO": {"ubigeo": "200105", "distrito": "Catacaos"},
        "CUENCA-PIURA-MEDIO": {"ubigeo": "200101", "distrito": "Piura"},
        "CUENCA-PIURA-ALTO": {"ubigeo": "200401", "distrito": "Chulucanas"},
        "CUENCA-LA-LECHE": {"ubigeo": "140304", "distrito": "Íllimo"},
        "CUENCA-CHANCAY-LAMBAYEQUE": {"ubigeo": "140101", "distrito": "Chiclayo"},
        "CUENCA-ZANA": {"ubigeo": "140115", "distrito": "Zaña"},
        "CUENCA-JEQUETEPEQUE": {"ubigeo": "130701", "distrito": "Pacasmayo"},
        "CUENCA-MOCHE-VIRU": {"ubigeo": "130102", "distrito": "El Porvenir"},
        "CUENCA-CASMA-HUARMEY": {"ubigeo": "021101", "distrito": "Huarmey"},
        "CUENCA-RIMAC": {"ubigeo": "150118", "distrito": "Lurigancho-Chosica"},
        "CUENCA-ICA": {"ubigeo": "110101", "distrito": "Ica"},
        "CUENCA-TITICACA-RAMIS": {"ubigeo": "210201", "distrito": "Azángaro"},
        "CUENCA-TITICACA-ILAVE-COATA": {"ubigeo": "210501", "distrito": "Ilave"}
    }

    async def evaluate_district_analog(self, ubigeo: str) -> Dict[str, Any]:
        """
        Evalúa el pronóstico de 7 días de Open-Meteo Pro para el distrito UBIGEO
        y calcula el grado de coincidencia contra eventos análogos históricos del FEN.
        Incluye caché en memoria con TTL de 15 minutos para acelerar consultas concurrentes.
        """
        now_ts = datetime.now().timestamp()
        if hasattr(self, "_analog_cache") and ubigeo in self._analog_cache:
            cached = self._analog_cache[ubigeo]
            if now_ts - cached.get("timestamp", 0) < 900:  # 15 minutos de TTL
                return cached["data"]

        # 1. Obtener expediente histórico y catálogo maestro
        distrito_data = historical_service.get_historical_district_memory(ubigeo)
        if not distrito_data:
            distrito_data = historical_service.get_district_full_profile(ubigeo)

        cat_maestro = historical_service.get_master_catalog()
        cuenca_id = distrito_data.get("cuenca_id")
        cuencas_map = cat_maestro.get("cuencas_estrategicas", {})
        cuenca_info = cuencas_map.get(cuenca_id, {}) if cuenca_id else {}

        # Si el distrito no tiene cuenca mapeada, intentar buscar en catálogo
        if not cuenca_info:
            for cid, cval in cuencas_map.items():
                if ubigeo in cval.get("ubigeos_asociados", []):
                    cuenca_id = cid
                    cuenca_info = cval
                    break

        region_macro = cuenca_info.get("region_macro") or distrito_data.get("region_macro") or "Costa"
        es_sierra_sur = "Sierra Sur" in region_macro or "Altiplano" in region_macro or distrito_data.get("departamento") in ["PUNO", "CUSCO", "AREQUIPA", "APURIMAC", "MOQUEGUA", "TACNA"]

        # 2. Consultar el pronóstico de 7 días a Open-Meteo Pro
        forecast_7d = await MeteoServicePro.fetch_district_detailed_forecast(ubigeo)
        days = forecast_7d.get("days", [])
        hours_24 = forecast_7d.get("hours_24", [])

        # Estimación de CAPE y humedad edáfica a partir del bloque de horas
        cape_promedio = 0.0
        if hours_24:
            capes = [h.get("cape", 0.0) for h in hours_24 if h.get("cape") is not None]
            if capes:
                cape_promedio = max(capes)

        # 3. Firmas de referencia de la cuenca
        firmas = cuenca_info.get("firmas_meteorologicas_precursoras", {
            "anomalia_tsm_nino12_minima": 2.0,
            "anomalia_temp_aire_2m": 5.0,
            "humedad_suelo_capa3_saturacion_pct": 75.0,
            "cape_convectivo_umbral_j_kg": 1000,
            "precipitacion_gatillo_24h_mm": 40.0
        })

        # 4. Evaluación día a día (Día +1 a Día +7)
        horizonte_evaluado = []
        max_score = 0.0
        dia_critico = None

        for idx, d in enumerate(days):
            day_index = idx + 1
            lead_time_hours = day_index * 24
            date_str = d.get("date")
            tmax = float(d.get("temp_max", 26.0))
            tmin = float(d.get("temp_min", 18.0))
            rain_mm = float(d.get("rain_mm", 0.0))
            wind_kmh = float(d.get("wind_speed_kmh", 12.0))
            wind_ms = wind_kmh / 3.6

            # Evaluación según macro-región
            if es_sierra_sur:
                # Sierra Sur / Altiplano: Bipolaridad FEN (Déficit hídrico y heladas radiativas)
                # Coincidencia con sequía histórica si tmin es muy baja, lluvia es nula y viento es seco
                es_helada = tmin <= 2.0
                deficit_lluvia = rain_mm < 2.0
                cielo_despejado = d.get("weather_code", 0) in [0, 1]

                score = 30.0
                if deficit_lluvia:
                    score += 25.0
                if es_helada:
                    score += 30.0
                    if tmin <= -5.0:
                        score += 15.0
                if cielo_despejado:
                    score += 10.0

                score = min(100.0, round(score, 1))
                analogo_evento = "FEN Canónico 1982-1983 (Sequía Andina y Helada Radiativa)" if score >= 70 else "Variabilidad Estacional Altiplánica"
                factor_fen = 1.0
                rain_extrema = rain_mm
                nivel_alerta = "ROJA" if score >= 85 and tmin <= -8.0 else ("NARANJA" if score >= 70 else ("AMARILLA" if score >= 50 else "VERDE"))

            else:
                # Costa Norte / Centro: Hiper-precipitación, TSM anómala y debilitamiento de vientos
                # Temperatura climatológica de referencia: ~28°C max
                anomalia_termica = max(0.0, tmax - 28.0)
                viento_alisio_debil = wind_ms < 3.5  # Debilitamiento documentado en SENAMHI
                cape_dia = cape_promedio * (1.1 if idx >= 4 else 1.0) # Proyección de inestabilidad convectiva

                # Puntuación de Similitud Vectorial
                score = 25.0
                # 1. Componente térmico (hasta 30 pts)
                if anomalia_termica >= 3.0:
                    score += 25.0
                elif anomalia_termica >= 1.5:
                    score += 15.0

                # 2. Componente de viento alisio debilitado (hasta 15 pts)
                if viento_alisio_debil:
                    score += 15.0

                # 3. Componente de precipitación proyectada (hasta 25 pts)
                if rain_mm >= firmas.get("precipitacion_gatillo_24h_mm", 40.0):
                    score += 25.0
                elif rain_mm >= 20.0:
                    score += 18.0
                elif rain_mm >= 8.0:
                    score += 10.0

                # 4. Componente de inestabilidad convectiva (CAPE)
                if cape_dia >= firmas.get("cape_convectivo_umbral_j_kg", 1000):
                    score += 15.0

                score = min(98.0, round(score, 1))

                # Selección del análogo más cercano
                if score >= 80.0:
                    analogo_evento = "Mega-Niño Extraordinario 1997-1998 (Firma 14-Feb-1998)"
                    factor_fen = 3.2 if rain_mm >= 15.0 else 2.2
                elif score >= 65.0:
                    analogo_evento = "El Niño Costero 2017 (Firma 15-Mar-2017)"
                    factor_fen = 2.4 if rain_mm >= 10.0 else 1.8
                elif score >= 45.0:
                    analogo_evento = "El Niño Moderado 2002-2003"
                    factor_fen = 1.4
                else:
                    analogo_evento = "Patrón Neutro Climatológico"
                    factor_fen = 1.0

                rain_extrema = round(rain_mm * factor_fen, 1)

                if rain_extrema >= 60.0 or score >= 85.0:
                    nivel_alerta = "ROJA"
                elif rain_extrema >= 35.0 or score >= 70.0:
                    nivel_alerta = "NARANJA"
                elif rain_extrema >= 15.0 or score >= 50.0:
                    nivel_alerta = "AMARILLA"
                else:
                    nivel_alerta = "VERDE"

            day_result = {
                "dia_numero": day_index,
                "fecha": date_str,
                "dia_semana": d.get("day_short"),
                "horas_anticipacion": lead_time_hours,
                "temperatura_max": tmax,
                "temperatura_min": tmin,
                "lluvia_proyectada_openmeteo_mm": rain_mm,
                "factor_amplificacion_fen": factor_fen,
                "lluvia_extrema_estimada_mm": rain_extrema,
                "similitud_analoga_pct": score,
                "evento_analogo_referencia": analogo_evento,
                "nivel_alerta_anticipada": nivel_alerta,
                "condicion_viento_alisio": "DEBILITADO" if (not es_sierra_sur and wind_ms < 3.5) else "NORMAL"
            }
            horizonte_evaluado.append(day_result)

            if score > max_score:
                max_score = score
                dia_critico = day_result

        # 5. Infraestructura crítica en peligro si hay alerta
        infraestructura_amenazada = []
        if cuenca_info and cuenca_info.get("infraestructura_critica"):
            puentes = cuenca_info["infraestructura_critica"].get("puentes_vulnerables", [])
            obras = cuenca_info["infraestructura_critica"].get("obras_hidraulicas_riego", [])
            vias = cuenca_info["infraestructura_critica"].get("vias_troncales", [])
            for p in puentes[:4]:
                infraestructura_amenazada.append({
                    "tipo": "PUENTE_VULNERABLE",
                    "nombre": p.get("nombre"),
                    "riesgo_historico": p.get("riesgo_historico")
                })
            for o in obras[:2]:
                infraestructura_amenazada.append({
                    "tipo": "OBRA_HIDRAULICA",
                    "nombre": o.get("nombre"),
                    "impacto": o.get("impacto")
                })
            for v in vias[:2]:
                infraestructura_amenazada.append({
                    "tipo": "VIA_TRONCAL",
                    "tramo": v.get("tramo"),
                    "patron_dano": v.get("patron_dano")
                })

        # 6. Evaluación de Bipolaridad Territorial
        if not es_sierra_sur and max_score >= 70.0:
            alerta_bipolar = {
                "regla_activa": "ACOPLAMIENTO_BIPOLAR_NORTE_SUR",
                "descripcion": (
                    f"Alerta FEN activa en {cuenca_info.get('nombre', 'Costa Norte')} al Día +{dia_critico['dia_numero']} "
                    f"({dia_critico['horas_anticipacion']}h de margen). De acuerdo al Dossier SENAMHI, la intensa convección costera "
                    "provocará subsidencia y bloqueo de humedad amazónica en el Altiplano y Sierra Sur, detonando estrés hídrico "
                    "en pastizales y heladas radiativas severas en Puno (Ríos Ramis/Ilave) y Cusco."
                ),
                "zonas_alerta_inversa": ["PUNO (Azángaro, Ayaviri, Ilave)", "CUSCO (Valle del Vilcanota)", "AREQUIPA (Caylloma, Alca)"],
                "accion_preventiva_recomendada": "Acopio inmediato de pacas de heno, cobertizos para camélidos y resguardo de semillas altoandinas."
            }
        elif es_sierra_sur and max_score >= 65.0:
            alerta_bipolar = {
                "regla_activa": "VIGILANCIA_ESTRES_ANDINO_POR_FEN",
                "descripcion": (
                    f"El Altiplano presenta condiciones análogas al FEN 1982-83 / 1992 con temperaturas nocturnas extremas "
                    f"de {dia_critico['temperatura_min']} °C y sequía de pastizales."
                ),
                "zonas_alerta_inversa": ["COSTA NORTE (Tumbes, Piura, Lambayeque) en monitoreo de calentamiento marino"],
                "accion_preventiva_recomendada": "Activar el seguro agrario catastrófico y abastecimiento de qochas comunales."
            }
        else:
            alerta_bipolar = {
                "regla_activa": "REGULAR",
                "descripcion": "Condiciones climáticas sin acoplamiento bipolar severo en el horizonte de 7 días."
            }

        # 7. Oportunidades FEN (Matriz Bivalente)
        oportunidades = []
        if not es_sierra_sur and max_score >= 60.0:
            oportunidades = [
                {"oportunidad": "Recarga de Acuíferos", "detalle": "La precipitación proyectada favorecerá el almacenamiento de aguas subterráneas en la cuenca."},
                {"oportunidad": "Regeneración Forestal", "detalle": "Brote natural de algarrobales y zapotales en las zonas de amortiguamiento del bosque seco."},
                {"oportunidad": "Pastizales Temporales", "detalle": "Aparición de praderas estacionales en llanuras arenosas para ganado caprino."}
            ]

        result_payload = {
            "ubigeo": ubigeo,
            "distrito": distrito_data.get("distrito"),
            "provincia": distrito_data.get("provincia"),
            "departamento": distrito_data.get("departamento"),
            "cuenca_id": cuenca_id,
            "cuenca_nombre": cuenca_info.get("nombre", "Cuenca Local"),
            "region_macro": region_macro,
            "poblacion_expuesta": distrito_data.get("poblacion", 25000),
            "dia_maximo_riesgo": dia_critico,
            "horizonte_7_dias": horizonte_evaluado,
            "infraestructura_amenazada_caf": infraestructura_amenazada,
            "acoplamiento_bipolar": alerta_bipolar,
            "oportunidades_territoriales_fen": oportunidades,
            "fuentes_validadas": [
                "Open-Meteo Pro ECMWF IFS 9km (7 días)",
                "CAF / CEPAL 1998 (Cuadro IV-1)",
                "SENAMHI 2014 (Dossier FEN)",
                "CENEPRED 2017"
            ],
            "generado_el": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        if not hasattr(self, "_analog_cache"):
            self._analog_cache = {}
        self._analog_cache[ubigeo] = {
            "timestamp": now_ts,
            "data": result_payload
        }
        return result_payload

    async def scan_national_analog_radar(self) -> Dict[str, Any]:
        """
        Escanea las cuencas estratégicas a nivel nacional y genera el Radar de Cuencas en Riesgo Análogo.
        """
        cuencas_evaluadas = []
        alertas_rojas = 0
        alertas_naranjas = 0
        alertas_amarillas = 0

        for cuenca_id, rep in self.CUENCA_REPRESENTATIVES.items():
            ub = rep["ubigeo"]
            try:
                eval_res = await self.evaluate_district_analog(ub)
                dia_critico = eval_res.get("dia_maximo_riesgo", {})
                nivel = dia_critico.get("nivel_alerta_anticipada", "VERDE")

                if nivel == "ROJA":
                    alertas_rojas += 1
                elif nivel == "NARANJA":
                    alertas_naranjas += 1
                elif nivel == "AMARILLA":
                    alertas_amarillas += 1

                cuencas_evaluadas.append({
                    "cuenca_id": cuenca_id,
                    "cuenca_nombre": eval_res.get("cuenca_nombre"),
                    "region_macro": eval_res.get("region_macro"),
                    "distrito_centinela": eval_res.get("distrito"),
                    "ubigeo": ub,
                    "dia_critico_numero": dia_critico.get("dia_numero"),
                    "horas_anticipacion": dia_critico.get("horas_anticipacion"),
                    "similitud_analoga_pct": dia_critico.get("similitud_analoga_pct"),
                    "evento_referencia": dia_critico.get("evento_analogo_referencia"),
                    "nivel_alerta": nivel,
                    "lluvia_proyectada_mm": dia_critico.get("lluvia_proyectada_openmeteo_mm"),
                    "lluvia_extrema_amplificada_mm": dia_critico.get("lluvia_extrema_estimada_mm"),
                    "factor_amplificacion": dia_critico.get("factor_amplificacion_fen"),
                    "puentes_en_riesgo_caf": len([i for i in eval_res.get("infraestructura_amenazada_caf", []) if i["tipo"] == "PUENTE_VULNERABLE"])
                })
            except Exception as e:
                print(f"[AnalogEngine Warning] Error evaluando cuenca {cuenca_id}: {e}")

        # Ordenar por similitud análoga descendente
        cuencas_evaluadas.sort(key=lambda x: x.get("similitud_analoga_pct", 0), reverse=True)

        return {
            "radar_nacional_version": "2.0-analog-engine",
            "total_cuencas_vigiladas": len(cuencas_evaluadas),
            "resumen_semaforo": {
                "cuencas_alerta_roja": alertas_rojas,
                "cuencas_alerta_naranja": alertas_naranjas,
                "cuencas_alerta_amarilla": alertas_amarillas,
                "cuencas_alerta_verde": len(cuencas_evaluadas) - (alertas_rojas + alertas_naranjas + alertas_amarillas)
            },
            "cuencas": cuencas_evaluadas,
            "generado_el": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

# Instancia singleton accesible globalmente
analog_engine = HistoricalAnalogEngine()
