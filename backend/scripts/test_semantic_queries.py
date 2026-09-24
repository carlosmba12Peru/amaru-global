import tempfile
import os
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

import sys
sys.path.insert(0, os.getcwd())

from backend.services.lex.vertex_embedding_service import embedding_service

p = os.path.join(tempfile.gettempdir(), 'marco_legal_embeddings_vertex.json')
with open(p, 'r', encoding='utf-8') as f:
    d = json.load(f)

chunks = d['chunks']
print(f"Total chunks cargados: {len(chunks)}")

consultas = [
    "contratacion directa de excavadoras y maquinaria pesada para defensas ribereñas",
    "bono de arrendamiento de 500 soles para familias con casas destruidas por inundacion",
    "responsabilidad penal y delito de omision de funciones de alcaldes por no limpiar quebradas"
]

for q in consultas:
    t0 = time.time()
    q_vec = embedding_service.generar_embedding(q)
    t_emb = (time.time() - t0) * 1000
    
    t1 = time.time()
    scored = []
    for c in chunks:
        sim = embedding_service.similitud_coseno(q_vec, c["vector_embedding"])
        scored.append((sim, c))
    scored.sort(key=lambda x: x[0], reverse=True)
    t_sim = (time.time() - t1) * 1000
    
    print(f"\n=======================================================")
    print(f"CONSULTA: '{q}'")
    print(f"Latencia Vertex AI Query: {t_emb:.2f}ms | Búsqueda Vectorial: {t_sim:.2f}ms")
    for score, item in scored[:3]:
        print(f" -> [{score*100:.1f}%] {item['norma_nombre']} | {item['tipo_fragmento']}")
        print(f"    Texto: {item['contenido_texto'][:140]}...")
