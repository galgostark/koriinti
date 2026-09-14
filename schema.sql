-- ======================================================================================
-- KORI INTI - SISTEMA DE GESTIÓN OPERATIVA MINERA (PERÚ)
-- Esquema DDL para PostgreSQL / Supabase
-- Gestión de Acopio: Cajamarca, Áncash y Piura -> Molinos en Trujillo
-- ======================================================================================

-- 1. ENUMS Y EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE etapa_lote_enum AS ENUM (
  'en_origen',
  'transito_trujillo',
  'en_molienda',
  'muestreo_leyes',
  'negociacion',
  'liquidado'
);

CREATE TYPE origen_region_enum AS ENUM (
  'Cajamarca',
  'Áncash',
  'Piura'
);

CREATE TYPE mineral_tipo_enum AS ENUM (
  'Aurífero (Au)',
  'Polimetálico (Au-Ag-Cu)',
  'Plata-Plomo-Zinc'
);

CREATE TYPE estado_molino_enum AS ENUM (
  'operando',
  'mantenimiento',
  'disponible'
);

-- 2. TABLA: MOLINOS INDEPENDIENTES EN TRUJILLO
CREATE TABLE molinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  capacidad_diaria_tm NUMERIC(10,2) NOT NULL,
  carga_actual_tm NUMERIC(10,2) DEFAULT 0,
  estado estado_molino_enum DEFAULT 'operando',
  contacto VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: CLIENTES / MINEROS ARTESANALES Y LABORES
CREATE TABLE clientes_mineros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ruc_o_dni VARCHAR(20) UNIQUE NOT NULL,
  razon_social VARCHAR(255) NOT NULL,
  persona_encargada VARCHAR(200) NOT NULL, -- Nombre del encargado / representante
  telefono VARCHAR(50),
  email VARCHAR(150),
  es_reinfo BOOLEAN DEFAULT TRUE,
  codigo_reinfo VARCHAR(100),
  departamento origen_region_enum NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  distrito VARCHAR(100),
  labor_minera_default VARCHAR(255),
  coordenadas_gps VARCHAR(100), -- Latitud, Longitud WGS84
  banco_preferido VARCHAR(100),
  cuenta_bancaria VARCHAR(100),
  cci VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA PRINCIPAL: LOTES DE MINERAL
CREATE TABLE lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_lote VARCHAR(50) UNIQUE NOT NULL, -- ej: LOT-2026-CAJ-048
  cliente_id UUID REFERENCES clientes_mineros(id) ON DELETE RESTRICT,
  origen_region origen_region_enum NOT NULL,
  origen_provincia VARCHAR(100) NOT NULL,
  labor_minera VARCHAR(255) NOT NULL,
  tipo_mineral mineral_tipo_enum NOT NULL,
  peso_estimado_tmh NUMERIC(10,2) NOT NULL,
  adelanto_pactado_usd NUMERIC(12,2) DEFAULT 0.00,
  -- Leyes estimadas pactadas en origen (Oro en g o oz, Plata oz, Cobre %)
  ley_estimada_oro_valor NUMERIC(10,4),
  ley_estimada_oro_unidad VARCHAR(10) DEFAULT 'oz_tm', -- 'g_tm' o 'oz_tm'
  ley_estimada_oro_oz_tm NUMERIC(10,4),
  ley_estimada_oro_g_tm NUMERIC(10,4),
  ley_estimada_plata_oz_tm NUMERIC(10,4),
  ley_estimada_cobre_porc NUMERIC(6,3),
  etapa_actual etapa_lote_enum DEFAULT 'en_origen',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: ETAPA 2 - TRANSPORTE A TRUJILLO
CREATE TABLE transportes_lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID UNIQUE REFERENCES lotes(id) ON DELETE CASCADE,
  empresa_transporte VARCHAR(200) NOT NULL,
  ruc_transporte VARCHAR(20),
  conductor_nombre VARCHAR(200) NOT NULL,
  licencia_conducir VARCHAR(50) NOT NULL,
  placa_volquete VARCHAR(20) NOT NULL,
  guia_remision_remitente VARCHAR(50) NOT NULL,
  guia_remision_transportista VARCHAR(50) NOT NULL,
  precintos_seguridad TEXT[],
  fecha_salida TIMESTAMPTZ NOT NULL,
  fecha_llegada_estimada TIMESTAMPTZ,
  observaciones_ruta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: ETAPA 3 - PESAJE EN BALANZA Y ASIGNACIÓN DE MOLINO
