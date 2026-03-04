import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getToday } from '../utils/format';
import { X, ChevronDown } from 'lucide-react';
import { DurationUnit } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'appointment' | 'transaction' | 'service' | 'client' | null;
  editId?: string | null;
}

export const Modals: React.FC<ModalProps> = ({ isOpen, onClose, type, editId }) => {
  const { appointments, settings, clients, addAppointment, updateAppointment, addTransaction, addService, addClient, updateClient } = useAppContext();

  // Appointment State
  const [aClientId, setAClientId] = useState('');
  const [aName, setAName] = useState('');
  const [aPhone, setAPhone] = useState('');
  const [aDate, setADate] = useState(getToday());
  const [aTime, setATime] = useState('');
  const [aDur, setADur] = useState('');
  const [aDurUnit, setADurUnit] = useState<DurationUnit>('minutes');
  const [aPrice, setAPrice] = useState('');
  const [aServices, setAServices] = useState<string[]>([]);
  const [showServicesList, setShowServicesList] = useState(false);

  // Transaction State
  const [tDesc, setTDesc] = useState('');
  const [tCat, setTCat] = useState('Materiais');
  const [tVal, setTVal] = useState('');

  // Service State
  const [sName, setSName] = useState('');
  const [sPrice, setSPrice] = useState('');
  const [sDur, setSDur] = useState('');
  const [sDurUnit, setSDurUnit] = useState<DurationUnit>('minutes');

  // Client State
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cBirthday, setCBirthday] = useState('');
  const [cNotes, setCNotes] = useState('');

  useEffect(() => {
    if (isOpen && type === 'appointment') {
      if (editId) {
        const appt = appointments.find(a => a.id === editId);
        if (appt) {
          setAClientId(appt.clientId || '');
          setAName(appt.name);
          setAPhone(appt.phone || '');
          setADate(appt.date);
          setATime(appt.time || '');
          setADur(appt.duration || '');
          setADurUnit(appt.durationUnit || 'minutes');
          setAPrice(appt.price.toString());
          setAServices(appt.services ? appt.services.map(s => s.name) : (appt.service ? [appt.service] : []));
          setShowServicesList(false);
        }
      } else {
        setAClientId('');
        setAName('');
        setAPhone('');
        setADate(getToday());
        setATime('');
        setADur('');
        setADurUnit('minutes');
        setAPrice('');
        setAServices([]);
        setShowServicesList(false);
      }
    } else if (isOpen && type === 'transaction') {
      setTDesc('');
      setTCat('Materiais');
      setTVal('');
    } else if (isOpen && type === 'service') {
      setSName('');
      setSPrice('');
      setSDur('');
      setSDurUnit('minutes');
    } else if (isOpen && type === 'client') {
      if (editId) {
        const client = clients.find(c => c.id === editId);
        if (client) {
          setCName(client.name);
          setCPhone(client.phone || '');
          setCBirthday(client.birthday || '');
          setCNotes(client.notes || '');
        }
      } else {
        setCName('');
        setCPhone('');
        setCBirthday('');
        setCNotes('');
      }
    }
  }, [isOpen, type, editId, appointments, clients]);

  if (!isOpen) return null;

  const handleServiceToggle = (serviceName: string) => {
    setAServices(prev => {
      const newServices = prev.includes(serviceName) 
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName];
      
      // Auto-calculate total price based on selected services
      let total = 0;
      newServices.forEach(sName => {
        const s = settings.services.find(serv => serv.name === sName);
        if (s) total += s.price;
      });
      setAPrice(total > 0 ? total.toString() : '');
      return newServices;
    });
  };

  const handleClientSelect = (clientId: string) => {
    setAClientId(clientId);
    if (clientId === 'new') {
      setAName('');
      setAPhone('');
    } else if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setAName(client.name);
        setAPhone(client.phone || '');
      }
    }
  };

  const submitAppt = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for conflicts
    if (aTime && !editId) {
      const conflict = appointments.find(a => a.date === aDate && a.time === aTime && a.status === 'pending');
      if (conflict) {
        if (!confirm(`Atenção: Já existe um agendamento para ${conflict.name} neste horário. Deseja continuar?`)) {
          return;
        }
      }
    }

    let finalClientId = aClientId;
    if (aClientId === 'new' || !aClientId) {
      // Create new client if it doesn't exist
      const safeName = aName || "Sem Nome";
      const existing = clients.find(c => c.name.toLowerCase() === safeName.toLowerCase());
      if (existing) {
        finalClientId = existing.id;
        if (aPhone && !existing.phone) updateClient(existing.id, { phone: aPhone });
      } else {
        finalClientId = addClient({ name: safeName, phone: aPhone });
      }
    } else {
      // Update existing client phone if changed
      const client = clients.find(c => c.id === aClientId);
      if (client && aPhone !== client.phone) {
        updateClient(aClientId, { phone: aPhone });
      }
    }

    const selectedServiceObjects = aServices.map(sName => {
      const found = settings.services.find(s => s.name === sName);
      return found || { name: sName, price: 0 };
    });

    const data = {
      clientId: finalClientId || "",
      name: aName || "Sem Nome",
      phone: aPhone || "",
      date: aDate || getToday(),
      time: aTime || "",
      duration: aDur || "",
      durationUnit: aDurUnit,
      price: parseFloat(aPrice || '0'),
      services: selectedServiceObjects,
      status: editId ? appointments.find(a => a.id === editId)?.status || 'pending' : 'pending' as const
    };

    if (editId) {
      updateAppointment(editId, data);
    } else {
      addAppointment(data);
    }
    onClose();
  };

  const submitTrans = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      desc: tDesc || "Sem Descrição",
      category: tCat || "Outros",
      val: parseFloat(tVal || '0'),
      type: 'out',
      date: getToday()
    });
    onClose();
  };

  const submitService = (e: React.FormEvent) => {
    e.preventDefault();
    addService({
      name: sName || "Sem Nome",
      price: parseFloat(sPrice || '0'),
      duration: sDur || "",
      durationUnit: sDurUnit
    });
    onClose();
  };

  const submitClient = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: cName || "Sem Nome",
      phone: cPhone || "",
      birthday: cBirthday || "",
      notes: cNotes || ""
    };
    if (editId) {
      updateClient(editId, data);
    } else {
      addClient(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black tracking-tight">
            {type === 'appointment' ? (editId ? 'Editar Agendamento' : 'Novo Agendamento') : ''}
            {type === 'transaction' ? 'Registrar Despesa' : ''}
            {type === 'service' ? 'Novo Serviço' : ''}
            {type === 'client' ? (editId ? 'Editar Cliente' : 'Novo Cliente') : ''}
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto no-scrollbar">
          {type === 'appointment' && (
            <form onSubmit={submitAppt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Cliente</label>
                <select value={aClientId} onChange={e => handleClientSelect(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all mb-2 appearance-none">
                  <option value="">-- Selecione um Cliente --</option>
                  <option value="new">+ Novo Cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {(aClientId === 'new' || !aClientId) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome do Cliente" value={aName} onChange={e => setAName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                    <input type="tel" value={aPhone} onChange={e => setAPhone(e.target.value)} placeholder="WhatsApp (Opcional)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Serviços</label>
                
                <button 
                  type="button" 
                  onClick={() => setShowServicesList(!showServicesList)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-left flex justify-between items-center mb-3"
                >
                  <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                    {aServices.length > 0 ? aServices.join(', ') : 'Selecione os serviços...'}
                  </span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${showServicesList ? 'rotate-180' : ''}`} />
                </button>

                {showServicesList && (
                  <div className="mb-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex flex-col gap-2">
                    <div className="max-h-48 overflow-y-auto space-y-1 no-scrollbar">
                      {settings.services.length > 0 ? settings.services.map((s, i) => {
                        const isSelected = aServices.includes(s.name);
                        return (
                          <label key={i} className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleServiceToggle(s.name)}
                              className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary focus:ring-offset-0 bg-white dark:bg-slate-900"
                            />
                            <span className={`text-sm font-medium flex-1 ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{s.name}</span>
                            <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>R$ {s.price}</span>
                          </label>
                        );
                      }) : (
                        <p className="text-xs text-slate-500 italic p-2 text-center">Nenhum serviço cadastrado no catálogo.</p>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowServicesList(false)}
                      className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      Pronto
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Data</label>
                  <input type="date" value={aDate} onChange={e => setADate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Hora</label>
                  <input type="time" value={aTime} onChange={e => setATime(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Duração (Opcional)</label>
                  <div className="flex gap-2">
                    <input type="number" value={aDur} onChange={e => setADur(e.target.value)} className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Ex: 2" />
                    <select value={aDurUnit} onChange={e => setADurUnit(e.target.value as DurationUnit)} className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none">
                      <option value="minutes">Min</option>
                      <option value="hours">Horas</option>
                      <option value="days">Dias</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Valor (R$)</label>
                  <input type="number" step="1" value={aPrice} onChange={e => setAPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl mt-4 transition-colors">
                Salvar Agendamento
              </button>
            </form>
          )}

          {type === 'transaction' && (
            <form onSubmit={submitTrans} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Descrição</label>
                <input type="text" value={tDesc} onChange={e => setTDesc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Categoria</label>
                <select value={tCat} onChange={e => setTCat(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none">
                  <option value="Materiais">Materiais</option>
                  <option value="Conta Recorrente">Conta Recorrente</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Valor (R$)</label>
                <input type="number" step="1" value={tVal} onChange={e => setTVal(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
              </div>

              <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl mt-4 transition-colors">
                Confirmar Saída
              </button>
            </form>
          )}

          {type === 'service' && (
            <form onSubmit={submitService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nome do Serviço</label>
                <input type="text" value={sName} onChange={e => setSName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Preço (R$)</label>
                  <input type="number" step="1" value={sPrice} onChange={e => setSPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Duração (Opcional)</label>
                  <div className="flex gap-2">
                    <input type="number" value={sDur} onChange={e => setSDur(e.target.value)} className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Ex: 1" />
                    <select value={sDurUnit} onChange={e => setSDurUnit(e.target.value as DurationUnit)} className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none">
                      <option value="minutes">Min</option>
                      <option value="hours">Horas</option>
                      <option value="days">Dias</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl mt-4 transition-colors">
                Adicionar ao Catálogo
              </button>
            </form>
          )}

          {type === 'client' && (
            <form onSubmit={submitClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nome do Cliente</label>
                <input type="text" value={cName} onChange={e => setCName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">WhatsApp</label>
                  <input type="tel" value={cPhone} onChange={e => setCPhone(e.target.value)} placeholder="(11) 99999-9999" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Aniversário</label>
                  <input type="date" value={cBirthday} onChange={e => setCBirthday(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Anotações / Ficha</label>
                <textarea value={cNotes} onChange={e => setCNotes(e.target.value)} rows={3} placeholder="Alergias, preferências, fórmulas..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"></textarea>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl mt-4 transition-colors">
                Salvar Cliente
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
