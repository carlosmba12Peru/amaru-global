-- ==============================================================================
-- AMARU-CLIMATE (COEN-Digital) - Lab4
-- Esquema Oficial de Base de Datos Relacional - Espacial
-- Motor: PostgreSQL 16 + PostGIS 3.4
-- ==============================================================================

-- 1. HABILITACIÓN DE EXTENSIONES ESPACIALES Y DE SEGURIDAD
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==============================================================================
-- DOMINIO 1: TERRITORIAL, ADMINISTRATIVO Y AUTORIDADES LOCALES
-- ==============================================================================

-- Tabla Maestra de Distritos Nacionales (1,891 Distritos)
CREATE TABLE IF NOT EXISTS distritos (
    ubigeo VARCHAR(6) PRIMARY KEY,
    distrito VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    poblacion_censo INTEGER DEFAULT 0,
    es_emergencia_ds_124 BOOLEAN DEFAULT FALSE,
    nivel_peligro_fen VARCHAR(30) DEFAULT 'MEDIO',
    geometria_centroide GEOMETRY(Point, 4326),
    geometria_limite GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_distritos_centroide ON distritos USING GIST (geometria_centroide);
CREATE INDEX IF NOT EXISTS idx_distritos_limite ON distritos USING GIST (geometria_limite);
CREATE INDEX IF NOT EXISTS idx_distritos_depto ON distritos(departamento);
CREATE INDEX IF NOT EXISTS idx_distritos_ds124 ON distritos(es_emergencia_ds_124) WHERE es_emergencia_ds_124 IS TRUE;

-- Tabla de Municipalidades y Autoridades (Censo INEI Setiembre 2026)
CREATE TABLE IF NOT EXISTS municipalidades_autoridades (
    ubigeo VARCHAR(6) PRIMARY KEY REFERENCES distritos(ubigeo) ON DELETE CASCADE,
    municipio_nombre VARCHAR(150) NOT NULL,
    alcalde_titular VARCHAR(150) NOT NULL,
    dni_alcalde VARCHAR(8),
    cargo_autoridad VARCHAR(80) DEFAULT 'Alcalde Distrital',
    rol_sinagerd VARCHAR(120) DEFAULT 'Presidente de la Plataforma de Defensa Civil',
    direccion_sede VARCHAR(200),
    telefono_central VARCHAR(50),
    email_institucional VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Comisarías Operativas PNP a Nivel Nacional (Programa Presupuestal 0030)
CREATE TABLE IF NOT EXISTS comisarias_pnp (
    codigo_comisaria VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'BASICA',
    ubigeo VARCHAR(6) REFERENCES distritos(ubigeo),
    division_policial VARCHAR(100),
    region_policial VARCHAR(100),
    telefono VARCHAR(50),
    ubicacion GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comisarias_geom ON comisarias_pnp USING GIST (ubicacion);
CREATE INDEX IF NOT EXISTS idx_comisarias_ubigeo ON comisarias_pnp(ubigeo);

-- Tabla de Colegios y Potenciales Albergues (MINEDU ESCALE / SIGMED)
CREATE TABLE IF NOT EXISTS albergues_colegios_minedu (
    codigo_modular VARCHAR(10) PRIMARY KEY,
    nombre_ie VARCHAR(150) NOT NULL,
    nivel_modalidad VARCHAR(80),
    ubigeo VARCHAR(6) REFERENCES distritos(ubigeo),
    direccion VARCHAR(200),
    capacidad_aforo_personas INTEGER DEFAULT 150,
    estado_infraestructura VARCHAR(40) DEFAULT 'OPERATIVO',
    ubicacion GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_albergues_colegios_geom ON albergues_colegios_minedu USING GIST (ubicacion);

-- ==============================================================================
-- DOMINIO 2: HIDROMETEOROLOGÍA, CAUDALES Y NOWCASTING DE SENSORES
-- ==============================================================================

-- Estaciones Hidrológicas de Aforo ANA / SNIRH
CREATE TABLE IF NOT EXISTS estaciones_aforo_ana (
    codigo_estacion VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    cuenca VARCHAR(80) NOT NULL,
    rio VARCHAR(80) NOT NULL,
    ubigeo VARCHAR(6) REFERENCES distritos(ubigeo),
    caudal_instantaneo_q NUMERIC(8,2) DEFAULT 0.0,
    nivel_rio_metros NUMERIC(5,2) DEFAULT 0.0,
    umbral_amarillo_q NUMERIC(8,2),
    umbral_naranja_q NUMERIC(8,2),
    umbral_rojo_q NUMERIC(8,2),
    estado_alerta VARCHAR(20) DEFAULT 'VERDE',
    ultima_lectura TIMESTAMP WITH TIME ZONE,
    ubicacion GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_aforos_geom ON estaciones_aforo_ana USING GIST (ubicacion);
CREATE INDEX IF NOT EXISTS idx_aforos_cuenca ON estaciones_aforo_ana(cuenca);

-- Radares Meteorológicos Banda C (SENAMHI Nowcasting)
CREATE TABLE IF NOT EXISTS radares_senamhi (
    radar_id VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento VARCHAR(60) NOT NULL,
    tipo_banda VARCHAR(20) DEFAULT 'BANDA_C',
    frecuencia_ghz NUMERIC(4,2) DEFAULT 5.6,
    rango_max_km NUMERIC(5,1) DEFAULT 250.0,
    ubicacion GEOMETRY(Point, 4326),
    estado_operativo VARCHAR(30) DEFAULT 'TRANSMITIENDO_NOWCASTING',
    ultimo_barrido TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_radares_geom ON radares_senamhi USING GIST (ubicacion);

-- Quebradas Críticas y Puntos de Riesgo de Huaicos
CREATE TABLE IF NOT EXISTS quebradas_criticas (
    quebrada_id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    cuenca_receptora VARCHAR(100) NOT NULL,
    ubigeo VARCHAR(6) REFERENCES distritos(ubigeo),
    tiempo_concentracion_horas NUMERIC(4,2) DEFAULT 1.5,
    antecedente_historico VARCHAR(100),
    nivel_activacion VARCHAR(20) DEFAULT 'INACTIVA',
    ubicacion GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_quebradas_geom ON quebradas_criticas USING GIST (ubicacion);

-- ==============================================================================
-- DOMINIO 3: LOGÍSTICA HUMANITARIA, RED VIAL Y ENRUTAMIENTO VRP
-- ==============================================================================

-- Almacenes Estratégicos INDECI
CREATE TABLE IF NOT EXISTS almacenes_indeci (
    almacen_id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    ciudad VARCHAR(80) NOT NULL,
    departamento VARCHAR(80) NOT NULL,
    raciones_frias_stock INTEGER DEFAULT 0,
    agua_litros_stock INTEGER DEFAULT 0,
    carpas_stock INTEGER DEFAULT 0,
    herramientas_kits INTEGER DEFAULT 0,
    ubicacion GEOMETRY(Point, 4326),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_almacenes_geom ON almacenes_indeci USING GIST (ubicacion);

-- Albergues y Destinos Tácticos Críticos
CREATE TABLE IF NOT EXISTS albergues_logistica (
    albergue_id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    distrito VARCHAR(80) NOT NULL,
    departamento VARCHAR(80) NOT NULL,
    poblacion_albergada INTEGER DEFAULT 0,
    demanda_raciones_dia INTEGER DEFAULT 0,
    demanda_agua_litros_dia INTEGER DEFAULT 0,
    estado_acceso VARCHAR(40) DEFAULT 'EXPEDITO_TERRESTRE',
    ubicacion GEOMETRY(Point, 4326),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_albergues_log_geom ON albergues_logistica USING GIST (ubicacion);

-- Puentes y Puntos Críticos de la Red Vial Nacional (VRP)
CREATE TABLE IF NOT EXISTS red_vial_puentes (
    puente_id VARCHAR(60) PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    carretera_codigo VARCHAR(30) NOT NULL,
    kilometro VARCHAR(30),
    cuenca_cruzada VARCHAR(80),
    estado_transitabilidad VARCHAR(30) DEFAULT 'TRANSITABLE',
    desvio_tactico_nombre VARCHAR(150),
    demora_desvio_minutos INTEGER DEFAULT 0,
    distancia_extra_km NUMERIC(5,1) DEFAULT 0.0,
    caudal_alerta_m3s NUMERIC(8,2),
    ubicacion GEOMETRY(Point, 4326),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_puentes_geom ON red_vial_puentes USING GIST (ubicacion);

-- ==============================================================================
-- DOMINIO 4: FICHAS EDAN DIGITAL SINPAD v2 Y SUBSIDIO BONO BAE
-- ==============================================================================

-- Cabecera Oficial de la Ficha EDAN (R.S. 002-2026-PCM/SGRD)
CREATE TABLE IF NOT EXISTS edan_fichas (
    edan_id VARCHAR(50) PRIMARY KEY,
    codigo_sinpad VARCHAR(40) UNIQUE NOT NULL,
    ubigeo VARCHAR(6) REFERENCES distritos(ubigeo),
    fecha_formulario DATE NOT NULL,
    hora_formulario TIME NOT NULL,
    alcalde_firmante VARCHAR(150) NOT NULL,
    token_autoridad VARCHAR(100),
    hash_sha256 VARCHAR(64) NOT NULL,
    decreto_emergencia VARCHAR(120) DEFAULT 'D.S. N.° 124-2026-PCM',
    formulario_1_evaluacion JSONB NOT NULL,
    formulario_2b_medios_vida JSONB NOT NULL,
    estado VARCHAR(40) DEFAULT 'APROBADO_CON_FIRMA_DIGITAL',
    pdf_generado_bytes BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_edan_ubigeo ON edan_fichas(ubigeo);
CREATE INDEX IF NOT EXISTS idx_edan_sinpad ON edan_fichas(codigo_sinpad);
CREATE INDEX IF NOT EXISTS idx_edan_hash ON edan_fichas(hash_sha256);

-- Padrón Familiar Empadronado (Formulario 2A - Calificación Bono BAE)
CREATE TABLE IF NOT EXISTS edan_familias_2a (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edan_id VARCHAR(50) REFERENCES edan_fichas(edan_id) ON DELETE CASCADE,
    correlativo INTEGER NOT NULL,
    dni_titular VARCHAR(8) NOT NULL,
    apellidos_nombres VARCHAR(150) NOT NULL,
    sexo CHAR(1),
    edad INTEGER,
    miembros_total INTEGER DEFAULT 1,
    ninos_0_12 INTEGER DEFAULT 0,
    adultos_mayores_65 INTEGER DEFAULT 0,
    gestantes INTEGER DEFAULT 0,
    personas_discapacidad INTEGER DEFAULT 0,
    condicion_vivienda VARCHAR(30) NOT NULL,
    condicion_habitante VARCHAR(30) NOT NULL,
    material_pared VARCHAR(60),
    califica_bono_bae BOOLEAN DEFAULT FALSE,
    sector_caserio VARCHAR(120),
    manzana_lote VARCHAR(60),
    estado_pide_reniec VARCHAR(30) DEFAULT 'VALIDADO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_familias_edan ON edan_familias_2a(edan_id);
CREATE INDEX IF NOT EXISTS idx_familias_dni ON edan_familias_2a(dni_titular);
CREATE INDEX IF NOT EXISTS idx_familias_bae ON edan_familias_2a(califica_bono_bae) WHERE califica_bono_bae IS TRUE;

-- ==============================================================================
-- DOMINIO 5: CONTROL CONCURRENTE CGR / OCI Y TRAZABILIDAD PIDE-RENIEC
-- ==============================================================================

-- Expedientes de Control Concurrente en Tiempo Real
CREATE TABLE IF NOT EXISTS contraloria_expedientes (
    registro_cgr_id VARCHAR(50) PRIMARY KEY,
    edan_id VARCHAR(50) REFERENCES edan_fichas(edan_id) ON DELETE CASCADE,
    codigo_sinpad VARCHAR(40) NOT NULL,
    ubigeo VARCHAR(6) REFERENCES distritos(ubigeo),
    constancia_codigo VARCHAR(50),
    puntaje_consistencia INTEGER NOT NULL,
    estado_control VARCHAR(40) NOT NULL,
    auditor_responsable VARCHAR(150),
    organo_control VARCHAR(120) DEFAULT 'Gerencia Regional de Control / OCI',
    blindaje_legal_alcalde TEXT,
    autoriza_reparto_bah BOOLEAN DEFAULT FALSE,
    resultado_auditoria JSONB,
    fecha_disparo TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_cgr_edan ON contraloria_expedientes(edan_id);
CREATE INDEX IF NOT EXISTS idx_cgr_estado ON contraloria_expedientes(estado_control);
CREATE INDEX IF NOT EXISTS idx_cgr_constancia ON contraloria_expedientes(constancia_codigo);

-- Bitácora de Consultas PIDE-RENIEC para Auditoría Forense
CREATE TABLE IF NOT EXISTS pide_reniec_bitacora (
    id_consulta VARCHAR(50) PRIMARY KEY,
    dni_consultado VARCHAR(8) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modo_conexion VARCHAR(40) NOT NULL,
    co_resultado VARCHAR(10) NOT NULL,
    nombre_obtenido VARCHAR(150),
    restriccion VARCHAR(40) DEFAULT 'NINGUNA',
    hash_trama VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pide_dni ON pide_reniec_bitacora(dni_consultado);
CREATE INDEX IF NOT EXISTS idx_pide_restriccion ON pide_reniec_bitacora(restriccion);

-- ==============================================================================
-- VISTAS TÁCTICAS PARA EL MANDO C2 Y DECISORES
-- ==============================================================================

-- Vista 1: Resumen de Emergencia por Departamento
CREATE OR REPLACE VIEW v_resumen_emergencia_departamento AS
SELECT 
    d.departamento,
    COUNT(DISTINCT d.ubigeo) AS total_distritos,
    COUNT(DISTINCT CASE WHEN d.es_emergencia_ds_124 THEN d.ubigeo END) AS distritos_en_emergencia,
    COUNT(DISTINCT ef.edan_id) AS total_fichas_edan_emitidas,
    COALESCE(SUM(fam.miembros_total), 0) AS total_personas_empadronadas,
    COALESCE(SUM(CASE WHEN fam.califica_bono_bae THEN 1 ELSE 0 END), 0) AS familias_aptas_bono_bae,
    COALESCE(SUM(CASE WHEN fam.califica_bono_bae THEN 500 ELSE 0 END), 0) AS monto_bono_bae_mensual_soles
FROM distritos d
LEFT JOIN edan_fichas ef ON d.ubigeo = ef.ubigeo
LEFT JOIN edan_familias_2a fam ON ef.edan_id = fam.edan_id
GROUP BY d.departamento
ORDER BY distritos_en_emergencia DESC;

-- Vista 2: Puentes Colapsados y Aislamiento Vial Táctico
CREATE OR REPLACE VIEW v_puentes_criticos_colapsados AS
SELECT 
    p.puente_id,
    p.nombre,
    p.carretera_codigo,
    p.kilometro,
    p.cuenca_cruzada,
    p.estado_transitabilidad,
    p.desvio_tactico_nombre,
    p.demora_desvio_minutos,
    p.distancia_extra_km,
    ST_Y(p.ubicacion) AS latitud,
    ST_X(p.ubicacion) AS longitud
FROM red_vial_puentes p
WHERE p.estado_transitabilidad IN ('COLAPSADO', 'RESTRINGIDO', 'EN_RIESGO_INMINENTE');
