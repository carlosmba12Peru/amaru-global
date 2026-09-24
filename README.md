# ⚡ AMARU-CLIMATE – Suite Soberana de Inteligencia Territorial y Emergencia Climática
## ARQUITECTURA DE MARCA PARAGUAS & SUBSERVICIOS SOBERANOS
### Fenómeno El Niño (FEN 2026-2027) & Eventos Hidrometeorológicos Extremos

> **Plataforma Tecnológica Soberana e Interoperable de Respuesta y Anticipación ante Desastres**  
> Desarrollado con **FastAPI**, **Next.js 14 (App Router)**, **Google Gemini 1.5 Pro & Vision**, **Open-Meteo Pro (ECMWF IFS 9km)**, **SENAMHI WFS / Radares Banda C**, **DHN / IMARPE SIOFEN**, **ENFEN**, **ANA GeoSNIRH**, **CENEPRED**, **MEF Consulta Amigable (PP 0068)**, **RENIEC PIDE**, **MINSA CDC**, **MINCUL (BDPI / RENALIO)** y **Google Cloud Platform**.  
> **Marco Legal e Institucional:** Ley N.º 29664 (SINAGERD), D.S. N.º 124-2026-PCM (Estado de Emergencia FEN), Ley N.º 31526 & D.S. N.º 008-2022-VIVIENDA (Bono BAE de S/ 500), Ley N.º 29735 (Uso y Preservación de Lenguas Originarias del Perú), Ley N.º 29733 (Protección de Datos Personales / Bóveda Zero-PII AES-256), Ley N.º 26842 (Ley General de Salud), NTS N.º 105-MINSA (Triaje en Emergencias), Ley N.º 31814 & D.S. N.º 115-2025-PCM (Uso Ético de IA y Soberanía Humana / HITL), Ley N.º 30225 (Ley de Contrataciones del Estado - Art. 27 Contratación Directa), R.J. N.º 058-2019-CENEPRED/J (PPRRD), y Art. 377 del Código Penal (Inacción Funcional).

---

