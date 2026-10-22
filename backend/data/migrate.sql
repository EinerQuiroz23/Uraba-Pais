-- =============================================
-- MIGRACIÓN: uraba_pais_db
-- Lleva una base creada con el schema.sql antiguo al esquema actual.
-- Es idempotente y no borra datos: se puede ejecutar varias veces.
--   psql -U postgres -d uraba_pais_db -f backend/data/migrate.sql
-- =============================================

-- Beneficiario
CREATE SEQUENCE IF NOT EXISTS beneficiario_codigo_seq;

ALTER TABLE beneficiario ADD COLUMN IF NOT EXISTS codigo_interno VARCHAR(20);
ALTER TABLE beneficiario ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(20);
ALTER TABLE beneficiario ADD COLUMN IF NOT EXISTS sexo VARCHAR(20);
ALTER TABLE beneficiario ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE beneficiario ADD COLUMN IF NOT EXISTS zona VARCHAR(20);
ALTER TABLE beneficiario ADD COLUMN IF NOT EXISTS nacionalidad VARCHAR(80);
ALTER TABLE beneficiario ADD COLUMN IF NOT EXISTS tipo_poblacion VARCHAR(80);
ALTER TABLE beneficiario ADD COLUMN IF NOT EXISTS organizacion VARCHAR(150);
ALTER TABLE beneficiario ADD COLUMN IF NOT EXISTS fecha_registro DATE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'beneficiario_codigo_interno_key'
    ) THEN
        ALTER TABLE beneficiario
            ADD CONSTRAINT beneficiario_codigo_interno_key UNIQUE (codigo_interno);
    END IF;
END $$;

-- Familiar
CREATE TABLE IF NOT EXISTS familiar (
    id_familiar INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_beneficiario INTEGER NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    parentesco VARCHAR(80) NOT NULL,
    edad INTEGER,
    FOREIGN KEY (id_beneficiario)
        REFERENCES beneficiario(id_beneficiario)
);

-- Atención
ALTER TABLE atencion ADD COLUMN IF NOT EXISTS tipo VARCHAR(40);
ALTER TABLE atencion ADD COLUMN IF NOT EXISTS responsable VARCHAR(150);
ALTER TABLE atencion ADD COLUMN IF NOT EXISTS resultado VARCHAR(40);

-- Seguimiento
ALTER TABLE seguimiento ADD COLUMN IF NOT EXISTS accion_pendiente_detalle TEXT;

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol VARCHAR(30) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE atencion ADD COLUMN IF NOT EXISTS entidad VARCHAR(150);
ALTER TABLE atencion ADD COLUMN IF NOT EXISTS remision VARCHAR(150);
ALTER TABLE seguimiento ADD COLUMN IF NOT EXISTS avance TEXT;
ALTER TABLE seguimiento ADD COLUMN IF NOT EXISTS proximo_contacto DATE;

ALTER TABLE participacion
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'inscrito';