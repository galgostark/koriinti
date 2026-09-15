import { Lote, StageId, ClienteMinero } from '../types';
import { INITIAL_LOTES, INITIAL_CLIENTES, STAGES } from '../data/mockData';

const STORAGE_KEY = 'koriinti_lotes_real_v2';
const CLIENTES_STORAGE_KEY = 'koriinti_clientes_real_v2';

// Servicio de Persistencia y Comunicación Backend
// NOTA ARQUITECTURA:
// En producción, este servicio se conecta a:
// - Node.js (Express / Fastify) o Python (FastAPI)
// - Supabase / PostgreSQL con Row Level Security (RLS)
//
// Métodos REST equivalentes:
// GET    /api/v1/lotes             -> getLotes()
// POST   /api/v1/lotes             -> createLote()
// PUT    /api/v1/lotes/:id/etapa   -> advanceStage()
// PUT    /api/v1/lotes/:id         -> updateLote()
// GET    /api/v1/clientes          -> getClientes()
// POST   /api/v1/clientes          -> createCliente()
// PUT    /api/v1/clientes/:id      -> updateCliente()

class StorageService {
  // --- CLIENTES ---
  public loadClientes(): ClienteMinero[] {
    try {
      const data = localStorage.getItem(CLIENTES_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading clientes from localStorage', e);
    }
    this.saveClientes(INITIAL_CLIENTES);
    return INITIAL_CLIENTES;
  }

  public saveClientes(clientes: ClienteMinero[]): void {
    try {
      localStorage.setItem(CLIENTES_STORAGE_KEY, JSON.stringify(clientes));
    } catch (e) {
      console.error('Error writing clientes to localStorage', e);
    }
  }

  public getClienteById(id: string): ClienteMinero | undefined {
    const clientes = this.loadClientes();
    return clientes.find(c => c.id === id);
  }

  public createCliente(newClienteData: Omit<ClienteMinero, 'id' | 'fechaRegistro'>): ClienteMinero {
    const clientes = this.loadClientes();
    const id = `cli-${Date.now()}`;
    const timestamp = new Date().toISOString().slice(0, 10);

    const fullCliente: ClienteMinero = {
      ...newClienteData,
      id,
      fechaRegistro: timestamp,
    };

    const updated = [fullCliente, ...clientes];
    this.saveClientes(updated);
    return fullCliente;
  }

  public updateCliente(updatedCliente: ClienteMinero): ClienteMinero {
    const clientes = this.loadClientes();
    const index = clientes.findIndex(c => c.id === updatedCliente.id);
    if (index !== -1) {
      clientes[index] = updatedCliente;
      this.saveClientes(clientes);
    }
    return updatedCliente;
  }

  // --- LOTES ---
  public loadLotes(): Lote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using initial mock data', e);
    }
    this.saveLotes(INITIAL_LOTES);
    return INITIAL_LOTES;
  }

  public saveLotes(lotes: Lote[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lotes));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  }

  public getLoteById(id: string): Lote | undefined {
    const lotes = this.loadLotes();
    return lotes.find(l => l.id === id);
  }

  public createLote(newLoteData: Omit<Lote, 'id' | 'etapaActual' | 'fechaCreacion' | 'historialEtapas'>): Lote {
    const lotes = this.loadLotes();
    const id = `lote-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const fullLote: Lote = {
      ...newLoteData,
      id,
      etapaActual: 'en_origen',
      fechaCreacion: timestamp,
      historialEtapas: [
        {
          etapa: 'en_origen',
          fecha: timestamp,
          usuario: 'Operador de Acopio',
          nota: `Lote registrado en ${newLoteData.origen.departamento} (${newLoteData.origen.provincia}).`,
        },
      ],
    };

    const updated = [fullLote, ...lotes];
    this.saveLotes(updated);
    return fullLote;
  }

  public updateLote(updatedLote: Lote): Lote {
    const lotes = this.loadLotes();
    const index = lotes.findIndex(l => l.id === updatedLote.id);
    if (index !== -1) {
      lotes[index] = updatedLote;
      this.saveLotes(lotes);
    }
    return updatedLote;
  }

  public advanceStage(
    loteId: string,
    nextStage: StageId,
    stageData: Partial<Lote>,
    usuario = 'Supervisor Operativo',
    nota?: string
  ): Lote | null {
    const lotes = this.loadLotes();
    const index = lotes.findIndex(l => l.id === loteId);
    if (index === -1) return null;

    const currentLote = lotes[index];
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const updatedLote: Lote = {
      ...currentLote,
      ...stageData,
      etapaActual: nextStage,
      historialEtapas: [
        ...currentLote.historialEtapas,
        {
          etapa: nextStage,
          fecha: timestamp,
          usuario,
          nota: nota || `Transición a ${STAGES.find(s => s.id === nextStage)?.label || nextStage}`,
        },
      ],
    };

    lotes[index] = updatedLote;
    this.saveLotes(lotes);
    return updatedLote;
  }

  public resetToDefault(): Lote[] {
    this.saveLotes(INITIAL_LOTES);
    this.saveClientes(INITIAL_CLIENTES);
    return INITIAL_LOTES;
  }
}

export const storageService = new StorageService();
