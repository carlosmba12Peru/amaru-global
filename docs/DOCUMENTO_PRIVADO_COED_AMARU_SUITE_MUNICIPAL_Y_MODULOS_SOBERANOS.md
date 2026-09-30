# DOCUMENTO PRIVADO / CLASIFICACIÓN: RESERVADO
# SISTEMA SOBERANO COED-AMARU • SUITE MUNICIPAL 360°, SALUD-AMARU Y AMARU-DAMNIFICADOS

**Identificador de Registro:** `DOC-PRIVADO-COED-AMARU-2026-V3`  
**Clasificación de Seguridad:** RESERVADO / USO OFICIAL EXCLUSIVO  
**Destinatarios Autorizados:** Presidencia del Consejo de Ministros (PCM), INDECI, COEN, MINSA (Dirección General de Gestión del Riesgo de Desastres y Defensa Nacional en Salud - DIGERD), Ministerio de Vivienda (MVCS), Asesorías Jurídicas de Gobiernos Regionales, Alcaldes Distritales y Jefes de Oficinas de Defensa Civil (ODC / GT-GRD).  
**Fecha de Actualización Técnica:** 24 de Septiembre de 2026  
**Horizonte de Aplicación Operativa:** Campaña Preventiva y Reactiva FEN 2026 – Julio 2027  

---

## 1. REBRANDING ESTRATÉGICO: COED-AMARU (CENTRO DE OPERACIONES DE EMERGENCIA DIGITAL)

### 1.1. Justificación Operativa y Doctrinal
En las versiones iniciales se utilizaron las siglas *COEN Nacional*, *COEL Municipal* y *COEN Social*. Sin embargo, ante el análisis de riesgo institucional de que actores externos o ciudadanos pudieran confundir esta herramienta tecnológica independiente con entidades del Estado, se estableció por decisión directiva el uso de:

$$\mathbf{COED-AMARU} \quad \Longleftrightarrow \quad \text{Centro de Operaciones de Emergencia Digital}$$

Conformado por tres salas de mando soberanas e interconectadas:
1. **COED Nacional Amaru:** Sala C2 Macro-Estratégica país (159 cuencas, telemetría radar Banda C Nowcasting Piura/Ica, ENFEN/IMARPE/DHN y despacho CAP v1.2 / SISMATE).
2. **COED Municipal Amaru (Suite Municipal 360°):** Gestión táctica local para las 1,891 municipalidades distritales y provinciales (Obras PP 0068, Certificador de Maquinaria, Reloj FEN Micro-calibrado, PCMD, PPRRD CENEPRED y Pre-Padrón EDAN).
3. **COED Social Amaru:** Red comunitaria de primera línea (Reporte Ciudadano Blindado Anti-Fake, AMARU-AYNI, SALUD-AMARU y AMARU-DAMNIFICADOS).

---

## 2. SUITE MUNICIPAL 360°: BLINDAJE JURÍDICO Y TÁCTICO PARA ALCALDES

La Suite Municipal 360° (`/municipal/[ubigeo]`) resuelve la soledad operativa y el temor legal de los alcaldes distritales frente a la Contraloría General de la República (CGR) y el Ministerio de Economía y Finanzas (MEF):

### 2.1. Consola de Obras PP 0068 & Certificador de Maquinaria
* **Auditoría SIAF en 5 Fases:** Identifica quirúrgicamente si las obras de defensa ribereña están trabadas en certificación, compromiso o devengado.
* **Certificador de Razonabilidad de Precios de Maquinaria Pesada (Art. 27 Ley N.º 30225):**
  - Compara el precio ofertado por hora-máquina (Tractor Oruga D8T, Excavadora 330, Cisterna, Motobomba) contra la banda oficial de precios del MTC y SEACE.
  - Emite un **Dictamen Automático de Razonabilidad** que el alcalde adjunta al expediente de contratación directa en situación de emergencia (D.S. N.º 124-2026-PCM), anulando el riesgo de imputaciones de colusión o sobreprecio.
* **Alerta Pericial por Inacción Funcional:** Previene la configuración del delito previsto en el **Art. 377 del Código Penal** cuando existen fondos asignados del PP 0068 que no son ejecutados antes del impacto aluvial.

### 2.2. Reloj FEN Micro-Calibrado y la "Ventana Dorada"
* **Fecha Límite:** **30 de Noviembre de 2026**.
* Con caudales de estiaje ($Q < 15\text{ m}^3/\text{s}$), la descolmatación preventiva cuesta en promedio **S/ 45,000 por km**. A partir de diciembre, con la crecida del río, la intervención reactiva se eleva a **S/ 195,000 por km** (+333%).
* Incorpora el tiempo de concentración de cuenca ($t_c$) y el retardo hidrocinético ($T_{\text{lag}}$) para programar la evacuación de maquinaria antes de la llegada de avenidas torrenciales.

