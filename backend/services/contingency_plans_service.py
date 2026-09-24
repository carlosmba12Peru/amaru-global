# backend/services/contingency_plans_service.py
"""
Servicio Táctico de Catálogo y Búsqueda de Planes de Contingencia FEN (Gob.pe / INDECI).
Administra los 39 planes oficiales físicos y su metadata operacional.

Funciones Principales:
1. list_all_plans(sector, nivel, search): Filtra y lista los planes disponibles.
2. get_plan_by_id(plan_id): Retorna la ficha técnica detallada y recursos declarados.
3. get_plans_for_ubigeo(ubigeo): Identifica los planes aplicables a un distrito.
4. get_summary_by_sector(): Conteo agrupado por sector institucional.
"""
from typing import Dict, Any, List, Optional
from agents.kuraq.connectors.gobpe_planes_connector import gobpe_planes_connector


class ContingencyPlansService:
    def __init__(self):
        self.connector = gobpe_planes_connector

    def _get_data(self) -> Dict[str, Any]:
        return self.connector._build_canonical_plans_catalog()

    def list_all_plans(
        self,
        sector: Optional[str] = None,
        nivel: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retorna el listado filtrado de planes de contingencia oficiales."""
        data = self._get_data()
        planes = data["planes"]

        if sector and sector != "ALL":
            planes = [p for p in planes if p.get("sector") == sector]
        if nivel and nivel != "ALL":
            planes = [p for p in planes if p.get("nivel") == nivel]
        if search:
            s_lower = search.lower()
            planes = [
                p for p in planes
                if s_lower in p.get("titulo", "").lower()
                or s_lower in p.get("ente_emisor", "").lower()
                or s_lower in p.get("alcance", "").lower()
                or any(s_lower in pf.lower() for pf in p.get("puntos_focales", []))
            ]

        return planes

    def get_plan_by_id(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Recupera la ficha completa de un plan por su ID."""
        data = self._get_data()
        for p in data["planes"]:
            if p["id"] == plan_id:
                return p
        return None

    def get_plans_for_ubigeo(self, ubigeo: str) -> List[Dict[str, Any]]:
        """Retorna los planes sectoriales, regionales o locales que aplican a un Ubigeo."""
        data = self._get_data()
        # Planes locales directos o sectoriales nacionales de cobertura general
        aplicables = []
        for p in data["planes"]:
            if p.get("ubigeo") == ubigeo or p.get("nivel") == "NACIONAL_SECTORIAL":
                aplicables.append(p)
        return aplicables

    def get_summary_by_sector(self) -> Dict[str, Any]:
        """Retorna el resumen de cobertura sectorial."""
        data = self._get_data()
        return {
            "total_planes": len(data["planes"]),
            "sectores": data["resumen_sectores"]
        }


# Instancia singleton
contingency_plans_service = ContingencyPlansService()
