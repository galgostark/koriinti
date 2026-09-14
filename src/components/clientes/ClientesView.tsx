import React, { useState } from 'react';
import { useLotes } from '../../context/LotesContext';
import { OriginRegion, ClienteMinero } from '../../types';

export const ClientesView: React.FC = () => {
  const { 
    clientes, 
    lotes, 
    setSelectedCliente, 
    setIsNewClienteModalOpen,
    setIsNewLoteModalOpen 
  } = useLotes();

  const [filterRegion, setFilterRegion] = useState<'all' | OriginRegion>('all');
  const [filterReinfo, setFilterReinfo] = useState<'all' | 'reinfo' | 'sin_reinfo'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtrar clientes
  const filteredClientes = clientes.filter((cli) => {
    if (filterRegion !== 'all' && cli.departamento !== filterRegion) {
      return false;
    }
    if (filterReinfo === 'reinfo' && !cli.esReinfo) return false;
    if (filterReinfo === 'sin_reinfo' && cli.esReinfo) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNombre = cli.nombre.toLowerCase().includes(q);
      const matchRuc = cli.rucO_Dni.includes(q);
      const matchLabor = cli.laborMinera.toLowerCase().includes(q);
      const matchProv = cli.provincia.toLowerCase().includes(q);
      const matchReinfo = cli.reinfoCodigo?.toLowerCase().includes(q);
      return matchNombre || matchRuc || matchLabor || matchProv || matchReinfo;
    }

    return true;
  });

  // Métricas agregadas
  const totalLotesCount = lotes.length;
  const totalTMHAll = lotes.reduce((acc, l) => acc + (l.balanza?.pesoNetoTMH || l.pesoEstimadoTMH || 0), 0);
  const totalUSDAll = lotes
    .filter(l => l.etapaActual === 'liquidado' && l.liquidacion)
    .reduce((acc, l) => acc + (l.liquidacion?.montoNetoPagadoUSD || 0), 0);

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo de Clientes */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400 flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-users-gear"></i>
            </span>
            <h2 className="text-lg font-bold font-display tracking-wider text-slate-100">
              DIRECTORIO DE CLIENTES Y LABORES MINERAS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Padrón comercial de mineros artesanales, concesiones y acopio en Cajamarca, Áncash y Piura.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewClienteModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-industrial-950 text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-gold-500/25 transition-all transform active:scale-95"
          >
            <i className="fa-solid fa-user-plus text-sm"></i>
            <span>Nuevo Minero / Cliente</span>
          </button>
        </div>
      </div>

      {/* KPIs del Directorio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-[11px] font-mono uppercase">
            <span>Total Mineros</span>
            <i className="fa-solid fa-id-badge text-gold-400 text-sm"></i>
          </div>
          <div className="text-2xl font-bold font-display text-slate-100 mt-2">
            {clientes.length} <span className="text-xs font-mono text-slate-400">registrados</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {clientes.filter(c => c.estado === 'activo').length} activos para acopio
          </p>
        </div>

        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-[11px] font-mono uppercase">
            <span>Formalización REINFO</span>
            <i className="fa-solid fa-certificate text-emerald-400 text-sm"></i>
          </div>
          <div className="text-2xl font-bold font-display text-emerald-400 mt-2">
            {clientes.filter(c => c.esReinfo).length} <span className="text-xs font-mono text-slate-400">con REINFO</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {Math.round((clientes.filter(c => c.esReinfo).length / (clientes.length || 1)) * 100)}% padrón formalizado
          </p>
        </div>

        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-[11px] font-mono uppercase">
            <span>Toneladas Entregadas</span>
            <i className="fa-solid fa-weight-scale text-blue-400 text-sm"></i>
          </div>
          <div className="text-2xl font-bold font-display text-blue-400 mt-2">
            {totalTMHAll.toFixed(1)} <span className="text-xs font-mono text-slate-400">TMH</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            En {totalLotesCount} lotes procesados en Trujillo
          </p>
        </div>

        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 text-[11px] font-mono uppercase">
            <span>Liquidado a Clientes</span>
            <i className="fa-solid fa-sack-dollar text-emerald-400 text-sm"></i>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            ${totalUSDAll.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Desembolsado vía transferencia bancaria
          </p>
        </div>
      </div>

      {/* Barra de Filtros Rápidos, Búsqueda y Switch de Vista */}
      <div className="bg-industrial-900/70 border border-industrial-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filtros de Región */}
        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 mr-2 shrink-0">Zona:</span>
          {(['all', 'Cajamarca', 'Áncash', 'Piura'] as Array<'all' | OriginRegion>).map((reg) => (
            <button
              key={reg}
              onClick={() => setFilterRegion(reg)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                filterRegion === reg
                  ? 'bg-gold-500 text-industrial-950 font-bold'
                  : 'bg-industrial-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {reg === 'all' ? 'Todas las Zonas' : reg}
            </button>
          ))}

          <span className="text-slate-600 mx-2 hidden sm:inline">|</span>

          {/* Filtro REINFO */}
          <button
            onClick={() => setFilterReinfo(filterReinfo === 'reinfo' ? 'all' : 'reinfo')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
              filterReinfo === 'reinfo'
                ? 'bg-emerald-500 text-industrial-950 font-bold'
                : 'bg-industrial-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Solo REINFO
          </button>
        </div>

        {/* Buscador y Switch de Vista */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500 text-xs"></i>
            <input
              type="text"
              placeholder="Buscar minero, RUC, labor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-industrial-950 border border-industrial-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500 font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="flex items-center bg-industrial-950 border border-industrial-800 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              title="Vista en tarjetas"
              className={`p-1.5 rounded text-xs ${
                viewMode === 'grid' ? 'bg-industrial-800 text-gold-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <i className="fa-solid fa-grip"></i>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Vista en tabla"
              className={`p-1.5 rounded text-xs ${
                viewMode === 'table' ? 'bg-industrial-800 text-gold-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <i className="fa-solid fa-table-list"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Listado de Clientes: Modo Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClientes.length === 0 ? (
            <div className="col-span-full bg-industrial-900 border border-industrial-800 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
              No se encontraron clientes con los filtros seleccionados.
            </div>
          ) : (
            filteredClientes.map((cliente) => {
              const lotesCliente = lotes.filter(
                l => l.cliente.rucO_Dni === cliente.rucO_Dni || l.cliente.nombre.toLowerCase() === cliente.nombre.toLowerCase()
              );
              const tmhTotal = lotesCliente.reduce((sum, l) => sum + (l.balanza?.pesoNetoTMH || l.pesoEstimadoTMH || 0), 0);

              let originBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
              if (cliente.departamento === 'Áncash') {
                originBadge = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
              } else if (cliente.departamento === 'Piura') {
                originBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              }

              return (
                <div
                  key={cliente.id}
                  className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 hover:border-gold-500/40 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    {/* Header Tarjeta */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${originBadge}`}>
                          {cliente.departamento}
                        </span>
                        <h3 className="font-bold text-sm text-slate-100 mt-1.5 line-clamp-1 group-hover:text-gold-400 transition-colors" title={cliente.nombre}>
                          {cliente.nombre}
                        </h3>
                        <p className="text-[11px] font-mono text-gold-400 font-semibold mt-0.5 flex items-center gap-1">
                          <i className="fa-solid fa-user-tie text-[10px]"></i>
                          <span className="truncate">{cliente.personaEncargada}</span>
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        cliente.estado === 'activo'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {cliente.estado}
                      </span>
                    </div>

                    {/* RUC y REINFO */}
                    <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>RUC: <strong className="text-slate-200">{cliente.rucO_Dni}</strong></span>
                      {cliente.esReinfo ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <i className="fa-solid fa-circle-check text-[10px]"></i>
                          REINFO
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Sin REINFO</span>
                      )}
                    </div>

                    {/* Labor y Ubicación con GPS */}
                    <div className="mt-2.5 bg-industrial-950 p-2.5 rounded-lg border border-industrial-800 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-slate-300 truncate">
                        <i className="fa-solid fa-mountain text-gold-500 text-[10px]"></i>
                        <span className="truncate font-semibold">{cliente.laborMinera}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="truncate">{cliente.provincia} {cliente.distrito ? `• ${cliente.distrito}` : ''}</span>
                        <a
                          href={`https://www.google.com/maps?q=${encodeURIComponent(cliente.coordenadasGps)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir ubicación en Google Maps"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 shrink-0 text-[10px]"
                        >
                          <i className="fa-solid fa-map-location-dot"></i>
                          <span>{cliente.coordenadasGps}</span>
                        </a>
                      </div>
                    </div>

                    {/* Entregas y Banco */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono border-t border-industrial-800 pt-2 text-slate-400">
                      <div>
                        <span className="text-[10px] block text-slate-500">Lotes Entregados</span>
                        <strong className="text-slate-200">{lotesCliente.length} lotes ({tmhTotal.toFixed(1)} TM)</strong>
                      </div>
                      <div>
                        <span className="text-[10px] block text-slate-500">Banco Desembolso</span>
                        <strong className="text-slate-200">{cliente.bancoPreferido || 'No reg.'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 pt-3 border-t border-industrial-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCliente(cliente)}
                      className="px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <i className="fa-solid fa-id-card text-[11px] text-gold-400"></i>
                      <span>Ver Detalles</span>
                    </button>

                    <button
                      onClick={() => setIsNewLoteModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500 text-gold-400 hover:text-industrial-950 border border-gold-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-all active:scale-95"
                    >
                      <i className="fa-solid fa-plus text-[10px]"></i>
                      <span>Lote</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Listado de Clientes: Modo Tabla */}
      {viewMode === 'table' && (
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-industrial-950 border-b border-industrial-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Cliente / Razón Social</th>
                  <th className="p-3.5">RUC / DNI</th>
                  <th className="p-3.5">Zona / Labor Minera</th>
                  <th className="p-3.5">REINFO</th>
                  <th className="p-3.5">Historial Lotes</th>
                  <th className="p-3.5">Banco de Pago</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800 text-slate-200">
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No se encontraron clientes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => {
                    const lotesCliente = lotes.filter(
                      l => l.cliente.rucO_Dni === cliente.rucO_Dni || l.cliente.nombre.toLowerCase() === cliente.nombre.toLowerCase()
                    );
                    const tmhTotal = lotesCliente.reduce((sum, l) => sum + (l.balanza?.pesoNetoTMH || l.pesoEstimadoTMH || 0), 0);

                    let originBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                    if (cliente.departamento === 'Áncash') {
                      originBadge = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                    } else if (cliente.departamento === 'Piura') {
                      originBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                    }

                    return (
                      <tr key={cliente.id} className="hover:bg-industrial-850/50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-100 hover:text-gold-400 cursor-pointer" onClick={() => setSelectedCliente(cliente)}>
                            {cliente.nombre}
                          </div>
                          <div className="text-[11px] text-gold-400 font-semibold flex items-center gap-1 mt-0.5">
                            <i className="fa-solid fa-user-tie text-[10px]"></i>
                            <span>{cliente.personaEncargada}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">{cliente.telefono}</div>
                        </td>
                        <td className="p-3.5 font-bold text-gold-400">
                          {cliente.rucO_Dni}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${originBadge}`}>
                              {cliente.departamento}
                            </span>
                            <span className="text-slate-300">{cliente.provincia}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                            {cliente.laborMinera}
                          </div>
                          <div className="mt-1">
                            <a
                              href={`https://www.google.com/maps?q=${encodeURIComponent(cliente.coordenadasGps)}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Abrir ubicación en Google Maps"
                              className="text-cyan-400 hover:text-cyan-300 text-[10px] inline-flex items-center gap-1 underline"
                            >
                              <i className="fa-solid fa-location-dot text-[9px]"></i>
                              {cliente.coordenadasGps}
                            </a>
                          </div>
                        </td>
                        <td className="p-3.5">
                          {cliente.esReinfo ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              REINFO Vigente
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">No registrado</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="text-slate-100 font-bold">{lotesCliente.length} lotes</span>
                          <div className="text-[10px] text-slate-400">{tmhTotal.toFixed(1)} TMH entregadas</div>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {cliente.bancoPreferido || 'No reg.'}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedCliente(cliente)}
                            className="px-3 py-1 rounded bg-industrial-800 hover:bg-gold-500 text-slate-200 hover:text-industrial-950 font-bold text-xs transition-all"
                          >
                            Detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