### 2.3. Plan de Contingencia Municipal Digital (PCMD) & PPRRD Digital
* Genera la memoria descriptiva de contingencia conforme a directivas INDECI con cálculo estandarizado de **Bienes de Ayuda Humanitaria (BAH)**.
* Provee el proyecto formal de **Resolución de Alcaldía listo para firma**, con opción de copiado y exportación para sesión de Concejo o Notaría.
* Integra el botón de pánico de **Convocatoria Urgente al Grupo de Trabajo de la GRD (GT-GRD)** para declarar la sesión permanente en situaciones de alerta roja.

---

## 3. MÓDULO SALUD-AMARU: TRIAJE DIGITAL DESACOPLADO & SOBERANÍA MÉDICA

### 3.1. Sustento Legal & Protección Cero-PII
Durante desbordes e inundaciones, el corte de puentes impide el acceso físico de ambulancias. Pobladores aislados requieren orientación médica sin que sus datos sensibles queden expuestos:
* **Ley N.º 26842 (Ley General de Salud):** Garantía del acto médico y confidencialidad de la historia clínica.
* **Ley N.º 29733 (Protección de Datos Personales):** Aislamiento criptográfico mediante Bóveda Envelope con claves efímeras simétricas AES-256-GCM.
* **NTS N.º 105-MINSA/DGSP-V.01:** Norma Técnica de Salud para la Atención en los Servicios de Emergencia.

### 3.2. Arquitectura de Dos Bóvedas
* **Bóveda A (Cifrada en RAM):** Almacena DNI, nombres, apellidos, teléfono y dirección exacta del paciente bajo custodia criptográfica inmutable.
* **Bóveda B (Expediente Clínico Desacoplado):** Genera el identificador opaco **`CUP-MINSA-{UBIGEO}-{HEX}`**, asociando únicamente edad, sexo, tiempo de gestación, signos clínicos y relato del paciente.

### 3.3. Observación Preliminar de IA & Descargo Doctrinal
El agente **SALUD-AMARU** clasifica el caso en una de las cuatro prioridades de la NTS-105:
* 🔴 **Prioridad I (Rojo):** Dificultad respiratoria severa, hemorragia activa, gestante con contracciones frecuentes o sangrado, shock hipovolémico, mordedura de serpiente.
* 🟡 **Prioridad II (Amarillo):** Dengue con signos de alarma (dolor abdominal intenso, vómitos persistentes), sospecha de leptospirosis tras inmersión en aguas servidas con ictericia o mialgias severas, heridas infectadas con barro.
* 🟢 **Prioridad III (Verde):** Cuadros febriles no complicados, diarrea simple sin deshidratación.
* ⚪ **Prioridad IV (Azul):** Patologías crónicas diferibles.

> **Cláusula de Soberanía Humana:** La IA no receta, no emite diagnósticos definitivos ni prescribe fármacos. Su función se limita a ordenar la cola de expedientes por gravedad para optimizar el tiempo de los médicos de primera línea.

### 3.4. Protocolo Break-the-Glass Médico & Bitácora WORM
* **Habilitación de Desprecintado:** Exclusivamente médicos cirujanos con colegiatura válida (**CMP**) y justificación médica explícita amparada en el **Art. 14 inc. 4 de la Ley N.º 29733** (urgencia médica en riesgo de vida).
* **Auditoría Forense Inmutable:** El desbloqueo registra en `data/audit_salud_break_glass.jsonl` la identidad del médico, hora UTC y hash criptográfico SHA-256 encadenado.
* **Dictamen Oficial:** El médico establece el diagnóstico presuntivo y la conducta médica oficial: *Evacuación Aeromédica FAP*, *Brigada Fluvial Zodiac*, *Teleorientación Telefónica* o *Manejo en Albergue*.

---

## 4. MÓDULO AMARU-DAMNIFICADOS: PRE-PADRÓN EDAN v2 & BONO BAE S/ 500

### 4.1. Marco Normativo de Compensación Social
* **Ley N.º 29664 (SINAGERD):**
  - **Damnificado:** Persona o familia afectada de forma íntegra o grave en su vivienda, salud o medios de vida, que no puede recuperarse por sus propios medios sin asistencia estatal inmediata.
  - **Afectado:** Persona o familia que sufre perturbaciones menores en su entorno habitual o vivienda sin colapso estructural.
* **Ley N.º 31526 & D.S. N.º 008-2022-VIVIENDA (Bono BAE):**
  - Subsidio monetario de **S/ 500 mensuales por familia damnificada** por un plazo máximo de **dos (2) años**, destinado al alquiler de una vivienda segura.
  - **Condición Legal Inflexible:** Solo acceden familias cuya vivienda ha sido declarada formalmente en la Ficha EDAN como **COLAPSADA / DESTRUIDA** o **INHABITABLE**. Las viviendas declaradas como *Afectadas Leves* quedan expresamente excluidas del Bono BAE por ley.

