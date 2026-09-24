"""
Motor de Ruteo Táctico y Logística Humanitaria Dinámica (AMARU-CLIMATE VRP)
Optimizador de Convoyes Anti-Corte de Puentes (Dijkstra con Penalización Fluvial y Desvíos Históricos CAF/MTC)
"""

import json
import heapq
import math
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple

# Rutas de datos
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR_PRIMARY = BASE_DIR / "data"
DATA_DIR_BACKEND = BASE_DIR / "backend" / "data"

def get_data_file(filename: str) -> Path:
    p1 = DATA_DIR_PRIMARY / filename
    if p1.exists():
        return p1
    p2 = DATA_DIR_BACKEND / filename
    if p2.exists():
        return p2
    return p1

class HumanitarianRouter:
    def __init__(self):
        self.puentes_catalogo: Dict[str, Dict[str, Any]] = {}
        self.almacenes: Dict[str, Dict[str, Any]] = {}
        self.albergues: Dict[str, Dict[str, Any]] = {}
        self.vehiculos: Dict[str, Dict[str, Any]] = {}
        self.grafo_aristas: List[Dict[str, Any]] = []
        self._cargar_catalogos()
        self._construir_grafo_base()

    def _cargar_catalogos(self):
        # 1. Puentes y cortes históricos MTC/CAF
        p_puentes = get_data_file("puentes_carreteras_historicos_fen.json")
        if p_puentes.exists():
            try:
                with open(p_puentes, "r", encoding="utf-8") as f:
                    raw_p = json.load(f)
                    for item in raw_p:
                        self.puentes_catalogo[item["id"]] = item
            except Exception as e:
                print(f"[Error HumanitarianRouter] Error cargando puentes: {e}")

        # 2. Almacenes, albergues y flota
        p_log = get_data_file("almacenes_albergues_logistica.json")
        if p_log.exists():
            try:
                with open(p_log, "r", encoding="utf-8") as f:
                    raw_log = json.load(f)
                    for a in raw_log.get("almacenes_indeci", []):
                        self.almacenes[a["id"]] = a
                    for alb in raw_log.get("albergues_destinos", []):
                        self.albergues[alb["id"]] = alb
                    for v in raw_log.get("flota_vehiculos", []):
                        self.vehiculos[v["tipo_id"]] = v
            except Exception as e:
                print(f"[Error HumanitarianRouter] Error cargando logística: {e}")

    def _construir_grafo_base(self):
        """
        Construye la topología de la Red Vial Nacional de Emergencia (PE-1N, PE-22, PE-5N y transversales)
        interconectando almacenes INDECI, cruces viales MTC, puentes estratégicos y albergues de damnificados.
        """
        self.grafo_aristas = [
            # ================= LIMA Y COSTA CENTRAL =================
            {
                "id": "AR-LIMA-ANCON",
                "origen": "ALM-LIMA-CENTRAL",
                "destino": "HUB-LIMA-NORTE",
                "distancia_km": 42.0,
                "calzada": "AUTOPISTA_ASFALTO",
                "velocidad_referencia_kmh": 75.0,
                "puentes": [],
                "es_desvio": False
            },
            {
                "id": "AR-LIMA-CHOSICA-TRONCAL",
                "origen": "ALM-LIMA-CENTRAL",
                "destino": "ALB-CHOSICA-LURIGANCHO",
                "distancia_km": 45.0,
                "calzada": "ASFALTO_MONITORIZADO",
                "velocidad_referencia_kmh": 50.0,
                "puentes": ["carretera-central-chosica-matucana"],
                "es_desvio": False
            },
            {
                "id": "AR-LIMA-CHOSICA-DESVIO-CANTA",
                "origen": "ALM-LIMA-CENTRAL",
                "destino": "ALB-CHOSICA-LURIGANCHO",
                "distancia_km": 118.0,
                "calzada": "ASFALTO_SIERRA_CURVAS",
                "velocidad_referencia_kmh": 35.0,
                "puentes": [],
                "es_desvio": True,
                "descripcion_desvio": "Ruta Alterna MTC vía Canta - Huayllay / Desvío Yaso a Chosica por quebrada alta."
            },
            {
                "id": "AR-LIMA-HUAYCOLORO-TRONCAL",
                "origen": "ALM-LIMA-CENTRAL",
                "destino": "ALB-HUAYCOLORO-CAMPOY",
                "distancia_km": 18.0,
                "calzada": "ASFALTO_URBANO",
                "velocidad_referencia_kmh": 40.0,
                "puentes": ["puente-huachipa-huaycoloro"],
                "es_desvio": False
            },
            {
                "id": "AR-LIMA-HUAYCOLORO-DESVIO-PRIALE",
                "origen": "ALM-LIMA-CENTRAL",
                "destino": "ALB-HUAYCOLORO-CAMPOY",
                "distancia_km": 29.0,
                "calzada": "ASFALTO_URBANO_DESVIO",
                "velocidad_referencia_kmh": 30.0,
                "puentes": ["puente-solidaridad-lima"],
                "es_desvio": True,
                "descripcion_desvio": "Desvío por Autopista Ramiro Prialé y puente Bailey militar de emergencia."
            },
            {
                "id": "AR-ANCON-PATIVILCA",
                "origen": "HUB-LIMA-NORTE",
                "destino": "HUB-BARRANCA-PATIVILCA",
                "distancia_km": 158.0,
                "calzada": "AUTOPISTA_ASFALTO",
                "velocidad_referencia_kmh": 85.0,
                "puentes": [],
                "es_desvio": False
            },

            # ================= ÁNCASH (HUARMEY / CASMA / CHIMBOTE) =================
            {
                "id": "AR-PATIVILCA-HUARMEY",
                "origen": "HUB-BARRANCA-PATIVILCA",
                "destino": "ALB-HUARMEY-CENTRAL",
                "distancia_km": 93.0,
                "calzada": "ASFALTO_PANAMERICANA",
                "velocidad_referencia_kmh": 75.0,
                "puentes": [],
                "es_desvio": False
            },
            {
                "id": "AR-HUARMEY-CASMA-TRONCAL",
                "origen": "ALB-HUARMEY-CENTRAL",
                "destino": "HUB-CASMA",
                "distancia_km": 78.0,
                "calzada": "ASFALTO_PANAMERICANA",
                "velocidad_referencia_kmh": 70.0,
                "puentes": ["puente-sechin-casma"],
                "es_desvio": False
            },
            {
                "id": "AR-HUARMEY-CASMA-DESVIO-HUARAZ",
                "origen": "ALB-HUARMEY-CENTRAL",
                "destino": "HUB-CASMA",
                "distancia_km": 195.0,
                "calzada": "AFIRMADO_SIERRA",
                "velocidad_referencia_kmh": 32.0,
                "puentes": [],
                "es_desvio": True,
                "descripcion_desvio": "Desvío histórico por Pativilca - Conococha - Huaraz - Descenso a Casma por Yaután."
            },
            {
                "id": "AR-CASMA-ALBERGUE-SECHIN",
                "origen": "HUB-CASMA",
                "destino": "ALB-CASMA-SECHIN",
                "distancia_km": 4.5,
                "calzada": "ASFALTO_URBANO",
                "velocidad_referencia_kmh": 40.0,
                "puentes": [],
                "es_desvio": False
            },
            {
                "id": "AR-CASMA-CHIMBOTE",
                "origen": "HUB-CASMA",
                "destino": "ALM-CHIMBOTE-REG",
                "distancia_km": 49.0,
                "calzada": "AUTOPISTA_ASFALTO",
                "velocidad_referencia_kmh": 80.0,
                "puentes": [],
                "es_desvio": False
            },

            # ================= LA LIBERTAD (VIRÚ / TRUJILLO / CHICAMA) =================
            {
                "id": "AR-CHIMBOTE-VIRU-TRONCAL",
                "origen": "ALM-CHIMBOTE-REG",
                "destino": "ALB-VIRU-VICTORRAUL",
                "distancia_km": 90.0,
                "calzada": "ASFALTO_PANAMERICANA",
                "velocidad_referencia_kmh": 70.0,
                "puentes": ["puente-viru-pe1n"],
                "es_desvio": False
            },
            {
                "id": "AR-CHIMBOTE-VIRU-DESVIO-BAILEY",
                "origen": "ALM-CHIMBOTE-REG",
                "destino": "ALB-VIRU-VICTORRAUL",
                "distancia_km": 114.0,
                "calzada": "AFIRMADO_COMPACTADO",
                "velocidad_referencia_kmh": 28.0,
                "puentes": [],
                "es_desvio": True,
                "descripcion_desvio": "Desvío provisional por ruta agrícola Santa Rita - Puente Bailey provisional km 515."
            },
            {
                "id": "AR-VIRU-TRUJILLO",
                "origen": "ALB-VIRU-VICTORRAUL",
                "destino": "ALM-TRUJILLO-REG",
                "distancia_km": 45.0,
                "calzada": "AUTOPISTA_ASFALTO",
                "velocidad_referencia_kmh": 75.0,
                "puentes": ["carretera-panamericana-norte-el-milagro"],
                "es_desvio": False
            },
            {
                "id": "AR-TRUJILLO-CHICAMA-TRONCAL",
                "origen": "ALM-TRUJILLO-REG",
                "destino": "ALB-CHICAMA-SAUSAL",
                "distancia_km": 30.0,
                "calzada": "ASFALTO_PANAMERICANA",
                "velocidad_referencia_kmh": 70.0,
                "puentes": ["VIAL-LIB-03"],
                "es_desvio": False
            },
            {
                "id": "AR-TRUJILLO-CHICAMA-DESVIO",
                "origen": "ALM-TRUJILLO-REG",
                "destino": "ALB-CHICAMA-SAUSAL",
                "distancia_km": 52.0,
                "calzada": "AFIRMADO_RURAL",
                "velocidad_referencia_kmh": 30.0,
                "puentes": [],
                "es_desvio": True,
                "descripcion_desvio": "Desvío por antigua línea férrea azucarera Casa Grande - Ascope."
            },
            {
                "id": "AR-CHICAMA-PACASMAYO",
                "origen": "ALB-CHICAMA-SAUSAL",
                "destino": "HUB-PACASMAYO",
                "distancia_km": 90.0,
                "calzada": "AUTOPISTA_ASFALTO",
                "velocidad_referencia_kmh": 80.0,
                "puentes": [],
                "es_desvio": False
            },

            # ================= CAJAMARCA (CONEXIÓN CIUDAD DE DIOS) =================
            {
                "id": "AR-PACASMAYO-CHILETE-TRONCAL",
                "origen": "HUB-PACASMAYO",
                "destino": "ALB-CHICLETE-CONTUMAZA",
                "distancia_km": 68.0,
                "calzada": "ASFALTO_MONTAÑA",
                "velocidad_referencia_kmh": 45.0,
                "puentes": ["VIAL-CAJ-01", "VIAL-CAJ-02", "VIAL-CAJ-03"],
                "es_desvio": False
            },
            {
                "id": "AR-CHILETE-CAJAMARCA",
                "origen": "ALB-CHICLETE-CONTUMAZA",
                "destino": "ALM-CAJAMARCA-REG",
                "distancia_km": 62.0,
                "calzada": "ASFALTO_MONTAÑA",
                "velocidad_referencia_kmh": 40.0,
                "puentes": [],
                "es_desvio": False
            },
            {
                "id": "AR-PACASMAYO-CAJAMARCA-DESVIO-OTUZCO",
                "origen": "HUB-PACASMAYO",
                "destino": "ALM-CAJAMARCA-REG",
                "distancia_km": 240.0,
                "calzada": "TROCHA_AFIRMADA",
                "velocidad_referencia_kmh": 22.0,
                "puentes": ["VIAL-LIB-01", "VIAL-LIB-02"],
                "es_desvio": True,
                "descripcion_desvio": "Ruta Alterna Sierra por Otuzco - Huamachuco - Cajabamba - San Marcos - Cajamarca."
            },

            # ================= LAMBAYEQUE (REQUE / CHICLAYO / ÍLLIMO / LA LECHE) =================
            {
                "id": "AR-PACASMAYO-CHICLAYO-TRONCAL",
                "origen": "HUB-PACASMAYO",
                "destino": "ALM-CHICLAYO-REG",
                "distancia_km": 90.0,
                "calzada": "ASFALTO_PANAMERICANA",
                "velocidad_referencia_kmh": 75.0,
                "puentes": ["puente-reque-pe1n"],
                "es_desvio": False
            },
            {
                "id": "AR-PACASMAYO-CHICLAYO-DESVIO-POMALCA",
                "origen": "HUB-PACASMAYO",
                "destino": "ALM-CHICLAYO-REG",
                "distancia_km": 138.0,
                "calzada": "AFIRMADO_RURAL_CAÑAVERAL",
                "velocidad_referencia_kmh": 26.0,
                "puentes": [],
                "es_desvio": True,
                "descripcion_desvio": "Desvío histórico MTC 1998: Mocupe - Cayaltí - Saltur - Pomalca (evita Puente Reque)."
            },
            {
                "id": "AR-CHICLAYO-ILLIMO-TRONCAL",
                "origen": "ALM-CHICLAYO-REG",
                "destino": "ALB-ILLIMO-PACORA",
                "distancia_km": 38.0,
                "calzada": "ASFALTO_PANAMERICANA_ANTIGUA",
                "velocidad_referencia_kmh": 60.0,
                "puentes": ["puente-la-leche-illimo", "carretera-panamericana-norte-illimo"],
                "es_desvio": False
            },
            {
                "id": "AR-CHICLAYO-ILLIMO-DESVIO-MORROPE",
                "origen": "ALM-CHICLAYO-REG",
                "destino": "ALB-ILLIMO-PACORA",
                "distancia_km": 68.0,
                "calzada": "ASFALTO_NUEVO_AFIRMADO",
                "velocidad_referencia_kmh": 40.0,
                "puentes": [],
                "es_desvio": True,
                "descripcion_desvio": "Desvío por Panamericana Norte Nueva vía Lambayeque - Mórrope y acceso posterior a Íllimo."
            },

            # ================= PIURA (CATACAOS / BAJO PIURA / CASTILLA / CANCHAQUE) =================
            {
                "id": "AR-CHICLAYO-PIURA-TRONCAL",
                "origen": "ALM-CHICLAYO-REG",
                "destino": "ALM-PIURA-REG",
                "distancia_km": 210.0,
                "calzada": "ASFALTO_PANAMERICANA",
                "velocidad_referencia_kmh": 85.0,
                "puentes": ["carretera-sechura-bayovar-la-nina"],
                "es_desvio": False
            },
            {
                "id": "AR-CHICLAYO-PIURA-DESVIO-DESIERTO",
                "origen": "ALM-CHICLAYO-REG",
                "destino": "ALM-PIURA-REG",
                "distancia_km": 265.0,
                "calzada": "AFIRMADO_DESIERTO",
                "velocidad_referencia_kmh": 38.0,
                "puentes": [],
                "es_desvio": True,
                "descripcion_desvio": "Desvío perimetral por Olmos - Chulucanas - Piura (bordeando la laguna La Niña)."
            },
            {
                "id": "AR-PIURA-CATACAOS-TRONCAL",
                "origen": "ALM-PIURA-REG",
                "destino": "ALB-CATACAOS-SANPABLO",
                "distancia_km": 14.0,
                "calzada": "ASFALTO_SUBURBANO",
                "velocidad_referencia_kmh": 50.0,
                "puentes": ["puente-independencia-catacaos", "puente-bolognesi-piura"],
                "es_desvio": False
            },
            {
                "id": "AR-PIURA-CATACAOS-DESVIO-DIQUE",
                "origen": "ALM-PIURA-REG",
                "destino": "ALB-CATACAOS-SANPABLO",
                "distancia_km": 28.0,
                "calzada": "CORONA_DIQUE_AFIRMADO",
                "velocidad_referencia_kmh": 20.0,
                "puentes": [],
                "es_desvio": True,
                "descripcion_desvio": "Tránsito de emergencia táctico por la corona del Dique Izquierdo (solo apto 4x4 o camión mediano)."
            },
            {
                "id": "AR-CATACAOS-CURAMORI-TRONCAL",
                "origen": "ALB-CATACAOS-SANPABLO",
                "destino": "ALB-NUEVO-CURAMORI",
                "distancia_km": 12.0,
                "calzada": "ASFALTO_LOCAL",
                "velocidad_referencia_kmh": 45.0,
                "puentes": ["puente-sanchez-cerro-piura"],
                "es_desvio": False
            },
            {
                "id": "AR-PIURA-CANCHAQUE",
                "origen": "ALM-PIURA-REG",
                "destino": "ALB-CANCHAQUE-HUANCABAMBA",
                "distancia_km": 142.0,
                "calzada": "AFIRMADO_SIERRA_ABRUPTA",
                "velocidad_referencia_kmh": 32.0,
                "puentes": ["carretera-canchaque-huancabamba"],
                "es_desvio": False
            },

            # ================= TUMBES =================
            {
                "id": "AR-PIURA-TUMBES-TRONCAL",
                "origen": "ALM-PIURA-REG",
                "destino": "ALM-TUMBES-REG",
                "distancia_km": 280.0,
                "calzada": "ASFALTO_PANAMERICANA_NORTE",
                "velocidad_referencia_kmh": 80.0,
                "puentes": ["puente-zurita-chira", "puente-carecitas-chira"],
                "es_desvio": False
            },
            {
                "id": "AR-TUMBES-SANJACINTO-TRONCAL",
                "origen": "ALM-TUMBES-REG",
                "destino": "ALB-TUMBES-SANJACINTO",
                "distancia_km": 18.0,
                "calzada": "ASFALTO_RIVERENO",
                "velocidad_referencia_kmh": 45.0,
                "puentes": ["puente-tumbes-urbano"],
                "es_desvio": False
            },
            {
                "id": "AR-TUMBES-SANJACINTO-DESVIO",
                "origen": "ALM-TUMBES-REG",
                "destino": "ALB-TUMBES-SANJACINTO",
                "distancia_km": 34.0,
                "calzada": "TROCHA_RURAL",
                "velocidad_referencia_kmh": 22.0,
                "puentes": [],
                "es_desvio": True,
                "descripcion_desvio": "Desvío por margen derecha vía Pampas de Hospital - Puente La Cruz."
            }
        ]

    def listar_almacenes(self) -> List[Dict[str, Any]]:
        return list(self.almacenes.values())

    def listar_albergues(self) -> List[Dict[str, Any]]:
        return list(self.albergues.values())

    def listar_vehiculos(self) -> List[Dict[str, Any]]:
        return list(self.vehiculos.values())

    def listar_puentes_criticos(self) -> List[Dict[str, Any]]:
        return list(self.puentes_catalogo.values())

    def obtener_red_vial_completa(self) -> Dict[str, Any]:
        """Retorna nodos y aristas para representación cartográfica C2."""
        nodos = []
        for a in self.almacenes.values():
            nodos.append({
                "id": a["id"],
                "nombre": a["nombre"],
                "tipo": "ALMACEN_INDECI",
                "coordenadas": a["coordenadas"],
                "departamento": a["departamento"],
                "stock_raciones": a["stock_raciones_frias"],
                "stock_agua_lts": a["stock_agua_lts"]
            })
        for alb in self.albergues.values():
            nodos.append({
                "id": alb["id"],
                "nombre": alb["nombre"],
                "tipo": "ALBERGUE_DESTINO",
                "coordenadas": alb["coordenadas"],
                "departamento": alb["departamento"],
                "poblacion": alb["poblacion_albergada"],
                "riesgo_aislamiento": alb["riesgo_aislamiento"],
                "puente_critico": alb["puente_critico_acceso"]
            })

        return {
            "total_nodos": len(nodos),
            "total_aristas": len(self.grafo_aristas),
            "nodos": nodos,
            "aristas": self.grafo_aristas,
            "puentes_criticos_monitoreados": len(self.puentes_catalogo)
        }

    def _ejecutar_dijkstra(
        self,
        origen_id: str,
        destino_id: str,
        puentes_cortados: List[str],
        tipo_vehiculo: str = "CAMION_PESADO_15T",
        permitir_desvios: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Algoritmo de Dijkstra para encontrar el camino de menor costo en tiempo/distancia.
        Si un puente de la arista está en 'puentes_cortados', la arista queda bloqueada (costo infinito).
        """
        vehiculo_info = self.vehiculos.get(tipo_vehiculo, self.vehiculos.get("CAMION_PESADO_15T", {}))
        v_asfalto = vehiculo_info.get("velocidad_asfalto_kmh", 60.0)
        v_desvio = vehiculo_info.get("velocidad_desvio_kmh", 25.0)
        km_x_galon = vehiculo_info.get("km_por_galon", 3.0)
        ton_max = vehiculo_info.get("capacidad_carga_tn", 15.0)

        # Construir adyacencias bidireccionales
        ady: Dict[str, List[Dict[str, Any]]] = {}
        for edge in self.grafo_aristas:
            u = edge["origen"]
            v = edge["destino"]
            if u not in ady:
                ady[u] = []
            if v not in ady:
                ady[v] = []

            # Verificar si está bloqueada por corte de puente
            puentes_en_edge = edge.get("puentes", [])
            esta_bloqueada = any(p in puentes_cortados for p in puentes_en_edge)

            # Si es desvío y no se permiten desvíos, no se usa
            if edge.get("es_desvio", False) and not permitir_desvios:
                continue

            # Peso: tiempo en minutos
            vel = v_desvio if edge.get("es_desvio", False) or "AFIRMADO" in edge.get("calzada", "") or "TROCHA" in edge.get("calzada", "") else v_asfalto
            tiempo_min = (edge["distancia_km"] / vel) * 60.0

            edge_forward = dict(edge)
            edge_forward["tiempo_min"] = tiempo_min
            edge_forward["bloqueada"] = esta_bloqueada
            edge_forward["hacia"] = v

            edge_backward = dict(edge)
            edge_backward["tiempo_min"] = tiempo_min
            edge_backward["bloqueada"] = esta_bloqueada
            edge_backward["hacia"] = u

            ady[u].append(edge_forward)
            ady[v].append(edge_backward)

        # Priority Queue: (costo_minutos, nodo_actual, ruta_aristas, km_acumulados, puentes_cruzados)
        pq = [(0.0, origen_id, [], 0.0, [])]
        visitados = {}

        while pq:
            costo_actual, u, path_edges, km_acum, bridges_crossed = heapq.heappop(pq)

            if u in visitados and visitados[u] <= costo_actual:
                continue
            visitados[u] = costo_actual

            if u == destino_id:
                # Llegamos al destino
                galones_diesel = km_acum / km_x_galon if km_x_galon > 0 else 0.0
                reserva_tactica = galones_diesel * 0.20
                total_diesel = round(galones_diesel + reserva_tactica, 1)
                horas = math.floor(costo_actual / 60.0)
                minutos = round(costo_actual % 60.0)

                return {
                    "exito": True,
                    "origen": origen_id,
                    "destino": destino_id,
                    "distancia_total_km": round(km_acum, 1),
                    "tiempo_total_minutos": round(costo_actual, 1),
                    "tiempo_formateado": f"{horas}h {minutos:02d}m",
                    "consumo_combustible": {
                        "tipo": vehiculo_info.get("tipo_combustible", "DIESEL_B5"),
                        "galones_netos": round(galones_diesel, 1),
                        "reserva_militar_20pct": round(reserva_tactica, 1),
                        "total_galones_requeridos": total_diesel
                    },
                    "puentes_en_ruta": bridges_crossed,
                    "aristas_ruta": path_edges,
                    "total_tramos": len(path_edges),
                    "usa_desvios_emergencia": any(e.get("es_desvio", False) for e in path_edges)
                }

            for e in ady.get(u, []):
                if e["bloqueada"]:
                    continue
                v = e["hacia"]
                nuevo_costo = costo_actual + e["tiempo_min"]
                if v not in visitados or nuevo_costo < visitados[v]:
                    new_bridges = bridges_crossed + [p for p in e.get("puentes", []) if p not in bridges_crossed]
                    heapq.heappush(pq, (
                        nuevo_costo,
                        v,
                        path_edges + [e],
                        km_acum + e["distancia_km"],
                        new_bridges
                    ))

        return None

    def calcular_ruta_contingencia(
        self,
        origen_id: str,
        destino_id: str,
        puentes_cortados: Optional[List[str]] = None,
        tipo_vehiculo: str = "CAMION_PESADO_15T"
    ) -> Dict[str, Any]:
        """
        Calcula y compara la Ruta Directa vs. la Ruta de Contingencia ante corte de puentes.
        Si la vía queda cortada sin ruta terrestre, activa alerta de PUENTE AÉREO / CABOTAJE.
        """
        cortados = puentes_cortados or []
        origen_data = self.almacenes.get(origen_id) or self.albergues.get(origen_id)
        destino_data = self.albergues.get(destino_id) or self.almacenes.get(destino_id)

        if not origen_data or not destino_data:
            return {"error": "Origen o destino no reconocidos en la red logística C2."}

        # 1. Ruta Nominal (Sin cortes de puentes)
        ruta_nominal = self._ejecutar_dijkstra(
            origen_id=origen_id,
            destino_id=destino_id,
            puentes_cortados=[],
            tipo_vehiculo=tipo_vehiculo,
            permitir_desvios=False
        )

        # 2. Ruta Real Efectiva (Aplicando puentes cortados y desvíos de emergencia)
        ruta_efectiva = self._ejecutar_dijkstra(
            origen_id=origen_id,
            destino_id=destino_id,
            puentes_cortados=cortados,
            tipo_vehiculo=tipo_vehiculo,
            permitir_desvios=True
        )

        vehiculo_info = self.vehiculos.get(tipo_vehiculo, {})

        # Si no hay ruta efectiva terrestre
        if not ruta_efectiva:
            puente_critico_id = destino_data.get("puente_critico_acceso")
            puente_forense = self.puentes_catalogo.get(puente_critico_id, {})

            return {
                "origen": origen_data,
                "destino": destino_data,
                "vehiculo": vehiculo_info,
                "estado_conectividad": "AISLAMIENTO_TERRESTRE_TOTAL",
                "semaforo": "#ef4444",
                "requiere_puente_aereo_ffaa": True,
                "alerta_tactica_c2": (
                    f"🚨 CORTE TOTAL DE ACCESO TERRESTRE A {destino_data.get('nombre', '').upper()}. "
                    f"No existe ruta transitable para vehículos de {vehiculo_info.get('capacidad_carga_tn', 0)} Tn. "
                    f"SE ACTIVA PROTOCOLO MILITAR DE AUXILIO AÉREO / HELITRANSPORTADO."
                ),
                "medio_transporte_recomendado": (
                    "Helicóptero FAP Mi-171Sh (Ala Rotatoria) o Cabotaje de la Marina de Guerra del Perú (BAP Pisco)"
                ),
                "poblacion_afectada": destino_data.get("poblacion_albergada", 0),
                "demanda_urgente_diaria": {
                    "raciones_frias": destino_data.get("demanda_raciones_dia", 0),
                    "agua_litros": destino_data.get("demanda_agua_lts_dia", 0)
                },
                "memoria_historica_precedente": {
                    "falla": puente_forense.get("modo_falla", "Colapso por socavación profunda de estribos"),
                    "dias_incomunicacion_historicos": puente_forense.get("dias_incomunicacion", 21),
                    "leccion_caf": puente_forense.get("leccion_aprendida_caf", "Despliegue inmediato de puentes aéreos y barcazas."),
                    "solucion_aplicada": destino_data.get("solucion_historica", "Puente aéreo FAP.")
                },
                "ruta_nominal_referencial": ruta_nominal,
                "ruta_efectiva": None
            }

        # Si hay ruta efectiva
        es_desvio = ruta_efectiva.get("usa_desvios_emergencia", False)
        puentes_afectados_en_camino = [p for p in ruta_nominal.get("puentes_en_ruta", []) if p in cortados] if ruta_nominal else []

        if es_desvio or len(puentes_afectados_en_camino) > 0:
            estado = "DESVIO_TACTICO_ACTIVO"
            semaforo = "#f59e0b"
            sobrecosto_km = round(ruta_efectiva["distancia_total_km"] - (ruta_nominal["distancia_total_km"] if ruta_nominal else 0), 1)
            sobrecosto_min = round(ruta_efectiva["tiempo_total_minutos"] - (ruta_nominal["tiempo_total_minutos"] if ruta_nominal else 0), 1)
            diesel_extra = round(ruta_efectiva["consumo_combustible"]["total_galones_requeridos"] - (ruta_nominal["consumo_combustible"]["total_galones_requeridos"] if ruta_nominal else 0), 1)
            alerta = (
                f"⚠️ RE-RUTEO ANTI-CORTE ACTIVO: La ruta troncal habitual está interrumpida por colapso de {len(puentes_afectados_en_camino)} puente(s). "
                f"El convoy ha sido desviado por vía alterna habilitada (+{sobrecosto_km} km, +{sobrecosto_min:.0f} min, +{diesel_extra} gal Diésel)."
            )
        else:
            estado = "TRANSITO_EXPEDITO_NORMAL"
            semaforo = "#10b981"
            sobrecosto_km = 0.0
            sobrecosto_min = 0.0
            diesel_extra = 0.0
            alerta = "🟢 TRÁNSITO EXPEDITO: Ruta troncal despejada sin cortes fluviales reportados."

        # Desglose de puentes en la ruta efectiva
        puentes_info = []
        for pid in ruta_efectiva.get("puentes_en_ruta", []):
            pdata = self.puentes_catalogo.get(pid, {})
            puentes_info.append({
                "id": pid,
                "nombre": pdata.get("nombre", pid),
                "rio": pdata.get("rio", ""),
                "departamento": pdata.get("departamento", ""),
                "caudal_gatillo_m3s": pdata.get("caudal_gatillo_m3s", 0),
                "estado": "CORTADO_COLAPSADO" if pid in cortados else "TRANSITABLE"
            })

        return {
            "origen": origen_data,
            "destino": destino_data,
            "vehiculo": vehiculo_info,
            "estado_conectividad": estado,
            "semaforo": semaforo,
            "requiere_puente_aereo_ffaa": False,
            "alerta_tactica_c2": alerta,
            "ruta_efectiva": ruta_efectiva,
            "ruta_nominal": ruta_nominal,
            "balance_contingencia": {
                "distancia_adicional_km": sobrecosto_km,
                "tiempo_adicional_minutos": sobrecosto_min,
                "diesel_adicional_galones": diesel_extra
            },
            "puentes_atravesados": puentes_info,
            "poblacion_albergada_beneficiada": destino_data.get("poblacion_albergada", 0),
            "raciones_diarias_requeridas": destino_data.get("demanda_raciones_dia", 0),
            "agua_litros_diarios_requeridos": destino_data.get("demanda_agua_lts_dia", 0)
        }

    def simular_red_regional(self, puentes_cortados: List[str]) -> Dict[str, Any]:
        """
        Simula el colapso masivo de una lista de puentes y evalúa el impacto sobre
        los 12 albergues y centros de auxilio del norte y centro del país.
        """
        albergues_evaluados = []
        total_poblacion_aislada = 0
        total_albergues_aislados = 0
        total_albergues_desviados = 0
        total_albergues_normales = 0

        # Mapeo de almacén regional más cercano a cada albergue
        almacen_optimo = {
            "ALB-CATACAOS-SANPABLO": "ALM-PIURA-REG",
            "ALB-NUEVO-CURAMORI": "ALM-PIURA-REG",
            "ALB-ILLIMO-PACORA": "ALM-CHICLAYO-REG",
            "ALB-VIRU-VICTORRAUL": "ALM-TRUJILLO-REG",
            "ALB-CHICAMA-SAUSAL": "ALM-TRUJILLO-REG",
            "ALB-CASMA-SECHIN": "ALM-CHIMBOTE-REG",
            "ALB-HUARMEY-CENTRAL": "ALM-CHIMBOTE-REG",
            "ALB-CHOSICA-LURIGANCHO": "ALM-LIMA-CENTRAL",
            "ALB-HUAYCOLORO-CAMPOY": "ALM-LIMA-CENTRAL",
            "ALB-CHICLETE-CONTUMAZA": "ALM-CAJAMARCA-REG",
            "ALB-CANCHAQUE-HUANCABAMBA": "ALM-PIURA-REG",
            "ALB-TUMBES-SANJACINTO": "ALM-TUMBES-REG"
        }

        for alb_id, alb_data in self.albergues.items():
            alm_id = almacen_optimo.get(alb_id, "ALM-LIMA-CENTRAL")
            resultado = self.calcular_ruta_contingencia(
                origen_id=alm_id,
                destino_id=alb_id,
                puentes_cortados=puentes_cortados,
                tipo_vehiculo="CAMION_PESADO_15T"
            )

            estado = resultado.get("estado_conectividad")
            pob = alb_data.get("poblacion_albergada", 0)

            if estado == "AISLAMIENTO_TERRESTRE_TOTAL":
                total_albergues_aislados += 1
                total_poblacion_aislada += pob
                severidad = "CRITICA"
            elif estado == "DESVIO_TACTICO_ACTIVO":
                total_albergues_desviados += 1
                severidad = "MODERADA"
            else:
                total_albergues_normales += 1
                severidad = "NORMAL"

            albergues_evaluados.append({
                "albergue_id": alb_id,
                "nombre": alb_data.get("nombre"),
                "departamento": alb_data.get("departamento"),
                "poblacion": pob,
                "estado_conectividad": estado,
                "semaforo": resultado.get("semaforo"),
                "severidad": severidad,
                "requiere_puente_aereo": resultado.get("requiere_puente_aereo_ffaa", False),
                "almacen_abastecedor": alm_id,
                "distancia_km": resultado.get("ruta_efectiva", {}).get("distancia_total_km") if resultado.get("ruta_efectiva") else None,
                "tiempo_formateado": resultado.get("ruta_efectiva", {}).get("tiempo_formateado") if resultado.get("ruta_efectiva") else "INACCESIBLE",
                "diesel_galones": resultado.get("ruta_efectiva", {}).get("consumo_combustible", {}).get("total_galones_requeridos") if resultado.get("ruta_efectiva") else 0,
                "puente_critico": alb_data.get("puente_critico_acceso")
            })

        return {
            "resumen_simulacion": {
                "total_puentes_cortados": len(puentes_cortados),
                "puentes_cortados": puentes_cortados,
                "albergues_incomunicados_puente_aereo": total_albergues_aislados,
                "albergues_con_desvio_activo": total_albergues_desviados,
                "albergues_con_transito_normal": total_albergues_normales,
                "poblacion_en_aislamiento_total": total_poblacion_aislada,
                "porcentaje_aislamiento_poblacional": round((total_poblacion_aislada / sum(a["poblacion_albergada"] for a in self.albergues.values())) * 100, 1) if self.albergues else 0.0
            },
            "albergues": albergues_evaluados
        }

humanitarian_router = HumanitarianRouter()
