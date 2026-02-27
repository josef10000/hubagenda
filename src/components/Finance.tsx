import React from 'react';
import { useAppContext } from '../context/AppContext';
import { formatBRL, formatDate } from '../utils/format';
import { TrendingUp, TrendingDown, Plus, Trash2, Download } from 'lucide-react';
import { exportToCSV } from '../utils/export';

interface FinanceProps {
  onAddExpense: () => void;
}

export const Finance: React.FC<FinanceProps> = ({ onAddExpense }) => {
  const { transactions, deleteTransaction } = useAppContext();
  
  const inc = transactions.filter(t => t.type === 'in').reduce((a, b) => a + b.val, 0);
  const exp = transactions.filter(t => t.type === 'out').reduce((a, b) => a + b.val, 0);
  const balance = inc - exp;

  const handleExport = () => {
    const headers = ['Descrição', 'Categoria', 'Valor', 'Tipo', 'Data'];
    const rows = transactions.map(t => [
      t.desc,
      t.category || 'Geral',
      t.val.toString(),
      t.type === 'in' ? 'Entrada' : 'Saída',
      formatDate(t.date)
    ]);
    exportToCSV('financeiro.csv', [headers, ...rows]);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black tracking-tight">Caixa</h2>
        <button 
          onClick={handleExport} 
          className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm font-bold"
        >
          <Download size={16} /> Exportar
        </button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 shadow-sm">
        <div className="p-6 text-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Saldo em Carteira</p>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatBRL(balance)}
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex-1 p-4 text-center border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <TrendingUp size={14} className="text-emerald-500" /> Entradas
            </div>
            <p className="text-lg font-black text-emerald-500">{formatBRL(inc)}</p>
          </div>
          <div className="flex-1 p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <TrendingDown size={14} className="text-red-500" /> Saídas
            </div>
            <p className="text-lg font-black text-red-500">{formatBRL(exp)}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onAddExpense}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors mb-8 border border-red-100 dark:border-red-500/20"
      >
        <Plus size={20} /> Registrar Despesa
      </button>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Histórico Recente</h3>
        {transactions.length > 0 ? [...transactions].reverse().slice(0, 30).map(t => {
          const isInc = t.type === 'in';
          return (
            <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isInc ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                }`}>
                  {isInc ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.desc}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t.category || 'Geral'} • {formatDate(t.date)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className={`font-black ${isInc ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isInc ? '+' : '-'} {formatBRL(t.val)}
                </p>
                <button 
                  onClick={() => { if(confirm('Excluir transação?')) deleteTransaction(t.id); }}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        }) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm font-medium">Nenhuma transação registrada.</p>
        )}
      </div>
    </div>
  );
};
