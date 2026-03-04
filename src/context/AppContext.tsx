import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, Transaction, Settings, Service, Client } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AppState {
  user: User | null;
  authLoading: boolean;
  appointments: Appointment[];
  transactions: Transaction[];
  settings: Settings;
  clients: Client[];
  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appt: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  completeAppointment: (id: string) => void;
  addTransaction: (trans: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  addService: (service: Service) => void;
  removeService: (index: number) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => string;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const defaultBusinessHours = {
  0: { isOpen: false, start: '09:00', end: '18:00' },
  1: { isOpen: true, start: '09:00', end: '18:00' },
  2: { isOpen: true, start: '09:00', end: '18:00' },
  3: { isOpen: true, start: '09:00', end: '18:00' },
  4: { isOpen: true, start: '09:00', end: '18:00' },
  5: { isOpen: true, start: '09:00', end: '18:00' },
  6: { isOpen: true, start: '09:00', end: '13:00' },
};

const defaultSettings: Settings = {
  name: 'Profissional',
  services: [],
  theme: 'dark',
  businessHours: defaultBusinessHours
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [clients, setClients] = useState<Client[]>([]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch data from Firestore
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAppointments(data.appointments || []);
            setTransactions(data.transactions || []);
            setSettings(data.settings || defaultSettings);
            setClients(data.clients || []);
          } else {
            // Initialize new user document if it doesn't exist
            const initialData = {
              appointments: [],
              transactions: [],
              settings: defaultSettings,
              clients: []
            };
            await setDoc(docRef, initialData);
            setAppointments([]);
            setTransactions([]);
            setSettings(defaultSettings);
            setClients([]);
          }
          setDataLoaded(true);
        } catch (error: any) {
          console.error("FIREBASE READ ERROR:", error);
          // Removed alert to avoid blocking the user experience. 
          // If rules are missing, it will just load empty data.
          
          setAppointments([]);
          setTransactions([]);
          setSettings(defaultSettings);
          setClients([]);
          setDataLoaded(true);
        }
      } else {
        // Clear data on logout
        setAppointments([]);
        setTransactions([]);
        setSettings(defaultSettings);
        setClients([]);
        setDataLoaded(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync data to Firestore when it changes
  useEffect(() => {
    if (user && dataLoaded) {
      const syncData = async () => {
        try {
          // Strip undefined values to prevent Firestore errors
          const cleanData = JSON.parse(JSON.stringify({
            appointments,
            transactions,
            settings,
            clients
          }));
          
          // Try to save to Firestore
          await setDoc(doc(db, 'users', user.uid), cleanData, { merge: true });
          console.log("Data successfully saved to Firestore!");
        } catch (error: any) {
          console.error("FIREBASE WRITE ERROR:", error);
          // Removed alert to avoid spamming the user since this runs on every change.
        }
      };
      
      // Debounce sync to avoid too many writes
      const timeoutId = setTimeout(syncData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [appointments, transactions, settings, clients, user, dataLoaded]);

  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings.theme]);

  // Auto-complete past appointments and auto-migrate clients
  useEffect(() => {
    if (!dataLoaded) return;
    
    const today = new Date().toISOString().split('T')[0];
    let hasChanges = false;
    let hasClientChanges = false;
    const newTransactions: Transaction[] = [];
    const updatedClients = [...clients];

    const updatedAppointments = appointments.map(appt => {
      // Auto-migrate clients from old appointments
      if (!appt.clientId) {
        const apptName = appt.name || "Sem Nome";
        const existingClient = updatedClients.find(c => c.name.toLowerCase() === apptName.toLowerCase());
        if (existingClient) {
          appt.clientId = existingClient.id;
          if (appt.phone && !existingClient.phone) {
            existingClient.phone = appt.phone;
            hasClientChanges = true;
          }
          hasChanges = true;
        } else {
          const newClient: Client = {
            id: generateId(),
            name: apptName,
            phone: appt.phone || "",
            createdAt: new Date().toISOString()
          };
          updatedClients.push(newClient);
          appt.clientId = newClient.id;
          hasClientChanges = true;
          hasChanges = true;
        }
      }

      const serviceName = appt.services && appt.services.length > 0 ? appt.services.map(s => s.name).join(', ') : (appt.service || "");

      if (appt.status === 'pending' && appt.date < today) {
        hasChanges = true;
        newTransactions.push({
          id: generateId(),
          desc: `Serviço: ${appt.name} (${serviceName})`,
          val: appt.price,
          type: 'in',
          category: 'Agenda',
          date: today
        });
        return { ...appt, status: 'done' as const };
      }
      return appt;
    });

    if (hasChanges) {
      setAppointments(updatedAppointments);
      if (newTransactions.length > 0) {
        setTransactions(prev => [...prev, ...newTransactions]);
      }
    }
    if (hasClientChanges) {
      setClients(updatedClients);
    }
  }, [appointments, clients, dataLoaded]);

  const addAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newAppt = { ...appt, id: generateId() };
    setAppointments(prev => [...prev, newAppt]);
  };

  const updateAppointment = (id: string, appt: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appt } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'deleted' as any } : a).filter(a => a.status !== 'deleted'));
  };

  const completeAppointment = (id: string) => {
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      updateAppointment(id, { status: 'done' });
      const serviceName = appt.services && appt.services.length > 0 ? appt.services.map(s => s.name).join(', ') : (appt.service || "");
      addTransaction({
        desc: `Serviço: ${appt.name} (${serviceName})`,
        val: appt.price,
        type: 'in',
        category: 'Agenda',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const addTransaction = (trans: Omit<Transaction, 'id'>) => {
    const newTrans = { ...trans, id: generateId() };
    setTransactions(prev => [...prev, newTrans]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addService = (service: Service) => {
    setSettings(prev => ({ ...prev, services: [...prev.services, service] }));
  };

  const removeService = (index: number) => {
    setSettings(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newClient: Client = { ...client, id, createdAt: new Date().toISOString() };
    setClients(prev => [...prev, newClient]);
    return id;
  };

  const updateClient = (id: string, client: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...client } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user,
      authLoading,
      appointments,
      transactions,
      settings,
      clients,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      completeAppointment,
      addTransaction,
      deleteTransaction,
      updateSettings,
      addService,
      removeService,
      addClient,
      updateClient,
      deleteClient
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
