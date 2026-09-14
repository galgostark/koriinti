import React from 'react';
import { Lote, StageId } from '../../types';
import { useLotes } from '../../context/LotesContext';
import { STAGES } from '../../data/mockData';

interface LoteCardProps {
  lote: Lote;
}

export const LoteCard: React.FC<LoteCardProps> = ({ lote }) => {
  const { openTransitionModal, openLiquidationSlip } = useLotes();

  // Etapa actual
  const currentStageIndex = STAGES.findIndex(s => s.id === lote.etapaActual);
  const nextStage = currentStageIndex < STAGES.length - 1 ? STAGES[currentStageIndex + 1] : null;

  // Badges por origen
  let originBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  if (lote.origen.departamento === 'Áncash') {
    originBadge = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  } else if (lote.origen.departamento === 'Piura') {
    originBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 hover:border-gold-500/50 transition-all duration-200 shadow-md group flex flex-col justify-between">
      <div>
        {/* Cabecera de la tarjeta: Código y Origen */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono font-bold text-sm tracking-tight text-gold-400 group-hover:text-gold-300 transition-colors">
            {lote.codigoLote}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${originBadge}`}>
            {lote.origen.departamento}
          </span>
        </div>

        {/* Cliente y Labor */}
        <div className="mt-2.5">
          <h4 className="text-xs font-semibold text-slate-100 truncate" title={lote.cliente.nombre}>
            {lote.cliente.nombre}
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
            <i className="fa-solid fa-mountain text-[10px] text-slate-500"></i>
            <span>{lote.origen.laborMinera}</span>
          </div>
        </div>

        {/* Datos Operativos Clave */}
        <div className="mt-3 bg-industrial-950/80 border border-industrial-800/80 rounded-lg p-2.5 space-y-1.5 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">Tipo Mineral:</span>
            <span className="text-slate-200 font-medium text-[11px] truncate max-w-[130px]">{lote.tipoMineral}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">Peso:</span>
            <span className="text-slate-100 font-bold">
              {lote.balanza?.pesoNetoTMH 
                ? `${lote.balanza.pesoNetoTMH.toFixed(2)} TMH (Real)` 
                : `${lote.pesoEstimadoTMH.toFixed(2)} TMH (Est.)`}
            </span>
          </div>

          {/* Información contextual por etapa */}
          {lote.etapaActual === 'en_origen' && (
            <div className="border-t border-industrial-800 pt-1.5 text-[11px] text-amber-300 space-y-0.5">
              {lote.leyesEstimadasOrigen ? (
                <>
                  <div className="flex justify-between">
                    <span>Ley Est. Au:</span>
                    <strong className="text-gold-400">
                      {lote.leyesEstimadasOrigen.oroValor} {lote.leyesEstimadasOrigen.oroUnidad}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({lote.leyesEstimadasOrigen.oroUnidad === 'oz/TM'
                          ? `${lote.leyesEstimadasOrigen.oroEquivalenteGramos} g`
                          : `${lote.leyesEstimadasOrigen.oroEquivalenteOz} oz`})
                      </span>
                    </strong>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ag: {lote.leyesEstimadasOrigen.plataOzTM} oz</span>
                    <span>Cu: {lote.leyesEstimadasOrigen.cobrePorcentaje}%</span>
                  </div>
                </>
              ) : (
                <div className="text-[10px] text-slate-400 italic">
                  Acopio pactado • Adelanto: ${lote.adelantoPactadoUSD.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {lote.etapaActual === 'transito_trujillo' && lote.transporte && (
            <div className="border-t border-industrial-800 pt-1.5 text-[11px] text-blue-300">
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-truck text-[10px]"></i>
                <span className="truncate">{lote.transporte.placaVolquete}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Cond: {lote.transporte.conductor}
              </div>
            </div>
          )}

          {lote.etapaActual === 'en_molienda' && lote.balanza && (
            <div className="border-t border-industrial-800 pt-1.5 text-[11px] text-purple-300">
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-gears text-[10px]"></i>
                <span className="truncate">{lote.balanza.molinoNombre}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Ticket Balanza: #{lote.balanza.ticketNumero}
              </div>
            </div>
          )}

          {lote.etapaActual === 'muestreo_leyes' && lote.ensayosLab && (
            <div className="border-t border-industrial-800 pt-1.5 text-[11px] text-cyan-300 space-y-0.5">
              <div className="flex justify-between">
                <span>Au: <strong>{lote.ensayosLab.leyes.oroOzTM} oz/TM</strong></span>
                <span>Recup Au: <strong>{lote.ensayosLab.recuperaciones.oroRecuperacionPorcentaje}%</strong></span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Humedad: <strong className="text-cyan-400">{lote.ensayosLab.porcentajeHumedad}%</strong></span>
                <span>Ag: {lote.ensayosLab.leyes.plataOzTM} oz</span>
              </div>
            </div>
          )}

          {lote.etapaActual === 'negociacion' && (
            <div className="border-t border-industrial-800 pt-1.5 text-[11px] text-gold-300 space-y-0.5">
              <div className="flex justify-between">
                <span>Spot Au Congelado:</span>
                <span className="font-bold text-gold-400">
                  ${lote.negociacion?.spotPricesCongelados.oroUSDoz || 2742}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Maquila: ${lote.negociacion?.maquilaPorTMS || 95}/TMS</span>
                <span className="text-emerald-400 font-semibold">Listo para Cierre</span>
              </div>
            </div>
          )}

          {lote.etapaActual === 'liquidado' && lote.liquidacion && (
            <div className="border-t border-industrial-800 pt-1.5 text-[11px] text-emerald-300 space-y-0.5">
              <div className="flex justify-between">
                <span>Neto Pagado:</span>
                <span className="font-bold text-emerald-400">
                  ${lote.liquidacion.montoNetoPagadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {lote.liquidacion.banco} | {lote.liquidacion.nroOperacionBancaria}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción y transición */}
      <div className="mt-4 pt-3 border-t border-industrial-800 flex items-center justify-between gap-2">
        <button
          onClick={() => openTransitionModal(lote)}
          className="text-[11px] font-mono font-medium text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1"
        >
          <i className="fa-solid fa-eye text-[10px]"></i>
          <span>Detalles</span>
        </button>

        {nextStage ? (
          <button
            onClick={() => openTransitionModal(lote)}
            className="px-3 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500 text-gold-400 hover:text-industrial-950 border border-gold-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <span>Avanzar a {nextStage.label}</span>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        ) : (
          <button
            onClick={() => openLiquidationSlip(lote)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-industrial-950 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-file-invoice-dollar text-[11px]"></i>
            <span>Ver Boleta</span>
          </button>
        )}
      </div>
    </div>
  );
};
