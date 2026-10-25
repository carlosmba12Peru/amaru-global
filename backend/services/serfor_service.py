# backend/services/serfor_service.py
"""
AMARU-CLIMATE: Servicio de Conexión e Interoperabilidad con SERFOR (MIDAGRI)
Unidad de Monitoreo Satelital (UMS) - Capa de Incendios Forestales & Focos de Calor.
Estándares: Esri Geoservices REST API / OGC WFS 2.0 / IDEP Perú.
"""

import urllib.request
import json
import logging
import time
import math
from typing import Dict, Any, List, Optional

logger = logging.getLogger("serfor_service")

# Diccionario de Códigos Territoriales SERFOR (DOMCAT)
DOMINIOS_TERRITORIALES_SERFOR = {
    1: {"nombre": "ANP - Parque Nacional", "grupo": "ANP", "prioridad": "ALTA"},
    2: {"nombre": "ANP - Santuario Nacional", "grupo": "ANP", "prioridad": "ALTA"},
    3: {"nombre": "ANP - Reserva Nacional", "grupo": "ANP", "prioridad": "ALTA"},
    4: {"nombre": "ANP - Cotos de caza", "grupo": "ANP", "prioridad": "MEDIA"},
    5: {"nombre": "ANP - Zona reservada", "grupo": "ANP", "prioridad": "ALTA"},
    6: {"nombre": "ANP - Reserva paisajistica", "grupo": "ANP", "prioridad": "ALTA"},
    7: {"nombre": "ANP - Reserva Comunal", "grupo": "ANP", "prioridad": "CRITICA"},
    8: {"nombre": "ANP - Refugio de vida silvestre", "grupo": "ANP", "prioridad": "ALTA"},
    9: {"nombre": "ANP - Santuario Histórico", "grupo": "ANP", "prioridad": "CRITICA"},
    10: {"nombre": "ANP - Bosque de protección", "grupo": "ANP", "prioridad": "ALTA"},
    11: {"nombre": "ACR - Area de Conservación Regional", "grupo": "ACR", "prioridad": "ALTA"},
    12: {"nombre": "ACP - Area de Conservacion Privada", "grupo": "ACP", "prioridad": "MEDIA"},
    13: {"nombre": "Zona de Amortiguamiento", "grupo": "AMORTIGUAMIENTO", "prioridad": "CRITICA"},
    14: {"nombre": "Concesión Forestal con Fines Maderables", "grupo": "CONCESION", "prioridad": "ALTA"},
    15: {"nombre": "Concesión para Conservación", "grupo": "CONCESION", "prioridad": "CRITICA"},
    16: {"nombre": "Concesión para Ecoturismo", "grupo": "CONCESION", "prioridad": "MEDIA"},
    17: {"nombre": "Concesión para Forestación y/o Reforestación", "grupo": "CONCESION", "prioridad": "ALTA"},
    18: {"nombre": "Concesión para Productos Diferentes a la Madera", "grupo": "CONCESION", "prioridad": "MEDIA"},
    19: {"nombre": "Concesión para Plantaciones Forestales", "grupo": "CONCESION", "prioridad": "ALTA"},
    20: {"nombre": "Bosque Local", "grupo": "BOSQUE", "prioridad": "ALTA"},
    21: {"nombre": "Bosque de Producción Permanente", "grupo": "BOSQUE", "prioridad": "ALTA"},
    22: {"nombre": "Concesiones Mineras", "grupo": "MINERIA", "prioridad": "BAJA"},
    23: {"nombre": "Concesiones Hidrocarburos", "grupo": "HIDROCARBUROS", "prioridad": "MEDIA"},
    24: {"nombre": "Comunidades Nativas", "grupo": "COMUNIDAD_NATIVA", "prioridad": "EXTREMA"},
    25: {"nombre": "Comunidades Campesinas", "grupo": "COMUNIDAD_CAMPESINA", "prioridad": "EXTREMA"},
    26: {"nombre": "Reservas Territoriales (PIACI)", "grupo": "PIACI", "prioridad": "EXTREMA"},
    27: {"nombre": "Registro de Plantaciones Forestales", "grupo": "PLANTACION", "prioridad": "ALTA"},
    28: {"nombre": "Predio Rural", "grupo": "PREDIO_RURAL", "prioridad": "ALTA"},
    29: {"nombre": "Ecosistemas frágiles", "grupo": "ECOSISTEMA_FRAGIL", "prioridad": "EXTREMA"},
    30: {"nombre": "Sin Categoría Territorial", "grupo": "OTRO", "prioridad": "MODERADA"},
    31: {"nombre": "Bosque Protector", "grupo": "BOSQUE", "prioridad": "ALTA"},
    32: {"nombre": "Reservas Indígenas", "grupo": "PIACI", "prioridad": "EXTREMA"},
    33: {"nombre": "Concesión de Manejo de Fauna Silvestre", "grupo": "FAUNA", "prioridad": "CRITICA"},
    34: {"nombre": "Cesiones en Uso para Sistemas Agroforestales", "grupo": "AGROFORESTAL", "prioridad": "ALTA"},
    35: {"nombre": "Hábitats Críticos", "grupo": "HABITAT_CRITICO", "prioridad": "EXTREMA"}
}

