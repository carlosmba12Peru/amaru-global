# DOCUMENTO PRIVADO / CONFIDENCIAL COEN-DIGITAL & GOBERNANZA CLIMÁTICA
## SISTEMA AMARU-AYNI: RED DE PARTICIPACIÓN CIUDADANA, ORGANIZACIONES SOCIALES Y DIFUSIÓN MULTICANAL (TELEGRAM & CORREO ELECTRÓNICO)

**Clasificación de Seguridad:** RESERVADO / USO COEN - INDECI - AUTORIDADES MUNICIPALES Y DIRIGENCIAS SOCIALES  
**Código de Registro:** C2-AMARU-AYNI-CIUDADANÍA-TELEGRAM-DOC-03  
**Fecha de Emisión:** 16 de Septiembre de 2026  
**Sistema:** AMARU-CLIMATE • Consola AMARU-AYNI (Fuerzas Vivas en Acción)  
**Horizonte Operativo:** Fenómeno El Niño 2026-2027  

---

## 1. PROPÓSITO Y RESUMEN DOCTRINARIO

El presente documento formaliza la doctrina de movilización social y la arquitectura tecnológica del módulo **AMARU-AYNI**, diseñado para integrar a las organizaciones sociales de base, juntas vecinales de seguridad ciudadana, comités de ollas comunes, comedores populares, agentes comunitarios de salud y voluntariado civil en el Sistema de Comando y Control (C2) ante el Fenómeno El Niño 2026-2027.

### 1.1. El Principio Ancestral del Ayni y la Evidencia Empírica de Salvamento
En la historia de emergencias en el Perú (FEN 1983, 1998, 2017 y Ciclón Yaku 2023), se ha demostrado que:
* **El 70% de las vidas salvadas en las primeras horas críticas** son auxiliadas directamente por vecinos organizados, brigadistas de barrio y dirigentas de ollas comunes antes de la llegada de auxilio institucional externo.
* El modelo jerárquico centralizado fracasa si no cuenta con un **tejido social articulado, informado y empoderado con alertas tempranas en tiempo real**.

---

## 2. LOS 5 ACTORES COMUNITARIOS INTEGRADOS

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FUERZAS VIVAS EN EL SISTEMA AMARU-AYNI                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. JUNTAS VECINALES DE SEGURIDAD CIUDADANA (JUVESC / LEY Nº 27933)                     │
│    • Alerta con sirenas comunitarias, megáfonos y silbatos en las quebradas.           │
│    • Evacuación guiada y custodia comunitaria de viviendas desocupadas.                │
│                                                                                        │
│ 2. RED DE OLLAS COMUNES Y COMEDORES POPULARES (LEY Nº 31458)                           │
│    • Activación de cocinas de campaña en albergues y locales comunales.                │
│    • Raciones calientes de emergencia y monitoreo de autonomía en días de víveres.     │
│                                                                                        │
│ 3. AGENTES COMUNITARIOS DE SALUD (ACS - MINSA)                                         │
│    • Vigilancia epidemiológica de febriles y prevención de dengue (Aedes aegypti).     │
│    • Control de cloración en cilindros y bidones de 20 litros; visitas a gestantes.    │
│                                                                                        │
│ 4. BRIGADISTAS CIVILES Y VOLUNTARIADO DEFENSA CIVIL                                    │
│    • Faenas de estibado de sacos terreros en bocacalles de quebrada antes del 30-Nov.  │
│    • Rescate y traslado de personas con movilidad reducida (Padrón 1-a-1).             │
│                                                                                        │
│ 5. COMISIONES DE REGANTES Y COMUNIDADES CAMPESINAS                                     │
│    • Monitoreo de caudales en bocatomas y compuertas de derivación.                    │
│    • Cierre preventivo de canales de regadío para evitar desbordes urbanos.            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. OPERATIVIDAD EN 3 TIEMPOS ANTE EL FENÓMENO EL NIÑO

### 3.1. Fase 1: Prevención y Preparación (Septiembre – Noviembre / Ventana Dorada)
* **Minkas Vecinales de Sacos Terreros:** Llenado y estibado de sacos en bocacalles y zonas bajas antes de que las lluvias orográficas aumenten caudales.
* **Padrón Comunitario de Población Vulnerable (Evacuación 1-a-1):** Mapeo con nombre y dirección de ancianos que viven solos, personas con discapacidad severa y madres gestantes, asignando 2 vecinos de soporte inmediato por cada uno.
* **Desbroce de Drenes y Acequias:** Retiro comunal de malezas y basura en cauces secundarios.

