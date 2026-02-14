import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { trackEvent } from '@/lib/analytics';
import { expenseService, CreateExpenseData } from '@/services/expense-service';

export function useExpenses(tripId: number) {
    return useQuery({
        queryKey: ['expenses', tripId],
        queryFn: () => expenseService.getExpenses(tripId),
        enabled: !!tripId,
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateExpenseData) => expenseService.create(data),
        onSuccess: (newExpense) => {
            queryClient.invalidateQueries({ queryKey: ['expenses', newExpense.tripId] });
            trackEvent('expense_added', {
                trip_id: newExpense.tripId,
                amount: newExpense.amount,
                category: newExpense.category
            });
        },
    });
}
