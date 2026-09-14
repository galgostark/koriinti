import { MetalTickerItem } from '../types';
import { INITIAL_TICKER } from '../data/mockData';

// Servicio de Precios Internacionales de Metales
// NOTA ARQUITECTURA: En producción, este servicio se conecta a tu backend (Node.js/Python)
// que consulta APIs como Metals-API, GoldAPI.io o Bloomberg/LME WebSocket.
// Endpoint sugerido: GET /api/v1/market/metals-spot

class MarketService {
  private currentPrices: MetalTickerItem[] = [...INITIAL_TICKER];
  private listeners: Array<(prices: MetalTickerItem[]) => void> = [];
  private intervalId: any = null;

  constructor() {
    this.startLiveSimulation();
  }

  public getPrices(): MetalTickerItem[] {
    return [...this.currentPrices];
  }

  public subscribe(listener: (prices: MetalTickerItem[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentPrices);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Simulación de fluctuación de mercado en tiempo real (COMEX / LME)
  private startLiveSimulation() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      // Modifica aleatoriamente un metal para dar dinamismo industrial realista
      const indexToMutate = Math.floor(Math.random() * this.currentPrices.length);
      const item = { ...this.currentPrices[indexToMutate] };

      let delta = 0;
      if (item.simbolo === 'AU') {
        // Oro oscila entre +/- $0.80 a $2.50
        delta = (Math.random() - 0.49) * 2.2;
      } else if (item.simbolo === 'AG') {
        // Plata oscila +/- $0.05 a $0.15
        delta = (Math.random() - 0.49) * 0.12;
      } else if (item.simbolo === 'CU') {
        // Cobre oscila +/- $0.005 a $0.02
        delta = (Math.random() - 0.49) * 0.015;
      } else if (item.simbolo === 'USDPEN') {
        // Tipo de cambio oscila +/- S/ 0.002
        delta = (Math.random() - 0.5) * 0.003;
      }

      const newPrice = Math.max(0.1, Number((item.precio + delta).toFixed(item.simbolo === 'CU' || item.simbolo === 'USDPEN' ? 3 : 2)));
      const trend = delta >= 0 ? 'up' : 'down';
      
      item.precio = newPrice;
      item.tendencia = trend;
      item.variacion24h = Number((item.variacion24h + (delta > 0 ? 0.02 : -0.02)).toFixed(2));
      item.ultimaActualizacion = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      this.currentPrices[indexToMutate] = item;
      this.notifyListeners();
    }, 7000); // Cada 7 segundos
  }

  private notifyListeners() {
    const copy = [...this.currentPrices];
    this.listeners.forEach(cb => cb(copy));
  }

  public forceRefresh() {
    this.currentPrices = this.currentPrices.map(item => {
      const delta = (Math.random() - 0.48) * (item.simbolo === 'AU' ? 3 : 0.2);
      return {
        ...item,
        precio: Number((item.precio + delta).toFixed(2)),
        tendencia: delta >= 0 ? 'up' : 'down',
        ultimaActualizacion: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    });
    this.notifyListeners();
  }
}

export const marketService = new MarketService();
