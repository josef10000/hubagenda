import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatBRL, formatDate } from '../utils/format';
import { MessageCircle, Users, Download, ChevronLeft, Edit2, Calendar } from 'lucide-react';
import { exportToCSV } from '../utils/export';
import { Modals } from './Modals';

export const Clients: React.FC = () => {
  const { clients, appointments } = useAppContext();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleExport = () => {
    const headers = ['Nome', 'Telefone', 'Aniversário', 'Último Serviço', 'Valor Gasto', 'Anotações'];
    const rows = clients.map(c => {
      const clientAppts = appointments.filter(a => a.clientId === c.id || a.name === c.name).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastAppt = clientAppts[0];
      const serviceName = lastAppt ? (lastAppt.services ? lastAppt.services.map(s => s.name).join(', ') : lastAppt.service) : 'Nenhum';
      const totalSpent = clientAppts.reduce((acc, a) => acc + a.price, 0);
      
      return [
        c.name,
        c.phone || 'Sem telefone',
        c.birthday ? new Date(c.birthday).toLocaleDateString('pt-BR') : 'N/A',
        serviceName || 'Nenhum',
        totalSpent.toString(),
        c.notes || ''
      ];
    });
    exportToCSV('clientes.csv', [headers, ...rows]);
  };

  const openEditModal = (id: string | null = null) => {
    setEditId(id);
    setIsModalOpen(true);
  };

  if (selectedClientId) {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return null;

    const clientAppts = appointments.filter(a => a.clientId === client.id || a.name === client.name).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const totalSpent = clientAppts.reduce((acc, a) => acc + a.price, 0);

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setSelectedClientId(null)} className="flex items-center gap-2 text-primary font-bold mb-6 hover:opacity-80 transition-opacity">
          <ChevronLeft size={20} /> Voltar para lista
        </button>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-1">{client.name}</h2>
              {client.phone && <p className="text-slate-500 dark:text-slate-400 font-medium">{client.phone}</p>}
              {client.birthday && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">🎂 {new Date(client.birthday).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>}
            </div>
            <button onClick={() => openEditModal(client.id)} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Edit2 size={18} />
            </button>
          </div>

          {client.notes && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider mb-1">Anotações / Ficha</p>
              <p className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Gasto</p>
              <p className="text-xl font-black text-emerald-500">{formatBRL(totalSpent)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Atendimentos</p>
              <p className="text-xl font-black text-primary">{clientAppts.length}</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-black tracking-tight mb-4">Histórico de Serviços</h3>
        <div className="space-y-3">
          {clientAppts.length > 0 ? clientAppts.map(a => {
            const serviceName = a.services ? a.services.map(s => s.name).join(', ') : a.service;
            return (
              <div key={a.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{serviceName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(a.date)} • {a.status === 'done' ? 'Concluído' : 'Pendente'}</p>
                </div>
                <p className="font-black text-emerald-500">{formatBRL(a.price)}</p>
              </div>
            );
          }) : (
            <p className="text-center text-slate-500 py-8">Nenhum histórico encontrado.</p>
          )}
        </div>
        
        <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type="client" editId={editId} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Clientes</h2>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{clients.length} cadastrados</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport} 
            className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm font-bold"
            title="Exportar para Excel"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={() => openEditModal()} 
            className="p-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 text-sm font-bold shadow-sm shadow-primary/20"
            title="Novo Cliente"
          >
            <Users size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {clients.length > 0 ? clients.map((client) => {
          const clientAppts = appointments.filter(a => a.clientId === client.id || a.name === client.name).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const lastAppt = clientAppts[0];
          const msg = `Olá ${client.name}, tudo bem? Temos novidades e horários disponíveis!`;
          
          return (
            <div key={client.id} onClick={() => setSelectedClientId(client.id)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
                <div>
                  <h3 className="font-bold text-lg leading-none mb-1">{client.name}</h3>
                  {client.phone ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{client.phone}</p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">Sem telefone</p>
                  )}
                </div>
                {client.phone && (
                  <a 
                    href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    className="p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366]/20 transition-colors self-start sm:self-auto"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle size={20} />
                  </a>
                )}
              </div>
              
              {lastAppt && (
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Último Serviço</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{lastAppt.services ? lastAppt.services.map(s => s.name).join(', ') : lastAppt.service}</p>
                    <p className="text-sm font-black text-primary">{formatBRL(lastAppt.price)}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(lastAppt.date)}</p>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">Nenhum cliente cadastrado ainda.</p>
            <p className="text-xs mt-2 opacity-70">Os clientes aparecerão aqui automaticamente ao agendar serviços.</p>
          </div>
        )}
      </div>

      <Modals isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type="client" editId={editId} />
    </div>
  );
};