### 4.2. Bóveda Zero-PII y Generación de `CUP-DAMN`
Al solicitar empadronamiento, el poblador consigna sus datos en `/reporte-ciudadano`. El sistema aplica cifrado simétrico AES-256 y emite el código:

$$\mathbf{CUP\text{-}DAMN\text{-}\{UBIGEO\}\text{-}\{HEX\}}$$

Ningún funcionario municipal ve nombres ni DNI en la bandeja pública, eliminando el clientelismo político y el favoritismo en la entrega de víveres o carpas.

### 4.3. Motor de Consistencia Territorial AMARU-CLIMATE (Score 0 - 100%)
Para evitar reportes fraudulentos ("vivos" que empadronan casas no afectadas para cobrar el bono), el motor evalúa:
1. **Capa Inundación Activa (35%):** Cruce con el Gemelo Digital FEN (cuencas en alerta roja hidrológica en Piura, Lambayeque, La Libertad, Tumbes y Lima).
2. **Capa Buffer Quebradas CENEPRED (25%):** Georreferenciación Haversine al eje aluvial ($< 2.5\text{ km}$).
3. **Capa Consenso Multivecinal (20%):** Existencia de reportes coincidentes de vecinos en el mismo sector territorial.
4. **Capa Peritaje Gemini Vision (20%):** Inspección de tirante y marca de lodo en fotos adjuntas.

### 4.4. Reglas Doctrinales de Pre-Clasificación EDAN v2
* **Regla 1 (Colapsada):** Tirante $> 2.00\text{ m}$ (`🏠 Techo`) o arrastre estructural $\Longrightarrow$ `DAMNIFICADO_VIVIENDA_COLAPSADA`. **Elegible para Bono BAE (S/ 500/mes)**, albergue unifamiliar y módulo temporal MVCS.
* **Regla 2 (Inhabitable):** Tirante $\ge 1.00\text{ m}$ (`🧍 Cintura`) o $\ge 50\text{ cm}$ (`🦵 Rodilla`) en viviendas con muros de **adobe o quincha** $\Longrightarrow$ `DAMNIFICADO_VIVIENDA_INHABITABLE`. La física de disolución hídrica del adobe genera pérdida de capacidad portante dentro de las 6 a 12 horas de anegamiento. **Elegible para Bono BAE (S/ 500/mes)**.
* **Regla 3 (Afectada Leve):** Tirante $\le 15\text{ cm}$ (`🦶 Tobillo`) en vivienda de material noble $\Longrightarrow$ `AFECTADO_VIVIENDA_AFECTADA_LEVE`. **No elegible a Bono BAE**; priorizado para motobombas de achique y kits de limpieza.

### 4.5. Soberanía Humana: Protocolo Break-the-Glass y Formalización SINPAD
1. **Desbloqueo de Filiación:** El evaluador acreditado de Defensa Civil distrital abre el sobre digital ingresando su DNI y motivo asistencial, registrado de forma inmutable en `data/audit_damnificados_break_glass.jsonl`.
2. **Inspección Ocular:** El evaluador constata en terreno el daño estructural.
3. **Formalización SINPAD:** El evaluador aprueba la Ficha EDAN e ingresa el código ministerial del **Sistema de Información Nacional para la Respuesta y Rehabilitación (SINPAD)** de INDECI.

---

## 5. BANDEJA DE CONTROL CONCURRENTE CGR & OBRAS DE LA ANA

Para garantizar el cumplimiento de los estándares de la **Contraloría General de la República (CGR)** y unificar la auditoría física y presupuestal:
1. **Bandeja de Control Concurrente (`/contraloria`):**
   - Agrupa todas las obras públicas ejecutadas bajo el marco del Fenómeno El Niño (D.S. N.º 124-2026-PCM y PP 0068).
   - Filtros dinámicos por Ubigeo, estado de avance físico/financiero SIAF, entidad ejecutora y nivel de riesgo.
2. **Integración de Obras de la Autoridad Nacional del Agua (ANA):**
   - Incorporación de intervenciones de descolmatación fluvial, limpieza de cauces, diques enrocados y fajas marginales.
   - Centralización de la inversión requerida en la Suite Municipal 360° (`/municipal/[ubigeo]`) para que el alcalde y el jefe de ODC tengan visibilidad unificada de los contratos activos de la ANA en su territorio.
