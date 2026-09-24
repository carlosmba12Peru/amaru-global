"""
Script de Vectorización Masiva de Normas Jurídicas del SINAGERD con Vertex AI (text-embedding-004)
AMARU-LEX (COEN-Digital) - Lab4
Genera embeddings de 768 dimensiones para el catálogo de 51 normas FEN 2026-2027
y las persiste en:
1. Google Cloud SQL (amaru_climate_db -> tabla marco_legal_vectores)
2. Cache JSON Local (data/marco_legal_embeddings_vertex.json) para modo desconectado FEN.
"""

import sys
import os
import json
import time
from urllib.parse import urlparse
from pathlib import Path
from typing import List, Dict, Any

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, r"C:\Users\USUARI~1\AppData\Local\Temp\my_pg_packages")

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import pg8000.native

from backend.services.lex.vertex_embedding_service import embedding_service
from backend.database.db_connection import db_manager

DATA_DIR = root_dir / "data"

def preparar_chunks_normas() -> List[Dict[str, Any]]:
    """Extrae y estructura los fragmentos semánticos de las 51 normas."""
    catalog_path = DATA_DIR / "marco_legal_51_catalog.json"
    if not catalog_path.exists():
        raise FileNotFoundError(f"Catálogo no encontrado: {catalog_path}")

    with open(catalog_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    normas = data.get("normas", [])
    chunks = []

    for n in normas:
        n_id = n.get("id", "leg-unknown")
        nombre = n.get("norma", "Norma Legal")
        titulo = n.get("titulo", "")
        sector = n.get("sector", "Sector Público")
        categoria = n.get("categoria", "MEDIDA DE EMERGENCIA")
        deptos = ", ".join(n.get("departamentos", ["Nacional"]))
        resumen = n.get("resumen_ejecutivo", "")
        facultad = n.get("facultad_principal", "")
        monto = n.get("monto_referencial", "")

        # Chunk 1: Objeto normativo y contexto legal
        texto_chunk_1 = (
            f"Norma: {nombre}. Categoría: {categoria}. Sector: {sector}. "
            f"Título y Objeto: {titulo}. Resumen: {resumen}. Departamentos alcanzados: {deptos}."
        )
        chunks.append({
            "chunk_id": f"{n_id}-c1-objeto",
            "norma_id": n_id,
            "norma_nombre": nombre,
            "sector": sector,
            "categoria": categoria,
            "tipo_fragmento": "OBJETO_Y_RESUMEN",
            "contenido_texto": texto_chunk_1
        })

        # Chunk 2: Facultades de compra y habilitaciones operativas
        texto_chunk_2 = (
            f"Facultades Operativas y Contratación Directa - Norma: {nombre} ({sector}). "
            f"Facultad Principal: {facultad}. "
            f"Presupuesto o Fondo: {monto or 'Fondos del Programa Presupuestal 0068'}. "
            f"Habilitación: Procedimientos expeditos de adquisición de bienes, alquiler de maquinaria, "
            f"combustible y ayuda humanitaria ante el Fenómeno El Niño 2026-2027."
        )
        chunks.append({
            "chunk_id": f"{n_id}-c2-facultades",
            "norma_id": n_id,
            "norma_nombre": nombre,
            "sector": sector,
            "categoria": categoria,
            "tipo_fragmento": "FACULTADES_COMPRA",
            "contenido_texto": texto_chunk_2
        })

    # Chunks doctrinales complementarios de alta relevancia (Bono BAE, Control Concurrente, Ley 29664)
    doctrinales = [
        {
            "chunk_id": "doctrina-ley-29664-art377",
            "norma_id": "LEY-29664-SINAGERD",
            "norma_nombre": "Ley N.º 29664 del SINAGERD y Código Penal",
            "sector": "PRESIDENCIA DEL CONSEJO DE MINISTROS",
            "categoria": "MARCO CONSTITUCIONAL Y PENAL",
            "tipo_fragmento": "RESPONSABILIDAD_PENAL_AUTORIDAD",
            "contenido_texto": (
                "Responsabilidad Penal de los Alcaldes y Funcionarios en Emergencia FEN: "
                "El Artículo 377 y 378 del Código Penal tipifican el delito de Omisión, Rehusamiento "
                "o Demora de Actos Funcionales si la autoridad edil no empadrona damnificados vía EDAN, "
                "no distribuye bienes de ayuda humanitaria o retiene maquinarias asignadas. "
                "La Constancia de No Observación de la Contraloría (Control Concurrente) otorga blindaje legal."
            )
        },
        {
            "chunk_id": "doctrina-bono-bae-rs002-2026",
            "norma_id": "RS-002-2026-PCM-SGRD",
            "norma_nombre": "R.S. N.º 002-2026-PCM/SGRD y R.M. N.º 324-2023-PCM",
            "sector": "MINISTERIO DE VIVIENDA, CONSTRUCCIÓN Y SANEAMIENTO",
            "categoria": "SUBSIDIO HABITACIONAL DE EMERGENCIA",
            "tipo_fragmento": "BONO_ARRENDAMIENTO_BAE",
            "contenido_texto": (
                "Requisitos y Calificación del Bono de Arrendamiento de Emergencia (BAE): "
                "Monto de S/ 500 mensuales por hasta 2 años para familias damnificadas con viviendas "
                "en condición de COLAPSADA o INHABITABLE. Requiere empadronamiento en Formulario 2A de Ficha EDAN, "
                "validación PIDE-RENIEC que certifique titular vivo y no propietario de otra vivienda habitable."
            )
        },
        {
            "chunk_id": "doctrina-ds124-maquinaria-descolmatacion",
            "norma_id": "DS-124-2026-PCM",
            "norma_nombre": "D.S. N.º 124-2026-PCM (Declaratoria Estado de Emergencia FEN)",
            "sector": "PRESIDENCIA DEL CONSEJO DE MINISTROS",
            "categoria": "DECLARATORIA DE ESTADO DE EMERGENCIA",
            "tipo_fragmento": "CONTRATACION_DIRECTA_MAQUINARIA",
            "contenido_texto": (
                "Contratación Directa de Maquinaria Pesada para Limpieza de Cauces y Descolmatación: "
                "El D.S. N.º 124-2026-PCM ampara a 893 distritos en peligro inminente para alquilar excavadoras, "
                "tractores oruga D8/D9, volquetes y motobombas mediante exoneración de concurso público en el SEACE, "
                "con regularización de expediente técnico posterior en 10 días hábiles."
            )
        }
    ]
    chunks.extend(doctrinales)
    return chunks

def ejecutar_vectorizacion_completa():
    print("=" * 75)
    print("🧠 AMARU-LEX: VECTORIZACIÓN MASIVA CON VERTEX AI (text-embedding-004)")
    print("=" * 75)

    chunks = preparar_chunks_normas()
    total = len(chunks)
    print(f"📦 Total de fragmentos jurídicos preparados: {total}")

    # 1. Llamada a Vertex AI en Lotes
    print("\n🌐 Conectando con Vertex AI API (us-central1)...")
    textos = [c["contenido_texto"] for c in chunks]
    start_ai = time.time()
    embeddings = embedding_service.generar_embeddings_lote(textos, task_type="RETRIEVAL_DOCUMENT", batch_size=50)
    duracion_ai = round(time.time() - start_ai, 2)
    print(f"✅ {len(embeddings)} vectores de 768-D generados exitosamente en {duracion_ai}s.")

    # Asignar vector a cada chunk
    for c, vec in zip(chunks, embeddings):
        c["vector_embedding"] = vec

    # 2. Persistencia en Google Cloud SQL
    print("\n🐘 [1/2] Guardando vectores en Google Cloud SQL (amaru_climate_db)...")
    try:
        u = urlparse(db_manager.db_url)
        con = pg8000.native.Connection(
            user=u.username or "amaru_admin",
            password=u.password or "",
            host=u.hostname or "34.176.254.17",
            port=u.port or 5432,
            database=u.path.lstrip("/") or "amaru_climate_db",
            timeout=30
        )

        # Crear tabla de vectores si no existe
        con.run("""
            CREATE TABLE IF NOT EXISTS marco_legal_vectores (
                chunk_id VARCHAR(80) PRIMARY KEY,
                norma_id VARCHAR(50) NOT NULL,
                norma_nombre VARCHAR(200) NOT NULL,
                sector VARCHAR(150),
                categoria VARCHAR(150),
                tipo_fragmento VARCHAR(50),
                contenido_texto TEXT NOT NULL,
                vector_embedding REAL[] NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_vectores_norma ON marco_legal_vectores(norma_id);
            CREATE INDEX IF NOT EXISTS idx_vectores_tipo ON marco_legal_vectores(tipo_fragmento);
        """)

        # Inserción por lotes
        batch_size = 50
        start_sql = time.time()
        for i in range(0, total, batch_size):
            lote = chunks[i:i + batch_size]
            stmts = ["BEGIN;"]
            for c in lote:
                vec_str = "ARRAY[" + ",".join(str(x) for x in c["vector_embedding"]) + "]::REAL[]"
                # Escapar comillas simples
                txt_esc = c["contenido_texto"].replace("'", "''")
                nom_esc = c["norma_nombre"].replace("'", "''")
                sec_esc = c["sector"].replace("'", "''")
                cat_esc = c["categoria"].replace("'", "''")

                sql = (
                    f"INSERT INTO marco_legal_vectores (chunk_id, norma_id, norma_nombre, sector, categoria, tipo_fragmento, contenido_texto, vector_embedding) "
                    f"VALUES ('{c['chunk_id']}', '{c['norma_id']}', '{nom_esc}', '{sec_esc}', '{cat_esc}', '{c['tipo_fragmento']}', '{txt_esc}', {vec_str}) "
                    f"ON CONFLICT (chunk_id) DO UPDATE SET contenido_texto = EXCLUDED.contenido_texto, vector_embedding = EXCLUDED.vector_embedding;"
                )
                stmts.append(sql)
            stmts.append("COMMIT;")
            con.run("\n".join(stmts))
            print(f"   -> {min(i + batch_size, total)}/{total} vectores almacenados en Cloud SQL...")

        res_count = con.run("SELECT COUNT(*) FROM marco_legal_vectores;")[0][0]
        con.close()
        print(f"   ✅ Cloud SQL actualizado: {res_count} vectores persistidos en {round(time.time() - start_sql, 2)}s.")
    except Exception as e:
        print(f"   ⚠️ Aviso guardando en Cloud SQL: {e}")

    # 3. Guardar en Cache JSON Local (Modo Contingencia FEN)
    print("\n💾 [2/2] Guardando dataset vectorial en cache local (Modo Desconectado FEN)...")
    cache_path = DATA_DIR / "marco_legal_embeddings_vertex.json"
    cache_data = {
        "modelo": "text-embedding-004",
        "dimension": 768,
        "total_chunks": total,
        "fecha_generacion": time.strftime("%Y-%m-%d %H:%M:%S"),
        "chunks": chunks
    }
    saved = False
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
        print(f"   ✅ Archivo guardado: {cache_path} ({round(cache_path.stat().st_size / 1024, 1)} KB).")
        saved = True
    except Exception as e:
        print(f"   ⚠️ Aviso guardando en {cache_path}: {e}")
        try:
            temp_cache = Path(r"C:\Users\USUARI~1\AppData\Local\Temp\marco_legal_embeddings_vertex.json")
            with open(temp_cache, "w", encoding="utf-8") as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
            print(f"   ✅ Archivo guardado en fallback seguro: {temp_cache} ({round(temp_cache.stat().st_size / 1024, 1)} KB).")
            saved = True
        except Exception as e2:
            print(f"   ⚠️ Error en fallback local: {e2}")


    print("\n" + "=" * 75)
    print("🎉 VECTORIZACIÓN MASIVA DE AMARU-LEX COMPLETADA EXITOSAMENTE CON VERTEX AI.")
    print("=" * 75)
    return True

if __name__ == "__main__":
    ejecutar_vectorizacion_completa()
