import React, { useState } from 'react';
import { useLotes } from '../../context/LotesContext';
import { STAGES } from '../../data/mockData';

export const ClienteDetailModal: React.FC = () => {
  const { 
    selectedCliente: cliente, 
    setSelectedCliente, 
    lotes, 
    openTransitionModal,
    setIsNewLoteModalOpen,
    updateCliente
  } = useLotes();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    personaEncargada: '',
    telefono: '',
    email: '',
    laborMinera: '',
    coordenadasGps: '',
    bancoPreferido: 'BCP' as any,
    cuentaBancaria: '',
    cci: '',
    notas: '',
    estado: 'activo' as any,
  });

  if (!cliente) return null;

  // Lotes asociados a este cliente (por nombre o RUC)
  const lotesDelCliente = lotes.filter(
    l => l.cliente.rucO_Dni === cliente.rucO_Dni || l.cliente.nombre.toLowerCase() === cliente.nombre.toLowerCase()
  );

  const totalTMH = lotesDelCliente.reduce(
    (sum, l) => sum + (l.balanza?.pesoNetoTMH || l.pesoEstimadoTMH || 0),
    0
  );

  const totalLiquidadoUSD = lotesDelCliente
    .filter(l => l.etapaActual === 'liquidado' && l.liquidacion)
    .reduce((sum, l) => sum + (l.liquidacion?.montoNetoPagadoUSD || 0), 0);

  const adelantosPendientes = lotesDelCliente
    .filter(l => l.etapaActual !== 'liquidado')
    .reduce((sum, l) => sum + (l.adelantoPactadoUSD || 0), 0);

  const startEdit = () => {
    setEditForm({
      personaEncargada: cliente.personaEncargada || '',
      telefono: cliente.telefono,
      email: cliente.email || '',
      laborMinera: cliente.laborMinera,
      coordenadasGps: cliente.coordenadasGps || '',
      bancoPreferido: cliente.bancoPreferido || 'BCP',
      cuentaBancaria: cliente.cuentaBancaria || '',
      cci: cliente.cci || '',
      notas: cliente.notas || '',
      estado: cliente.estado,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCliente({
      ...cliente,
      personaEncargada: editForm.personaEncargada,
      telefono: editForm.telefono,
      email: editForm.email,
      laborMinera: editForm.laborMinera,
      coordenadasGps: editForm.coordenadasGps,
      bancoPreferido: editForm.bancoPreferido,
      cuentaBancaria: editForm.cuentaBancaria,
      cci: editForm.cci,
      notas: editForm.notas,
      estado: editForm.estado,
    });
    setIsEditing(false);
  };

  let originBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  if (cliente.departamento === 'Áncash') {
    originBadge = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  } else if (cliente.departamento === 'Piura') {
    originBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-industrial-900 border border-industrial-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8">
        {/* Cabecera del Perfil de Cliente */}
        <div className="p-6 bg-industrial-950 border-b border-industrial-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xl shrink-0">
              <i className="fa-solid fa-id-card-clip"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-lg text-slate-100">
                  {cliente.nombre}
                </h3>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${originBadge}`}>
                  {cliente.departamento}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                  cliente.estado === 'activo'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : cliente.estado === 'observado'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {cliente.estado}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1 flex-wrap">
                <span>RUC/DNI: <strong className="text-slate-200">{cliente.rucO_Dni}</strong></span>
                <span>•</span>
                <span>Encargado: <strong className="text-gold-400">{cliente.personaEncargada}</strong></span>
                <span>•</span>
                <span>Labor: <strong className="text-slate-300">{cliente.laborMinera}</strong></span>
                {cliente.esReinfo && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <i className="fa-solid fa-certificate text-[10px]"></i>
                      {cliente.reinfoCodigo || 'REINFO VIGENTE'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={startEdit}
                className="px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-industrial-700"
              >
                <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                <span>Editar</span>
              </button>
            ) : null}
            <button
              onClick={() => setSelectedCliente(null)}
              className="text-slate-400 hover:text-slate-100 p-2 rounded-lg hover:bg-industrial-800 transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Formulario de Edición o Vista de Detalles */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-150px)] overflow-y-auto">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4 bg-industrial-950 p-5 rounded-xl border border-industrial-800">
              <h4 className="text-xs font-mono font-bold text-gold-400 uppercase tracking-wider">
                Editar Información de Contacto y Cuentas Bancarias
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="sm:col-span-2">
                  <label className="block text-gold-400 font-bold mb-1">Persona Encargada / Representante *</label>
                  <input
                    type="text"
                    required
                    value={editForm.personaEncargada}
                    onChange={(e) => setEditForm({ ...editForm, personaEncargada: e.target.value })}
                    className="w-full bg-industrial-900 border border-gold-500/40 rounded p-2 text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={editForm.telefono}
                    onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Labor / Concesión Minera</label>
                  <input
                    type="text"
                    value={editForm.laborMinera}
                    onChange={(e) => setEditForm({ ...editForm, laborMinera: e.target.value })}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 font-bold mb-1">Coordenadas GPS (Lat, Long)</label>
                  <input
                    type="text"
                    value={editForm.coordenadasGps}
                    onChange={(e) => setEditForm({ ...editForm, coordenadasGps: e.target.value })}
                    placeholder="-6.7667, -78.6167"
                    className="w-full bg-industrial-900 border border-cyan-500/40 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Estado del Cliente</label>
                  <select
                    value={editForm.estado}
                    onChange={(e) => setEditForm({ ...editForm, estado: e.target.value as any })}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-slate-100"
                  >
                    <option value="activo">Activo (Habilitado para acopio)</option>
                    <option value="observado">Observado (Revisión técnica/legal)</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Banco de Abono Preferido</label>
                  <select
                    value={editForm.bancoPreferido}
                    onChange={(e) => setEditForm({ ...editForm, bancoPreferido: e.target.value as any })}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-slate-100"
                  >
                    <option value="BCP">BCP</option>
                    <option value="BBVA">BBVA</option>
                    <option value="Interbank">Interbank</option>
                    <option value="Scotiabank">Scotiabank</option>
                    <option value="Banco de la Nación">Banco de la Nación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nro de Cuenta Bancaria</label>
                  <input
                    type="text"
                    value={editForm.cuentaBancaria}
                    onChange={(e) => setEditForm({ ...editForm, cuentaBancaria: e.target.value })}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Código de Cuenta Interbancario (CCI)</label>
                  <input
                    type="text"
                    value={editForm.cci}
                    onChange={(e) => setEditForm({ ...editForm, cci: e.target.value })}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Notas Comerciales / Legales</label>
                  <textarea
                    rows={2}
                    value={editForm.notas}
                    onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded p-2 text-slate-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded bg-industrial-800 text-slate-300 text-xs font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-gold-500 text-industrial-950 font-bold text-xs font-mono shadow"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          ) : null}

          {/* Tarjetas de Métricas Históricas del Minero */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-industrial-950 p-3.5 rounded-xl border border-industrial-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Lotes Entregados
              </span>
              <div className="text-2xl font-bold font-display text-slate-100 mt-1">
                {lotesDelCliente.length}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {lotesDelCliente.filter(l => l.etapaActual === 'liquidado').length} liquidados
              </span>
            </div>

            <div className="bg-industrial-950 p-3.5 rounded-xl border border-industrial-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Tonelaje Acopiado
              </span>
              <div className="text-2xl font-bold font-display text-blue-400 mt-1">
                {totalTMH.toFixed(1)} <span className="text-xs font-mono text-slate-400">TMH</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Hacia Trujillo</span>
            </div>

            <div className="bg-industrial-950 p-3.5 rounded-xl border border-industrial-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Liquidado Histórico
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                ${totalLiquidadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Pagos bancarios BCP/BBVA</span>
            </div>

            <div className="bg-industrial-950 p-3.5 rounded-xl border border-industrial-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Adelantos en Curso
              </span>
              <div className="text-xl font-bold font-mono text-gold-400 mt-1">
                ${adelantosPendientes.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Por amortizar en liquidación</span>
            </div>
          </div>

          {/* Información Bancaria y Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-2 text-xs font-mono">
              <h5 className="text-[11px] font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-landmark"></i>
                Datos Bancarios para Liquidación
              </h5>
              <div className="flex justify-between text-slate-400">
                <span>Banco Preferido:</span>
                <strong className="text-slate-200">{cliente.bancoPreferido || 'No especificado'}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Nro de Cuenta:</span>
                <strong className="text-slate-200">{cliente.cuentaBancaria || 'Pendiente de registrar'}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CCI:</span>
                <strong className="text-slate-200">{cliente.cci || 'Pendiente de registrar'}</strong>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-industrial-800 pt-1.5">
                <span>Contacto:</span>
                <strong className="text-slate-200">{cliente.telefono}</strong>
              </div>
            </div>

            <div className="bg-industrial-950 p-4 rounded-xl border border-industrial-800 space-y-2.5 text-xs font-mono">
              <h5 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-map-location-dot"></i>
                Ubicación de Origen, Labor & Georreferenciación
              </h5>
              <div className="flex justify-between text-slate-400">
                <span>Persona Encargada:</span>
                <strong className="text-gold-400 font-bold">{cliente.personaEncargada}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Departamento:</span>
                <strong className="text-slate-200">{cliente.departamento}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Provincia / Distrito:</span>
                <strong className="text-slate-200">{cliente.provincia} {cliente.distrito ? `• ${cliente.distrito}` : ''}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Labor habitual:</span>
                <strong className="text-slate-200 truncate max-w-[200px]">{cliente.laborMinera}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-400 bg-industrial-900 p-2 rounded border border-industrial-800">
                <span className="flex items-center gap-1 text-cyan-300">
                  <i className="fa-solid fa-location-crosshairs text-[10px]"></i>
                  GPS: {cliente.coordenadasGps}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(cliente.coordenadasGps)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-industrial-950 border border-cyan-500/30 text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <i className="fa-solid fa-map-pin text-[9px]"></i>
                  Ver en Maps
                </a>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-industrial-800 pt-1.5 text-[11px]">
                <span>Fecha de Registro:</span>
                <strong className="text-slate-200">{cliente.fechaRegistro}</strong>
              </div>
            </div>
          </div>

          {/* Historial de Lotes de este Minero */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-boxes-stacked text-gold-400"></i>
                Historial de Lotes del Cliente ({lotesDelCliente.length})
              </h4>
              <button
                onClick={() => {
                  setSelectedCliente(null);
                  setIsNewLoteModalOpen(true);
                }}
                className="text-xs font-mono font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1"
              >
                <i className="fa-solid fa-plus text-[10px]"></i>
                Nuevo Lote para este Minero
              </button>
            </div>

            {lotesDelCliente.length === 0 ? (
              <div className="bg-industrial-950 p-6 rounded-xl border border-dashed border-industrial-800 text-center text-slate-500 text-xs font-mono">
                No hay lotes registrados para este minero aún.
              </div>
            ) : (
              <div className="bg-industrial-950 border border-industrial-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-industrial-900 border-b border-industrial-800 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Lote / Fecha</th>
                      <th className="p-3">Mineral & Peso</th>
                      <th className="p-3">Etapa Actual</th>
                      <th className="p-3">Leyes / Maquila</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-industrial-800 text-slate-300">
                    {lotesDelCliente.map(l => {
                      const stageDef = STAGES.find(s => s.id === l.etapaActual);
                      return (
                        <tr key={l.id} className="hover:bg-industrial-900/50 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-gold-400">{l.codigoLote}</span>
                            <div className="text-[10px] text-slate-500">{l.fechaCreacion}</div>
                          </td>
                          <td className="p-3">
                            <div>{l.tipoMineral}</div>
                            <div className="text-slate-100 font-bold">
                              {l.balanza?.pesoNetoTMH ? `${l.balanza.pesoNetoTMH} TMH` : `${l.pesoEstimadoTMH} TMH est.`}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${stageDef?.badgeBg}`}>
                              <i className={`${stageDef?.icon} text-[9px]`}></i>
                              {stageDef?.label}
                            </span>
                          </td>
                          <td className="p-3 text-[11px]">
                            {l.ensayosLab ? (
                              <div className="text-cyan-300">
                                Au: {l.ensayosLab.leyes.oroOzTM} oz | Hum: {l.ensayosLab.porcentajeHumedad}%
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">Pendiente de muestreo</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedCliente(null);
                                openTransitionModal(l);
                              }}
                              className="px-2.5 py-1 rounded bg-industrial-800 hover:bg-gold-500 text-slate-200 hover:text-industrial-950 font-bold text-[11px] transition-all"
                            >
                              Ver Lote
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-industrial-950 border-t border-industrial-800 flex justify-end">
          <button
            onClick={() => setSelectedCliente(null)}
            className="px-4 py-2 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-slate-300 text-xs font-mono font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