### 3.2. Fase 2: Acción Inmediata y Respuesta (Diciembre – Abril / Temporada de Lluvias)
* **Cadena de Alerta Temprana Vecinal:** Coordinación entre la zona alta de la quebrada y la zona baja mediante silbatos, megáfonos y avisos rápidos por Telegram.
* **Suministro Alimentario Ininterrumpido:** La Olla Común prepara raciones para las familias que debieron abandonar zonas inundadas.
* **Puntos de Encuentro Seguro:** Habilitación de losas deportivas techadas y locales comunales identificados.

### 3.3. Fase 3: Apoyo Familiar y Recuperación (Mayo – Julio / Post-impacto)
* **Vigilancia Sanitaria Antidengue:** Eliminación de recipientes con agua estancada y fumigación comunitaria coordinada con el centro de salud.
* **Filtro Vecinal al Empadronamiento EDAN:** Las dirigentas garantizan que la ayuda humanitaria entregada por INDECI llegue a los verdaderos afectados, evitando el clientelismo o acaparamiento.

---

## 4. ARQUITECTURA DE INTEGRACIÓN MULTICANAL (TELEGRAM & CORREO ELECTRÓNICO)

Para asegurar la comunicación inmediata sin depender exclusivamente de redes sociales comerciales, AMARU-AYNI implementa un motor de difusión multicanal:

### 4.1. Canal Oficial de Telegram (Bot API & Webhooks)
* **Inmediatez y Bajo Consumo de Datos:** Telegram permite despachar alertas a grupos y canales públicos (`@COEN_Comunidad_Peru`) que funcionan incluso con conectividad 2G/3G inestable.
* **Plantillas Preformateadas en Markdown:** Convocatorias a faenas, alertas de crecida de quebrada y llamados solidarios de agua para ollas comunes.

### 4.2. Notificaciones por Correo Electrónico (SMTP)
* **Trazabilidad Institucional:** Envío formal de reportes de necesidades comunitarias a las bandejas del Centro de Operaciones de Emergencia Regional/Local (COER/COEL), MIDIS, INDECI y Ministerios.
* **Modo Sandbox / Simulación Segura:** Si las credenciales no están cargadas en el servidor, el sistema procesa el envío en un registro seguro inmutable sin generar errores de ejecución.

---

## 5. MAPA DE ARCHIVOS Y COMPONENTES TÉCNICOS

```
Lab4/
├── backend/
│   ├── services/
│   │   └── ayni_service.py              <-- Servicio C2: Ollas, Juntas, Padrón Vulnerables, Telegram y SMTP
│   └── main.py                          <-- Endpoints oficiales /api/ayni/*
└── frontend/
    └── src/
        ├── app/
        │   └── ayni/
        │       └── page.tsx             <-- Consola AMARU-AYNI (Faenas, Juntas, Ollas, Salud, Despacho)
        └── components/
            └── HeaderNav.tsx            <-- Acceso oficial AMARU-AYNI (Comunidad)
```

---

## 6. MARCO LEGAL DE AMPARO
1. **Ley Nº 29664 (Ley del SINAGERD):**
   * *Artículo 12:* Obligatoriedad de incorporar la participación de las organizaciones de la sociedad civil y el voluntariado.
   * *Artículo 68:* Las organizaciones sociales coadyuvan en la preparación, respuesta y rehabilitación comunitaria.
2. **Ley Nº 31458 (Ley de Ollas Comunes):**
   * Reconoce a las ollas comunes como organizaciones sociales de base y dispone su atención prioritaria con alimentos y agua segura durante emergencias climáticas.
3. **Ley Nº 27933 (Ley del Sistema Nacional de Seguridad Ciudadana):**
   * Ampara la conformación y actuación de las Juntas Vecinales (JUVESC) en la prevención y auxilio ante siniestros y desastres naturales.

---

*Fin del Documento Confidencial.*  
*COEN-DIGITAL • AMARU-CLIMATE • GOBERNANZA COMUNITARIA Y FUERZAS VIVAS*
