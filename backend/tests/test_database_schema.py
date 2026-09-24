"""
Test de verificación de Arquitectura de Base de Datos PostgreSQL 16 + PostGIS
AMARU-CLIMATE 2026.
Valida:
1. Integridad y sintaxis del script DDL PostGIS (14 tablas maestras, vistas C2, índices GiST).
2. Conexión resiliente y modo contingencia offline (fallback sin caídas).
3. Generador ETL de migración JSON a PostGIS (georreferenciación EPSG:4326).
"""

import os
import sys
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir.parent) not in sys.path:
    sys.path.insert(0, str(backend_dir.parent))
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from backend.database.db_connection import (
    DatabaseConnectionManager,
    db_manager
)

from backend.scripts.migrate_json_to_postgis import (
    procesar_distritos,
    procesar_municipalidades,
    procesar_logistica_y_puentes
)

class TestPostGISDatabaseArchitecture(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.base_dir = Path(__file__).resolve().parent.parent
        cls.sql_file = cls.base_dir / "database" / "init_postgis.sql"

    def test_ddl_script_exists_and_declares_postgis(self):
        """Verifica que init_postgis.sql declare las extensiones geoespaciales requeridas."""
        self.assertTrue(self.sql_file.exists(), f"El archivo DDL {self.sql_file} debe existir.")
        content = self.sql_file.read_text(encoding="utf-8")
        
        self.assertIn("CREATE EXTENSION IF NOT EXISTS postgis;", content)
        self.assertIn("CREATE EXTENSION IF NOT EXISTS postgis_topology;", content)

    def test_ddl_declares_all_core_tables(self):
        """Verifica que las 14 tablas maestras de los 6 dominios estén declaradas."""
        expected_tables = [
            "distritos",
            "municipalidades_autoridades",
            "comisarias_pnp",
            "albergues_colegios_minedu",
            "estaciones_aforo_ana",
            "radares_senamhi",
            "quebradas_criticas",
            "almacenes_indeci",
            "albergues_logistica",
            "red_vial_puentes",
            "edan_fichas",
            "edan_familias_2a",
            "contraloria_expedientes",
            "pide_reniec_bitacora"
        ]
        content = self.sql_file.read_text(encoding="utf-8")
        for table in expected_tables:
            self.assertIn(f"CREATE TABLE IF NOT EXISTS {table}", content, f"Tabla {table} no encontrada en DDL")

    def test_ddl_declares_spatial_gist_indexes(self):
        """Verifica que existan índices GiST para consultas geoespaciales de alta velocidad."""
        content = self.sql_file.read_text(encoding="utf-8")
        self.assertIn("USING GIST (geometria_centroide)", content)
        self.assertIn("USING GIST (ubicacion)", content)
        self.assertIn("idx_distritos_centroide", content)
        self.assertIn("idx_almacenes_geom", content)
        self.assertIn("idx_puentes_geom", content)

    def test_ddl_declares_c2_views(self):
        """Verifica que las vistas tácticas C2 estén declaradas en el script."""
        content = self.sql_file.read_text(encoding="utf-8")
        self.assertIn("CREATE OR REPLACE VIEW v_resumen_emergencia_departamento", content)
        self.assertIn("CREATE OR REPLACE VIEW v_puentes_criticos_colapsados", content)

    def test_connection_manager_disabled_fallback(self):
        """
        Verifica que el ConnectionManager entre en modo contingencia FEN cuando
        la base de datos no está explícitamente activada.
        """
        manager = DatabaseConnectionManager()
        manager.enabled = False
        status = manager.verificar_conexion()
        
        self.assertFalse(status["conectado"])
        self.assertEqual(status["modo_activo"], "MODO_RESILIENTE_FEN_OFFLINE")
        self.assertIn("Memoria RAM", status["motor"])

    def test_connection_manager_unreachable_db_fallback(self):
        """
        Verifica que el ConnectionManager capture errores de red y conmute
        automáticamente a contingencia sin romper el servidor.
        """
        manager = DatabaseConnectionManager()
        manager.enabled = True
        manager.db_url = "postgresql://dummy_user:dummy_pass@127.0.0.1:59999/dummy_db"
        status = manager.verificar_conexion()
        
        self.assertFalse(status["conectado"])
        self.assertEqual(status["modo_activo"], "FALLBACK_CONTINGENCIA_OFFLINE")
        self.assertIn("error_conexion", status)
        self.assertIn("Conmutación automática", status["resiliencia_tactica"])

    def test_etl_generates_valid_distritos_sql(self):
        """Verifica que el ETL procese los 1,891 distritos con sintaxis PostGIS válida."""
        stmts = procesar_distritos()
        insert_stmts = [s for s in stmts if s.startswith("INSERT INTO")]
        self.assertEqual(len(insert_stmts), 1891, "Deben generarse exactamente 1,891 instrucciones para distritos.")
        
        sample = insert_stmts[0]
        self.assertIn("INSERT INTO distritos", sample)
        self.assertIn("ON CONFLICT (ubigeo) DO UPDATE", sample)
        
        # Validar que al menos los distritos con coordenadas tengan ST_SetSRID
        has_postgis_point = any("ST_SetSRID(ST_MakePoint" in s for s in insert_stmts)
        self.assertTrue(has_postgis_point, "Debe haber distritos con coordenadas espaciales PostGIS EPSG:4326")

    def test_etl_generates_valid_municipalidades_sql(self):
        """Verifica que el ETL procese las municipalidades INEI."""
        stmts = procesar_municipalidades()
        muni_stmts = [s for s in stmts if s.startswith("INSERT INTO municipalidades_autoridades")]
        self.assertGreaterEqual(len(muni_stmts), 1890, "Deben generarse al menos 1,890 municipios.")
        sample = muni_stmts[0]
        self.assertIn("INSERT INTO municipalidades_autoridades", sample)
        self.assertIn("ON CONFLICT (ubigeo) DO UPDATE", sample)


    def test_etl_generates_valid_logistica_puentes_sql(self):
        """Verifica que el ETL procese almacenes, albergues y puentes con PostGIS."""
        stmts = procesar_logistica_y_puentes()
        insert_stmts = [s for s in stmts if s.startswith("INSERT INTO")]
        self.assertEqual(len(insert_stmts), 45, "Deben generarse 45 instrucciones (7 almacenes + 12 albergues + 26 puentes).")
        
        has_almacen = any("almacenes_indeci" in s for s in insert_stmts)
        has_albergue = any("albergues_logistica" in s for s in insert_stmts)
        has_puente = any("red_vial_puentes" in s for s in insert_stmts)
        
        self.assertTrue(has_almacen, "Falta instrucción para almacenes")
        self.assertTrue(has_albergue, "Falta instrucción para albergues")
        self.assertTrue(has_puente, "Falta instrucción para puentes")

if __name__ == "__main__":
    unittest.main()
