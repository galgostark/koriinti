import React from 'react';
import { useLotes } from '../../context/LotesContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLotes();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-700 bg-industrial-900';
        let iconClass = 'fa-solid fa-circle-info text-cyan-400';
        let glowClass = '';

        if (toast.tipo === 'success') {
          borderClass = 'border-emerald-500/50 bg-industrial-900 text-emerald-300';
          iconClass = 'fa-solid fa-circle-check text-emerald-400';
          glowClass = 'shadow-lg shadow-emerald-500/15';
        } else if (toast.tipo === 'warning') {
          borderClass = 'border-amber-500/50 bg-industrial-900 text-amber-300';
          iconClass = 'fa-solid fa-triangle-exclamation text-amber-400';
          glowClass = 'shadow-lg shadow-amber-500/15';
        } else if (toast.tipo === 'error') {
          borderClass = 'border-rose-500/50 bg-industrial-900 text-rose-300';
          iconClass = 'fa-solid fa-circle-xmark text-rose-400';
          glowClass = 'shadow-lg shadow-rose-500/15';
        } else {
          borderClass = 'border-cyan-500/40 bg-industrial-900 text-cyan-300';
          iconClass = 'fa-solid fa-circle-info text-cyan-400';
          glowClass = 'shadow-lg shadow-cyan-500/15';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl ${borderClass} ${glowClass} transition-all duration-300 animate-slide-in`}
          >
            <div className="shrink-0 pt-0.5 text-lg">
              <i className={iconClass}></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold font-mono tracking-wide text-slate-100">
                  {toast.titulo}
                </h4>
                {toast.tiempo && (
                  <span className="text-[10px] text-slate-500 font-mono">{toast.tiempo}</span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {toast.mensaje}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 shrink-0 text-xs p-1"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
};
