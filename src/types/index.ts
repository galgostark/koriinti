// Tipos del Sistema de Gestión Operativa (ERP Industrial)

export type StageId = 
  | 'en_origen'
  | 'transito_trujillo'
  | 'en_molienda'
  | 'muestreo_leyes'
  | 'negociacion'
  | 'liquidado';

export interface StageDefinition {
  id: StageId;
  label: string;
  stepNumber: number;
  icon: string;
  color: string;
  badgeBg: string;
  description: string;
}

export type OriginRegion = 'Cajamarca' | 'Áncash' | 'Piura';

export interface ClienteMinero {
  id: string;
  nombre: string; // Razón Social o Nombre de la Empresa/Labor
  personaEncargada: string; // Nombre del encargado / representante de la labor
  tipoDocumento: 'RUC' | 'DNI';
  rucO_Dni: string;
  telefono: string;
  email?: string;
  esReinfo: boolean;
  reinfoCodigo?: string;
  departamento: OriginRegion;
  provincia: string;
  distrito?: string;
  laborMinera: string; // Labor o Concesión habitual
  coordenadasGps: string; // Coordenadas Lat, Long (ej. "-6.7667, -78.6167")
  fechaRegistro: string;
  bancoPreferido?: 'BCP' | 'BBVA' | 'Interbank' | 'Scotiabank' | 'Banco de la Nación';
  cuentaBancaria?: string;
  cci?: string;
  notas?: string;
  estado: 'activo' | 'observado' | 'inactivo';
}

export interface Molino {
  id: string;
  nombre: string;
  ubicacion: string;
  capacidadDiariaTM: number;
  cargaActualTM: number;
  estado: 'operando' | 'mantenimiento' | 'disponible';
  contacto: string;
}

export interface TransportData {
  transportista: string;
  rucTransporte?: string;
  conductor: string;
  licenciaConducir: string;
  placaVolquete: string;
  guiaRemisionRemitente: string;
  guiaRemisionTransportista: string;
  precintosSeguridad: string[];
  fechaSalida: string;
  fechaLlegadaEstimada: string;
  observacionesRuta?: string;
}

export interface BalanzaData {
  ticketNumero: string;
  fechaPesaje: string;
  horaPesaje: string;
  pesoBrutoTM: number;
  pesoTaraTM: number;
  pesoNetoTMH: number; // Toneladas Métricas Húmedas
  molinoAsignadoId: string;
  molinoNombre: string;
  operadorBalanza: string;
}

export interface EnsayosLabData {
  codigoMuestraCliente: string;
  codigoContraMuestra: string;
  codigoDirimente?: string;
  laboratorio: string;
  fechaEmision: string;
  certificadoNro: string;
  // Feedback usuario: Agregar porcentaje de humedad y recuperación
  porcentajeHumedad: number; // % H2O
  leyes: {
    oroOzTM: number;   // Au en oz/TM
    plataOzTM: number; // Ag en oz/TM
    cobrePorcentaje: number; // Cu en %
  };
  recuperaciones: {
    oroRecuperacionPorcentaje: number;   // Recup Au % (ej. 85%)
    plataRecuperacionPorcentaje: number; // Recup Ag % (ej. 75%)
    cobreRecuperacionPorcentaje: number; // Recup Cu % (ej. 80%)
  };
  penalidades?: {
    arsenicoPorc: number;
    antimonioPorc: number;
  };
  aprobadoCliente: boolean;
  aprobadoEmpresa: boolean;
}

export interface NegociacionData {
  fechaNegociacion: string;
  tipoCambioSpot: number; // USD to PEN
  spotPricesCongelados: {
    oroUSDoz: number;
    plataUSDoz: number;
    cobreUSDlb: number;
  };
  maquilaPorTMS: number; // Costo de tratamiento/molienda por TMS en USD
  penalidadesTotalesUSD: number;
  adelantoOrigenUSD: number;
  porcentajeDetraccion: number; // 10% por ley SUNAT
  observacionesPacto?: string;
  estadoNegociacion: 'propuesta' | 'contraoferta' | 'acordado';
}

export interface LiquidacionData {
  numeroLiquidacion: string;
  fechaPago: string;
  banco: 'BCP' | 'BBVA' | 'Interbank' | 'Scotiabank' | 'Banco de la Nación';
  nroOperacionBancaria: string;
  comprobantePagoTipo: 'Liquidación de Compra' | 'Factura Electrónica';
  comprobanteNumero: string;
  constanciaDetraccionNro?: string;
  montoTotalBrutoUSD: number;
  deduccionesTotalesUSD: number;
  montoDetraccionUSD: number;
  adelantosDescontadosUSD: number;
  montoNetoPagadoUSD: number;
  montoNetoPagadoPEN: number;
  responsableCierre: string;
  documentoUrl?: string;
}

export interface Lote {
  id: string;
  codigoLote: string; // ej. LOT-2026-CAJ-042
  etapaActual: StageId;
  fechaCreacion: string;
  
  // Etapa 1: En Origen
  cliente: {
    nombre: string;
    rucO_Dni: string;
    telefono: string;
    esReinfo: boolean; // Registro Integral de Formalización Minera
    reinfoCodigo?: string;
  };
  origen: {
    departamento: OriginRegion;
    provincia: string;
    laborMinera: string;
  };
  tipoMineral: 'Aurífero (Au)' | 'Polimetálico (Au-Ag-Cu)' | 'Plata-Plomo-Zinc';
  pesoEstimadoTMH: number;
  adelantoPactadoUSD: number;
  
  // Leyes estimadas preliminares registradas en origen (g/TM y oz/TM)
  leyesEstimadasOrigen?: {
    oroValor: number;
    oroUnidad: 'g/TM' | 'oz/TM';
    oroEquivalenteOz: number;
    oroEquivalenteGramos: number;
    plataOzTM: number;
    plataGramosTM?: number;
    cobrePorcentaje: number;
  };
  
  // Etapa 2: Tránsito a Trujillo
  transporte?: TransportData;
  
  // Etapa 3: En Molienda (Varios Molinos)
  balanza?: BalanzaData;
  
  // Etapa 4: Muestreo / Leyes (Humedad y Recuperación incluidas)
  ensayosLab?: EnsayosLabData;
  
  // Etapa 5: Negociación
  negociacion?: NegociacionData;
  
  // Etapa 6: Liquidado
  liquidacion?: LiquidacionData;
  
  // Notas e historial
  historialEtapas: Array<{
    etapa: StageId;
    fecha: string;
    usuario: string;
    nota?: string;
  }>;
}

export interface MetalTickerItem {
  simbolo: 'AU' | 'AG' | 'CU' | 'USDPEN';
  nombre: string;
  precio: number;
  unidad: string;
  variacion24h: number;
  tendencia: 'up' | 'down' | 'neutral';
  mercado: 'COMEX' | 'LME' | 'SBS Perú';
  ultimaActualizacion: string;
}

export interface ToastMessage {
  id: string;
  tipo: 'success' | 'info' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  tiempo?: string;
}
