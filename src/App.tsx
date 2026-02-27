/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Agenda } from './components/Agenda';
import { Finance } from './components/Finance';
import { Settings } from './components/Settings';
import { Modals } from './components/Modals';
import { Clients } from './components/Clients';
import { Login } from './components/Login';

function AppContent() {
  const { user, authLoading } = useAppContext();
  const [view, setView] = useState('dash');
  const [modalType, setModalType] = useState<'appointment' | 'transaction' | 'service' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const openModal = (type: 'appointment' | 'transaction' | 'service', id: string | null = null) => {
    setModalType(type);
    setEditId(id);
  };

  const closeModal = () => {
    setModalType(null);
    setEditId(null);
  };

  return (
    <div className="min-h-screen pb-24">
      <Header />
      
      <main className="max-w-md sm:max-w-2xl mx-auto px-4 sm:px-6 pt-2">
        {view === 'dash' && <Dashboard />}
        {view === 'agenda' && <Agenda onEdit={(id) => openModal('appointment', id)} />}
        {view === 'clients' && <Clients />}
        {view === 'finance' && <Finance onAddExpense={() => openModal('transaction')} />}
        {view === 'config' && <Settings onAddService={() => openModal('service')} />}
      </main>

      <BottomNav 
        currentView={view} 
        setView={setView} 
        onAddClick={() => openModal('appointment')} 
      />

      <Modals 
        isOpen={modalType !== null} 
        onClose={closeModal} 
        type={modalType} 
        editId={editId} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
