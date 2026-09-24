"""
Gestor de Conexión a Base de Datos Relacional y Espacial (PostgreSQL 16 + PostGIS)
AMARU-CLIMATE - Lab4
Soporta: Docker Local, Google Cloud SQL y Modo Desconectado Resiliente FEN (JSON/RAM).
"""

import os
import time
from typing import Dict, Any, Optional

class DatabaseConnectionManager:
    def __init__(self):
        try:
            from pathlib import Path
            from dotenv import load_dotenv
            env_path = Path(__file__).resolve().parent.parent / ".env"
            if env_path.exists():
                load_dotenv(dotenv_path=env_path)
            else:
                load_dotenv()
        except ImportError:
            pass


        self.db_url = os.getenv(
            "DATABASE_URL",
            "postgresql://amaru_admin:AmaruSecure2026!@localhost:5432/amaru_climate_db"
        )
        self.enabled = os.getenv("ENABLE_POSTGRES_DB", "false").lower() == "true"

        self._pool = None
        self._is_connected = False
        self._postgis_version = None

    def verificar_conexion(self) -> Dict[str, Any]:
        """
        Verifica la conectividad con la base de datos PostgreSQL/PostGIS.
        Si no está disponible o está deshabilitada, reporta el estado de contingencia.
        """
        if not self.enabled:
            return {
                "conectado": False,
                "modo_activo": "MODO_RESILIENTE_FEN_OFFLINE",
                "motor": "Memoria RAM + Catálogos JSON",
                "motivo": "PostgreSQL no habilitado explícitamente (ENABLE_POSTGRES_DB=false).",
                "resiliencia_tactica": "100% Operativo sin conexión externa."
            }

        start_time = time.time()
        try:
            import sys
            sys.path.insert(0, r"C:\Users\USUARI~1\AppData\Local\Temp\my_pg_packages")
            postgis_ver = None
            try:
                import pg8000.native
                from urllib.parse import urlparse
                u = urlparse(self.db_url)
                con = pg8000.native.Connection(
                    user=u.username or "amaru_admin",
                    password=u.password or "",
                    host=u.hostname or "127.0.0.1",
                    port=u.port or 5432,
                    database=u.path.lstrip("/") or "amaru_climate_db",
                    timeout=5
                )
                res = con.run("SELECT postgis_version();")
                postgis_ver = str(res[0][0])
                con.close()
            except Exception as e_pg8000:
                import psycopg2
                conn = psycopg2.connect(self.db_url, connect_timeout=3)
                cursor = conn.cursor()
                cursor.execute("SELECT postgis_version();")
                postgis_ver = cursor.fetchone()[0]
                cursor.close()
                conn.close()


            latency_ms = round((time.time() - start_time) * 1000, 2)
            self._is_connected = True
            self._postgis_version = postgis_ver

            return {
                "conectado": True,
                "modo_activo": "MODO_RELACIONAL_POSTGIS_ACTIVO",
                "motor": "PostgreSQL 16 + PostGIS",
                "postgis_version": postgis_ver,
                "latencia_ms": latency_ms,
                "resiliencia_tactica": "Conexión a base de datos institucional conforme."
            }
        except Exception as e:
            self._is_connected = False
            return {
                "conectado": False,
                "modo_activo": "FALLBACK_CONTINGENCIA_OFFLINE",
                "motor": "Memoria RAM + Catálogos JSON",
                "error_conexion": str(e),
                "resiliencia_tactica": "Conmutación automática a catálogos locales. Operación continua garantizada."
            }

    @property
    def is_connected(self) -> bool:
        return self._is_connected

db_manager = DatabaseConnectionManager()