## 📑 Tabla de Contenidos
1. [Arquitectura de Marca: AMARU-CLIMATE como Marca Paraguas](#-arquitectura-de-marca-amaru-climate-como-marca-paraguas)
2. [Subservicio 1: COED Nacional AMARU (C2 Macro-Estratégico)](#-subservicio-1-coed-nacional-amaru-c2-macro-estratégico)
3. [Subservicio 2: COED Municipal AMARU (Suite Municipal 360°)](#-subservicio-2-coed-municipal-amaru-suite-municipal-360)
4. [Subservicio 3: COED Social AMARU (Ground-Truth Comunitario & Resiliencia)](#-subservicio-3-coed-social-amaru-ground-truth-comunitario--resiliencia)
5. [Inclusión Intercultural: Pre-Padrón EDAN en Lenguas Originarias & Voz Oral](#-inclusión-intercultural-pre-padrón-edan-en-lenguas-originarias--voz-oral)
6. [Canales de Difusión Ciudadana: Telegram Gratuito & WhatsApp Web](#-canales-de-difusión-ciudadana-telegram-gratuito--whatsapp-web)
7. [Módulo SALUD-AMARU: Triaje Digital Desacoplado & Soberanía Médica](#-módulo-salud-amaru-triaje-digital-desacoplado--soberanía-médica)
8. [Módulo AMARU-DAMNIFICADOS: Pre-Padrón EDAN v2 & Bono BAE S/ 500](#-módulo-amaru-damnificados-pre-padrón-edan-v2--bono-bae-s-500)
9. [Portafolio de Patentes & Propiedad Intelectual (Lab1 vs. Lab4)](#-portafolio-de-patentes--propiedad-intelectual-lab1-vs-lab4)
10. [Swarm Multi-Agente Autónomo & Enjaulamiento Cognitivo](#-swarm-multi-agente-autónomo--enjaulamiento-cognitivo)
11. [Bóveda Criptográfica Envelope Zero-PII & Auditoría WORM](#-bóveda-criptográfica-envelope-zero-pii--auditoría-worm)
12. [Catálogo de Endpoints REST de la API](#-catálogo-de-endpoints-rest-de-la-api)
13. [Puesta en Marcha y Suites de Pruebas Unitarias](#-puesta-en-marcha-y-suites-de-pruebas-unitarias)

---

## 🏛️ Arquitectura de Marca: AMARU-CLIMATE como Marca Paraguas

**AMARU-CLIMATE** constituye la **marca paraguas soberana** que agrupa y articula todos los esfuerzos tecnológicos, analíticos, territoriales y sociales frente a la crisis climática y eventos hidrometeorológicos extremos en el Perú.

Bajo este paraguas operan tres subservicios estratégicos y complementarios:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AMARU-CLIMATE: MARCA PARAGUAS SOBERANA                          │
│               Suite de Inteligencia Territorial, Alerta Temprana y C2                  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         ▼                                  ▼                                  ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
│     COED NACIONAL AMARU      │ │     COED MUNICIPAL AMARU     │ │      COED SOCIAL AMARU     │
│   (C2 Macro-Estratégico)     │ │   (Suite Municipal 360°)     │ │ (Comunidad & Primera Línea)│
├──────────────────────────────┤ ├──────────────────────────────┤ ├──────────────────────────────┤
│ • Geovisor 3D Multiescala    │ │ • Consola PP 0068 (MEF/SIAF) │ │ • Reporte Ciudadano Blindado │
│ • 159 Cuencas & Radares Now. │ │ • Certificador de Maquinaria │ │ • Pre-Padrón EDAN Bilingüe   │
│ • Monitoreo ENFEN/IMARPE/DHN │ │ • Reloj FEN Micro-Calibrado  │ │ • Grabación Oral SHA-256     │
│ • Despacho CAP v1.2 / SISMATE│ │ • Plan Contingencia (PCMD)   │ │ • AMARU-AYNI & Albergues     │
│ • Ingesta KURAQ (27 Fuentes) │ │ • Consola Homologación T1    │ │ • SALUD-AMARU (Triaje NTS)   │
│ • Modo War Room para Crisis  │ │ • Ficha EDAN / BAE S/ 500    │ │ • AMARU-AGRO (SAC / PPA)     │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 🌐 Subservicio 1: COED Nacional AMARU (C2 Macro-Estratégico)

Diseñado para las salas de comando y control del nivel central, ministerios, INDECI, CENEPRED y Fuerzas Armadas:
- **Geovisor 3D Nacional (Deck.gl / MapLibre):** Visualización espacial en tiempo real de precipitaciones ECMWF, caudales ANA, susceptibilidad aluvial CENEPRED y albergues temporales.
- **Modo War Room (`[🖥️ Modo War Room]`):** Expansión visual que maximiza el mapa operativo a `540px` y colapsa paneles accesorios para videowalls de salas de crisis.
- **Radar Nowcasting Banda C:** Integración con los radares meteorológicos de Piura (`PIU`) e Ica (`ICA`) para anticipación aluvial de 0 a 120 minutos.
- **Fusión Oceanográfica & Fluvial:** Ingesta continua de la Bitácora Diaria Oceanográfica IMARPE/DHN (Región Niño 1+2), aforos telemétricos ANA GeoSNIRH y comunicados ENFEN.
- **Despacho Estandarizado OASIS CAP v1.2:** Emisión de alertas estandarizadas compatibles con SISMATE (difusión celular masiva e interoperabilidad internacional).

---

## 🏛️ Subservicio 2: COED Municipal AMARU (Suite Municipal 360°)

Ubicado en `/municipal/[ubigeo]`, provee a los alcaldes y gerentes de Defensa Civil de los **1,891 municipios del Perú** un centro táctico integral:

1. **Consola de Obras PP 0068 & Certificador de Maquinaria:**
   - Auditoría en tiempo real del avance físico y financiero SIAF de proyectos de mitigación y defensas ribereñas.
   - **Certificador de Razonabilidad de Precios de Maquinaria Pesada:** Validación instantánea del precio por hora de tractores oruga D8, excavadoras y motobombas frente a la banda de precios oficiales de mercado, habilitando la contratación directa sin sobreprecios conforme al Art. 27 de la Ley N.º 30225.
   - **Alerta por Inacción Funcional:** Notificación preventiva sobre riesgo de responsabilidad penal bajo el **Art. 377 del Código Penal**.
2. **Reloj FEN Municipal Micro-Calibrado:**
   - Cálculo del tiempo de concentración de la cuenca ($t_c$), tiempo de retardo hidrocinético ($T_{\text{lag}}$) y fecha límite de la **Ventana Dorada (30 de Noviembre)** para trabajos de descolmatación antes de la crecida de ríos ($Q < 15\text{ m}^3/\text{s}$).
3. **Plan de Contingencia Municipal Digital (PCMD):**
   - Generador automatizado de planes distritales con cálculo de Bienes de Ayuda Humanitaria (BAH) bajo directivas INDECI y proyecto formal de **Resolución de Alcaldía lista para firma**.
4. **PPRRD Digital (CENEPRED):**
   - Cartera de inversiones estructurales y medidas no estructurales conforme a la R.J. N.º 058-2019-CENEPRED/J.
5. **Pre-Padrón EDAN & Damnificados Validados:**
   - Bandeja distrital con desglose de familias, viviendas colapsadas, inhabitables, elegibles al Bono BAE y formalización en SINPAD.

---

## 👥 Subservicio 3: COED Social AMARU (Ground-Truth Comunitario & Resiliencia)

Herramientas concebidas para la ciudadanía, juntas vecinales, ollas comunes y brigadas barriales de primera línea:
- **Consola de Reporte Ciudadano Blindado (`/reporte-ciudadano`):**
  - **Selector Ergonómico de Altura de Agua en 1 Toque:** `🦶 Tobillo (~15cm)`, `🦵 Rodilla (~50cm)`, `🧍 Cintura (~1.00m)`, `🏠 Techo (>2.00m)`.
  - **Blindaje Anti-Fake:** Las fotografías y testimonios crudos no se publican en internet para evitar pánico colectivo ni viralización de bulos. Se genera un pin geográfico discreto tras validación forense con metadatos EXIF y Gemini Vision.
- **AMARU-AYNI (`/ayni`):**
  - Red comunitaria para ollas comunes (Ley N.º 31458), albergues temporales y juntas vecinales con canalización de necesidades logísticas y víveres.

---

## 🌐 Inclusión Intercultural: Pre-Padrón EDAN en Lenguas Originarias & Voz Oral

El Perú cuenta con 48 lenguas originarias y millones de ciudadanos cuya lengua materna no es el castellano. Bajo el amparo de la **Ley N.º 29735**, AMARU-CLIMATE garantiza soberanía e inclusión lingüística en el registro EDAN:

### 1. Diccionario Etnolingüístico Oficial (`frontend/src/locales/edan_i18n.ts`)
Soporte completo e interactivo para 5 variantes:
- 🇵🇪 **Castellano** (`es`)
- 🌄 **Runasimi Chanka** (`qu_chanka`): Ayacucho, Huancavelica, Apurímac.
- 🏔️ **Runasimi Qullaw** (`qu_collao`): Cusco, Puno, Arequipa alta.
- ❄️ **Runasimi Anqash** (`qu_ancash`): Callejón de Huaylas, Conchucos.
- 🦙 **Aymara** (`aymara`): Altiplano, Puno, Moquegua, Tacna.

### 2. Grabación de Testimonio Oral en Dispositivo (Zero-Cloud PII)
- Componente nativo [`VoiceStoryRecorder.tsx`](frontend/src/components/VoiceStoryRecorder.tsx) basado en la Web Audio API estándar (`navigator.mediaDevices.getUserMedia`).
- **Sin suscripciones ni costes en dólares:** No requiere plataformas propietarias externas (como Vapi AI) que forzarían la exposición de audios sensibles y presentan altas tasas de alucinación fonética en lenguas indígenas.
- **Sellado Criptográfico SHA-256 en el Navegador:** El audio se procesa en la memoria del dispositivo del poblador, calculando su hash SHA-256 (`audio_testimonio_sha256`) antes del envío. Esto garantiza inalterabilidad probatoria ante el INDECI y la Contraloría sin transferir datos biométricos desprotegidos.

### 3. Asistencia Bilingüe Acreditada MINCUL
- El poblador puede activar la casilla `[ ] Requiere evaluador bilingüe`.
- El sistema alerta inmediatamente en el COED Municipal para el despacho de personal acreditado en el Registro Nacional de Intérpretes y Traductores de Lenguas Indígenas (**ReNITLI / RENALIO**).

---

## 📱 Canales de Difusión Ciudadana: Telegram Gratuito & WhatsApp Web

Para facilitar la adopción masiva sin incurrir en cuotas de pago de APIs corporativas:

### 1. Integración Gratuita con Telegram Bot API (Ideal para Pruebas y Operación de Campo)
- **100% Gratuito y sin restricciones de verificación de empresa:** Telegram permite crear bots sin costo en segundos a través de `@BotFather`.
- El backend de AMARU-CLIMATE ya cuenta con el despachador nativo en [`backend/services/ayni_service.py`](backend/services/ayni_service.py).
- **Configuración de Variables de Entorno:**
  ```env
  TELEGRAM_BOT_TOKEN="tu_token_de_bot_father"
  TELEGRAM_CHAT_ID="id_del_canal_o_grupo_coed"
  ```
- **Botón de Compartición Web:** En el comprobante digital de pre-empadronamiento se incluye el botón directo `t.me/share/url`, permitiendo que el damnificado comparta su código de custodia `CUP-DAMN` a su familia o directiva comunal con un solo toque.

### 2. Enlace Directo a WhatsApp Web (Sin Meta Cloud API)
- Para evitar las altas tarifas de mensajes salientes de WhatsApp Business Cloud API, el comprobante genera una URL codificada `https://api.whatsapp.com/send?text=...`.
- El mensaje incluye el código de trámite, estado preliminar de vivienda, elegibilidad al Bono BAE y texto adaptado a la lengua materna seleccionada.

---

## 🩺 Módulo SALUD-AMARU: Triaje Digital Desacoplado & Soberanía Médica

Especialmente diseñado para atender a poblaciones aisladas por desbordes y huaicos bajo estricto amparo de la **Ley General de Salud N.º 26842**, la **Ley N.º 29733** y la **NTS N.º 105-MINSA/DGSP**:

1. **Desacoplamiento Cero-PII:** La identidad del paciente queda sellada en la Bóveda Criptográfica AES-256. El expediente médico público solo expone el código `CUP-MINSA-{UBIGEO}-{HEX}`.
2. **Observación Preliminar de IA (No vinculante / Sin receta farmacológica):**
   - 🔴 **Prioridad I (Rojo):** Emergencia con riesgo de muerte (dificultad respiratoria severa, shock, gestante con contracciones o sangrado, mordedura de serpiente).
   - 🟡 **Prioridad II (Amarillo):** Urgencia mayor (dengue con signos de alarma, leptospirosis tras inmersión prolongada en aguas servidas, heridas infectadas con lodo).
   - 🟢 **Prioridad III (Verde):** Urgencia menor (cuadros febriles leves, diarrea sin deshidratación).
   - ⚪ **Prioridad IV (Azul):** Consulta médica diferible.
3. **Protocolo Break-the-Glass Médico:**
   - El sobre criptográfico solo puede ser abierto por un **Médico Cirujano habilitado con su N.º de CMP** e indicación de justificación clínica de urgencia (amparado en el Art. 14 inc. 4 de la Ley N.º 29733).
   - El evento se registra en la bitácora inmutable **WORM (`data/audit_salud_break_glass.jsonl`)** con hash SHA-256.
4. **Soberanía Médica:** El médico cirujano ratifica la prioridad, emite el diagnóstico presuntivo y dispone la conducta de rescate: *Evacuación Aeromédica FAP*, *Brigada Fluvial Zodiac*, *Teleorientación Telefónica* o *Manejo en Albergue*.

---

## 📋 Módulo AMARU-DAMNIFICADOS: Pre-Padrón EDAN v2 & Bono BAE S/ 500

Módulo de pre-empadronamiento digital y verificación cruzada territorial para acelerar la asistencia humanitaria y la canalización del **Bono de Arrendamiento de Emergencia (Bono BAE)**:

1. **Marco Legal Integrado:**
   - **Ley N.º 29664 (SINAGERD):** Distinción formal entre Damnificado (daño severo en vivienda o medios de vida) y Afectado (daño menor subsanable).
   - **Ley N.º 31526 & D.S. N.º 008-2022-VIVIENDA:** Subsidio de **S/ 500 mensuales por hasta 2 años** para familias cuya vivienda sea declarada **Colapsada / Destruida** o **Inhabitable**.
   - **Manual EDAN v2 (INDECI):** Estándar oficial de evaluación de daños para alimentación del **SINPAD**.
2. **Motor de Consistencia Territorial AMARU-CLIMATE (Score 0 - 100%):**
   - **Capa 1 (35%):** Alerta hidrológica activa en cuenca (SENAMHI, ANA, GloFAS).
   - **Capa 2 (25%):** Buffer de proximidad al eje aluvial o faja marginal CENEPRED ($< 2.5\text{ km}$).
   - **Capa 3 (20%):** Consenso espacial multivecinal ($\ge 2$ reportes coincidentes en el distrito).
   - **Capa 4 (20%):** Peritaje Gemini Vision de huellas de barro y tirante de agua.
3. **Pre-Clasificaciones Oficiales:**
   - 🔴 **Damnificado - Vivienda Colapsada:** Tirante $> 2.00\text{ m}$ (`🏠 Techo`) o arrastre de cimientos. **Elegible al Bono BAE**, carpa unifamiliar y módulo temporal MVCS.
   - 🟠 **Damnificado - Vivienda Inhabitable:** Inundación prolongada (`🧍 Cintura` o `🦵 Rodilla` con muros de adobe/quincha con riesgo de colapso). **Elegible al Bono BAE**.
   - 🔵 **Afectado - Vivienda Afectada Leve:** Anegamiento de patio (`🦶 Tobillo`). No elegible a Bono BAE; priorizado para motobombas de achique y kits de herramientas.
4. **Soberanía Humana & Formalización SINPAD:**
   - La IA solo calcula consistencia técnica. El **Jefe de Defensa Civil distrital** ejecuta el Break-the-Glass oficial, inspecciona en campo, formaliza la Ficha EDAN y registra el caso en el **SINPAD Nacional**.

---

## 💡 Portafolio de Patentes & Propiedad Intelectual (Lab1 vs. Lab4)

### A. Herencia Tecnológica y Módulos Compartidos de Lab1
AMARU-CLIMATE reutiliza componentes nucleares de ciberseguridad y soberanía de datos validados en Lab1:
1. **Bóveda de Criptografía de Sobre Zero-PII (`SecureZeroPiiVault`):** Cifrado simétrico de datos sensibles en memoria volátil con clave maestra en sobre cerrado, emitiendo identificadores opacos desvinculados de la identidad civil.
2. **Bitácora Inmutable WORM de Auditoría (*Break-the-Glass*):** Registro de solo adición con marca de tiempo UTC y hash encadenado SHA-256 para cualquier apertura forzada de datos confidenciales.
3. **Sandbox de Enjaulamiento Cognitivo (*Agent Enjailment*):** Aislamiento estricto de agentes de IA donde cada modelo únicamente puede invocar herramientas de su dominio estricto, imposibilitando la escalada de privilegios o ejecución de código arbitrario.

### B. Patente Madre / Insignia de Sistema (Arquitectura General Multiescala)
> **Candidato a Patente:** *Sistema computacional y método de comunicación bidireccional multiescala para la sincronización hidrocinética, certificación criptográfica de daños en el borde y retroalimentación humanitaria en tiempo real.*
> 
> **Reclamo Esencial y Nivel Inventivo:**  
> La novedad radica en que el sistema sincroniza en tiempo real un modelo predictivo hidrodinámico centralizado descendente con una malla de verificación territorial ascendente protegida por encriptación de sobre (Zero-PII), cerrando el ciclo mediante la emisión automatizada de comprobantes de elegibilidad a subsidios de arrendamiento de emergencia (Bono BAE) sin exponer datos biométricos ni depender de servicios de mensajería comercial de pago.

### C. Fichas Técnicas de las 5 Patentes de Subsistema Especializado (Lab4)
Las siguientes tecnologías representan desarrollos originales creados para resolver los desafíos físicos, geográficos y sociales del Fenómeno El Niño:

| N.° | Denominación de la Invención | Campo Técnico | Problema Físico / Operativo que Resuelve |
|:---:|:---|:---|:---|
| **1** | **AMARU-METEO-FUSION** | Fusión de Sensores & Modelamiento Hidráulico | Corrige el sesgo orográfico de modelos globales (ECMWF 9km) en los Andes peruanos mediante fusión ponderada con radares Banda C Vaisala y detecta de forma autónoma la **Ventana Dorada de Inyección** ($Q < 15\text{ m}^3/\text{s}$) para obras ribereñas. |
| **2** | **Motor Tetra-Índice con Amortiguador Asintótico** | Analítica Predictiva & Evaluación Multicriterio | Integra IRCE, IPH, IPI e ISH mediante matrices Saaty AHP e introduce un amortiguador no lineal de $+0.35$ que evita falsos negativos en cuencas áridas de respuesta torrencial súbita. |
| **3** | **Zero-Cloud PII Oral Witness & EDAN Intercultural** | Criptografía en el Borde & Accesibilidad Lingüística | Permite la captura de testimonios orales de desastres en lenguas originarias con sellado de hash SHA-256 local en el navegador, preservando la validez probatoria sin exponer biometría de voz en nubes públicas. |
| **4** | **Reloj Táctico Polar Multi-escala de Emergencia** | Interfaz Humano-Máquina C2 | Visualización polar concéntrica que sincroniza el tiempo de concentración de cuenca ($t_c$), tiempo de retardo aluvial ($T_{\text{lag}}$) y la fecha de desborde proyectada en videowalls de salas de crisis. |
| **5** | **Serializador Dual CAP v1.2 / Cell Broadcast Rural** | Telecomunicaciones Resilientes | Convierte alertas técnicas en tramas bilingües ultracompactas preparadas para difusión celular masiva (SISMATE / SMS) funcionales incluso con colapso total de redes de datos móviles IP. |

---

## 🤖 Swarm Multi-Agente Autónomo & Enjaulamiento Cognitivo

AMARU-CLIMATE opera con una constelación de agentes especializados coordinados bajo el principio de enjaulamiento cognitivo:

| Agente | Nombre en Runa Simi / Rol | Misión Principal y Herramientas |
|---|---|---|
| 👑 **Agente 1** | **KURAQ** (Master Data Ingestion) | Ingesta y validación de 27 fuentes oficiales (SENAMHI, IMARPE, ENFEN, ANA, GloFAS). |
| 🧠 **Agente 2** | **YACHAY** (Memoria Histórica & Saberes) | Análogos históricos FEN (1983, 1998, 2017, Yaku 2023), bioindicadores y nodos CAF. |
| ✍️ **Agente 3** | **QILQAY** (Escribano Oficial C2) | Redacción de Resoluciones de Alcaldía, informes situacionales e inyección CAP v1.2. |
| 📐 **Agente 4** | **YUPAQ** (Cálculo Físico & Hidrometeorológico) | Ecuaciones de Manning, Mohr-Coulomb, fórmulas tetra-índice Saaty AHP. |
| ⚖️ **Agente 5** | **FISCALIZADOR** (Auditoría MEF & CGR) | Cruce de proyectos PP 0068, alertas SIAF y razonabilidad de maquinaria (Ley 30225). |
| 👥 **Agente 6** | **COMUNITARIO** (Intercultural & Difusión) | Adaptación lingüística Quechua/Aymara y despacho a Telegram/WhatsApp. |
| 🛰️ **Agente 7** | **SATELITAL** (Teledetección & Radar) | Nowcasting de radares Banda C Vaisala y detección de humedad de suelo Sentinel/ECMWF. |
| 📜 **Agente 8** | **ReNITLI** (Fe Pública Intercultural) | Certificación pericial bilingüe con hash SHA-256 inmutable (Ley N.º 29735 / Art. 220 CPP). |
| 🩺 **Agente 9** | **SALUD-AMARU** (Triaje Desacoplado) | Clasificación preliminar NTS-105 MINSA y custodia de expedientes CUP-MINSA. |
| 📋 **Agente 10** | **AMARU-DAMNIFICADOS** (Auditor Territorial) | Validación cruzada de Fichas EDAN, consistencia territorial y elegibilidad Bono BAE. |

---

## 🔒 Bóveda Criptográfica Envelope Zero-PII & Auditoría WORM

Para dar cumplimiento irrestricto a la **Ley N.º 29733 (Protección de Datos Personales)**:
- **Envelope Encryption:** Los datos de filiación ciudadana se encriptan con claves simétricas AES-256 generadas dinámicamente en RAM.
- **Códigos Opacos:** `CUP-MINSA-{UBIGEO}-{HEX}` para salud y `CUP-DAMN-{UBIGEO}-{HEX}` para damnificados.
- **Bitácoras WORM (Write Once, Read Many):** Todo acceso por Break-the-Glass se registra en archivos `.jsonl` auditables con marca de tiempo UTC y hash SHA-256 encadenado:
  - `data/audit_salud_break_glass.jsonl`
  - `data/audit_damnificados_break_glass.jsonl`

---

## 🔌 Catálogo de Endpoints REST de la API

### Módulo AMARU-DAMNIFICADOS (Pre-Padrón EDAN, Lenguas Originarias & Bono BAE)
- `POST /api/v1/damnificados/registrar`: Pre-empadronamiento ciudadano bilingüe (Quechua/Aymara/Castellano), con soporte de `lengua_materna`, `requiere_asistencia_bilingue`, `audio_testimonio_sha256` y generación de `CUP-DAMN`.
- `GET /api/v1/municipal/{ubigeo}/padron-damnificados`: Bandeja distrital desacoplada para Defensa Civil con distintivo de lengua originaria y audio testimonio.
- `GET /api/v1/municipal/{ubigeo}/padron-damnificados/{cup}`: Consulta de expediente técnico desacoplado con metadatos lingüísticos.
- `POST /api/v1/municipal/{ubigeo}/padron-damnificados/{cup}/desbloquear-identidad`: Protocolo Break-the-Glass con DNI de evaluador.
- `POST /api/v1/municipal/{ubigeo}/padron-damnificados/{cup}/aprobar-sinpad`: Aprobación y formalización formal en SINPAD.
- `GET /api/v1/municipal/{ubigeo}/padron-damnificados/metricas`: KPIs distritales y estimación de presupuesto BAE.

### Módulo AMARU-AGRO (Pre-Padrón Agrícola, Seguro Catastrófico SAC & Auditoría Satelital)
- `POST /api/v1/agro/registrar-siniestro`: Registro georreferenciado de parcela siniestrada, cultivo y tenencia PPA con emisión de `CUP-AGRO`.
- `GET /api/v1/agro/auditoria-satelital/{cup}`: Consulta de cruce espectral Sentinel-1 SAR (inundación activa) y serie histórica NDVI de 60 días previos (biomasa pre-huaico).
- `POST /api/v1/agro/homologar-sac/{cup}`: Acta de ajuste digitalizada y firma de perito de la Dirección Regional de Agricultura / Aseguradora.
- `GET /api/v1/agro/cerradura-geodesica-h3`: Verificador espacial de exclusión de solapamiento de tierras comunales en hexágonos H3.

### Módulo SALUD-AMARU (Triaje Médico Desacoplado)
- `POST /api/v1/salud/triaje/registrar`: Registro de paciente y emisión de observación NTS-105.
- `GET /api/v1/salud/bandeja-minsa`: Bandeja médica con prioridad de gravedad (I, II, III).
- `GET /api/v1/salud/caso/{cup}`: Detalle del caso clínico con identidad protegida.
- `POST /api/v1/salud/caso/{cup}/homologar-medico`: Certificación médica oficial y vinculación con la historia clínica SIS/MINSA.
- `POST /api/v1/salud/caso/{cup}/desbloquear-identidad`: Protocolo Break-the-Glass médico con CMP.
- `POST /api/v1/salud/caso/{cup}/resolucion-medica`: Dictamen de conducta médica y rescate.
- `GET /api/v1/salud/metricas`: Métricas ejecutivas de atenciones de emergencia.

### Suite Municipal 360° & Obras PP 0068
- `GET /api/v1/municipal/{ubigeo}/obras-pp0068`: Cartera de proyectos MEF y cuellos de botella SIAF.
- `POST /api/v1/municipal/{ubigeo}/certificar-maquinaria`: Certificación de razonabilidad de precios de maquinaria pesada (Ley N.º 30225).
- `GET /api/v1/municipal/{ubigeo}/reloj-fen`: Métricas hidrocinéticas de cuenca y fecha límite de Ventana Dorada.
- `GET /api/v1/municipal/{ubigeo}/plan-contingencia-digital`: Generador del Plan PCMD y resolución de alcaldía.
- `GET /api/v1/municipal/{ubigeo}/pprrd-digital`: Cartera de inversiones estructurales y medidas CENEPRED.

---

## 🚀 Puesta en Marcha y Suites de Pruebas Unitarias

### 1. Requisitos Previos
- **Python 3.11+**
- **Node.js 18+** y **npm**
- **Google Cloud Platform SDK (gcloud CLI)** configurado

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# En Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# En Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
# Acceder a http://localhost:3000
```

### 4. Ejecución de la Suite Completa de Pruebas (100% Pass)
```bash
# Desde la raíz del repositorio:
$env:PYTHONPATH="backend"
.\backend\.venv\Scripts\python.exe -m unittest backend/tests/test_damnificados_amaru.py backend/tests/test_salud_amaru.py backend/tests/test_municipal_suite_360.py

# Verificación de TypeScript en Frontend (0 errores):
cd frontend
npx tsc --noEmit
```

---

## 📄 Licencia y Soberanía Tecnológica

Desarrollado bajo principios de **Soberanía Tecnológica Nacional y Ciencia Abierta**. Prohibida su comercialización privada o apropiación sin autorización institucional expresa de las entidades rectoras del SINAGERD.
