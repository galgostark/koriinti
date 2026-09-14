import React from 'react';
import { useLotes } from '../../context/LotesContext';

export const MillsStatus: React.FC = () => {
  const { molinos, lotes, openTransitionModal } = useLotes();

  return (
    <div className="space-y-4">
      {/* Header del módulo */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-display tracking-wider text-slate-100 flex items-center gap-2">
              <i className="fa-solid fa-gears text-gold-500"></i>
              CENTRO DE CONTROL: MOLINOS EN TRUJILLO
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Monitoreo y despacho operativo de lotes asignados a los diferentes molinos en Trujillo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {molinos.filter(m => m.estado === 'operando').length} Molinos en Operación
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Molinos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {molinos.map((molino) => {
          // Obtener lotes asignados a este molino
          const lotesAsignados = lotes.filter(
            l => l.balanza?.molinoAsignadoId === molino.id || l.balanza?.molinoNombre?.includes(molino.nombre)
          );

          const pesoTotalMolienda = lotesAsignados.reduce(
            (acc, l) => acc + (l.balanza?.pesoNetoTMH || 0),
            0
          );

          const porcentajeCarga = Math.min(
            100,
            Math.round((molino.cargaActualTM / molino.capacidadDiariaTM) * 100)
          );

          let statusBadge = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
          let statusText = 'Operando';
          if (molino.estado === 'disponible') {
            statusBadge = 'bg-blue-500/10 border-blue-500/30 text-blue-400';
            statusText = 'Disponible';
          } else if (molino.estado === 'mantenimiento') {
            statusBadge = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
            statusText = 'En Mantenimiento';
          }

          return (
            <div
              key={molino.id}
              className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 hover:border-gold-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-gold-400 font-bold uppercase tracking-wider">
                      Molino ID: {molino.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 mt-0.5">
                      {molino.nombre}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${statusBadge}`}>
                    {statusText}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                  <i className="fa-solid fa-location-dot text-slate-500 text-[11px]"></i>
                  {molino.ubicacion}
                </p>

                {/* Barra de Capacidad */}
                <div className="mt-4 bg-industrial-950 p-3 rounded-lg border border-industrial-800">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-400">Capacidad Ocupada</span>
                    <span className="text-slate-200 font-bold">{porcentajeCarga}%</span>
                  </div>
                  <div className="w-full bg-industrial-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        porcentajeCarga > 85 ? 'bg-rose-500' : porcentajeCarga > 60 ? 'bg-gold-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${porcentajeCarga}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-2">
                    <span>Carga: <strong className="text-slate-200">{molino.cargaActualTM} TM</strong></span>
                    <span>Máx: <strong className="text-slate-300">{molino.capacidadDiariaTM} TM/día</strong></span>
                  </div>
                </div>

                {/* Lotes actualmente asignados */}
                <div className="mt-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <i className="fa-solid fa-boxes-stacked text-[10px] text-gold-400"></i>
                    Lotes en Proceso ({lotesAsignados.length}):
                  </span>

                  {lotesAsignados.length === 0 ? (
                    <p className="text-xs text-slate-500 italic mt-1.5">Sin lotes activos en este molino.</p>
                  ) : (
                    <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {lotesAsignados.map(l => (
                        <div
                          key={l.id}
                          onClick={() => openTransitionModal(l)}
                          className="bg-industrial-950/80 border border-industrial-800 hover:border-gold-500/40 p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-mono font-bold text-gold-400">{l.codigoLote}</span>
                            <span className="text-[11px] text-slate-400 ml-2">({l.origen.departamento})</span>
                          </div>
                          <span className="font-mono text-slate-300 font-semibold">
                            {l.balanza?.pesoNetoTMH || l.pesoEstimadoTMH} TMH
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info contacto */}
              <div className="mt-4 pt-3 border-t border-industrial-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span className="truncate">Resp: {molino.contacto}</span>
                <span className="text-gold-400 font-bold shrink-0">{pesoTotalMolienda.toFixed(1)} TMH reg.</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
