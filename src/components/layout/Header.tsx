import React from 'react';
import { useLotes } from '../../context/LotesContext';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    setIsNewLoteModalOpen, 
    resetAllData 
  } = useLotes();

  return (
    <header className="bg-industrial-950/90 border-b border-industrial-800 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo y Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-amber-700 flex items-center justify-center text-industrial-950 shadow-lg shadow-gold-500/20 font-bold">
              <i className="fa-solid fa-gem text-lg"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl tracking-wider text-slate-100">
                  KORI INTI<span className="text-gold-500">.SGO</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-industrial-800 text-gold-400 border border-gold-500/30">
                  PERÚ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Compra y Beneficio de Minerales | Cajamarca • Áncash • Piura → Molinos Trujillo
              </p>
            </div>
          </div>

          {/* Vistas Navegación */}
          <nav className="flex items-center bg-industrial-900 border border-industrial-800 p-1 rounded-lg">
            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'kanban'
                  ? 'bg-gold-500 text-industrial-950 font-bold shadow-md shadow-gold-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-industrial-800/60'
              }`}
            >
              <i className="fa-solid fa-table-columns"></i>
              <span className="hidden md:inline">Flujo Kanban</span>
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'table'
                  ? 'bg-gold-500 text-industrial-950 font-bold shadow-md shadow-gold-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-industrial-800/60'
              }`}
            >
              <i className="fa-solid fa-list-check"></i>
              <span className="hidden md:inline">Tabla de Lotes</span>
            </button>
            <button
              onClick={() => setCurrentView('molinos')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'molinos'
                  ? 'bg-gold-500 text-industrial-950 font-bold shadow-md shadow-gold-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-industrial-800/60'
              }`}
            >
              <i className="fa-solid fa-gears"></i>
              <span className="hidden md:inline">Molinos Trujillo</span>
            </button>
            <button
              onClick={() => setCurrentView('clientes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'clientes'
                  ? 'bg-gold-500 text-industrial-950 font-bold shadow-md shadow-gold-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-industrial-800/60'
              }`}
            >
              <i className="fa-solid fa-users"></i>
              <span className="hidden md:inline">Padrón Clientes</span>
            </button>
          </nav>

          {/* Botones de Acción */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewLoteModalOpen(true)}
              className="bg-gold-500 hover:bg-gold-400 text-industrial-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-gold-500/25 transition-all transform active:scale-95"
            >
              <i className="fa-solid fa-plus text-sm"></i>
              <span className="hidden sm:inline">Nuevo Lote en Origen</span>
              <span className="sm:hidden">Nuevo</span>
            </button>

            <button
              onClick={resetAllData}
              title="Restablecer datos de prueba"
              className="p-2 text-slate-500 hover:text-slate-300 hover:bg-industrial-800 rounded-lg text-xs transition-colors"
            >
              <i className="fa-solid fa-arrow-rotate-left"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
