import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Lote, StageId, MetalTickerItem, Molino, ToastMessage, OriginRegion, ClienteMinero } from '../types';
import { storageService } from '../services/storageService';
import { marketService } from '../services/marketService';
import { MOLINOS_DISPONIBLES, STAGES } from '../data/mockData';

interface LotesContextType {
  lotes: Lote[];
  clientes: ClienteMinero[];
  ticker: MetalTickerItem[];
  molinos: Molino[];
  toasts: ToastMessage[];
  addToast: (tipo: ToastMessage['tipo'], titulo: string, mensaje: string) => void;
  removeToast: (id: string) => void;
  
  // Modales Lotes
  transitionModalLote: Lote | null;
  openTransitionModal: (lote: Lote) => void;
  closeTransitionModal: () => void;
  
  liquidationSlipLote: Lote | null;
  openLiquidationSlip: (lote: Lote) => void;
  closeLiquidationSlip: () => void;
  
  isNewLoteModalOpen: boolean;
  setIsNewLoteModalOpen: (open: boolean) => void;

  // Modales Clientes
  selectedCliente: ClienteMinero | null;
  setSelectedCliente: (cliente: ClienteMinero | null) => void;
  isNewClienteModalOpen: boolean;
  setIsNewClienteModalOpen: (open: boolean) => void;
  
  // Acciones Lotes
  createLote: (data: Omit<Lote, 'id' | 'etapaActual' | 'fechaCreacion' | 'historialEtapas'>) => void;
  advanceLoteStage: (loteId: string, nextStage: StageId, stageData: Partial<Lote>, nota?: string) => void;
  updateLote: (lote: Lote) => void;
  
  // Acciones Clientes
  createCliente: (data: Omit<ClienteMinero, 'id' | 'fechaRegistro'>) => void;
  updateCliente: (cliente: ClienteMinero) => void;

  resetAllData: () => void;
  refreshMarketPrices: () => void;

  // Filtros y Vistas
  currentView: 'kanban' | 'table' | 'molinos' | 'clientes';
  setCurrentView: (view: 'kanban' | 'table' | 'molinos' | 'clientes') => void;
  filterOrigin: 'all' | OriginRegion;
  setFilterOrigin: (origin: 'all' | OriginRegion) => void;
  filterSearch: string;
  setFilterSearch: (search: string) => void;

  // KPIs Calculados
  kpis: {
    totalActivos: number;
    totalLiquidados: number;
    toneladasTotales: number;
    toneladasTransito: number;
    toneladasEnMolienda: number;
    distribucionOrigen: {
      cajamarca: number;
      ancash: number;
      piura: number;
    };
    montoLiquidadoUSD: number;
    montoLiquidadoPEN: number;
    adelantosPendientesUSD: number;
    totalClientes: number;
    clientesReinfoVigentes: number;
  };
}

const LotesContext = createContext<LotesContextType | undefined>(undefined);