ESTADOS_SERFOR = {
    1: "ALERTADO",
    2: "CONFIRMADO",
    3: "CONTROLADO",
    4: "EXTINGUIDO"
}

SENSORES_MAPA = {
    "N": "VIIRS - NPP (375m)",
    "N20": "VIIRS - NOAA 20 (375m)",
    "N21": "VIIRS - NOAA 21 (375m)",
    "A": "MODIS - AQUA (1km)",
    "T": "MODIS - TERRA (1km)",
    "GOES (16 y 17)": "ABI - GOES Geoestacionario",
    "GOES (16 y 18)": "ABI - GOES Geoestacionario"
}

class SerforService:
    _instance = None
    _cache_data: List[Dict[str, Any]] = []
    _last_fetch_ts: float = 0.0
    _CACHE_TTL_SECONDS: float = 900.0  # 15 minutos

    ENDPOINT_INCENDIOS = (
        "https://geo.serfor.gob.pe/geoservicios/rest/services/Servicios_OGC/"
        "Unidad_Monitoreo_Satelital/MapServer/1/query?"
        "where=1%3D1&outFields=OBJECTID,CODREP,ESTADO,NOMDEP,NOMPRO,NOMDIS,FECHA,HORA,SENSAT,CATEG,NOMCATEG,LATITUD,LONGITUD"
        "&orderByFields=FECHA+DESC&resultRecordCount=300&f=json"
    )

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SerforService, cls).__new__(cls)
        return cls._instance

    def obtener_incendios_oficiales(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Consulta en tiempo de casi-tiempo-real los incendios validados por la Unidad
        de Monitoreo Satelital de SERFOR. Implementa caché seguro de 15 minutos.
        """
        now = time.time()
        if not force_refresh and self._cache_data and (now - self._last_fetch_ts < self._CACHE_TTL_SECONDS):
            return self._cache_data

        try:
            req = urllib.request.Request(
                self.ENDPOINT_INCENDIOS,
                headers={"User-Agent": "AmaruClimateBot/1.0 (+https://amaru.pe; interoperabilidad-c2)"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                payload = json.loads(response.read().decode("utf-8"))
                features = payload.get("features", [])
                
                parsed_list = []
                for feat in features:
                    attr = feat.get("attributes", {})
                    geom = feat.get("geometry", {})
                    lat = attr.get("LATITUD") or geom.get("y")
                    lng = attr.get("LONGITUD") or geom.get("x")
                    
                    if not lat or not lng:
                        continue

                    categ_id = attr.get("CATEG") or 30
                    dom_info = DOMINIOS_TERRITORIALES_SERFOR.get(categ_id, {
                        "nombre": attr.get("NOMCATEG") or "Zona de Cobertura General",
                        "grupo": "GENERAL",
                        "prioridad": "MODERADA"
                    })

                    estado_id = attr.get("ESTADO") or 1
                    estado_label = ESTADOS_SERFOR.get(estado_id, "ALERTADO")
                    sensor_raw = attr.get("SENSAT") or "VIIRS/MODIS"
                    sensor_label = SENSORES_MAPA.get(sensor_raw, sensor_raw)

                    parsed_list.append({
                        "objectid": attr.get("OBJECTID"),
                        "codrep": attr.get("CODREP") or f"SERFOR-ID-{attr.get('OBJECTID')}",
                        "estado_codigo": estado_id,
                        "estado_label": estado_label,
                        "departamento": (attr.get("NOMDEP") or "").strip().upper(),
                        "provincia": (attr.get("NOMPRO") or "").strip().upper(),
                        "distrito": (attr.get("NOMDIS") or "").strip().upper(),
                        "lat": float(lat),
                        "lng": float(lng),
                        "fecha_epoch": attr.get("FECHA"),
                        "hora": attr.get("HORA") or "--:--",
                        "categoria_territorial_id": categ_id,
                        "categoria_territorial_nom": dom_info["nombre"],
                        "categoria_grupo": dom_info["grupo"],
                        "impacto_prioridad": dom_info["prioridad"],
                        "sensor": sensor_label
                    })

                self._cache_data = parsed_list
                self._last_fetch_ts = now
                logger.info("SERFOR Service: Sincronizados %d registros oficiales de incendios", len(parsed_list))
                return parsed_list

        except Exception as e:
            logger.warning("SERFOR Service Fallback: No se pudo conectar al geoservidor SERFOR (%s). Usando caché.", e)
            return self._cache_data

    def cruzar_cluster_con_serfor(
        self,
        centroide_lat: float,
        centroide_lng: float,
        distrito: str,
        departamento: str,
        radio_busqueda_km: float = 18.0
    ) -> Optional[Dict[str, Any]]:
        """
        Encuentra coincidencia espacial y/o toponímica entre un cluster táctico de AMARU
        y los registros satelitales oficiales de SERFOR.
        """
        incendios = self.obtener_incendios_oficiales()
        if not incendios:
            return None

        mejor_match = None
        menor_distancia = float("inf")

        distrito_clean = distrito.strip().upper()
        departamento_clean = departamento.strip().upper()

        for inc in incendios:
            # 1. Distancia euclidiana / Haversine
            d_lat = math.radians(inc["lat"] - centroide_lat)
            d_lng = math.radians(inc["lng"] - centroide_lng)
            a = (
                math.sin(d_lat / 2) ** 2
                + math.cos(math.radians(centroide_lat))
                * math.cos(math.radians(inc["lat"]))
                * math.sin(d_lng / 2) ** 2
            )
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            dist_km = 6371.0 * c

            # Coincidencia espacial directa (radio <= 18 km) o toponímica distrital
            es_mismo_distrito = (
                inc["distrito"] and distrito_clean
                and (inc["distrito"] == distrito_clean or distrito_clean in inc["distrito"])
                and inc["departamento"] == departamento_clean
            )

            if dist_km <= radio_busqueda_km or (es_mismo_distrito and dist_km <= 35.0):
                if dist_km < menor_distancia:
                    menor_distancia = dist_km
                    mejor_match = {
                        "codrep": inc["codrep"],
                        "estado_codigo": inc["estado_codigo"],
                        "estado_label": inc["estado_label"],
                        "categoria_territorial_id": inc["categoria_territorial_id"],
                        "categoria_territorial_nom": inc["categoria_territorial_nom"],
                        "categoria_grupo": inc["categoria_grupo"],
                        "impacto_prioridad": inc["impacto_prioridad"],
                        "sensor_deteccion": inc["sensor"],
                        "hora_deteccion": inc["hora"],
                        "distancia_cruce_km": round(dist_km, 2),
                        "distrito_serfor": inc["distrito"],
                        "departamento_serfor": inc["departamento"],
                        "fuente_oficial": "Unidad de Monitoreo Satelital (SERFOR - MIDAGRI)",
                        "protocolo_fauna": "En caso de fauna silvestre afectada por el fuego, reportar a la Administración Técnica Forestal y de Fauna Silvestre (ATFFS)."
                    }

        return mejor_match

# Instancia singleton accesible
serfor_service = SerforService()
