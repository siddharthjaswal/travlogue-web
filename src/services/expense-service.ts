import api from '@/lib/api';

export interface Expense {
  id: number;
  tripId: number;
  tripDayId?: number;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO
  currency: string;
  notes?: string;
}

export interface CreateExpenseData {
  tripId: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  currency?: string;
}

const mapExpense = (data: any): Expense => ({
  id: data.id,
  tripId: data.trip_id,
  tripDayId: data.trip_day_id,
  description: data.description,
  amount: data.amount,
  category: data.category,
  date: data.date,
  currency: data.currency,
  notes: data.notes,
});

export const expenseService = {
  getExpenses: async (tripId: number): Promise<Expense[]> => {
    const res = await api.get(`/trips/${tripId}/expenses`);
    return (res.data || []).map(mapExpense);
  },

  create: async (data: CreateExpenseData): Promise<Expense> => {
    const payload = {
      trip_id: data.tripId,
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date,
      notes: data.notes,
      currency: data.currency || 'USD',
    };
    const res = await api.post('/expenses', payload);
    return mapExpense(res.data);
  },
};
