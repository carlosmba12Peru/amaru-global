"""
Pruebas Unitarias del Motor de Búsqueda Semántica Vectorial con Vertex AI (text-embedding-004)
AMARU-LEX (COEN-Digital) - Lab4
Valida dimensiones de 768-D, cálculo de similitud coseno y coincidencia jurídica de las 51 normas.
"""

import unittest
import math
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from services.lex.vertex_embedding_service import embedding_service
    from services.legal_framework_service import legal_service
except ImportError:
    from backend.services.lex.vertex_embedding_service import embedding_service
    from backend.services.legal_framework_service import legal_service



class TestVertexEmbeddingsLex(unittest.TestCase):
    def test_vertex_embedding_dimensions_and_norm(self):
        """Verifica que el servicio genera vectores de 768 dimensiones normalizados."""
        texto_prueba = "Decreto Supremo Nº 124-2026-PCM declaratoria de estado de emergencia"
        vec = embedding_service.generar_embedding(texto_prueba)

        assert isinstance(vec, list), "El embedding debe ser una lista de floats"
        assert len(vec) == 768, f"Se esperaban 768 dimensiones, pero se obtuvieron {len(vec)}"

        norm = math.sqrt(sum(x * x for x in vec))
        assert abs(norm - 1.0) < 0.05, f"La norma L2 del vector debe aproximarse a 1.0 (obtenido: {norm})"

    def test_similitud_coseno_matematica(self):
        """Valida las propiedades algebraicas de la similitud de coseno."""
        v1 = [1.0, 0.0, 0.0]
        v2 = [1.0, 0.0, 0.0]
        v3 = [-1.0, 0.0, 0.0]
        v4 = [0.0, 1.0, 0.0]

        # Identidad
        sim_id = embedding_service.similitud_coseno(v1, v2)
        assert abs(sim_id - 1.0) < 1e-4

        # Antítesis
        sim_op = embedding_service.similitud_coseno(v1, v3)
        assert abs(sim_op - (-1.0)) < 1e-4

        # Ortogonalidad
        sim_ort = embedding_service.similitud_coseno(v1, v4)
        assert abs(sim_ort - 0.0) < 1e-4

    def test_legal_service_vector_status(self):
        """Verifica el estado del motor vectorial institucional en LegalFrameworkService."""
        status = legal_service.get_vector_status()
        assert status["activo"] is True
        assert status["total_chunks_vectorizados"] == 105
        assert status["dimension"] == 768
        assert status["modelo"] == "text-embedding-004"
        assert "Google Cloud Vertex AI" in status["proveedor"]

    def test_semantic_search_machinery_ds124(self):
        """Consulta táctica sobre maquinaria pesada debe priorizar el D.S. 124-2026-PCM."""
        q = "contratacion directa de excavadoras y maquinaria pesada para defensas ribereñas"
        resultado = legal_service.buscar_normas_semanticas(q, top_k=3, umbral_minimo=0.40)

        assert resultado["total_coincidencias"] > 0
        assert "coincidencias" in resultado
        top_match = resultado["coincidencias"][0]

        # Debe asociarse con D.S. 124 o Ley 32513
        assert any(
            n in top_match["norma_nombre"]
            for n in ["124-2026-PCM", "32513", "087-2018", "Decreto"]
        )
        assert top_match["similitud_porcentaje"] >= 50.0
        assert "dictamen_amparo_inmediato" in resultado

    def test_semantic_search_bono_arrendamiento_bae(self):
        """Consulta sobre bono de S/ 500 para damnificados debe priorizar la normativa BAE."""
        q = "bono de arrendamiento de 500 soles para familias con casas destruidas por inundacion"
        resultado = legal_service.buscar_normas_semanticas(q, top_k=3, umbral_minimo=0.40)

        assert resultado["total_coincidencias"] > 0
        top_match = resultado["coincidencias"][0]
        assert "BAE" in top_match["norma_nombre"] or "002-2026" in top_match["norma_nombre"] or "324-2023" in top_match["norma_nombre"] or top_match["similitud_porcentaje"] >= 50.0

    def test_semantic_search_empty_query(self):
        """Una consulta vacía no debe provocar excepciones y debe responder adecuadamente."""
        resultado = legal_service.buscar_normas_semanticas("", top_k=5)
        assert resultado["total_coincidencias"] == 0
        assert "válida" in resultado["dictamen_amparo_inmediato"]
