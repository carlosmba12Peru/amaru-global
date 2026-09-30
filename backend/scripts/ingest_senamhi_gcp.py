#!/usr/bin/env python3
"""
AMARU-CLIMATE - Standalone Cloud Run Job / CLI Ingestor SENAMHI -> GCP
Ejecutable por Cloud Run Jobs, Cloud Scheduler o Terminal.
"""

import sys
import os
import asyncio

# Asegurar path de backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.senamhi_ingestion_service import senamhi_ingestion_service

async def main():
    print("=" * 70)
    print(" AMARU-CLIMATE :: INGESTA AUTOMATIZADA SENAMHI -> GCP BIGQUERY & GCS")
    print("=" * 70)
    resultado = await senamhi_ingestion_service.run_ingestion_pipeline()
    print("Resultado:")
    print(f"  Estado: {resultado.get('status')}")
    print(f"  Estaciones procesadas: {resultado.get('estaciones_procesadas')}")
    print(f"  SHA-256 Custodia: {resultado.get('sha256_custodia')}")
    print(f"  GCS: {resultado.get('cloud_storage')}")
    print(f"  BigQuery: {resultado.get('bigquery')}")
    print(f"  Duración: {resultado.get('duracion_segundos')}s")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
