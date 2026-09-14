import React from 'react';
import { useLotes } from '../../context/LotesContext';
import { OriginRegion } from '../../types';

export const KpiCards: React.FC = () => {
  const { kpis, filterOrigin, setFilterOrigin, filterSearch, setFilterSearch } = useLotes();

  const totalOrigins = (kpis.distribucionOrigen.cajamarca + kpis.distribucionOrigen.ancash + kpis.distribucionOrigen.piura) || 1;
  const percCaj = Math.round((kpis.distribucionOrigen.cajamarca / totalOrigins) * 100);
  const percAnc = Math.round((kpis.distribucionOrigen.ancash / totalOrigins) * 100);
  const percPiu = Math.round((kpis.distribucionOrigen.piura / totalOrigins) * 100);

  return (
    <div className="space-y-4">
      {/* 4 Cards de KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lotes Activos */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm hover:border-gold-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Lotes en Operación
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 flex items-center justify-center text-sm border border-gold-500/20">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-slate-100">
              {kpis.totalActivos}
            </span>
            <span className="text-xs text-gold-400 font-medium">activos</span>
            <span className="text-xs text-slate-500 font-mono ml-auto">
              {kpis.totalLiquidados} liquidados
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
            Flujo en 5 etapas antes de cierre
          </p>
        </div>

        {/* Card 2: Toneladas Totales y Tránsito */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Volumen Mineral (TM)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm border border-blue-500/20">
              <i className="fa-solid fa-weight-scale"></i>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-slate-100">
              {kpis.toneladasTotales}
            </span>
            <span className="text-xs text-blue-400 font-medium">TMH Total</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 border-t border-industrial-800 pt-1.5 font-mono">
            <span>Tránsito: <strong className="text-slate-200">{kpis.toneladasTransito} TM</strong></span>
            <span>Molienda: <strong className="text-purple-300">{kpis.toneladasEnMolienda} TM</strong></span>
          </div>
        </div>

        {/* Card 3: Distribución por Origen */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Zonas de Acopio
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm border border-amber-500/20">
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Cajamarca: {kpis.distribucionOrigen.cajamarca}
              </span>
              <span className="text-slate-400">{percCaj}%</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Áncash: {kpis.distribucionOrigen.ancash}
              </span>
              <span className="text-slate-400">{percAnc}%</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Piura: {kpis.distribucionOrigen.piura}
              </span>
              <span className="text-slate-400">{percPiu}%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Liquidaciones y Capital */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Liquidado Acumulado
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/20">
              <i className="fa-solid fa-receipt"></i>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-bold text-emerald-400">
              ${kpis.montoLiquidadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              S/ {kpis.montoLiquidadoPEN.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-industrial-800 pt-1.5 font-mono">
            <span>Adelantos en Origen:</span>
            <span className="text-gold-400 font-bold">${kpis.adelantosPendientesUSD.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Barra de Filtros Rápidos y Búsqueda */}
      <div className="bg-industrial-900/60 border border-industrial-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filtros por Origen */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 mr-2 flex items-center gap-1.5 shrink-0">
            <i className="fa-solid fa-filter text-[10px]"></i>
            Origen:
          </span>
          {(['all', 'Cajamarca', 'Áncash', 'Piura'] as Array<'all' | OriginRegion>).map((orig) => (
            <button
              key={orig}
              onClick={() => setFilterOrigin(orig)}
              className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-all shrink-0 ${
                filterOrigin === orig
                  ? 'bg-gold-500 text-industrial-950 font-bold shadow'
                  : 'bg-industrial-800/80 text-slate-400 hover:text-slate-200 hover:bg-industrial-700'
              }`}
            >
              {orig === 'all' ? 'Todos los Orígenes' : orig}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500 text-xs"></i>
          <input
            type="text"
            placeholder="Buscar por lote, cliente, RUC..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full bg-industrial-950 border border-industrial-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/80 transition-colors font-mono"
          />
          {filterSearch && (
            <button
              onClick={() => setFilterSearch('')}
              className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
