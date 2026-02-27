export type DurationUnit = 'minutes' | 'hours' | 'days';

export type Client = {
  id: string;
  name: string;
  phone?: string;
  birthday?: string;
  notes?: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  clientId?: string;
  name: string;
  phone?: string;
  date: string;
  time?: string;
  duration?: string;
  durationUnit?: DurationUnit;
  price: number;
  service?: string;
  services?: Service[];
  status: 'pending' | 'done';
};

export type Transaction = {
  id: string;
  desc: string;
  category: string;
  val: number;
  type: 'in' | 'out';
  date: string;
};

export type Service = {
  name: string;
  price: number;
  duration?: string;
  durationUnit?: DurationUnit;
};

export type BusinessHours = {
  [day: number]: { isOpen: boolean; start: string; end: string };
};

export type Settings = {
  name: string;
  services: Service[];
  theme: 'light' | 'dark';
  businessHours?: BusinessHours;
};
