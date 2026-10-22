-- =============================================
-- ESQUEMA COMPLETO: uraba_pais_db
-- Sistema de Gestión URABÁ-PAÍS
-- Instalación desde cero. Para una base existente use migrate.sql.
-- =============================================

-- 1. Municipio
CREATE TABLE IF NOT EXISTS municipio (
    id_municipio INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Beneficiario
-- codigo_interno se genera como 'URABA-' || nextval('beneficiario_codigo_seq')
CREATE SEQUENCE IF NOT EXISTS beneficiario_codigo_seq;

CREATE TABLE IF NOT EXISTS beneficiario (
    id_beneficiario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    documento VARCHAR(30) UNIQUE,
    telefono VARCHAR(30),
    id_municipio INTEGER NOT NULL,
    codigo_interno VARCHAR(20) UNIQUE,
    tipo_documento VARCHAR(20),
    sexo VARCHAR(20),
    edad INTEGER,
    zona VARCHAR(20),
    nacionalidad VARCHAR(80),
    tipo_poblacion VARCHAR(80),
    organizacion VARCHAR(150),
    fecha_registro DATE,
    FOREIGN KEY (id_municipio)
        REFERENCES municipio(id_municipio)
);

-- 3. Familiar
CREATE TABLE IF NOT EXISTS familiar (
    id_familiar INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_beneficiario INTEGER NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    parentesco VARCHAR(80) NOT NULL,
    edad INTEGER,
    FOREIGN KEY (id_beneficiario)
        REFERENCES beneficiario(id_beneficiario)
);

-- 4. Línea de Trabajo
CREATE TABLE IF NOT EXISTS linea_trabajo (
    id_linea INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE
);

-- 5. Programa
CREATE TABLE IF NOT EXISTS programa (
    id_programa INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(250) NOT NULL UNIQUE,
    id_linea INTEGER NOT NULL,
    FOREIGN KEY (id_linea)
        REFERENCES linea_trabajo(id_linea)
);

-- 6. Participación
CREATE TABLE IF NOT EXISTS participacion (
    id_participacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_beneficiario INTEGER NOT NULL,
    id_programa INTEGER NOT NULL,
    fecha_vinculacion DATE NOT NULL DEFAULT CURRENT_DATE,

    FOREIGN KEY (id_beneficiario)
        REFERENCES beneficiario(id_beneficiario),

    FOREIGN KEY (id_programa)
        REFERENCES programa(id_programa),

    UNIQUE (id_beneficiario, id_programa)
);

-- 7. Atención
CREATE TABLE IF NOT EXISTS atencion (
    id_atencion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_beneficiario INTEGER NOT NULL,
    id_programa INTEGER NOT NULL,
    descripcion TEXT,
    fecha_atencion DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo VARCHAR(40),
    responsable VARCHAR(150),
    resultado VARCHAR(40),

    FOREIGN KEY (id_beneficiario)
        REFERENCES beneficiario(id_beneficiario),

    FOREIGN KEY (id_programa)
        REFERENCES programa(id_programa)
);

-- 8. Seguimiento
CREATE TABLE IF NOT EXISTS seguimiento (
    id_seguimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_beneficiario INTEGER NOT NULL,
    fecha_seguimiento DATE NOT NULL DEFAULT CURRENT_DATE,
    observacion TEXT,
    accion_pendiente BOOLEAN NOT NULL DEFAULT FALSE,
    accion_pendiente_detalle TEXT,

    FOREIGN KEY (id_beneficiario)
        REFERENCES beneficiario(id_beneficiario)
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Actualización: Agregar columnas a atencion y seguimiento
ALTER TABLE atencion ADD COLUMN IF NOT EXISTS entidad VARCHAR(150);
ALTER TABLE atencion ADD COLUMN IF NOT EXISTS remision VARCHAR(150);
ALTER TABLE seguimiento ADD COLUMN IF NOT EXISTS avance TEXT;
ALTER TABLE seguimiento ADD COLUMN IF NOT EXISTS proximo_contacto DATE;