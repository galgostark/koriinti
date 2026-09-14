import React from 'react';
import { useLotes } from '../../context/LotesContext';

export const MarketTicker: React.FC = () => {
  const { ticker, refreshMarketPrices } = useLotes();

  return (
    <div className="bg-industrial-900 border-b border-industrial-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Indicador de mercado en vivo */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="font-display font-bold text-slate-300 tracking-wider uppercase text-[11px] flex items-center gap-1.5">
          <i className="fa-solid fa-chart-line text-gold-500"></i>
          COMEX / LME LIVE SPOT
        </span>
        <span className="text-[10px] text-slate-500 hidden sm:inline">| Trujillo Hub Feeder</span>
      </div>

      {/* Precios de metales */}
      <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar py-0.5">
        {ticker.map((item) => {
          const isUp = item.tendencia === 'up';
          const isNeutral = item.tendencia === 'neutral';
          const badgeClass = isUp 
            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' 
            : isNeutral 
              ? 'text-slate-400 bg-slate-800/60 border-slate-700' 
              : 'text-rose-400 bg-rose-950/60 border-rose-800/60';
          const arrowIcon = isUp 
            ? 'fa-solid fa-arrow-trend-up' 
            : isNeutral 
              ? 'fa-solid fa-minus' 
              : 'fa-solid fa-arrow-trend-down';

          let metalIcon = 'fa-solid fa-circle';
          let metalColor = 'text-slate-400';
          if (item.simbolo === 'AU') {
            metalIcon = 'fa-solid fa-coins';
            metalColor = 'text-gold-400';
          } else if (item.simbolo === 'AG') {
            metalIcon = 'fa-solid fa-gem';
            metalColor = 'text-silver-300';
          } else if (item.simbolo === 'CU') {
            metalIcon = 'fa-solid fa-cubes-stacked';
            metalColor = 'text-copper-500';
          } else if (item.simbolo === 'USDPEN') {
            metalIcon = 'fa-solid fa-money-bill-transfer';
            metalColor = 'text-emerald-400';
          }

          return (
            <div key={item.simbolo} className="flex items-center gap-2 shrink-0">
              <span className={`text-[11px] ${metalColor} flex items-center gap-1 font-semibold`}>
                <i className={`${metalIcon} text-[10px]`}></i>
                {item.simbolo}:
              </span>
              <span className="font-mono font-bold text-slate-100 tracking-tight text-sm">
                ${item.precio.toLocaleString('en-US', { minimumFractionDigits: item.simbolo === 'CU' ? 3 : 2 })}
              </span>
              <span className="text-[10px] text-slate-400">{item.unidad}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border flex items-center gap-1 ${badgeClass}`}>
                <i className={`${arrowIcon} text-[9px]`}></i>
                {item.variacion24h > 0 ? `+${item.variacion24h}` : item.variacion24h}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Botón de recarga manual */}
      <div className="flex items-center gap-2">
        <button
          onClick={refreshMarketPrices}
          title="Refrescar cotizaciones spot"
          className="text-slate-400 hover:text-gold-400 transition-colors p-1 rounded hover:bg-industrial-800 text-xs flex items-center gap-1"
        >
          <i className="fa-solid fa-rotate text-[11px]"></i>
          <span className="hidden lg:inline text-[10px] text-slate-400 font-mono">Sync</span>
        </button>
      </div>
    </div>
  );
};
