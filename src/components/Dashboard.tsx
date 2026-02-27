import React from 'react';
import { useAppContext } from '../context/AppContext';
import { getToday, formatBRL } from '../utils/format';
import { Clock, CheckCircle2, Calendar as CalendarIcon, Gift, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { appointments, settings, clients, transactions } = useAppContext();
  
  const today = getToday();
  const nowTime = new Date().toTimeString().slice(0, 5);
  
  const appToday = appointments.filter(a => a.date === today);
  
  const isInWeek = (dateStr: string) => {
    if(!dateStr) return false;
    const d = new Date(dateStr + 'T12:00:00');
    const now = new Date();
    const diff = now.getDate() - now.getDay();
    const start = new Date(new Date().setDate(diff));
    const end = new Date(new Date().setDate(diff + 6));
    start.setHours(0,0,0,0); end.setHours(23,59,59,999);
    return d >= start && d <= end;
  };

  const isInMonth = (dateStr: string) => {
    if(!dateStr) return false;
    const d = new Date(dateStr + 'T12:00:00');
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const appWeek = appointments.filter(a => isInWeek(a.date));
  const appMonth = appointments.filter(a => isInMonth(a.date));
  
  const doneToday = appToday.filter(a => a.status === 'done').length;
  const doneWeek = appWeek.filter(a => a.status === 'done').length;
  const doneMonth = appMonth.filter(a => a.status === 'done').length;
  
  const upcoming = appToday
    .filter(a => a.time && a.time >= nowTime && a.status === 'pending')
    .sort((a,b) => (a.time || '').localeCompare(b.time || ''))[0];

  // Birthdays of the week
  const todayDate = new Date();
  const currentWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - todayDate.getDay() + i);
    return `${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  });

  const birthdaysThisWeek = clients.filter(c => {
    if (!c.birthday) return false;
    const bDate = new Date(c.birthday);
    const bStr = `${String(bDate.getUTCMonth() + 1).padStart(2, '0')}-${String(bDate.getUTCDate()).padStart(2, '0')}`;
    return currentWeek.includes(bStr);
  });

  // Chart Data (Last 7 days revenue)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - 6 + i);
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayTotal = transactions
      .filter(t => t.date === date && t.type === 'in')
      .reduce((acc, t) => acc + t.val, 0);
    return {
      name: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
      total: dayTotal
    };
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">Olá, {settings.name}</h1>
        <p className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">Dashboard</p>
      </div>

      {upcoming && (
        <div className="bg-gradient-to-br from-primary to-primary-hover text-white p-4 sm:p-5 rounded-2xl mb-6 sm:mb-8 shadow-lg shadow-primary/20">
          <div className="flex items-center gap-2 text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <Clock size={14} />
            Próximo Atendimento
          </div>
          <h3 className="text-xl sm:text-2xl font-black mb-1">{upcoming.name}</h3>
          <p className="text-sm sm:text-base font-medium opacity-90">
            {upcoming.time} • {upcoming.services ? upcoming.services.map(s => s.name).join(', ') : upcoming.service}
          </p>
        </div>
      )}

      {birthdaysThisWeek.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 mb-6 sm:mb-8 flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-xl text-amber-600 dark:text-amber-400">
            <Gift size={20} />
          </div>
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-1">Aniversariantes da Semana</h3>
            <div className="space-y-1">
              {birthdaysThisWeek.map(c => (
                <p key={c.id} className="text-sm text-amber-900 dark:text-amber-100">
                  <span className="font-bold">{c.name}</span> • {new Date(c.birthday!).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 mb-6 sm:mb-8 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">
          <BarChart2 size={16} /> Faturamento (Últimos 7 dias)
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [formatBRL(value), 'Faturamento']}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#2563eb' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon size={18} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Agendados</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Hoje" value={appToday.length} />
            <StatCard label="Semana" value={appWeek.length} />
            <StatCard label="Mês" value={appMonth.length} />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Concluídos</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Hoje" value={doneToday} highlight="emerald" />
            <StatCard label="Semana" value={doneWeek} highlight="emerald" />
            <StatCard label="Mês" value={doneMonth} highlight="emerald" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, highlight }: { label: string, value: number, highlight?: 'emerald' }) => (
  <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 text-center ${highlight === 'emerald' ? 'border-l-4 border-l-emerald-500' : ''}`}>
    <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-xl sm:text-2xl font-black ${highlight === 'emerald' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>{value}</p>
  </div>
);
