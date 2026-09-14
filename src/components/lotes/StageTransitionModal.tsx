import React, { useState } from 'react';
import { useLotes } from '../../context/LotesContext';
import { STAGES } from '../../data/mockData';

export const StageTransitionModal: React.FC = () => {
  const { 
    transitionModalLote: lote, 
    closeTransitionModal, 
    advanceLoteStage,
    molinos,
    ticker,
    openLiquidationSlip
  } = useLotes();

  if (!lote) return null;

  const currentStageIndex = STAGES.findIndex(s => s.id === lote.etapaActual);
  const nextStage = currentStageIndex < STAGES.length - 1 ? STAGES[currentStageIndex + 1] : null;

  // Estados locales para cada etapa posible
  
  // Etapa 2: Tránsito
  const [transporteForm, setTransporteForm] = useState({
    transportista: 'Transportes San Juan SAC',
    rucTransporte: '20489912001',
    conductor: 'Guillermo Tacuchi Quispe',
    licenciaConducir: 'Q-44589123',
    placaVolquete: 'T7B-894',
    guiaRemisionRemitente: `GRR-004-${Math.floor(100000 + Math.random() * 900000)}`,
    guiaRemisionTransportista: `GRT-002-${Math.floor(100000 + Math.random() * 900000)}`,
    precintosSeguridad: 'SEC-99012, SEC-99013',
    fechaSalida: new Date().toISOString().slice(0, 16).replace('T', ' '),
    fechaLlegadaEstimada: 'En 12 horas aprox.',
    observacionesRuta: 'Ruta directa hacia molinos en Trujillo sin novedades.',
  });

  // Etapa 3: Molienda
  const [balanzaForm, setBalanzaForm] = useState({
    ticketNumero: `BLZ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    fechaPesaje: new Date().toISOString().slice(0, 10),
    horaPesaje: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pesoBrutoTM: Number((lote.pesoEstimadoTMH * 1.45).toFixed(2)),
    pesoTaraTM: Number((lote.pesoEstimadoTMH * 0.45).toFixed(2)),
    pesoNetoTMH: lote.pesoEstimadoTMH,
    molinoAsignadoId: molinos[0]?.id || 'mol-01',
    operadorBalanza: 'F. Valderrama (Plataforma Trujillo)',
  });

  // Etapa 4: Muestreo / Leyes (con Humedad y Recuperación)
  const [ensayosForm, setEnsayosForm] = useState({
    codigoMuestraCliente: `MUE-CLI-${lote.codigoLote.split('-').pop()}`,
    codigoContraMuestra: `CTRA-EMP-${lote.codigoLote.split('-').pop()}`,
    codigoDirimente: `DIR-CUST-${lote.codigoLote.split('-').pop()}`,
    laboratorio: 'SGS del Perú (Sede Trujillo)',
    certificadoNro: `CERT-SGS-TRU-${Math.floor(10000 + Math.random() * 90000)}`,
    porcentajeHumedad: 6.5, // % Humedad
    oroOzTM: lote.leyesEstimadasOrigen?.oroEquivalenteOz ?? 1.65, // Au oz/TM de origen
    plataOzTM: lote.leyesEstimadasOrigen?.plataOzTM ?? 8.50,     // Ag oz/TM de origen
    cobrePorcentaje: lote.leyesEstimadasOrigen?.cobrePorcentaje ?? 0.75, // Cu % de origen
    oroRecuperacion: 88.5,  // Recup Au %
    plataRecuperacion: 72.0,// Recup Ag %
    cobreRecuperacion: 80.0,// Recup Cu %
    arsenicoPorc: 0.08,
    antimonioPorc: 0.03,
  });

  // Etapa 5: Negociación
  const spotAuDefault = ticker.find(t => t.simbolo === 'AU')?.precio || 2742.40;
  const spotAgDefault = ticker.find(t => t.simbolo === 'AG')?.precio || 32.48;
  const spotCuDefault = ticker.find(t => t.simbolo === 'CU')?.precio || 4.39;
  const tipoCambioDefault = ticker.find(t => t.simbolo === 'USDPEN')?.precio || 3.755;

  const [negociacionForm, setNegociacionForm] = useState({
    spotOroUSDoz: spotAuDefault,
    spotPlataUSDoz: spotAgDefault,
    spotCobreUSDlb: spotCuDefault,
    tipoCambio: tipoCambioDefault,
    maquilaPorTMS: 95.0, // Maquila USD por TMS
    penalidadesUSD: 0,
    adelantoOrigenUSD: lote.adelantoPactadoUSD || 0,
    observaciones: 'Acuerdo en base a leyes SGS Trujillo y cotización spot de bolsa congelada.',
  });

  // Etapa 6: Liquidación
  const [liquidacionForm, setLiquidacionForm] = useState({
    banco: 'BCP' as 'BCP' | 'BBVA' | 'Interbank' | 'Scotiabank' | 'Banco de la Nación',
    nroOperacion: `OP-BCP-${Math.floor(10000000 + Math.random() * 90000000)}`,
    comprobanteTipo: 'Liquidación de Compra' as 'Liquidación de Compra' | 'Factura Electrónica',
    comprobanteNumero: `LQ01-${Math.floor(100000 + Math.random() * 900000)}`,
    constanciaDetraccionNro: `DET-SUNAT-2026-${Math.floor(1000000 + Math.random() * 9000000)}`,
    responsableCierre: 'Lic. Ana Carbajal (Tesorería)',
  });

  // Sincronizar recálculo de peso neto en balanza
  const handlePesoChange = (bruto: number, tara: number) => {
    const neto = Math.max(0, Number((bruto - tara).toFixed(2)));
    setBalanzaForm(prev => ({
      ...prev,
      pesoBrutoTM: bruto,
      pesoTaraTM: tara,
      pesoNetoTMH: neto,
    }));
  };

  // Cálculos dinámicos de negociación
  const tmhActual = lote.balanza?.pesoNetoTMH || lote.pesoEstimadoTMH || 1;
  const humedadActual = lote.ensayosLab?.porcentajeHumedad ?? ensayosForm.porcentajeHumedad ?? 6.5;
  const tmsCalculada = Number((tmhActual * (1 - humedadActual / 100)).toFixed(3));

  const leyAu = lote.ensayosLab?.leyes.oroOzTM ?? ensayosForm.oroOzTM ?? 1.5;
  const leyAg = lote.ensayosLab?.leyes.plataOzTM ?? ensayosForm.plataOzTM ?? 8.0;
  const leyCu = lote.ensayosLab?.leyes.cobrePorcentaje ?? ensayosForm.cobrePorcentaje ?? 0.5;

  const recupAu = lote.ensayosLab?.recuperaciones.oroRecuperacionPorcentaje ?? ensayosForm.oroRecuperacion ?? 88;
  const recupAg = lote.ensayosLab?.recuperaciones.plataRecuperacionPorcentaje ?? ensayosForm.plataRecuperacion ?? 72;
  const recupCu = lote.ensayosLab?.recuperaciones.cobreRecuperacionPorcentaje ?? ensayosForm.cobreRecuperacion ?? 80;

  // Valor bruto por TMS
  const valorAuPorTMS = leyAu * (recupAu / 100) * negociacionForm.spotOroUSDoz;
  const valorAgPorTMS = leyAg * (recupAg / 100) * negociacionForm.spotPlataUSDoz;
  // Cobre: 1 TM = 2204.62 lbs. Si ley es %, lbs de Cu por TM = (leyCu / 100) * 2204.62
  const valorCuPorTMS = (leyCu / 100) * 2204.62 * (recupCu / 100) * negociacionForm.spotCobreUSDlb;

  const totalBrutoPorTMS = valorAuPorTMS + valorAgPorTMS + valorCuPorTMS;
  const totalBrutoLoteUSD = Number((tmsCalculada * totalBrutoPorTMS).toFixed(2));
  const deduccionMaquilaUSD = Number((tmsCalculada * negociacionForm.maquilaPorTMS).toFixed(2));
  const deduccionesTotalesUSD = deduccionMaquilaUSD + (negociacionForm.penalidadesUSD || 0);
  
  const baseImponibleUSD = Math.max(0, totalBrutoLoteUSD - deduccionesTotalesUSD);
  const detraccionSUNAT_USD = Number((baseImponibleUSD * 0.10).toFixed(2)); // 10%
  const adelantosDescontados = Math.min(baseImponibleUSD - detraccionSUNAT_USD, negociacionForm.adelantoOrigenUSD);
  const netoPagarUSD = Number((baseImponibleUSD - detraccionSUNAT_USD - adelantosDescontados).toFixed(2));
  const netoPagarPEN = Number((netoPagarUSD * negociacionForm.tipoCambio).toFixed(2));

  // Manejar el submit para avanzar a la siguiente etapa
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextStage) return;

    if (nextStage.id === 'transito_trujillo') {
      advanceLoteStage(lote.id, 'transito_trujillo', {
        transporte: {
          transportista: transporteForm.transportista,
          rucTransporte: transporteForm.rucTransporte,
          conductor: transporteForm.conductor,
          licenciaConducir: transporteForm.licenciaConducir,
          placaVolquete: transporteForm.placaVolquete,
          guiaRemisionRemitente: transporteForm.guiaRemisionRemitente,
          guiaRemisionTransportista: transporteForm.guiaRemisionTransportista,
          precintosSeguridad: transporteForm.precintosSeguridad.split(',').map(s => s.trim()),
          fechaSalida: transporteForm.fechaSalida,
          fechaLlegadaEstimada: transporteForm.fechaLlegadaEstimada,
          observacionesRuta: transporteForm.observacionesRuta,
        },
      }, `Despachado en volquete ${transporteForm.placaVolquete} hacia Trujillo.`);
    } 
    else if (nextStage.id === 'en_molienda') {
      const selectedMolino = molinos.find(m => m.id === balanzaForm.molinoAsignadoId);
      advanceLoteStage(lote.id, 'en_molienda', {
        balanza: {
          ticketNumero: balanzaForm.ticketNumero,
          fechaPesaje: balanzaForm.fechaPesaje,
          horaPesaje: balanzaForm.horaPesaje,
          pesoBrutoTM: balanzaForm.pesoBrutoTM,
          pesoTaraTM: balanzaForm.pesoTaraTM,
          pesoNetoTMH: balanzaForm.pesoNetoTMH,
          molinoAsignadoId: balanzaForm.molinoAsignadoId,
          molinoNombre: selectedMolino?.nombre || 'Molino Trujillo',
          operadorBalanza: balanzaForm.operadorBalanza,
        },
      }, `Pesaje registrado en balanza (${balanzaForm.pesoNetoTMH} TMH) e ingresado a ${selectedMolino?.nombre}.`);
    }
    else if (nextStage.id === 'muestreo_leyes') {
      advanceLoteStage(lote.id, 'muestreo_leyes', {
        ensayosLab: {
          codigoMuestraCliente: ensayosForm.codigoMuestraCliente,
          codigoContraMuestra: ensayosForm.codigoContraMuestra,
          codigoDirimente: ensayosForm.codigoDirimente,
          laboratorio: ensayosForm.laboratorio,
          fechaEmision: new Date().toISOString().slice(0, 10),
          certificadoNro: ensayosForm.certificadoNro,
          porcentajeHumedad: Number(ensayosForm.porcentajeHumedad),
          leyes: {
            oroOzTM: Number(ensayosForm.oroOzTM),
            plataOzTM: Number(ensayosForm.plataOzTM),
            cobrePorcentaje: Number(ensayosForm.cobrePorcentaje),
          },
          recuperaciones: {
            oroRecuperacionPorcentaje: Number(ensayosForm.oroRecuperacion),
            plataRecuperacionPorcentaje: Number(ensayosForm.plataRecuperacion),
            cobreRecuperacionPorcentaje: Number(ensayosForm.cobreRecuperacion),
          },
          penalidades: {
            arsenicoPorc: Number(ensayosForm.arsenicoPorc),
            antimonioPorc: Number(ensayosForm.antimonioPorc),
          },
          aprobadoCliente: true,
          aprobadoEmpresa: true,
        },
      }, `Ensayos químicos validados: Au ${ensayosForm.oroOzTM} oz/TM, Humedad ${ensayosForm.porcentajeHumedad}%, Recup Au ${ensayosForm.oroRecuperacion}%.`);
    }
    else if (nextStage.id === 'negociacion') {
      advanceLoteStage(lote.id, 'negociacion', {
        negociacion: {
          fechaNegociacion: new Date().toISOString().slice(0, 10),
          tipoCambioSpot: negociacionForm.tipoCambio,
          spotPricesCongelados: {
            oroUSDoz: negociacionForm.spotOroUSDoz,
            plataUSDoz: negociacionForm.spotPlataUSDoz,
            cobreUSDlb: negociacionForm.spotCobreUSDlb,
          },
          maquilaPorTMS: Number(negociacionForm.maquilaPorTMS),
          penalidadesTotalesUSD: Number(negociacionForm.penalidadesUSD),
          adelantoOrigenUSD: Number(negociacionForm.adelantoOrigenUSD),
          porcentajeDetraccion: 10,
          observacionesPacto: negociacionForm.observaciones,
          estadoNegociacion: 'acordado',
        },
      }, `Negociación cerrada con Spot Au $${negociacionForm.spotOroUSDoz}/oz. Neto a liquidar: $${netoPagarUSD.toLocaleString()}.`);
    }
    else if (nextStage.id === 'liquidado') {
      advanceLoteStage(lote.id, 'liquidado', {
        liquidacion: {
          numeroLiquidacion: `LIQ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          fechaPago: new Date().toISOString().slice(0, 10),
          banco: liquidacionForm.banco,
          nroOperacionBancaria: liquidacionForm.nroOperacion,
          comprobantePagoTipo: liquidacionForm.comprobanteTipo,
          comprobanteNumero: liquidacionForm.comprobanteNumero,
          constanciaDetraccionNro: liquidacionForm.constanciaDetraccionNro,
          montoTotalBrutoUSD: totalBrutoLoteUSD,
          deduccionesTotalesUSD: deduccionesTotalesUSD,
          montoDetraccionUSD: detraccionSUNAT_USD,
          adelantosDescontadosUSD: adelantosDescontados,
          montoNetoPagadoUSD: netoPagarUSD,
          montoNetoPagadoPEN: netoPagarPEN,
          responsableCierre: liquidacionForm.responsableCierre,
        },
      }, `Liquidación pagada por $${netoPagarUSD.toLocaleString()} USD vía ${liquidacionForm.banco} (${liquidacionForm.nroOperacion}).`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-industrial-900 border border-industrial-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        {/* Cabecera del Modal */}
        <div className="p-5 bg-industrial-950 border-b border-industrial-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <i className="fa-solid fa-timeline text-base"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-slate-100">
                  {lote.codigoLote}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-industrial-800 text-gold-400 border border-industrial-700">
                  {lote.origen.departamento}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lote.cliente.nombre} • {lote.origen.laborMinera}
              </p>
            </div>
          </div>

          <button
            onClick={closeTransitionModal}
            className="text-slate-400 hover:text-slate-100 p-2 rounded-lg hover:bg-industrial-800 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Stepper Visual de las 6 Etapas */}
        <div className="bg-industrial-900/50 p-4 border-b border-industrial-800">
          <div className="grid grid-cols-6 gap-2">
            {STAGES.map((s, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isNext = idx === currentStageIndex + 1;

              let stepColor = 'text-slate-600 border-industrial-800 bg-industrial-950';
              if (isPast) stepColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
              if (isCurrent) stepColor = 'text-gold-400 border-gold-500 bg-gold-500/10 shadow-sm shadow-gold-500/20';
              if (isNext) stepColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20 animate-pulse';

              return (
                <div key={s.id} className="text-center">
                  <div className={`w-full py-1.5 rounded-lg border text-xs font-mono font-bold flex flex-col items-center justify-center ${stepColor}`}>
                    <i className={`${s.icon} text-xs mb-0.5`}></i>
                    <span className="text-[10px] hidden sm:inline">{s.stepNumber}. {s.label}</span>
                    <span className="text-[9px] sm:hidden">{s.stepNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulario según la etapa siguiente */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-200px)] overflow-y-auto">
          {nextStage ? (
            <div className="bg-industrial-950/60 p-4 rounded-xl border border-industrial-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider font-bold">
                  Siguiente Transición Requerida
                </span>
                <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                  <i className={`${nextStage.icon} text-gold-500`}></i>
                  Etapa {nextStage.stepNumber}: {nextStage.label}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{nextStage.description}</p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/30 p-5 rounded-xl border border-emerald-500/40 text-center space-y-3">
              <i className="fa-solid fa-circle-check text-emerald-400 text-3xl"></i>
              <h4 className="text-lg font-bold text-emerald-300">Lote Liquidado y Cerrado</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Este mineral ha cumplido con todo el ciclo operativo: acopio en origen, tránsito, molienda en Trujillo, ensayos de leyes y liquidación comercial.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeTransitionModal();
                  openLiquidationSlip(lote);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-industrial-950 font-bold text-xs shadow-lg hover:bg-emerald-400 transition-all"
              >
                <i className="fa-solid fa-file-invoice-dollar"></i>
                Descargar / Ver Boleta de Liquidación
              </button>
            </div>
          )}

          {/* Formulario Etapa 2: Tránsito a Trujillo */}
          {nextStage?.id === 'transito_trujillo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Empresa de Transporte</label>
                  <input
                    type="text"
                    required
                    value={transporteForm.transportista}
                    onChange={(e) => setTransporteForm({ ...transporteForm, transportista: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Conductor Responsable</label>
                  <input
                    type="text"
                    required
                    value={transporteForm.conductor}
                    onChange={(e) => setTransporteForm({ ...transporteForm, conductor: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Placa del Volquete / Tracto</label>
                  <input
                    type="text"
                    required
                    value={transporteForm.placaVolquete}
                    onChange={(e) => setTransporteForm({ ...transporteForm, placaVolquete: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-gold-400 font-bold font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Guía Remisión Remitente (GRR)</label>
                  <input
                    type="text"
                    required
                    value={transporteForm.guiaRemisionRemitente}
                    onChange={(e) => setTransporteForm({ ...transporteForm, guiaRemisionRemitente: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Precintos de Seguridad</label>
                  <input
                    type="text"
                    value={transporteForm.precintosSeguridad}
                    onChange={(e) => setTransporteForm({ ...transporteForm, precintosSeguridad: e.target.value })}
                    placeholder="SEC-001, SEC-002"
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Destino Final</label>
                  <input
                    type="text"
                    disabled
                    value="Molinos en Trujillo (La Libertad)"
                    className="w-full bg-industrial-950/50 border border-industrial-800 text-slate-500 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Formulario Etapa 3: En Molienda (Varios Molinos en Trujillo) */}
          {nextStage?.id === 'en_molienda' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-gold-400 font-bold mb-1">
                    Seleccionar Molino Asignado en Trujillo *
                  </label>
                  <select
                    value={balanzaForm.molinoAsignadoId}
                    onChange={(e) => setBalanzaForm({ ...balanzaForm, molinoAsignadoId: e.target.value })}
                    className="w-full bg-industrial-950 border border-gold-500/50 rounded-lg p-2 text-xs text-slate-100 font-mono focus:border-gold-500 outline-none"
                  >
                    {molinos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} — {m.ubicacion} (Carga: {m.cargaActualTM}/{m.capacidadDiariaTM} TM) - [{m.estado.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Nota: La empresa procesa en múltiples molinos independientes en Trujillo.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Ticket de Balanza Electrónica</label>
                  <input
                    type="text"
                    required
                    value={balanzaForm.ticketNumero}
                    onChange={(e) => setBalanzaForm({ ...balanzaForm, ticketNumero: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Operador de Balanza</label>
                  <input
                    type="text"
                    value={balanzaForm.operadorBalanza}
                    onChange={(e) => setBalanzaForm({ ...balanzaForm, operadorBalanza: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>

                {/* Pesaje */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Peso Bruto Volquete (TM)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={balanzaForm.pesoBrutoTM}
                    onChange={(e) => handlePesoChange(Number(e.target.value), balanzaForm.pesoTaraTM)}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Peso Tara Volquete (TM)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={balanzaForm.pesoTaraTM}
                    onChange={(e) => handlePesoChange(balanzaForm.pesoBrutoTM, Number(e.target.value))}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2 bg-industrial-950 p-3 rounded-lg border border-industrial-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300">Peso Neto en Cancha / Molienda (TMH):</span>
                  <span className="text-lg font-mono font-bold text-gold-400">
                    {balanzaForm.pesoNetoTMH.toFixed(2)} TMH
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Formulario Etapa 4: Muestreo / Leyes (con Porcentaje de Humedad y Recuperación) */}
          {nextStage?.id === 'muestreo_leyes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Muestra Cliente</label>
                  <input
                    type="text"
                    value={ensayosForm.codigoMuestraCliente}
                    onChange={(e) => setEnsayosForm({ ...ensayosForm, codigoMuestraCliente: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Contra-Muestra Empresa</label>
                  <input
                    type="text"
                    value={ensayosForm.codigoContraMuestra}
                    onChange={(e) => setEnsayosForm({ ...ensayosForm, codigoContraMuestra: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Laboratorio Químico</label>
                  <input
                    type="text"
                    value={ensayosForm.laboratorio}
                    onChange={(e) => setEnsayosForm({ ...ensayosForm, laboratorio: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
              </div>

              {/* Panel de Leyes, Humedad y Recuperación */}
              <div className="bg-industrial-950 p-4 rounded-xl border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
                  <h5 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-flask"></i>
                    Resultados de Laboratorio & Factores Metalúrgicos
                  </h5>
                  <span className="text-[11px] font-mono text-slate-400">
                    Certificado: {ensayosForm.certificadoNro}
                  </span>
                </div>

                {/* Referencia de Leyes Pactadas en Origen */}
                {lote.leyesEstimadasOrigen && (
                  <div className="bg-industrial-900/90 border border-gold-500/30 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="bg-gold-500/20 text-gold-400 p-1 rounded">
                        <i className="fa-solid fa-scale-balanced text-xs"></i>
                      </span>
                      <span className="text-slate-300">
                        <strong className="text-gold-400">Pactado en Origen:</strong>{' '}
                        Au {lote.leyesEstimadasOrigen.oroEquivalenteOz.toFixed(2)} oz/TM ({lote.leyesEstimadasOrigen.oroEquivalenteGramos.toFixed(2)} g/TM)
                        {lote.leyesEstimadasOrigen.plataOzTM !== undefined && (
                          <span className="text-silver-300 ml-2">| Ag {lote.leyesEstimadasOrigen.plataOzTM} oz/TM</span>
                        )}
                        {lote.leyesEstimadasOrigen.cobrePorcentaje !== undefined && (
                          <span className="text-copper-400 ml-2">| Cu {lote.leyesEstimadasOrigen.cobrePorcentaje}%</span>
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-industrial-950 px-2 py-0.5 rounded border border-industrial-800">
                      Valores pre-cargados
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Humedad */}
                  <div className="bg-industrial-900 p-2.5 rounded-lg border border-industrial-800">
                    <label className="block text-[11px] font-mono text-cyan-300 font-semibold mb-1">
                      % Humedad (H2O) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={ensayosForm.porcentajeHumedad}
                      onChange={(e) => setEnsayosForm({ ...ensayosForm, porcentajeHumedad: Number(e.target.value) })}
                      className="w-full bg-industrial-950 border border-industrial-700 rounded p-1.5 text-xs text-slate-100 font-mono focus:border-cyan-400 outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      TMS: {(tmhActual * (1 - ensayosForm.porcentajeHumedad / 100)).toFixed(2)} TM
                    </span>
                  </div>

                  {/* Ley Au */}
                  <div className="bg-industrial-900 p-2.5 rounded-lg border border-industrial-800">
                    <label className="block text-[11px] font-mono text-gold-400 font-semibold mb-1">
                      Ley Oro (Au oz/TM) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={ensayosForm.oroOzTM}
                      onChange={(e) => setEnsayosForm({ ...ensayosForm, oroOzTM: Number(e.target.value) })}
                      className="w-full bg-industrial-950 border border-industrial-700 rounded p-1.5 text-xs text-gold-400 font-bold font-mono focus:border-gold-400 outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      aprox. {(ensayosForm.oroOzTM * 31.1035).toFixed(2)} g/TM
                    </span>
                  </div>

                  {/* Ley Ag */}
                  <div className="bg-industrial-900 p-2.5 rounded-lg border border-industrial-800">
                    <label className="block text-[11px] font-mono text-silver-300 font-semibold mb-1">
                      Ley Plata (Ag oz/TM)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={ensayosForm.plataOzTM}
                      onChange={(e) => setEnsayosForm({ ...ensayosForm, plataOzTM: Number(e.target.value) })}
                      className="w-full bg-industrial-950 border border-industrial-700 rounded p-1.5 text-xs text-slate-100 font-mono focus:border-slate-400 outline-none"
                    />
                  </div>

                  {/* Ley Cu */}
                  <div className="bg-industrial-900 p-2.5 rounded-lg border border-industrial-800">
                    <label className="block text-[11px] font-mono text-copper-500 font-semibold mb-1">
                      Ley Cobre (Cu %)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={ensayosForm.cobrePorcentaje}
                      onChange={(e) => setEnsayosForm({ ...ensayosForm, cobrePorcentaje: Number(e.target.value) })}
                      className="w-full bg-industrial-950 border border-industrial-700 rounded p-1.5 text-xs text-slate-100 font-mono focus:border-copper-500 outline-none"
                    />
                  </div>
                </div>

                {/* Factores de Recuperación */}
                <div className="pt-2 border-t border-industrial-800">
                  <span className="text-[11px] font-mono text-slate-400 block mb-2">
                    Porcentaje de Recuperación Metalúrgica de Planta (%):
                  </span>
                  <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Recup. Au %</span>
                      <input
                        type="number"
                        step="0.5"
                        value={ensayosForm.oroRecuperacion}
                        onChange={(e) => setEnsayosForm({ ...ensayosForm, oroRecuperacion: Number(e.target.value) })}
                        className="w-full bg-industrial-950 border border-industrial-800 rounded p-1 text-slate-100"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Recup. Ag %</span>
                      <input
                        type="number"
                        step="0.5"
                        value={ensayosForm.plataRecuperacion}
                        onChange={(e) => setEnsayosForm({ ...ensayosForm, plataRecuperacion: Number(e.target.value) })}
                        className="w-full bg-industrial-950 border border-industrial-800 rounded p-1 text-slate-100"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Recup. Cu %</span>
                      <input
                        type="number"
                        step="0.5"
                        value={ensayosForm.cobreRecuperacion}
                        onChange={(e) => setEnsayosForm({ ...ensayosForm, cobreRecuperacion: Number(e.target.value) })}
                        className="w-full bg-industrial-950 border border-industrial-800 rounded p-1 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulario Etapa 5: Negociación (Calculadora Comercial Spot) */}
          {nextStage?.id === 'negociacion' && (
            <div className="space-y-4">
              <div className="bg-industrial-950 p-4 rounded-xl border border-gold-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
                  <h5 className="text-xs font-mono font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-calculator"></i>
                    Calculadora de Liquidación Minera (Spot Live)
                  </h5>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
                    Leyes Validadas
                  </span>
                </div>

                {/* Precios Spot Congelados */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Spot Oro Au ($/oz)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={negociacionForm.spotOroUSDoz}
                      onChange={(e) => setNegociacionForm({ ...negociacionForm, spotOroUSDoz: Number(e.target.value) })}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-xs font-mono font-bold text-gold-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Spot Plata Ag ($/oz)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={negociacionForm.spotPlataUSDoz}
                      onChange={(e) => setNegociacionForm({ ...negociacionForm, spotPlataUSDoz: Number(e.target.value) })}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-xs font-mono font-bold text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Maquila Molienda ($/TMS)</label>
                    <input
                      type="number"
                      step="1"
                      value={negociacionForm.maquilaPorTMS}
                      onChange={(e) => setNegociacionForm({ ...negociacionForm, maquilaPorTMS: Number(e.target.value) })}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-xs font-mono font-bold text-amber-400"
                    />
                  </div>
                </div>

                {/* Resumen de la fórmula de valorización */}
                <div className="bg-industrial-900/90 p-3 rounded-lg border border-industrial-800 font-mono text-xs space-y-2">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>TMH: {tmhActual.toFixed(2)} | Humedad: {humedadActual}%</span>
                    <span className="text-slate-200 font-bold">TMS Efectivas: {tmsCalculada} TM</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Valor Metálico Au ({leyAu} oz * {recupAu}% * ${negociacionForm.spotOroUSDoz}):</span>
                    <span className="text-gold-400 font-semibold">${valorAuPorTMS.toFixed(2)} / TMS</span>
                  </div>
                  <div className="flex justify-between text-slate-300 border-t border-industrial-800 pt-1.5 font-bold">
                    <span>Total Bruto Lote:</span>
                    <span className="text-slate-100">${totalBrutoLoteUSD.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-rose-400 text-[11px]">
                    <span>(-) Maquila Molienda ({tmsCalculada} TMS * ${negociacionForm.maquilaPorTMS}):</span>
                    <span>-${deduccionMaquilaUSD.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between text-amber-400 text-[11px]">
                    <span>(-) Detracción SUNAT (10% Ley Peruana):</span>
                    <span>-${detraccionSUNAT_USD.toLocaleString()} USD</span>
                  </div>
                  {negociacionForm.adelantoOrigenUSD > 0 && (
                    <div className="flex justify-between text-blue-400 text-[11px]">
                      <span>(-) Adelanto entregado en Origen:</span>
                      <span>-${adelantosDescontados.toLocaleString()} USD</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-400 text-sm font-bold border-t border-industrial-800 pt-2">
                    <span>NETO A LIQUIDAR (USD):</span>
                    <span className="text-base">${netoPagarUSD.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Equivalente en Soles (TC {negociacionForm.tipoCambio}):</span>
                    <span className="text-slate-200">S/ {netoPagarPEN.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulario Etapa 6: Liquidación (Pago y Cierre Bancario) */}
          {nextStage?.id === 'liquidado' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Banco Pagador</label>
                  <select
                    value={liquidacionForm.banco}
                    onChange={(e) => setLiquidacionForm({ ...liquidacionForm, banco: e.target.value as any })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  >
                    <option value="BCP">Banco de Crédito del Perú (BCP)</option>
                    <option value="BBVA">BBVA Continental</option>
                    <option value="Interbank">Interbank</option>
                    <option value="Scotiabank">Scotiabank</option>
                    <option value="Banco de la Nación">Banco de la Nación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Nro de Operación Bancaria</label>
                  <input
                    type="text"
                    required
                    value={liquidacionForm.nroOperacion}
                    onChange={(e) => setLiquidacionForm({ ...liquidacionForm, nroOperacion: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Tipo de Comprobante</label>
                  <select
                    value={liquidacionForm.comprobanteTipo}
                    onChange={(e) => setLiquidacionForm({ ...liquidacionForm, comprobanteTipo: e.target.value as any })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  >
                    <option value="Liquidación de Compra">Liquidación de Compra (SUNAT)</option>
                    <option value="Factura Electrónica">Factura Electrónica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Nro de Comprobante</label>
                  <input
                    type="text"
                    required
                    value={liquidacionForm.comprobanteNumero}
                    onChange={(e) => setLiquidacionForm({ ...liquidacionForm, comprobanteNumero: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-400 mb-1">Constancia de Detracción SUNAT (10%)</label>
                  <input
                    type="text"
                    required
                    value={liquidacionForm.constanciaDetraccionNro}
                    onChange={(e) => setLiquidacionForm({ ...liquidacionForm, constanciaDetraccionNro: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                  />
                </div>
              </div>

              {/* Confirmación de Liquidación */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg flex items-center justify-between font-mono text-xs">
                <span className="text-emerald-300 font-semibold">Monto Neto Final a Desembolsar:</span>
                <span className="text-lg font-bold text-emerald-400">
                  ${netoPagarUSD.toLocaleString()} USD
                </span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="pt-4 border-t border-industrial-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeTransitionModal}
              className="px-4 py-2 rounded-lg bg-industrial-800 text-slate-300 text-xs font-medium hover:bg-industrial-700 transition-colors"
            >
              Cancelar
            </button>

            {nextStage && (
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-industrial-950 text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all active:scale-95"
              >
                <span>Confirmar y Avanzar a {nextStage.label}</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
