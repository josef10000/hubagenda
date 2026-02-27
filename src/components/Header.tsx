import React from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export const Header: React.FC = () => {
  const { settings, updateSettings, user } = useAppContext();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair?')) {
      await signOut(auth);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 sm:p-6 max-w-md sm:max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-primary font-black text-lg sm:text-xl tracking-tight">
        <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm">
          H
        </div>
        AgendaHub
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Alternar Tema"
        >
          {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {user && (
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
};
