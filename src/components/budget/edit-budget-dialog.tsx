'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useUpdateTrip } from '@/hooks/use-trips';
import { CURRENCIES, currencySymbol } from '@/lib/format';

interface EditBudgetDialogProps {
    tripId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentBudget?: number;
    currentCurrency: string;
}

export function EditBudgetDialog({
    tripId,
    open,
    onOpenChange,
    currentBudget,
    currentCurrency,
}: EditBudgetDialogProps) {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState(currentCurrency);
    const { mutate: updateTrip, isPending } = useUpdateTrip();

    // Re-hydrate whenever the dialog opens.
    useEffect(() => {
        if (open) {
            setAmount(currentBudget != null && currentBudget > 0 ? String(currentBudget) : '');
            setCurrency(currentCurrency);
        }
    }, [open, currentBudget, currentCurrency]);

    const handleSave = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value < 0) {
            toast.error('Enter a valid budget amount');
            return;
        }
        updateTrip(
            { id: tripId, data: { budgetTotal: value, currency } },
            {
                onSuccess: () => {
                    toast.success('Budget updated');
                    onOpenChange(false);
                },
                onError: () => toast.error('Failed to update budget'),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Set trip budget</DialogTitle>
                    <DialogDescription>
                        Your total planned spend for this trip.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="budget-amount">Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                    {currencySymbol(currency)}
                                </span>
                                <Input
                                    id="budget-amount"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="rounded-xl pl-8"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="w-[110px] rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                    {CURRENCIES.map((c) => (
                                        <SelectItem key={c.code} value={c.code}>
                                            {c.symbol} {c.code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending} className="gap-2">
                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Budget
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
