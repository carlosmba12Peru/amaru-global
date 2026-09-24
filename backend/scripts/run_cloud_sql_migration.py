"""
Script de Carga Masiva ETL Directa hacia Google Cloud SQL (PostgreSQL 16 + PostGIS)
AMARU-CLIMATE 2026.
Puebla los 1,891 distritos nacionales, 1,893 municipalidades y 45 infraestructuras críticas.
"""

import sys
import time
from urllib.parse import urlparse
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, r"C:\Users\USUARI~1\AppData\Local\Temp\my_pg_packages")

import pg8000.native

from backend.database.db_connection import db_manager

from backend.scripts.migrate_json_to_postgis import (
    procesar_distritos,
    procesar_municipalidades,
    procesar_logistica_y_puentes
)

def run_migration():
    print("=" * 70)
    print("🚀 AMARU-CLIMATE: INICIANDO MIGRACIÓN MASIVA A GOOGLE CLOUD SQL POSTGIS")
    print("=" * 70)
    
    status = db_manager.verificar_conexion()
    if not status["conectado"]:
        print(f"❌ Error: No se puede conectar a Cloud SQL. Detalle: {status}")
        return False
        
    print(f"✅ Conectado a Cloud SQL: {status['motor']} (PostGIS {status['postgis_version']})")
    
    u = urlparse(db_manager.db_url)
    con = pg8000.native.Connection(
        user=u.username or "amaru_admin",
        password=u.password or "",
        host=u.hostname or "34.176.254.17",
        port=u.port or 5432,
        database=u.path.lstrip("/") or "amaru_climate_db",
        timeout=30
    )
    
    def execute_in_batches(statements, desc):
        start_t = time.time()
        batch_size = 100
        total = len(statements)
        for i in range(0, total, batch_size):
            chunk = statements[i:i + batch_size]
            multi_sql = "BEGIN;\n" + "\n".join(chunk) + "\nCOMMIT;"
            con.run(multi_sql)
            done = min(i + batch_size, total)
            print(f"   -> {done}/{total} {desc} procesados...")
        print(f"   ✅ {total} {desc} migrados exitosamente en {round(time.time() - start_t, 2)}s.")

    # 1. Distritos Nacionales
    print("\n📦 [1/3] Procesando 1,891 Distritos Nacionales...")
    stmts_dist = [s for s in procesar_distritos() if s.startswith("INSERT INTO")]
    execute_in_batches(stmts_dist, "distritos")
    
    # 2. Municipalidades INEI 2026
    print("\n🏛️ [2/3] Procesando 1,893 Municipalidades y Autoridades INEI...")
    stmts_muni = [s for s in procesar_municipalidades() if s.startswith("INSERT INTO")]
    execute_in_batches(stmts_muni, "autoridades/distritos")
    
    # 3. Logística Humanitaria y Puentes Críticos
    print("\n🚚 [3/3] Procesando Almacenes, Albergues y Puentes VRP...")
    stmts_log = [s for s in procesar_logistica_y_puentes() if s.startswith("INSERT INTO")]
    execute_in_batches(stmts_log, "activos logísticos")

    
    # Verificación final
    print("\n" + "=" * 70)
    print("📊 VERIFICACIÓN DE AUDITORÍA EN CLOUD SQL")
    print("=" * 70)
    
    tablas = [
        ("distritos", "Distritos CENEPRED/MEF"),
        ("municipalidades_autoridades", "Alcaldías INEI 2026"),
        ("almacenes_indeci", "Almacenes Humanitarios"),
        ("albergues_logistica", "Albergues Tácticos"),
        ("red_vial_puentes", "Puentes Red Vial VRP")
    ]
    
    for t_name, label in tablas:
        res = con.run(f"SELECT COUNT(*) FROM {t_name};")
        count = res[0][0]
        print(f"   • {label} ({t_name}): {count:,} registros")
        
    # Verificar vista C2
    res_vista = con.run("SELECT COUNT(*) FROM v_resumen_emergencia_departamento;")
    print(f"   • Departamentos en Vista Táctica C2: {res_vista[0][0]} departamentos consolidados")
    
    con.close()
    print("\n🎉 MIGRACIÓN COMPLETA A GOOGLE CLOUD SQL POSTGIS FINALIZADA CON ÉXITO.")
    return True

if __name__ == "__main__":
    run_migration()
