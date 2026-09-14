import React from 'react';
import { LotesProvider, useLotes } from './context/LotesContext';
import { MarketTicker } from './components/layout/MarketTicker';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/layout/ToastContainer';
import { KpiCards } from './components/dashboard/KpiCards';
import { LotesKanban } from './components/lotes/LotesKanban';
import { LotesTable } from './components/lotes/LotesTable';
import { MillsStatus } from './components/dashboard/MillsStatus';
import { ClientesView } from './components/clientes/ClientesView';
import { StageTransitionModal } from './components/lotes/StageTransitionModal';
import { NewLoteModal } from './components/lotes/NewLoteModal';
import { NewClienteModal } from './components/clientes/NewClienteModal';
import { ClienteDetailModal } from './components/clientes/ClienteDetailModal';
import { LiquidationSlipModal } from './components/settlement/LiquidationSlipModal';

const AppContent: React.FC = () => {
  const { currentView } = useLotes();

  return (
    <div className="min-h-screen flex flex-col bg-industrial-950 text-slate-100 antialiased selection:bg-gold-500 selection:text-black">
      {/* 1. Ticker de Mercado en Vivo (Constante en cabecera) */}
      <MarketTicker />

      {/* 2. Barra de Navegación Industrial */}
      <Header />

      {/* 3. Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPIs y Filtros */}
        <KpiCards />

        {/* Vista dinámica según selección */}
        {currentView === 'kanban' && <LotesKanban />}
        {currentView === 'table' && <LotesTable />}
        {currentView === 'molinos' && <MillsStatus />}
        {currentView === 'clientes' && <ClientesView />}
      </main>

      {/* 4. Footer Industrial & Conexiones Backend */}
      <footer className="bg-industrial-900/60 border-t border-industrial-800 text-xs text-slate-500 py-4 px-4 sm:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Kori Inti ERP SGO v2.4 • Red de Acopio: Cajamarca | Áncash | Piura → Molinos Trujillo</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Arquitectura: React 19 + TypeScript + Tailwind CSS | Ready for Node.js / FastAPI / Supabase PostgreSQL
          </div>
        </div>
      </footer>

      {/* Modales y Notificaciones */}
      <StageTransitionModal />
      <NewLoteModal />
      <NewClienteModal />
      <ClienteDetailModal />
      <LiquidationSlipModal />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LotesProvider>
      <AppContent />
    </LotesProvider>
  );
};

export default App;
