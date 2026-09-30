"""
AMARU-CLIMATE: Servicio de Ground Truth y Análogos Empíricos INDECI
Basado en los reportes oficiales SINPAD / INDECI:
1. "RESUMEN EJECUTIVO HISTÓRICO AL 100% TEMPORADA DE LLUVIAS 2016 2017" (El Niño Costero 2017, liquidado al 100%)
2. "RESUMEN EJECUTIVO HISTORICO FINAL 018 TEMPORADA DE LLUVIAS 2017 2018" (Temporada Regular)
"""

from typing import Dict, Any, List

class IndeciGroundTruthService:
    def __init__(self):
        # 1. Datos consolidados oficiales del cierre al 100% SINPAD (El Niño Costero 2016-2017)
        self.fen_2016_2017 = {
            "periodo": "01 de Noviembre 2016 al 30 de Mayo 2017",
            "fecha_liquidacion": "24 de Enero de 2018",
            "fuente_oficial": "SINPAD - Sistema Nacional de Información para la Prevención y Atención de Desastres / INDECI Dirección de Respuesta",
            "tipo_evento": "EL NIÑO COSTERO 2017 (RÉGIMEN CATASTRÓFICO AL 100%)",
            "vidas_salud": {
                "fallecidos": 169,
                "heridos": 505,
                "desaparecidos": 19,
                "damnificados": 283137,
                "afectados": 1644879,
                "total_personas_impactadas": 1928016
            },
            "viviendas": {
                "colapsadas": 28533,
                "inhabitables": 37409,
                "total_destruidas_inhabitables": 65942,
                "afectadas": 381076,
                "total_parque_habitacional_danado": 447018
            },
            "transporte": {
                "carreteras_destruidas_km": 4030.0,
                "carreteras_afectadas_km": 10251.0,
                "caminos_rurales_destruidos_km": 2398.0,
                "caminos_rurales_afectados_km": 5939.0,
                "puentes_destruidos_unidades": 493,
                "puentes_afectados_unidades": 943
            },
            "sector_agropecuario": {
                "cultivos_perdidos_has": 51851.0,
                "cultivos_afectados_has": 112748.0,
                "canales_riego_destruidos_km": 3019.23,
                "canales_riego_afectados_km": 7681.91,
                "reservorios_destruidos": 372,
                "reservorios_afectados": 225,
                "pozos_agua_colapsados": 252,
                "pozos_agua_afectados": 28,
                "animales_perdidos": 1558294,
                "animales_afectados": 483967
            },
            "infraestructura_publica": {
                "colegios_colapsados": 141,
                "colegios_inhabitables": 315,
                "colegios_destruidos_inhabitables_total": 456,
                "colegios_afectados": 3703,
                "centros_salud_colapsados": 39,
                "centros_salud_inhabitables": 1,
                "centros_salud_destruidos_inhabitables_total": 40,
                "centros_salud_afectados": 1159
            },
            "servicios_basicos_porcentaje_falla": {
                "agua_potable": {"destruido_pct": 28.0, "afectado_pct": 38.0, "colapso_total_pct": 66.0},
                "alcantarillado_desague": {"destruido_pct": 27.0, "afectado_pct": 20.0, "colapso_total_pct": 47.0},
                "energia_electrica": {"destruido_pct": 16.0, "afectado_pct": 32.0, "colapso_total_pct": 48.0},
                "telefonia_movil": {"destruido_pct": 5.0, "afectado_pct": 37.0, "colapso_total_pct": 42.0},
                "telefonia_fija": {"destruido_pct": 5.0, "afectado_pct": 21.0, "colapso_total_pct": 26.0}
            },
            "ayuda_humanitaria_tm": {
                "total_tm": 2518.06,
                "techo_tm": 1400.91,
                "alimento_tm": 705.37,
                "abrigo_tm": 173.85,
                "herramientas_tm": 105.48,
                "otros_tm": 71.24,
                "enseres_tm": 61.20,
                "coeficiente_kg_por_damnificado": 8.89
            },
            "distribucion_departamental_damnificados": {
                "PIURA": {"damnificados": 98894, "afectados": 483431, "pct_damnificados_nacional": 34.93},
                "LA LIBERTAD": {"damnificados": 78978, "afectados": 397606, "pct_damnificados_nacional": 27.89},
                "LAMBAYEQUE": {"damnificados": 38912, "afectados": 117657, "pct_damnificados_nacional": 13.74},
                "LIMA": {"damnificados": 25385, "afectados": 127345, "pct_damnificados_nacional": 8.97},
                "ANCASH": {"damnificados": 15858, "afectados": 61041, "pct_damnificados_nacional": 5.60},
                "ICA": {"damnificados": 6980, "afectados": 112748, "pct_damnificados_nacional": 2.47},
                "TUMBES": {"damnificados": 2380, "afectados": 51368, "pct_damnificados_nacional": 0.84},
                "CAJAMARCA": {"damnificados": 1873, "afectados": 11216, "pct_damnificados_nacional": 0.66},
                "AMAZONAS": {"damnificados": 1375, "afectados": 75009, "pct_damnificados_nacional": 0.49},
                "OTROS": {"damnificados": 12502, "afectados": 206458, "pct_damnificados_nacional": 4.41}
            }
        }

        # 2. Datos consolidados de la Temporada Regular de Lluvias (2017-2018)
        self.temporada_regular_2017_2018 = {
            "periodo": "Temporada de Lluvias 2017-2018",
            "documento_oficial": "RESUMEN EJECUTIVO HISTÓRICO FINAL N° 018",
            "fuente_oficial": "SINPAD / INDECI Dirección de Respuesta",
            "tipo_evento": "TEMPORADA REGULAR DE LLUVIAS (LÍNEA BASE SIN FEN)",
            "vidas_salud": {
                "fallecidos": 34,
                "heridos": 48,
                "desaparecidos": 4,
                "damnificados": 13085,
                "afectados": 76605,
                "total_personas_impactadas": 89690
            },
            "viviendas": {
                "colapsadas": 1296,
                "inhabitables": 1778,
                "total_destruidas_inhabitables": 3074,
                "afectadas": 18932,
                "total_parque_habitacional_danado": 22006
            },
            "transporte": {
                "carreteras_destruidas_km": 418.59,
                "carreteras_afectadas_km": 1456.46,
                "caminos_rurales_destruidos_km": 85.32,
                "caminos_rurales_afectados_km": 730.01,
                "puentes_destruidos_unidades": 64,
                "puentes_afectados_unidades": 114
            },
            "sector_agropecuario": {
                "cultivos_perdidos_has": 1162.93,
                "cultivos_afectados_has": 6705.0,
                "canales_riego_destruidos_km": 36.58,
                "canales_riego_afectados_km": 499.66,
                "reservorios_destruidos": 5,
                "reservorios_afectados": 19,
                "animales_perdidos": 64633,
                "animales_afectados": 87121
            },
            "infraestructura_publica": {
                "colegios_colapsados": 11,
                "colegios_inhabitables": 43,
                "colegios_destruidos_inhabitables_total": 54,
                "colegios_afectados": 238,
                "centros_salud_colapsados": 2,
                "centros_salud_inhabitables": 6,
                "centros_salud_destruidos_inhabitables_total": 8,
                "centros_salud_afectados": 45
            },
            "ayuda_humanitaria_tm": {
                "total_tm": 431.61,
                "techo_tm": 128.94,
                "alimento_tm": 108.70,
                "otros_tm": 86.07,
                "abrigo_tm": 67.44,
                "herramientas_tm": 31.41,
                "enseres_tm": 9.02,
                "medicina_tm": 0.02,
                "coeficiente_kg_por_damnificado": 32.98
            },
            "distribucion_departamental_damnificados": {
                "PIURA": {"damnificados": 4557, "afectados": 6190},
                "SAN MARTIN": {"damnificados": 2024, "afectados": 6719},
                "HUANCAVELICA": {"damnificados": 1082, "afectados": 6633},
                "APURIMAC": {"damnificados": 828, "afectados": 10599},
                "CUSCO": {"damnificados": 754, "afectados": 1359},
                "AMAZONAS": {"damnificados": 724, "afectados": 679},
                "JUNIN": {"damnificados": 642, "afectados": 912},
                "AREQUIPA": {"damnificados": 447, "afectados": 6677},
                "LIMA": {"damnificados": 283, "afectados": 711},
                "ANCASH": {"damnificados": 279, "afectados": 564},
                "PUNO": {"damnificados": 252, "afectados": 1068},
                "AYACUCHO": {"damnificados": 234, "afectados": 1360},
                "LORETO": {"damnificados": 185, "afectados": 12632},
                "PASCO": {"damnificados": 183, "afectados": 765},
                "HUANUCO": {"damnificados": 181, "afectados": 421},
                "CAJAMARCA": {"damnificados": 105, "afectados": 2614},
                "UCAYALI": {"damnificados": 102, "afectados": 130},
                "MADRE DE DIOS": {"damnificados": 55, "afectados": 1337},
                "ICA": {"damnificados": 41, "afectados": 12155},
                "TUMBES": {"damnificados": 41, "afectados": 1390},
                "MOQUEGUA": {"damnificados": 33, "afectados": 159},
                "LA LIBERTAD": {"damnificados": 30, "afectados": 700},
                "LAMBAYEQUE": {"damnificados": 5, "afectados": 400},
                "TACNA": {"damnificados": 0, "afectados": 431}
            }
        }

    def obtener_comparativa_indeci(self) -> Dict[str, Any]:
        """Calcula los multiplicadores de catástrofe y el contraste FEN vs Regular."""
        f17 = self.fen_2016_2017
        f18 = self.temporada_regular_2017_2018

        ratios = {
            "damnificados_ratio": round(f17["vidas_salud"]["damnificados"] / f18["vidas_salud"]["damnificados"], 1),
            "afectados_ratio": round(f17["vidas_salud"]["afectados"] / f18["vidas_salud"]["afectados"], 1),
            "fallecidos_ratio": round(f17["vidas_salud"]["fallecidos"] / f18["vidas_salud"]["fallecidos"], 1),
            "viviendas_destruidas_ratio": round(f17["viviendas"]["total_destruidas_inhabitables"] / f18["viviendas"]["total_destruidas_inhabitables"], 1),
            "carreteras_destruidas_ratio": round(f17["transporte"]["carreteras_destruidas_km"] / f18["transporte"]["carreteras_destruidas_km"], 1),
            "puentes_destruidos_ratio": round(f17["transporte"]["puentes_destruidos_unidades"] / f18["transporte"]["puentes_destruidos_unidades"], 1),
            "canales_riego_destruidos_ratio": round(f17["sector_agropecuario"]["canales_riego_destruidos_km"] / f18["sector_agropecuario"]["canales_riego_destruidos_km"], 1),
            "cultivos_perdidos_ratio": round(f17["sector_agropecuario"]["cultivos_perdidos_has"] / f18["sector_agropecuario"]["cultivos_perdidos_has"], 1),
            "ayuda_humanitaria_tm_ratio": round(f17["ayuda_humanitaria_tm"]["total_tm"] / f18["ayuda_humanitaria_tm"]["total_tm"], 1)
        }

        # Daño neto atribuible al FEN (restando la línea base de lluvias regulares)
        dano_neto_fen = {
            "damnificados_excedentes_fen": f17["vidas_salud"]["damnificados"] - f18["vidas_salud"]["damnificados"],
            "viviendas_destruidas_excedentes": f17["viviendas"]["total_destruidas_inhabitables"] - f18["viviendas"]["total_destruidas_inhabitables"],
            "puentes_destruidos_excedentes": f17["transporte"]["puentes_destruidos_unidades"] - f18["transporte"]["puentes_destruidos_unidades"],
            "ayuda_humanitaria_tm_excedente": round(f17["ayuda_humanitaria_tm"]["total_tm"] - f18["ayuda_humanitaria_tm"]["total_tm"], 2)
        }

        return {
            "fen_costero_2017": f17,
            "temporada_regular_2018": f18,
            "multiplicadores_de_catastrofe": ratios,
            "dano_neto_atribuible_fen": dano_neto_fen
        }

    def calcular_demanda_ayuda_humanitaria(self, total_damnificados: int) -> Dict[str, Any]:
        """
        Calcula la demanda logística de ayuda humanitaria (en Toneladas Métricas)
        utilizando las relaciones empíricas auditadas por INDECI en El Niño Costero 2017.
        """
        # Coeficientes oficiales por persona damnificada (extraídos de las 2,518.06 TM / 283,137 damnificados)
        c_techo = 1400.91 / 283137.0       # 0.0049478 TM / damnificado
        c_alimento = 705.37 / 283137.0     # 0.0024912 TM / damnificado
        c_abrigo = 173.85 / 283137.0       # 0.0006140 TM / damnificado
        c_herramientas = 105.48 / 283137.0 # 0.0003725 TM / damnificado
        c_otros = 71.24 / 283137.0         # 0.0002516 TM / damnificado
        c_enseres = 61.20 / 283137.0       # 0.0002161 TM / damnificado

        techo_tm = round(total_damnificados * c_techo, 2)
        alimento_tm = round(total_damnificados * c_alimento, 2)
        abrigo_tm = round(total_damnificados * c_abrigo, 2)
        herramientas_tm = round(total_damnificados * c_herramientas, 2)
        otros_tm = round(total_damnificados * c_otros, 2)
        enseres_tm = round(total_damnificados * c_enseres, 2)
        total_tm = round(techo_tm + alimento_tm + abrigo_tm + herramientas_tm + otros_tm + enseres_tm, 2)

        # Requerimiento de transporte terrestre (flota de camiones de 10 TM)
        camiones_requeridos = int(round(total_tm / 10.0))

        return {
            "total_damnificados_base": total_damnificados,
            "total_ayuda_tm": total_tm,
            "desglose_por_tipo_tm": {
                "techo_calaminas_bobinas": techo_tm,
                "raciones_alimento_emergencia": alimento_tm,
                "abrigo_frazadas_ropa": abrigo_tm,
                "herramientas_palas_carretillas": herramientas_tm,
                "enseres_menaje_bidones": enseres_tm,
                "otros_apoyo": otros_tm
            },
            "logistica_operativa": {
                "camiones_10_tm_equivalentes": camiones_requeridos,
                "vuelos_hercules_l100_equivalentes": int(round(total_tm / 18.0)),
                "advertencia_cuello_botella": "Si colapsan puentes troncales (en 2017 cayeron 493 puentes), el 70% de esta carga requerirá puente aéreo a un costo 14 veces mayor salvo pre-posicionamiento T-144h."
            }
        }

indeci_ground_truth_service = IndeciGroundTruthService()
