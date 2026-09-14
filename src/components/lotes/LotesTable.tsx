import React from 'react';
import { useLotes } from '../../context/LotesContext';
import { STAGES } from '../../data/mockData';

export const LotesTable: React.FC = () => {
  const { lotes, filterOrigin, filterSearch, openTransitionModal, openLiquidationSlip } = useLotes();

  const filteredLotes = lotes.filter((lote) => {
    if (filterOrigin !== 'all' && lote.origen.departamento !== filterOrigin) {
      return false;
    }
    if (filterSearch.trim()) {
      const search = filterSearch.toLowerCase();
      return (
        lote.codigoLote.toLowerCase().includes(search) ||
        lote.cliente.nombre.toLowerCase().includes(search) ||
        lote.cliente.rucO_Dni.toLowerCase().includes(search) ||
        lote.origen.laborMinera.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-industrial-950/80 border-b border-industrial-800 text-slate-400 font-mono uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4">Lote / Fecha</th>
              <th className="py-3 px-4">Origen / Labor</th>
              <th className="py-3 px-4">Minero / RUC</th>
              <th className="py-3 px-4">Mineral & Peso</th>
              <th className="py-3 px-4">Etapa Actual</th>
              <th className="py-3 px-4">Detalles Operativos</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-800/60 font-mono">
            {filteredLotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No se encontraron lotes con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredLotes.map((lote) => {
                const stageDef = STAGES.find(s => s.id === lote.etapaActual);
                const currentStageIndex = STAGES.findIndex(s => s.id === lote.etapaActual);
                const nextStage = currentStageIndex < STAGES.length - 1 ? STAGES[currentStageIndex + 1] : null;

                let originBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                if (lote.origen.departamento === 'Áncash') {
                  originBadge = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                } else if (lote.origen.departamento === 'Piura') {
                  originBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                }

                return (
                  <tr key={lote.id} className="hover:bg-industrial-850/50 transition-colors">
                    {/* Código y Fecha */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gold-400">{lote.codigoLote}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{lote.fechaCreacion}</div>
                    </td>

                    {/* Origen y Labor */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${originBadge}`}>
                          {lote.origen.departamento}
                        </span>
                        <span className="text-slate-300 text-xs">{lote.origen.provincia}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                        {lote.origen.laborMinera}
                      </div>
                    </td>

                    {/* Minero / RUC */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="text-slate-200 font-medium truncate max-w-[190px]" title={lote.cliente.nombre}>
                        {lote.cliente.nombre}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        RUC: {lote.cliente.rucO_Dni}
                        {lote.cliente.esReinfo && (
                          <span className="ml-1 text-emerald-400 font-semibold">• REINFO</span>
                        )}
                      </div>
                    </td>

                    {/* Mineral y Peso */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-medium font-sans">{lote.tipoMineral}</div>
                      <div className="text-slate-100 font-bold">
                        {lote.balanza?.pesoNetoTMH 
                          ? `${lote.balanza.pesoNetoTMH} TMH` 
                          : `${lote.pesoEstimadoTMH} TMH (Est.)`}
                      </div>
                    </td>

                    {/* Etapa Actual */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${stageDef?.badgeBg}`}>
                        <i className={`${stageDef?.icon} text-[10px]`}></i>
                        {stageDef?.label}
                      </span>
                    </td>

                    {/* Detalles Operativos */}
                    <td className="py-3.5 px-4 text-[11px]">
                      {lote.etapaActual === 'transito_trujillo' && lote.transporte && (
                        <div className="text-blue-300">
                          <div>Placa: {lote.transporte.placaVolquete}</div>
                          <div className="text-[10px] text-slate-400">{lote.transporte.guiaRemisionRemitente}</div>
                        </div>
                      )}
                      {lote.etapaActual === 'en_molienda' && lote.balanza && (
                        <div className="text-purple-300">
                          <div>{lote.balanza.molinoNombre}</div>
                          <div className="text-[10px] text-slate-400">Neto: {lote.balanza.pesoNetoTMH} TMH</div>
                        </div>
                      )}
                      {lote.etapaActual === 'muestreo_leyes' && lote.ensayosLab && (
                        <div className="text-cyan-300">
                          <div>Au: {lote.ensayosLab.leyes.oroOzTM} oz/TM | Hum: {lote.ensayosLab.porcentajeHumedad}%</div>
                          <div className="text-[10px] text-slate-400">Recup Au: {lote.ensayosLab.recuperaciones.oroRecuperacionPorcentaje}%</div>
                        </div>
                      )}
                      {lote.etapaActual === 'negociacion' && (
                        <div className="text-gold-300">
                          <div>Spot Au: ${lote.negociacion?.spotPricesCongelados.oroUSDoz || 2742}</div>
                          <div className="text-[10px] text-slate-400">Maquila: ${lote.negociacion?.maquilaPorTMS || 95}/TMS</div>
                        </div>
                      )}
                      {lote.etapaActual === 'liquidado' && lote.liquidacion && (
                        <div className="text-emerald-300">
                          <div className="font-bold">${lote.liquidacion.montoNetoPagadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                          <div className="text-[10px] text-slate-400">{lote.liquidacion.banco} • {lote.liquidacion.nroOperacionBancaria}</div>
                        </div>
                      )}
                      {lote.etapaActual === 'en_origen' && (
                        <div className="text-amber-300">
                          {lote.leyesEstimadasOrigen ? (
                            <>
                              <div>Au: {lote.leyesEstimadasOrigen.oroValor} {lote.leyesEstimadasOrigen.oroUnidad} ({lote.leyesEstimadasOrigen.oroUnidad === 'oz/TM' ? `${lote.leyesEstimadasOrigen.oroEquivalenteGramos} g` : `${lote.leyesEstimadasOrigen.oroEquivalenteOz} oz`})</div>
                              <div className="text-[10px] text-slate-400">Ag: {lote.leyesEstimadasOrigen.plataOzTM} oz | Cu: {lote.leyesEstimadasOrigen.cobrePorcentaje}%</div>
                            </>
                          ) : (
                            <>
                              <div>Adelanto: ${lote.adelantoPactadoUSD.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-500 font-sans">Acopio en origen</div>
                            </>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {nextStage ? (
                          <button
                            onClick={() => openTransitionModal(lote)}
                            className="px-2.5 py-1 rounded bg-gold-500/10 hover:bg-gold-500 text-gold-400 hover:text-industrial-950 border border-gold-500/30 text-[11px] font-bold transition-all"
                          >
                            Avanzar a {nextStage.label}
                          </button>
                        ) : (
                          <button
                            onClick={() => openLiquidationSlip(lote)}
                            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-industrial-950 border border-emerald-500/30 text-[11px] font-bold transition-all"
                          >
                            Ver Liquidación
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