export const LotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [clientes, setClientes] = useState<ClienteMinero[]>([]);
  const [ticker, setTicker] = useState<MetalTickerItem[]>([]);
  const [molinos] = useState<Molino[]>(MOLINOS_DISPONIBLES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Modales Lotes
  const [transitionModalLote, setTransitionModalLote] = useState<Lote | null>(null);
  const [liquidationSlipLote, setLiquidationSlipLote] = useState<Lote | null>(null);
  const [isNewLoteModalOpen, setIsNewLoteModalOpen] = useState(false);

  // Modales Clientes
  const [selectedCliente, setSelectedCliente] = useState<ClienteMinero | null>(null);
  const [isNewClienteModalOpen, setIsNewClienteModalOpen] = useState(false);

  // Vistas y Filtros
  const [currentView, setCurrentView] = useState<'kanban' | 'table' | 'molinos' | 'clientes'>('kanban');
  const [filterOrigin, setFilterOrigin] = useState<'all' | OriginRegion>('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Carga inicial
  useEffect(() => {
    const loadedLotes = storageService.loadLotes();
    setLotes(loadedLotes);

    const loadedClientes = storageService.loadClientes();
    setClientes(loadedClientes);

    // Suscripción al mercado de metales
    const unsubscribe = marketService.subscribe((prices) => {
      setTicker(prices);
    });

    return () => unsubscribe();
  }, []);

  const addToast = (tipo: ToastMessage['tipo'], titulo: string, mensaje: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = {
      id,
      tipo,
      titulo,
      mensaje,
      tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setToasts(prev => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openTransitionModal = (lote: Lote) => {
    setTransitionModalLote(lote);
  };

  const closeTransitionModal = () => {
    setTransitionModalLote(null);
  };

  const openLiquidationSlip = (lote: Lote) => {
    setLiquidationSlipLote(lote);
  };

  const closeLiquidationSlip = () => {
    setLiquidationSlipLote(null);
  };

  const createLote = (data: Omit<Lote, 'id' | 'etapaActual' | 'fechaCreacion' | 'historialEtapas'>) => {
    const created = storageService.createLote(data);
    setLotes(prev => [created, ...prev]);
    setIsNewLoteModalOpen(false);
    addToast('success', 'Lote Registrado en Origen', `Se creó ${created.codigoLote} (${created.origen.departamento} - ${created.pesoEstimadoTMH} TMH est.)`);
  };

  const advanceLoteStage = (loteId: string, nextStage: StageId, stageData: Partial<Lote>, nota?: string) => {
    const updated = storageService.advanceStage(loteId, nextStage, stageData, 'Supervisor Operativo', nota);
    if (updated) {
      setLotes(prev => prev.map(l => l.id === loteId ? updated : l));
      closeTransitionModal();
      
      const stageName = STAGES.find(s => s.id === nextStage)?.label || nextStage;
      addToast(
        nextStage === 'liquidado' ? 'success' : 'info',
        `Etapa Actualizada: ${stageName}`,
        `El lote ${updated.codigoLote} avanzó exitosamente a ${stageName}.`
      );
    }
  };

  const updateLote = (lote: Lote) => {
    const updated = storageService.updateLote(lote);
    setLotes(prev => prev.map(l => l.id === lote.id ? updated : l));
    addToast('info', 'Lote Actualizado', `Se guardaron los cambios del lote ${lote.codigoLote}.`);
  };

  const createCliente = (data: Omit<ClienteMinero, 'id' | 'fechaRegistro'>) => {
    const created = storageService.createCliente(data);
    setClientes(prev => [created, ...prev]);
    setIsNewClienteModalOpen(false);
    addToast('success', 'Cliente Registrado', `Se agregó al minero/empresa ${created.nombre} (${created.departamento}).`);
  };

  const updateCliente = (cliente: ClienteMinero) => {
    const updated = storageService.updateCliente(cliente);
    setClientes(prev => prev.map(c => c.id === cliente.id ? updated : c));
    setSelectedCliente(updated);
    addToast('info', 'Cliente Actualizado', `Se guardaron los datos de ${cliente.nombre}.`);
  };

  const resetAllData = () => {
    const freshLotes = storageService.resetToDefault();
    setLotes(freshLotes);
    const freshClientes = storageService.loadClientes();
    setClientes(freshClientes);
    addToast('warning', 'Sistema Restablecido', 'Se restablecieron los lotes y clientes con la data real operativa.');
  };

  const refreshMarketPrices = () => {
    marketService.forceRefresh();
    addToast('info', 'Mercado Actualizado', 'Cotizaciones COMEX/LME refrescadas en vivo.');
  };

  // KPIs
  const kpis = useMemo(() => {
    const activos = lotes.filter(l => l.etapaActual !== 'liquidado');
    const liquidados = lotes.filter(l => l.etapaActual === 'liquidado');

    const toneladasTotales = lotes.reduce((acc, l) => {
      const peso = l.balanza?.pesoNetoTMH || l.pesoEstimadoTMH || 0;
      return acc + peso;
    }, 0);

    const toneladasTransito = lotes
      .filter(l => l.etapaActual === 'transito_trujillo')
      .reduce((acc, l) => acc + (l.pesoEstimadoTMH || 0), 0);

    const toneladasEnMolienda = lotes
      .filter(l => l.etapaActual === 'en_molienda' || l.etapaActual === 'muestreo_leyes' || l.etapaActual === 'negociacion')
      .reduce((acc, l) => acc + (l.balanza?.pesoNetoTMH || l.pesoEstimadoTMH || 0), 0);

    const cajamarcaCount = lotes.filter(l => l.origen.departamento === 'Cajamarca').length;
    const ancashCount = lotes.filter(l => l.origen.departamento === 'Áncash').length;
    const piuraCount = lotes.filter(l => l.origen.departamento === 'Piura').length;

    const montoLiquidadoUSD = liquidados.reduce((acc, l) => acc + (l.liquidacion?.montoNetoPagadoUSD || 0), 0);
    const montoLiquidadoPEN = liquidados.reduce((acc, l) => acc + (l.liquidacion?.montoNetoPagadoPEN || 0), 0);
    
    const adelantosPendientesUSD = activos.reduce((acc, l) => acc + (l.adelantoPactadoUSD || 0), 0);

    const clientesReinfoVigentes = clientes.filter(c => c.esReinfo).length;

    return {
      totalActivos: activos.length,
      totalLiquidados: liquidados.length,
      toneladasTotales: Number(toneladasTotales.toFixed(1)),
      toneladasTransito: Number(toneladasTransito.toFixed(1)),
      toneladasEnMolienda: Number(toneladasEnMolienda.toFixed(1)),
      distribucionOrigen: {
        cajamarca: cajamarcaCount,
        ancash: ancashCount,
        piura: piuraCount,
      },
      montoLiquidadoUSD,
      montoLiquidadoPEN,
      adelantosPendientesUSD,
      totalClientes: clientes.length,
      clientesReinfoVigentes,
    };
  }, [lotes, clientes]);

  return (
    <LotesContext.Provider
      value={{
        lotes,
        clientes,
        ticker,
        molinos,
        toasts,
        addToast,
        removeToast,
        transitionModalLote,
        openTransitionModal,
        closeTransitionModal,
        liquidationSlipLote,
        openLiquidationSlip,
        closeLiquidationSlip,
        isNewLoteModalOpen,
        setIsNewLoteModalOpen,
        selectedCliente,
        setSelectedCliente,
        isNewClienteModalOpen,
        setIsNewClienteModalOpen,
        createLote,
        advanceLoteStage,
        updateLote,
        createCliente,
        updateCliente,
        resetAllData,
        refreshMarketPrices,
        currentView,
        setCurrentView,
        filterOrigin,
        setFilterOrigin,
        filterSearch,
        setFilterSearch,
        kpis,
      }}
    >
      {children}
    </LotesContext.Provider>
  );
};

export const useLotes = () => {
  const context = useContext(LotesContext);
  if (!context) {
    throw new Error('useLotes debe ser usado dentro de un LotesProvider');
  }
  return context;
};
