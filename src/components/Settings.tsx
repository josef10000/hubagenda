import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatBRL } from '../utils/format';
import { User, Briefcase, Plus, Trash2, Save } from 'lucide-react';

interface SettingsProps {
  onAddService: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onAddService }) => {
  const { settings, updateSettings, removeService } = useAppContext();
  const [name, setName] = useState(settings.name);

  const handleSave = () => {
    if (name.trim()) {
      updateSettings({ name });
      alert('Perfil salvo com sucesso!');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      <h2 className="text-2xl font-black tracking-tight mb-6">Ajustes</h2>
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-primary" />
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Perfil Profissional</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nome de Exibição</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <button 
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Save size={18} /> Salvar Perfil
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-primary" />
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Catálogo de Serviços</h3>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {settings.services.length > 0 ? settings.services.map((s, idx) => {
            const durationLabels = { minutes: 'min', hours: 'h', days: 'dias' };
            return (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="font-bold text-sm">{s.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {formatBRL(s.price)} {s.duration ? `• ${s.duration} ${durationLabels[s.durationUnit || 'minutes']}` : ''}
                </p>
              </div>
              <button 
                onClick={() => { if(confirm('Remover serviço?')) removeService(idx); }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            );
          }) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4 text-sm font-medium">Nenhum serviço cadastrado.</p>
          )}
        </div>

        <button 
          onClick={onAddService}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={18} /> Novo Serviço
        </button>
      </div>
    </div>
  );
};
