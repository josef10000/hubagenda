import React from 'react';
import { LayoutDashboard, CalendarDays, PlusCircle, Wallet, Settings, Users } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setView: (view: string) => void;
  onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, onAddClick }) => {
  const navItems = [
    { id: 'dash', icon: LayoutDashboard, label: 'Início' },
    { id: 'agenda', icon: CalendarDays, label: 'Agenda' },
    { id: 'clients', icon: Users, label: 'Clientes' },
    { id: 'add', icon: PlusCircle, label: 'Novo', isAction: true },
    { id: 'finance', icon: Wallet, label: 'Caixa' },
    { id: 'config', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] pt-2 px-2 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center mb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onAddClick}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="bg-primary text-white p-3 rounded-full shadow-lg shadow-primary/30 border-4 border-slate-50 dark:border-slate-900">
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-semibold mt-1 text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center w-14 gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