3. **Reloj FEN Amaru con Análogos Históricos Horizontales:**
   - Rediseño táctico con la tarjeta de **Análogos Históricos (1982-83, 1997-98, 2017, Yaku 2023)** desplegada en franja horizontal directamente debajo del reloj polar.
   - En el lateral del reloj se sitúa el resumen agrupado de **Obras e Inversión Requerida de la ANA**, maximizando la eficiencia visual del operador C2.

---

## 6. MATRIZ DE ENDPOINTS REST IMPLEMENTADOS

| Método | Endpoint | Módulo | Función y Control de Acceso |
|---|---|---|---|
| `POST` | `/api/v1/damnificados/registrar` | AMARU-DAMNIFICADOS | Pre-empadronamiento ciudadano con generación de CUP-DAMN. |
| `GET` | `/api/v1/municipal/{ubigeo}/padron-damnificados` | AMARU-DAMNIFICADOS | Bandeja distrital desacoplada ordenada por severidad. |
| `GET` | `/api/v1/municipal/{ubigeo}/padron-damnificados/{cup}` | AMARU-DAMNIFICADOS | Expediente técnico desacoplado con peritaje geoespacial. |
| `POST` | `/api/v1/municipal/{ubigeo}/padron-damnificados/{cup}/desbloquear-identidad` | AMARU-DAMNIFICADOS | Protocolo Break-the-Glass con DNI oficial y registro WORM. |
| `POST` | `/api/v1/municipal/{ubigeo}/padron-damnificados/{cup}/aprobar-sinpad` | AMARU-DAMNIFICADOS | Aprobación formal e incorporación al SINPAD Nacional. |
| `GET` | `/api/v1/municipal/{ubigeo}/padron-damnificados/metricas` | AMARU-DAMNIFICADOS | KPIs distritales (familias, colapsadas, presupuesto BAE). |
| `POST` | `/api/v1/salud/triaje/registrar` | SALUD-AMARU | Registro de paciente y emisión de observación preliminar NTS-105. |
| `GET` | `/api/v1/salud/bandeja-minsa` | SALUD-AMARU | Bandeja clínica priorizada para médicos MINSA. |
| `POST` | `/api/v1/salud/caso/{cup}/desbloquear-identidad` | SALUD-AMARU | Break-the-Glass médico con CMP y registro WORM inmutable. |
| `POST` | `/api/v1/salud/caso/{cup}/resolucion-medica` | SALUD-AMARU | Dictamen oficial de conducta médica y rescate. |
| `GET` | `/api/v1/municipal/{ubigeo}/obras-pp0068` | SUITE MUNICIPAL 360° | Cartera MEF de obras de mitigación y cuellos de botella SIAF. |
| `POST` | `/api/v1/municipal/{ubigeo}/certificar-maquinaria` | SUITE MUNICIPAL 360° | Certificación de razonabilidad de maquinaria (Art. 27 Ley 30225). |
| `GET` | `/api/v1/municipal/{ubigeo}/reloj-fen` | SUITE MUNICIPAL 360° | Reloj FEN Micro-Calibrado ($t_c$, $T_{\text{lag}}$, Ventana Dorada). |
| `GET` | `/api/v1/municipal/{ubigeo}/plan-contingencia-digital` | SUITE MUNICIPAL 360° | Generador de Plan PCMD y resolución de alcaldía lista para firma. |
| `GET` | `/api/v1/simulacion/mega-fen/indeci-ground-truth` | GROUND TRUTH C4ISR | Métricas oficiales SINPAD 2017 (100%) vs 2018 y multiplicadores. |

---

## 7. VALIDACIÓN TÉCNICA Y AUDITORÍA DE PRODUCCIÓN EN GOOGLE CLOUD

Todas las implementaciones se encuentran validadas y activas en el entorno de producción de Google Cloud Platform:

1. **Servicios Cloud Run en Vivo:**
   - **Frontend:** [https://coen-frontend-289004262994.us-central1.run.app/](https://coen-frontend-289004262994.us-central1.run.app/)
   - **Backend:** [https://coen-backend-289004262994.us-central1.run.app/](https://coen-backend-289004262994.us-central1.run.app/)
   - **Swagger Docs:** [https://coen-backend-289004262994.us-central1.run.app/docs](https://coen-backend-289004262994.us-central1.run.app/docs)
2. **Suites Automatizadas de Pruebas Unitarias (100% PASS):**
   - `test_damnificados_amaru.py`: 8 pruebas OK.
   - `test_salud_amaru.py`: 7 pruebas OK.
   - `test_municipal_suite_360.py`: 7 pruebas OK.
3. **Frontend TypeScript (`npx tsc --noEmit`):**
   - **0 errores** de compilación en las 33 rutas de la aplicación.
4. **Respaldo Forense WORM:**
   - Custodia criptográfica inmutable con hashing SHA-256 de todas las solicitudes Break-the-Glass y actas de formalización SINPAD.