CREATE TABLE recepciones_balanza (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID UNIQUE REFERENCES lotes(id) ON DELETE CASCADE,
  molino_id UUID REFERENCES molinos(id) ON DELETE RESTRICT,
  ticket_numero VARCHAR(50) NOT NULL,
  fecha_pesaje DATE NOT NULL,
  hora_pesaje TIME NOT NULL,
  peso_bruto_tm NUMERIC(10,2) NOT NULL,
  peso_tara_tm NUMERIC(10,2) NOT NULL,
  peso_neto_tmh NUMERIC(10,2) NOT NULL, -- Toneladas Métricas Húmedas
  operador_balanza VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: ETAPA 4 - ENSAYOS DE LABORATORIO, HUMEDAD Y RECUPERACIÓN
CREATE TABLE ensayos_laboratorio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID UNIQUE REFERENCES lotes(id) ON DELETE CASCADE,
  codigo_muestra_cliente VARCHAR(50) NOT NULL,
  codigo_contra_muestra VARCHAR(50) NOT NULL,
  codigo_dirimente VARCHAR(50),
  laboratorio VARCHAR(150) NOT NULL, -- ej: SGS del Perú, Certimin
  certificado_numero VARCHAR(100) NOT NULL,
  fecha_emision DATE NOT NULL,
  -- Requerimiento: Porcentaje de Humedad y Recuperaciones
  porcentaje_humedad NUMERIC(5,2) NOT NULL, -- % H2O
  ley_oro_oz_tm NUMERIC(8,4) NOT NULL,      -- Au oz/TM
  ley_plata_oz_tm NUMERIC(8,4) DEFAULT 0,  -- Ag oz/TM
  ley_cobre_porc NUMERIC(6,3) DEFAULT 0,   -- Cu %
  recuperacion_oro_porc NUMERIC(5,2) NOT NULL DEFAULT 85.0,   -- Recup Au %
  recuperacion_plata_porc NUMERIC(5,2) NOT NULL DEFAULT 70.0, -- Recup Ag %
  recuperacion_cobre_porc NUMERIC(5,2) NOT NULL DEFAULT 75.0, -- Recup Cu %
  penalidad_arsenico_porc NUMERIC(5,3) DEFAULT 0,
  penalidad_antimonio_porc NUMERIC(5,3) DEFAULT 0,
  aprobado_cliente BOOLEAN DEFAULT TRUE,
  aprobado_empresa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: ETAPA 5 - NEGOCIACIÓN Y SPOT PRICES
CREATE TABLE negociaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID UNIQUE REFERENCES lotes(id) ON DELETE CASCADE,
  fecha_negociacion DATE NOT NULL,
  tipo_cambio_spot NUMERIC(6,4) NOT NULL DEFAULT 3.755,
  spot_oro_usd_oz NUMERIC(10,2) NOT NULL,
  spot_plata_usd_oz NUMERIC(10,2) NOT NULL,
  spot_cobre_usd_lb NUMERIC(8,3) NOT NULL,
  maquila_por_tms_usd NUMERIC(10,2) NOT NULL DEFAULT 95.00,
  penalidades_totales_usd NUMERIC(10,2) DEFAULT 0,
  adelanto_origen_descontado_usd NUMERIC(12,2) DEFAULT 0,
  porcentaje_detraccion NUMERIC(4,2) DEFAULT 10.0, -- 10% Detracción SUNAT
  observaciones_pacto TEXT,
  estado_negociacion VARCHAR(50) DEFAULT 'acordado',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: ETAPA 6 - LIQUIDACIÓN Y PAGO FINAL
CREATE TABLE liquidaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID UNIQUE REFERENCES lotes(id) ON DELETE CASCADE,
  numero_liquidacion VARCHAR(50) UNIQUE NOT NULL,
  fecha_pago DATE NOT NULL,
  banco VARCHAR(100) NOT NULL, -- BCP, BBVA, Interbank, etc.
  nro_operacion_bancaria VARCHAR(100) NOT NULL,
  comprobante_pago_tipo VARCHAR(100) NOT NULL, -- Liquidación de Compra o Factura
  comprobante_numero VARCHAR(100) NOT NULL,
  constancia_detraccion_nro VARCHAR(100) NOT NULL,
  monto_total_bruto_usd NUMERIC(14,2) NOT NULL,
  deducciones_totales_usd NUMERIC(14,2) NOT NULL,
  monto_detraccion_usd NUMERIC(14,2) NOT NULL,
  adelantos_descontados_usd NUMERIC(14,2) NOT NULL,
  monto_neto_pagado_usd NUMERIC(14,2) NOT NULL,
  monto_neto_pagado_pen NUMERIC(14,2) NOT NULL,
  responsable_cierre VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA: AUDITORÍA Y TRAZABILIDAD (HISTORIAL DE ETAPAS)
CREATE TABLE historial_etapas_lote (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID REFERENCES lotes(id) ON DELETE CASCADE,
  etapa etapa_lote_enum NOT NULL,
  usuario VARCHAR(150) NOT NULL,
  fecha_cambio TIMESTAMPTZ DEFAULT NOW(),
  nota TEXT
);

-- ÍNDICES PARA ALTA CONCURRENCIA
CREATE INDEX idx_lotes_etapa ON lotes(etapa_actual);
CREATE INDEX idx_lotes_origen ON lotes(origen_region);
CREATE INDEX idx_lotes_codigo ON lotes(codigo_lote);
CREATE INDEX idx_balanza_molino ON recepciones_balanza(molino_id);
