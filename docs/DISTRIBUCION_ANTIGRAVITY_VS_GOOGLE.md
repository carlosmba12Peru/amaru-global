# DOCUMENTO TÉCNICO PRIVADO Y CONFIDENCIAL
## ARQUITECTURA DE DISTRIBUCIÓN DE RESPONSABILIDADES: ANTIGRAVITY VS. GOOGLE CLOUD PLATFORM (GCP)
### PROYECTO: COEN-DIGITAL / SAT BI-ESCALA FRENTE AL FENÓMENO EL NIÑO (ENSO)

**Clasificación:** PRIVADO / CONFIDENCIAL  
**Fecha:** Septiembre 2026  
**Sistema:** COEN-Digital (Centro de Operaciones de Emergencia Nacional)  
**Entorno:** Antigravity 2.0 + Google Cloud Platform (Serverless)  

---

## 1. VISIÓN GENERAL DE LA SINERGIA

El desarrollo y operación del Sistema de Alerta Temprana (SAT Bi-Escala) se estructura bajo un modelo de colaboración de alta eficiencia entre **Antigravity** (como fábrica de software, arquitecto y desarrollador de agentes autónomos) y **Google Cloud Platform** (como infraestructura soberana, entorno de ejecución serverless 24/7 y motor fundacional de inteligencia artificial).

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            ANTIGRAVITY (Tu Fábrica de Software Agéntico)                    │
│  • Orquesta el Monorepo completo (FastAPI en Backend + Next.js 14 App Router en Frontend)   │
│  • Compone la lógica del Swarm de los 4 Agentes de IA en Python:                            │
│    1. Agente Centinela (Matriz Multi-Criterio 4 niveles + Open-Meteo Pro Batch)             │
│    2. Agente Táctico (Evaluación de impacto crítico INEI, MTC, Hospitales e INDECI)        │
│    3. Agente Lingüístico (Traducción bilingüe a Quechua Chanka/Collao, Aymara y Español)    │
│    4. Agente Despachador (Norma CAP v1.2 para SISMATE y Telegram Dual-Channel)              │
│  • Desarrolla la ingesta de Open-Meteo Pro Full Stack (ECMWF IFS 9km, CAPE y Suelo 4 capas) │
│  • Codifica el conector WFS OGC de SENAMHI y el algoritmo de Bias Correction (Sesgo Andino) │
│  • Escribe el parser de comunicados ENFEN y el monitor de ondas Kelvin de boyas DHN/IMARPE  │
│  • Construye el serializador oficial bajo la norma internacional CAP v1.2 para SISMATE     │
│  • Ensambla la UI del Tablero Nacional y consolas distritales (Deck.gl 3D, Tailwind, Lucide)│
│  • Conteneriza la solución (Dockerfiles multi-stage, docker-compose) y valida el tipado     │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ (gcloud run deploy / CI-CD / Event-Driven)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          GOOGLE CLOUD PLATFORM (Tu Infraestructura 24/7)                    │
│  • Cloud Run (Serverless): Aloja el Tablero Nacional y las consolas de los 1,874 distritos │
│    con autoescalado elástico de 0 a N instancias y alta disponibilidad                      │
│  • Google AI Studio / Vertex AI (Gemini 1.5): Provee el motor cognitivo para la evaluación  │
│    táctica de INDECI y la traducción dialectal adaptativa (Quechua Chanka/Collao/Aymara)   │
│  • Cloud Scheduler & Cloud Tasks: Bucle autónomo 24/7 que despierta al Agente Centinela    │
│    cada 15 minutos sin requerir guardias nocturnas humanas                                  │
│  • BigQuery: Feature store de series temporales de boyas, estaciones EMA y bitácora         │
│    inmutable de auditoría legal de incidentes y latencias                                   │
│  • Cloud Storage (GCS): Repositorio de alta velocidad para capas vectoriales del INEI,     │
│    red vial MTC y fajas marginales de la Autoridad Nacional del Agua (ANA)                  │
│  • Google Maps Platform: Provee mapas base satelitales híbridos, elevación y geocodificación│
│  • Facturación: Arquitectura de costo optimizado ($36 - $60 USD/mes), 100% financiable con │
│    créditos de bienvenida ($300-340 USD) + cupo recurrente de $200 USD/mes de Maps          │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MATRIZ DETALLADA DE RESPONSABILIDADES

