import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

export interface Expense {
    id: number;
    tripId: number;
    description: string;
    amount: number;
    category: string;
    date: string; // ISO date string
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

// Mock service for now
const mockExpenses: Record<number, Expense[]> = {
    123: [
        { id: 1, tripId: 123, description: 'Flight to Paris', amount: 450, category: 'transport', date: '2026-06-15', currency: 'USD' },
        { id: 2, tripId: 123, description: 'Hotel Deposit', amount: 200, category: 'accommodation', date: '2026-06-15', currency: 'USD' }
    ]
};

export const expenseService = {
    getExpenses: async (tripId: number): Promise<Expense[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockExpenses[tripId] || [];
    },

    create: async (data: CreateExpenseData): Promise<Expense> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newExpense: Expense = {
            id: Date.now(),
            ...data,
            currency: data.currency || 'USD'
        };
        
        if (!mockExpenses[data.tripId]) {
            mockExpenses[data.tripId] = [];
        }
        mockExpenses[data.tripId].push(newExpense);
        
        return newExpense;
    }
};

export function useExpenses(tripId: number) {
    return useQuery({
        queryKey: ['expenses', tripId],
        queryFn: () => expenseService.getExpenses(tripId),
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: expenseService.create,
        onSuccess: (newExpense) => {
            queryClient.invalidateQueries({ queryKey: ['expenses', newExpense.tripId] });
        },
    });
}
