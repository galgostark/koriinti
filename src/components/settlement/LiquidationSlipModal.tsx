import React from 'react';
import { useLotes } from '../../context/LotesContext';

export const LiquidationSlipModal: React.FC = () => {
  const { liquidationSlipLote: lote, closeLiquidationSlip } = useLotes();

  if (!lote || !lote.liquidacion) return null;

  const liq = lote.liquidacion;
  const neg = lote.negociacion;
  const lab = lote.ensayosLab;
  const bal = lote.balanza;

  const tmh = bal?.pesoNetoTMH || lote.pesoEstimadoTMH;
  const humedad = lab?.porcentajeHumedad || 6.0;
  const tms = Number((tmh * (1 - humedad / 100)).toFixed(3));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-industrial-900 border border-industrial-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Barra superior de acciones (Oculta al imprimir) */}
        <div className="p-4 bg-industrial-950 border-b border-industrial-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-mono text-xs font-bold text-slate-200">
              BOLETA OFICIAL DE LIQUIDACIÓN DE MINERAL
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-industrial-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <i className="fa-solid fa-print"></i>
              <span>Imprimir / Exportar PDF</span>
            </button>
            <button
              onClick={closeLiquidationSlip}
              className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-industrial-800"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Documento de Liquidación Imprimible */}
        <div className="p-8 space-y-6 font-mono text-xs bg-industrial-900 print:bg-white print:text-black">
          {/* Cabecera Empresa */}
          <div className="flex justify-between items-start border-b border-industrial-800 pb-5 print:border-black">
            <div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-gem text-gold-500 text-xl print:text-black"></i>
                <span className="font-display font-black text-xl tracking-wider text-slate-100 print:text-black">
                  KORI INTI MINERALS PERÚ S.A.C.
                </span>
              </div>
              <p className="text-[11px] text-slate-400 print:text-gray-600 mt-1">
                R.U.C. 20609812451 | Planta y Molinos: Trujillo, La Libertad
              </p>
              <p className="text-[10px] text-slate-500 print:text-gray-500">
                Acopio Autorizado: Cajamarca • Áncash • Piura
              </p>
            </div>
            <div className="text-right border border-gold-500/40 print:border-black p-3 rounded-lg bg-industrial-950 print:bg-gray-100">
              <span className="text-[10px] text-gold-400 print:text-black font-bold block">
                LIQUIDACIÓN DE COMPRA
              </span>
              <span className="text-base font-bold text-slate-100 print:text-black">
                {liq.numeroLiquidacion}
              </span>
              <span className="text-[10px] text-slate-400 print:text-gray-600 block mt-1">
                Fecha: {liq.fechaPago}
              </span>
            </div>
          </div>

          {/* Datos del Cliente y Origen */}
          <div className="grid grid-cols-2 gap-4 bg-industrial-950 print:bg-gray-50 p-4 rounded-xl border border-industrial-800 print:border-gray-300">
            <div>
              <span className="text-[10px] text-slate-500 print:text-gray-500 uppercase block mb-1">
                DATOS DEL VENDEDOR / MINERO:
              </span>
              <p className="font-bold text-slate-100 print:text-black text-sm">{lote.cliente.nombre}</p>
              <p className="text-slate-400 print:text-gray-700">RUC/DNI: {lote.cliente.rucO_Dni}</p>
              {lote.cliente.esReinfo && (
                <p className="text-emerald-400 print:text-green-700 text-[10px]">
                  REINFO: {lote.cliente.reinfoCodigo || 'Inscripción Vigente'}
                </p>
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 print:text-gray-500 uppercase block mb-1">
                PROCEDENCIA Y LOTE:
              </span>
              <p className="font-bold text-gold-400 print:text-black">LOTE: {lote.codigoLote}</p>
              <p className="text-slate-400 print:text-gray-700">
                Zona: {lote.origen.departamento} ({lote.origen.provincia})
              </p>
              <p className="text-slate-400 print:text-gray-700 truncate">
                Labor: {lote.origen.laborMinera}
              </p>
            </div>
          </div>

          {/* Pesaje y Molienda */}
          <div className="grid grid-cols-3 gap-3 border border-industrial-800 print:border-gray-300 p-3 rounded-lg text-center">
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-600 block">PESO NETO HÚMEDO</span>
              <span className="text-sm font-bold text-slate-100 print:text-black">{tmh.toFixed(2)} TMH</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-600 block">% HUMEDAD</span>
              <span className="text-sm font-bold text-cyan-400 print:text-black">{humedad.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-600 block">PESO NETO SECO</span>
              <span className="text-sm font-bold text-gold-400 print:text-black">{tms.toFixed(3)} TMS</span>
            </div>
          </div>

          {/* Leyes y Factores de Recuperación */}
          <div className="border border-industrial-800 print:border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-industrial-950 print:bg-gray-100 px-4 py-2 border-b border-industrial-800 print:border-gray-300 font-bold text-slate-300 print:text-black flex justify-between">
              <span>ENSAYO QUÍMICO Y RECUPERACIÓN</span>
              <span className="text-[10px] font-normal text-slate-400 print:text-gray-600">
                {lab?.laboratorio || 'SGS Sede Trujillo'} • {lab?.certificadoNro}
              </span>
            </div>
            <table className="w-full text-center">
              <thead className="bg-industrial-950/50 print:bg-gray-50 text-[10px] text-slate-400 print:text-gray-600 border-b border-industrial-800 print:border-gray-300">
                <tr>
                  <th className="py-2">Elemento</th>
                  <th className="py-2">Ley Obtenida</th>
                  <th className="py-2">% Recuperación</th>
                  <th className="py-2">Precio Bolsa Aplicado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800 print:divide-gray-300 text-slate-200 print:text-black">
                <tr>
                  <td className="py-2 font-bold text-gold-400 print:text-black">Oro (Au)</td>
                  <td className="py-2">{lab?.leyes.oroOzTM || 1.65} oz/TM</td>
                  <td className="py-2">{lab?.recuperaciones.oroRecuperacionPorcentaje || 88.5}%</td>
                  <td className="py-2">${neg?.spotPricesCongelados.oroUSDoz || 2742.40}/oz</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-silver-300 print:text-black">Plata (Ag)</td>
                  <td className="py-2">{lab?.leyes.plataOzTM || 8.5} oz/TM</td>
                  <td className="py-2">{lab?.recuperaciones.plataRecuperacionPorcentaje || 72.0}%</td>
                  <td className="py-2">${neg?.spotPricesCongelados.plataUSDoz || 32.48}/oz</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-copper-500 print:text-black">Cobre (Cu)</td>
                  <td className="py-2">{lab?.leyes.cobrePorcentaje || 0.75}%</td>
                  <td className="py-2">{lab?.recuperaciones.cobreRecuperacionPorcentaje || 80.0}%</td>
                  <td className="py-2">${neg?.spotPricesCongelados.cobreUSDlb || 4.39}/lb</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Desglose Financiero */}
          <div className="bg-industrial-950 print:bg-gray-50 p-4 rounded-xl border border-industrial-800 print:border-gray-300 space-y-2">
            <div className="flex justify-between text-slate-300 print:text-black">
              <span>VALOR BRUTO TOTAL DEL MINERAL:</span>
              <span className="font-bold">${liq.montoTotalBrutoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
            </div>
            <div className="flex justify-between text-rose-400 print:text-red-700">
              <span>(-) DEDUCCIONES & MAQUILA MOLIENDA:</span>
              <span>-${liq.deduccionesTotalesUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
            </div>
            <div className="flex justify-between text-amber-400 print:text-amber-800">
              <span>(-) RETENCIÓN DETRACCIÓN SUNAT (10%):</span>
              <span>-${liq.montoDetraccionUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
            </div>
            {liq.adelantosDescontadosUSD > 0 && (
              <div className="flex justify-between text-blue-400 print:text-blue-800">
                <span>(-) AMORTIZACIÓN ADELANTO EN ORIGEN:</span>
                <span>-${liq.adelantosDescontadosUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
              </div>
            )}
            <div className="border-t border-industrial-800 print:border-gray-400 pt-2 flex justify-between text-base font-bold text-emerald-400 print:text-green-800">
              <span>TOTAL NETO ABONADO AL CLIENTE:</span>
              <span>${liq.montoNetoPagadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 print:text-gray-600">
              <span>Equivalente en Moneda Nacional (Soles):</span>
              <span className="font-semibold text-slate-200 print:text-black">S/ {liq.montoNetoPagadoPEN.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Datos Bancarios y Constancias */}
          <div className="border border-emerald-500/30 print:border-gray-300 p-4 rounded-lg bg-emerald-950/10 print:bg-white text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-gray-600">Banco de Desembolso:</span>
              <span className="font-bold text-slate-200 print:text-black">{liq.banco}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-gray-600">Nro de Operación Bancaria:</span>
              <span className="font-bold text-emerald-400 print:text-black">{liq.nroOperacionBancaria}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-gray-600">Constancia Detracción SUNAT:</span>
              <span className="font-bold text-slate-200 print:text-black">{liq.constanciaDetraccionNro}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 print:text-gray-600">Comprobante Emitido:</span>
              <span className="text-slate-300 print:text-black">{liq.comprobantePagoTipo} #{liq.comprobanteNumero}</span>
            </div>
          </div>

          {/* Firmas */}
          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-industrial-800 print:border-gray-300 text-center text-[10px]">
            <div>
              <div className="border-t border-slate-700 print:border-black mx-8 pt-1">
                <p className="font-bold text-slate-200 print:text-black">{liq.responsableCierre}</p>
                <p className="text-slate-500 print:text-gray-600">Por Minerva Minerals Perú SAC</p>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-700 print:border-black mx-8 pt-1">
                <p className="font-bold text-slate-200 print:text-black">{lote.cliente.nombre}</p>
                <p className="text-slate-500 print:text-gray-600">Conforme Vendedor / Minero</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
