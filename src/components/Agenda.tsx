import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDate, formatBRL } from '../utils/format';
import { Check, Trash2, Edit2, MessageCircle, Calendar as CalendarIcon, List } from 'lucide-react';

interface AgendaProps {
  onEdit: (id: string) => void;
}

export const Agenda: React.FC<AgendaProps> = ({ onEdit }) => {
  const { appointments, completeAppointment, deleteAppointment } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  const sorted = [...appointments].sort((a,b) => 
    (a.date + (a.time || '23:59')).localeCompare(b.date + (b.time || '23:59'))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Sua Agenda</h2>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{appointments.length} agendamentos</p>
        </div>
        <button 
          onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')} 
          className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm font-bold"
        >
          {viewMode === 'list' ? <CalendarIcon size={16} /> : <List size={16} />}
          {viewMode === 'list' ? 'Calendário' : 'Lista'}
        </button>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 text-center">
          <CalendarIcon size={48} className="mx-auto text-primary/30 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Visão de Calendário</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            A visualização em grade mensal será implementada em breve. Por enquanto, utilize a visão em lista para gerenciar seus agendamentos.
          </p>
          <button 
            onClick={() => setViewMode('list')} 
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors"
          >
            Voltar para Lista
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.length > 0 ? sorted.map(a => {
            const dateF = formatDate(a.date);
            const timeDisp = a.time || 'Sem hora';
            const durationLabels = { minutes: 'min', hours: 'h', days: 'dias' };
            const durDisp = a.duration ? ` • ${a.duration} ${durationLabels[a.durationUnit || 'minutes']}` : '';
            const serviceName = a.services ? a.services.map(s => s.name).join(', ') : a.service;
            const msg = `Olá ${a.name}, confirmando nosso agendamento de ${serviceName} no dia ${dateF}${a.time ? ' às ' + a.time : ''}.`;
            const isDone = a.status === 'done';

            return (
              <div 
                key={a.id} 
                className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 shadow-sm ${
                  isDone ? 'border-l-emerald-500' : 'border-l-primary'
                } border-y border-r border-slate-200 dark:border-slate-700`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                  <div>
                    <h3 className="font-bold text-lg leading-none mb-1">{a.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                      {dateF} • {timeDisp}{durDisp}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {serviceName} • {formatBRL(a.price)}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider self-start sm:self-auto ${
                    isDone 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}>
                    {isDone ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <a 
                    href={`https://wa.me/${a.phone ? a.phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(msg)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                  <button 
                    onClick={() => onEdit(a.id)}
                    className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  {!isDone && (
                    <button 
                      onClick={() => completeAppointment(a.id)}
                      className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if(confirm('Remover agendamento?')) deleteAppointment(a.id);
                    }}
                    className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">Nenhum agendamento encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