| Dominio Técnico | Antigravity (Fábrica de Software Agéntico) | Google Cloud Platform (Infraestructura 24/7) |
| :--- | :--- | :--- |
| **Rol Primario** | **Arquitecto y Desarrollador**: Lógica agéntica, algoritmos físicos, código fuente, interfaz y adaptadores de datos. | **Motor y Plataforma de Producción**: Cómputo serverless, inferencia LLM, almacenamiento de alta escala y red global. |
| **Capa Backend** | Controladores FastAPI, contratos Pydantic, algoritmos de bias correction y herramientas *Function Calling*. | Ejecución contenerizada en Cloud Run con balanceo de carga automático y triggers con Cloud Scheduler. |
| **Capa Cognitiva (IA)** | Diseño de *system instructions*, prompting dialectal, flujos de razonamiento y validación de esquemas JSON. | Inferencia de modelos Gemini 1.5 Flash en Google AI Studio / Vertex AI con SLA empresarial. |
| **Capa de Datos** | Clientes API para Open-Meteo Pro, GeoServer WFS de SENAMHI, parser de comunicados ENFEN y boyas DHN. | Tablas particionadas en BigQuery y buckets de Cloud Storage para cartografía vectorial de INEI, MTC y ANA. |
| **Capa Frontend** | Diseño del videowall 3D, dashboard nacional, medidores CAPE, hidrogramas y modales interactivos CAP v1.2. | Red de distribución de contenidos (Cloud CDN), mapas base satelitales y geocodificación de Google Maps. |
| **Seguridad y Auditoría** | Implementación del protocolo CAP v1.2 (ITU-T X.1303), hashing SHA-256 de alertas y bitácora local. | Cloud IAM (permisos de mínimo privilegio), Secret Manager para API keys y auditoría inmutable en Cloud Logging. |

---

## 3. FLUJO OPERATIVO CICLICO (CICLO DE VIDA CONTINUO)

1. **Ingeniería e Iteración en Antigravity:**
   - Antigravity programa, prueba y compila la lógica de los agentes en local (Next.js 14 + FastAPI).
   - Valida la compatibilidad con Open-Meteo Pro (`models=ecmwf_ifs025`, variables convectivas `cape`, 4 capas de humedad del suelo).
   - Prueba unitaria de los 4 agentes y simula la emisión del XML CAP v1.2 para SISMATE.

2. **Despliegue y Activación en Google Cloud:**
   - Se empaquetan los contenedores Docker mediante Cloud Build.
   - Se despliegan en Google Cloud Run (`coen-backend` y `coen-frontend`).
   - Cloud Scheduler dispara solicitudes POST cada 15 minutos al endpoint `/api/agents/run/batch` para escaneo continuo de las 159 cuencas hidrográficas.

3. **Inferencia y Alerta en Tiempo Real:**
   - Si el Agente Centinela detecta que el índice de riesgo compuesto supera el umbral crítico ($R \ge 0.70$), activa en cadena al Agente Táctico (Vertex AI / Gemini) y al Agente Lingüístico.
   - El Agente Despachador emite el boletín CAP v1.2 hacia SISMATE y distribuye los mensajes a los canales de Telegram correspondientes (COER y Vecinal).
   - La traza completa se almacena de forma inmutable en BigQuery.

---

## 4. REGISTRO Y VINCULACIÓN

- **Documento Principal de Propuesta:** [PROPUESTA_TECNICA_SAT_ENSO.md](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/PROPUESTA_TECNICA_SAT_ENSO.md)
- **Código Fuente Backend:** [main.py](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/backend/main.py)
- **Orquestador Agéntico:** [orchestrator.py](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/backend/agents/orchestrator.py)
- **Tablero Nacional:** [page.tsx](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/frontend/src/app/page.tsx)
