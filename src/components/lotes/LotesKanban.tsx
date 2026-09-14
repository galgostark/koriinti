import React from 'react';
import { useLotes } from '../../context/LotesContext';
import { STAGES } from '../../data/mockData';
import { LoteCard } from './LoteCard';

export const LotesKanban: React.FC = () => {
  const { lotes, filterOrigin, filterSearch, setIsNewLoteModalOpen } = useLotes();

  // Filtrado de lotes
  const filteredLotes = lotes.filter((lote) => {
    // Filtro origen
    if (filterOrigin !== 'all' && lote.origen.departamento !== filterOrigin) {
      return false;
    }

    // Filtro búsqueda
    if (filterSearch.trim()) {
      const search = filterSearch.toLowerCase();
      const matchCodigo = lote.codigoLote.toLowerCase().includes(search);
      const matchCliente = lote.cliente.nombre.toLowerCase().includes(search);
      const matchRuc = lote.cliente.rucO_Dni.toLowerCase().includes(search);
      const matchLabor = lote.origen.laborMinera.toLowerCase().includes(search);
      const matchPlaca = lote.transporte?.placaVolquete?.toLowerCase().includes(search);
      const matchMolino = lote.balanza?.molinoNombre?.toLowerCase().includes(search);
      return matchCodigo || matchCliente || matchRuc || matchLabor || matchPlaca || matchMolino;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Tablero Kanban Scrollable Horizontal */}
      <div className="overflow-x-auto pb-6 pt-1">
        <div className="flex gap-4 min-w-[1550px]">
          {STAGES.map((stage) => {
            const stageLotes = filteredLotes.filter(l => l.etapaActual === stage.id);
            const totalTMH = stageLotes.reduce(
              (sum, l) => sum + (l.balanza?.pesoNetoTMH || l.pesoEstimadoTMH || 0),
              0
            );

            return (
              <div
                key={stage.id}
                className="w-[280px] shrink-0 bg-industrial-950/90 border border-industrial-800 rounded-2xl flex flex-col max-h-[calc(100vh-270px)]"
              >
                {/* Cabecera de la columna */}
                <div className="p-3.5 border-b border-industrial-800 bg-industrial-900/90 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-industrial-800 border border-industrial-700 font-mono text-xs font-bold text-slate-300 flex items-center justify-center">
                        {stage.stepNumber}
                      </span>
                      <h3 className="font-bold text-xs tracking-wide text-slate-100 flex items-center gap-1.5 font-display">
                        <i className={`${stage.icon} ${stage.color} text-xs`}></i>
                        {stage.label}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-industrial-800 text-slate-300 border border-industrial-700">
                      {stageLotes.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                    <span className="truncate max-w-[170px]" title={stage.description}>
                      {stage.description}
                    </span>
                    <span className="text-gold-400 font-bold shrink-0">
                      {totalTMH.toFixed(1)} TM
                    </span>
                  </div>
                </div>

                {/* Lista de tarjetas */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {stageLotes.length === 0 ? (
                    <div className="h-32 border border-dashed border-industrial-800 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                      <i className="fa-regular fa-folder-open text-slate-600 text-xl mb-1.5"></i>
                      <p className="text-[11px] text-slate-500 font-mono">Sin lotes en esta etapa</p>
                      {stage.id === 'en_origen' && (
                        <button
                          onClick={() => setIsNewLoteModalOpen(true)}
                          className="mt-2 text-[10px] text-gold-400 hover:text-gold-300 underline font-mono"
                        >
                          + Crear Lote
                        </button>
                      )}
                    </div>
                  ) : (
                    stageLotes.map((lote) => (
                      <LoteCard key={lote.id} lote={lote} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
