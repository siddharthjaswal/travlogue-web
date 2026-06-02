import api from '@/lib/api';

export interface Expense {
  id: number;
  tripId: number;
  tripDayId?: number;
  activityId?: number;
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
  activityId: data.activity_id,
  description: data.description,
  amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
  category: data.category,
  date: data.expense_date || data.date,
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
      expense_date: data.date,
      notes: data.notes,
      currency: data.currency || 'USD',
    };
    const res = await api.post('/expenses', payload);
    return mapExpense(res.data);
  },

  update: async (id: number, data: Partial<CreateExpenseData>): Promise<Expense> => {
    const payload: Record<string, unknown> = {};
    if (data.description !== undefined) payload.description = data.description;
    if (data.amount !== undefined) payload.amount = data.amount;
    if (data.category !== undefined) payload.category = data.category;
    if (data.date !== undefined) payload.expense_date = data.date;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.currency !== undefined) payload.currency = data.currency;
    const res = await api.put(`/expenses/${id}`, payload);
    return mapExpense(res.data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};
