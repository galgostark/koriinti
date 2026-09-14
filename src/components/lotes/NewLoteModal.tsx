import React, { useState } from 'react';
import { useLotes } from '../../context/LotesContext';
import { OriginRegion } from '../../types';

export const NewLoteModal: React.FC = () => {
  const { isNewLoteModalOpen, setIsNewLoteModalOpen, createLote, clientes } = useLotes();

  const [selectedClienteId, setSelectedClienteId] = useState<string>('');

  const [formData, setFormData] = useState({
    departamento: 'Cajamarca' as OriginRegion,
    provincia: 'Hualgayoc (Bambamarca)',
    laborMinera: 'Socavón La Esperanza - Nivel 2',
    clienteNombre: 'Consorcio Minero El Quijote SAC',
    clienteRuc: '20608934120',
    clienteTelefono: '+51 976 892 104',
    esReinfo: true,
    reinfoCodigo: 'REINFO-06-88341-CAJ',
    tipoMineral: 'Aurífero (Au)' as 'Aurífero (Au)' | 'Polimetálico (Au-Ag-Cu)' | 'Plata-Plomo-Zinc',
    pesoEstimadoTMH: 30.0,
    adelantoPactadoUSD: 5000,
  });

  // Leyes estimadas iniciales (Oro en g/oz, Plata, Cobre)
  const [leyesForm, setLeyesForm] = useState({
    oroValor: 1.80,
    oroUnidad: 'oz/TM' as 'g/TM' | 'oz/TM',
    plataOzTM: 8.50,
    cobrePorcentaje: 0.75,
  });

  // Conversión automática 1 oz Troy = 31.1035 g
  const oroEquivalenteOz = leyesForm.oroUnidad === 'oz/TM'
    ? Number(leyesForm.oroValor)
    : Number((Number(leyesForm.oroValor) / 31.1035).toFixed(3));

  const oroEquivalenteGramos = leyesForm.oroUnidad === 'g/TM'
    ? Number(leyesForm.oroValor)
    : Number((Number(leyesForm.oroValor) * 31.1035).toFixed(2));

  if (!isNewLoteModalOpen) return null;

  const handleClienteSelect = (cliId: string) => {
    setSelectedClienteId(cliId);
    if (!cliId) return;

    const cli = clientes.find(c => c.id === cliId);
    if (cli) {
      setFormData(prev => ({
        ...prev,
        clienteNombre: cli.nombre,
        clienteRuc: cli.rucO_Dni,
        clienteTelefono: cli.telefono,
        esReinfo: cli.esReinfo,
        reinfoCodigo: cli.reinfoCodigo || '',
        departamento: cli.departamento,
        provincia: cli.provincia,
        laborMinera: cli.laborMinera,
      }));
    }
  };

  const handleDepartamentoChange = (dept: OriginRegion) => {
    let prov = 'Hualgayoc (Bambamarca)';
    let reinfo = 'REINFO-06-88120-CAJ';
    if (dept === 'Áncash') {
      prov = 'Pallasca (Cabana)';
      reinfo = 'REINFO-02-14092-ANC';
    } else if (dept === 'Piura') {
      prov = 'Ayabaca (Suyo)';
      reinfo = 'REINFO-20-00941-PIU';
    }

    setFormData({
      ...formData,
      departamento: dept,
      provincia: prov,
      reinfoCodigo: reinfo,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const prefix = formData.departamento.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const codigoLote = `LOT-2026-${prefix}-${randomNum}`;

    createLote({
      codigoLote,
      cliente: {
        nombre: formData.clienteNombre,
        rucO_Dni: formData.clienteRuc,
        telefono: formData.clienteTelefono,
        esReinfo: formData.esReinfo,
        reinfoCodigo: formData.esReinfo ? formData.reinfoCodigo : undefined,
      },
      origen: {
        departamento: formData.departamento,
        provincia: formData.provincia,
        laborMinera: formData.laborMinera,
      },
      tipoMineral: formData.tipoMineral,
      pesoEstimadoTMH: Number(formData.pesoEstimadoTMH),
      adelantoPactadoUSD: Number(formData.adelantoPactadoUSD),
      leyesEstimadasOrigen: {
        oroValor: Number(leyesForm.oroValor),
        oroUnidad: leyesForm.oroUnidad,
        oroEquivalenteOz,
        oroEquivalenteGramos,
        plataOzTM: Number(leyesForm.plataOzTM),
        plataGramosTM: Number((Number(leyesForm.plataOzTM) * 31.1035).toFixed(1)),
        cobrePorcentaje: Number(leyesForm.cobrePorcentaje),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-industrial-900 border border-industrial-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Cabecera */}
        <div className="p-5 bg-industrial-950 border-b border-industrial-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <i className="fa-solid fa-mountain-sun text-base"></i>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100">
                Nuevo Lote en Origen (Etapa 1)
              </h3>
              <p className="text-xs text-slate-400">
                Registro de acopio en campamento minero y cierre de trato inicial
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewLoteModalOpen(false)}
            className="text-slate-400 hover:text-slate-100 p-2 rounded-lg hover:bg-industrial-800 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Zona de Origen */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Zona de Acopio Principal *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cajamarca', 'Áncash', 'Piura'] as OriginRegion[]).map((dept) => (
                <button
                  type="button"
                  key={dept}
                  onClick={() => handleDepartamentoChange(dept)}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border transition-all ${
                    formData.departamento === dept
                      ? 'bg-gold-500 text-industrial-950 border-gold-400 shadow-md shadow-gold-500/20'
                      : 'bg-industrial-950 text-slate-400 border-industrial-800 hover:border-slate-700'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Provincia / Distrito</label>
              <input
                type="text"
                required
                value={formData.provincia}
                onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Labor / Concesión Minera</label>
              <input
                type="text"
                required
                value={formData.laborMinera}
                onChange={(e) => setFormData({ ...formData, laborMinera: e.target.value })}
                className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
              />
            </div>
          </div>

          {/* Datos del Minero / Cliente */}
          <div className="border-t border-industrial-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-gold-400 font-bold uppercase tracking-wider">
                Datos del Minero / Razón Social
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Cargar cliente registrado:</span>
                <select
                  value={selectedClienteId}
                  onChange={(e) => handleClienteSelect(e.target.value)}
                  className="bg-industrial-950 border border-gold-500/40 rounded px-2 py-1 text-gold-400 text-xs focus:outline-none"
                >
                  <option value="">-- Seleccionar de Padrón --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.departamento})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-slate-400 mb-1">Nombre / Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.clienteNombre}
                  onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">RUC o DNI *</label>
                <input
                  type="text"
                  required
                  value={formData.clienteRuc}
                  onChange={(e) => setFormData({ ...formData, clienteRuc: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={formData.clienteTelefono}
                  onChange={(e) => setFormData({ ...formData, clienteTelefono: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-4 bg-industrial-950 p-2.5 rounded-lg border border-industrial-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.esReinfo}
                    onChange={(e) => setFormData({ ...formData, esReinfo: e.target.checked })}
                    className="accent-gold-500 w-4 h-4 rounded"
                  />
                  <span>Inscrito en REINFO (Formalización Minera)</span>
                </label>
                {formData.esReinfo && (
                  <input
                    type="text"
                    value={formData.reinfoCodigo}
                    onChange={(e) => setFormData({ ...formData, reinfoCodigo: e.target.value })}
                    placeholder="Código REINFO"
                    className="flex-1 bg-industrial-900 border border-industrial-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Mineral y Peso Estimado */}
          <div className="border-t border-industrial-800 pt-3">
            <span className="text-[11px] font-mono text-gold-400 font-bold uppercase tracking-wider block mb-2">
              Mineral & Condiciones Iniciales
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Tipo de Mineral</label>
                <select
                  value={formData.tipoMineral}
                  onChange={(e) => setFormData({ ...formData, tipoMineral: e.target.value as any })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                >
                  <option value="Aurífero (Au)">Aurífero (Au)</option>
                  <option value="Polimetálico (Au-Ag-Cu)">Polimetálico (Au-Ag-Cu)</option>
                  <option value="Plata-Plomo-Zinc">Plata-Plomo-Zinc</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Peso Estimado (TMH) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.pesoEstimadoTMH}
                  onChange={(e) => setFormData({ ...formData, pesoEstimadoTMH: Number(e.target.value) })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-gold-400 font-bold font-mono focus:border-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Adelanto en Origen ($ USD)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.adelantoPactadoUSD}
                  onChange={(e) => setFormData({ ...formData, adelantoPactadoUSD: Number(e.target.value) })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-gold-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Leyes Estimadas del Mineral (Oro en g/oz, Plata y Cobre) */}
          <div className="border-t border-industrial-800 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-flask text-amber-500"></i>
                Leyes Estimadas del Mineral (Pactadas en Origen)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                1 oz Troy = 31.1035 g
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-industrial-950 p-3 rounded-xl border border-amber-500/30">
              {/* Oro */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-gold-400 font-bold flex items-center gap-1">
                    <i className="fa-solid fa-coins text-[10px]"></i>
                    Ley Oro (Au) *
                  </label>
                  {/* Selector Gramos vs Onza */}
                  <div className="flex rounded bg-industrial-900 border border-industrial-700 p-0.5 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setLeyesForm(prev => ({ ...prev, oroUnidad: 'oz/TM' }))}
                      className={`px-1.5 py-0.5 rounded ${
                        leyesForm.oroUnidad === 'oz/TM'
                          ? 'bg-gold-500 text-industrial-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      oz/TM
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeyesForm(prev => ({ ...prev, oroUnidad: 'g/TM' }))}
                      className={`px-1.5 py-0.5 rounded ${
                        leyesForm.oroUnidad === 'g/TM'
                          ? 'bg-gold-500 text-industrial-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      g/TM
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  step="0.01"
                  required
                  value={leyesForm.oroValor}
                  onChange={(e) => setLeyesForm({ ...leyesForm, oroValor: Number(e.target.value) })}
                  className="w-full bg-industrial-900 border border-gold-500/50 rounded-lg p-2 text-xs text-gold-400 font-bold font-mono focus:border-gold-400 outline-none"
                />

                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Equivalente:</span>
                  <strong className="text-gold-300">
                    {leyesForm.oroUnidad === 'oz/TM'
                      ? `${oroEquivalenteGramos} g/TM`
                      : `${oroEquivalenteOz} oz/TM`}
                  </strong>
                </div>
              </div>

              {/* Plata */}
              <div>
                <label className="block text-xs font-mono text-silver-300 font-semibold mb-1 flex items-center gap-1">
                  <i className="fa-solid fa-gem text-[10px]"></i>
                  Ley Plata (Ag oz/TM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={leyesForm.plataOzTM}
                  onChange={(e) => setLeyesForm({ ...leyesForm, plataOzTM: Number(e.target.value) })}
                  className="w-full bg-industrial-900 border border-industrial-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-slate-400 outline-none"
                />
                <div className="mt-1 text-[10px] font-mono text-slate-500">
                  aprox. {(Number(leyesForm.plataOzTM) * 31.1035).toFixed(1)} g/TM
                </div>
              </div>

              {/* Cobre */}
              <div>
                <label className="block text-xs font-mono text-copper-500 font-semibold mb-1 flex items-center gap-1">
                  <i className="fa-solid fa-cubes-stacked text-[10px]"></i>
                  Ley Cobre (Cu %)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={leyesForm.cobrePorcentaje}
                  onChange={(e) => setLeyesForm({ ...leyesForm, cobrePorcentaje: Number(e.target.value) })}
                  className="w-full bg-industrial-900 border border-industrial-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-copper-500 outline-none"
                />
                <div className="mt-1 text-[10px] font-mono text-slate-500">
                  Polimetálico en porcentaje
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-4 border-t border-industrial-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewLoteModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-industrial-800 text-slate-300 text-xs font-medium hover:bg-industrial-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-industrial-950 text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all active:scale-95"
            >
              <i className="fa-solid fa-check"></i>
              Crear Lote en Origen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
