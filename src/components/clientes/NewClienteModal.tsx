import React, { useState } from 'react';
import { useLotes } from '../../context/LotesContext';
import { OriginRegion } from '../../types';

export const NewClienteModal: React.FC = () => {
  const { isNewClienteModalOpen, setIsNewClienteModalOpen, createCliente } = useLotes();

  const [formData, setFormData] = useState({
    nombre: '',
    personaEncargada: '',
    tipoDocumento: 'RUC' as 'RUC' | 'DNI',
    rucO_Dni: '',
    telefono: '',
    email: '',
    esReinfo: true,
    reinfoCodigo: '',
    departamento: 'Cajamarca' as OriginRegion,
    provincia: '',
    distrito: '',
    laborMinera: '',
    coordenadasGps: '-6.7667, -78.6167',
    bancoPreferido: 'BCP' as 'BCP' | 'BBVA' | 'Interbank' | 'Scotiabank' | 'Banco de la Nación',
    cuentaBancaria: '',
    cci: '',
    notas: '',
    estado: 'activo' as 'activo' | 'observado' | 'inactivo',
  });

  if (!isNewClienteModalOpen) return null;

  const handleRegionChange = (region: OriginRegion) => {
    let prov = 'Hualgayoc (Bambamarca)';
    let reinfo = 'REINFO-06-';
    let coords = '-6.7667, -78.6167';
    if (region === 'Áncash') {
      prov = 'Pallasca (Cabana)';
      reinfo = 'REINFO-02-';
      coords = '-8.5412, -78.0194';
    } else if (region === 'Piura') {
      prov = 'Ayabaca (Suyo)';
      reinfo = 'REINFO-20-';
      coords = '-4.5122, -80.0911';
    }

    setFormData({
      ...formData,
      departamento: region,
      provincia: prov,
      coordenadasGps: coords,
      reinfoCodigo: formData.esReinfo ? `${reinfo}${Math.floor(10000 + Math.random() * 90000)}` : '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.rucO_Dni.trim()) return;

    createCliente({
      nombre: formData.nombre.trim(),
      personaEncargada: formData.personaEncargada.trim() || 'Encargado de Operaciones',
      tipoDocumento: formData.tipoDocumento,
      rucO_Dni: formData.rucO_Dni.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email.trim() || undefined,
      esReinfo: formData.esReinfo,
      reinfoCodigo: formData.esReinfo ? formData.reinfoCodigo.trim() : undefined,
      departamento: formData.departamento,
      provincia: formData.provincia.trim() || 'Principal',
      distrito: formData.distrito.trim() || undefined,
      laborMinera: formData.laborMinera.trim() || 'Labor General',
      coordenadasGps: formData.coordenadasGps.trim() || '-6.7667, -78.6167',
      bancoPreferido: formData.bancoPreferido,
      cuentaBancaria: formData.cuentaBancaria.trim() || undefined,
      cci: formData.cci.trim() || undefined,
      notas: formData.notas.trim() || undefined,
      estado: formData.estado,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-industrial-900 border border-industrial-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Cabecera */}
        <div className="p-5 bg-industrial-950 border-b border-industrial-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <i className="fa-solid fa-user-plus text-base"></i>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100">
                Registrar Nuevo Cliente / Minero
              </h3>
              <p className="text-xs text-slate-400">
                Ficha de acreditación para acopio y liquidación de minerales
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewClienteModalOpen(false)}
            className="text-slate-400 hover:text-slate-100 p-2 rounded-lg hover:bg-industrial-800 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-150px)] overflow-y-auto font-mono text-xs">
          {/* Zona de Origen */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-bold">
              Zona de Acopio Principal *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cajamarca', 'Áncash', 'Piura'] as OriginRegion[]).map((region) => (
                <button
                  type="button"
                  key={region}
                  onClick={() => handleRegionChange(region)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    formData.departamento === region
                      ? 'bg-gold-500 text-industrial-950 border-gold-400 shadow-md shadow-gold-500/20'
                      : 'bg-industrial-950 text-slate-400 border-industrial-800 hover:border-slate-700'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Datos Legales del Minero */}
          <div className="border-t border-industrial-800 pt-3 space-y-3">
            <span className="text-[11px] text-gold-400 font-bold uppercase tracking-wider block">
              Identificación y Razón Social
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Nombre Completo o Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Consorcio Minero El Quijote SAC"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tipo de Documento</label>
                <select
                  value={formData.tipoDocumento}
                  onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as any })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-gold-500 outline-none"
                >
                  <option value="RUC">RUC (11 dígitos)</option>
                  <option value="DNI">DNI (8 dígitos)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gold-400 font-bold mb-1">
                  Nombre de la Persona Encargada / Representante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Ing. Marcos Chávez / Don Fortunato Mendoza"
                  value={formData.personaEncargada}
                  onChange={(e) => setFormData({ ...formData, personaEncargada: e.target.value })}
                  className="w-full bg-industrial-950 border border-gold-500/50 rounded-lg p-2 text-slate-100 font-bold focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nro de RUC / DNI *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. 20608934120"
                  value={formData.rucO_Dni}
                  onChange={(e) => setFormData({ ...formData, rucO_Dni: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-gold-400 font-bold focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  placeholder="+51 976 000 000"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="minero@correo.pe"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-gold-500 outline-none"
                />
              </div>
            </div>

            {/* REINFO */}
            <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.esReinfo}
                  onChange={(e) => setFormData({ ...formData, esReinfo: e.target.checked })}
                  className="accent-gold-500 w-4 h-4 rounded"
                />
                <span className="font-bold">Inscripción en el REINFO (Registro Integral de Formalización Minera)</span>
              </label>

              {formData.esReinfo && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Código REINFO (ej. REINFO-06-88341-CAJ)"
                    value={formData.reinfoCodigo}
                    onChange={(e) => setFormData({ ...formData, reinfoCodigo: e.target.value })}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded-lg p-2 text-emerald-400 font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ubicación y Labor */}
          <div className="border-t border-industrial-800 pt-3 space-y-3">
            <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider block">
              Ubicación de la Labor Minera
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Provincia</label>
                <input
                  type="text"
                  placeholder="ej. Hualgayoc"
                  value={formData.provincia}
                  onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Distrito</label>
                <input
                  type="text"
                  placeholder="ej. Bambamarca"
                  value={formData.distrito}
                  onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Labor / Concesión Minera *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Veta San Francisco Nv. 3"
                  value={formData.laborMinera}
                  onChange={(e) => setFormData({ ...formData, laborMinera: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-cyan-400 outline-none"
                />
              </div>

              {/* Coordenadas GPS del Lugar */}
              <div className="sm:col-span-3 bg-industrial-950 p-3 rounded-lg border border-cyan-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-cyan-300 font-bold">
                    <i className="fa-solid fa-location-crosshairs mr-1.5"></i>
                    Coordenadas GPS del Lugar (Latitud, Longitud) *
                  </label>
                  {formData.coordenadasGps && (
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(formData.coordenadasGps)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      Ver en Google Maps
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="ej. -6.7667, -78.6167"
                    value={formData.coordenadasGps}
                    onChange={(e) => setFormData({ ...formData, coordenadasGps: e.target.value })}
                    className="flex-1 bg-industrial-900 border border-industrial-700 rounded-lg p-2 text-slate-100 font-bold focus:border-cyan-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.departamento === 'Cajamarca') setFormData(f => ({ ...f, coordenadasGps: '-6.7667, -78.6167' }));
                      else if (formData.departamento === 'Áncash') setFormData(f => ({ ...f, coordenadasGps: '-8.5412, -78.0194' }));
                      else if (formData.departamento === 'Piura') setFormData(f => ({ ...f, coordenadasGps: '-4.5122, -80.0911' }));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-industrial-800 hover:bg-industrial-700 text-slate-300 text-xs shrink-0"
                  >
                    GPS Zona
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Formato: Latitud, Longitud WGS84 para georreferenciación de la labor minera.
                </span>
              </div>
            </div>
          </div>

          {/* Datos Bancarios para Liquidación */}
          <div className="border-t border-industrial-800 pt-3 space-y-3">
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
              Datos Bancarios para Liquidaciones
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Banco Principal</label>
                <select
                  value={formData.bancoPreferido}
                  onChange={(e) => setFormData({ ...formData, bancoPreferido: e.target.value as any })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-emerald-500 outline-none"
                >
                  <option value="BCP">BCP</option>
                  <option value="BBVA">BBVA</option>
                  <option value="Interbank">Interbank</option>
                  <option value="Scotiabank">Scotiabank</option>
                  <option value="Banco de la Nación">Banco de la Nación</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Nro de Cuenta</label>
                <input
                  type="text"
                  placeholder="193-xxxxxxxx-0-xx"
                  value={formData.cuentaBancaria}
                  onChange={(e) => setFormData({ ...formData, cuentaBancaria: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Código CCI</label>
                <input
                  type="text"
                  placeholder="002-193-xxxxxxxxxxxx-xx"
                  value={formData.cci}
                  onChange={(e) => setFormData({ ...formData, cci: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-800 rounded-lg p-2 text-slate-100 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-4 border-t border-industrial-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewClienteModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-industrial-800 text-slate-300 text-xs font-medium hover:bg-industrial-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-industrial-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-gold-500/20 transition-all active:scale-95"
            >
              <i className="fa-solid fa-check"></i>
              Registrar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
