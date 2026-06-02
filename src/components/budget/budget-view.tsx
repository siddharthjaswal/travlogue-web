'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp, CreditCard, Pencil, Trash2 } from "lucide-react";
import { Trip } from "@/services/trip-service";
import { AddExpenseDialog } from "./add-expense-dialog";
import { EditBudgetDialog } from "./edit-budget-dialog";
import { useState, useMemo } from "react";
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTripTimeline } from '@/hooks/use-trips';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { collectDayPlaces, cleanPlaceTokens } from '@/lib/places';
import { formatMoney } from '@/lib/format';

interface BudgetViewProps {
    tripId: number;
    trip?: Trip;
}

export function BudgetView({ tripId, trip }: BudgetViewProps) {
    const { data: expenses, isLoading } = useExpenses(tripId);
    const { data: timeline } = useTripTimeline(tripId);
    const { user } = useAuth();
    const [editOpen, setEditOpen] = useState(false);
    const deleteExpense = useDeleteExpense(tripId);

        const derivedPlaces = useMemo(() => {
        if (!timeline?.days) return [] as string[];
        const tokens = timeline.days.flatMap((day) => collectDayPlaces({
            dayPlace: day.place,
            activityLocations: day.activities.map((a) => a.location),
        }));
        return cleanPlaceTokens(tokens).slice(0, 4);
    }, [timeline]);

    // Currency: trip's own currency, falling back to the user's default.
    const currency = trip?.currency || user?.defaultCurrency || 'USD';
    const totalBudget = trip?.budgetTotal ?? 0;
    const hasBudget = totalBudget > 0;

    // Calculate total spent
    const totalSpent = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const progress = hasBudget ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
    const remaining = totalBudget - totalSpent;

    if (isLoading) {
        return <BudgetSkeleton />;
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Trip Budget</h2>
                    <p className="text-muted-foreground">Track your expenses and stay on budget.</p>
                    {derivedPlaces.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {derivedPlaces.map((place) => (
                                <span key={place} className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/40 text-xs font-medium text-muted-foreground">
                                    {place}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <AddExpenseDialog tripId={tripId} trigger={
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> Add Expense
                    </Button>
                } />
            </div>

            {/* Budget Overview Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-10">
                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
                        <button
                            type="button"
                            onClick={() => setEditOpen(true)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Edit budget"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    </CardHeader>
                    <CardContent>
                        {hasBudget ? (
                            <>
                                <div className="text-2xl font-bold">{formatMoney(totalBudget, currency)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Planned allocation · {currency}</p>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setEditOpen(true)}
                                className="text-left"
                            >
                                <div className="text-2xl font-bold text-muted-foreground/50">—</div>
                                <p className="text-xs text-primary mt-1 font-medium">Set a budget →</p>
                            </button>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatMoney(totalSpent, currency)}
                        </div>
                        {hasBudget && (
                            <>
                                <Progress value={progress} className="h-2 mt-3" indicatorClassName="bg-orange-500" />
                                <p className="text-xs text-muted-foreground mt-2 text-right">{progress.toFixed(1)}% used</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        {hasBudget ? (
                            <>
                                <div className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                                    {formatMoney(remaining, currency)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {remaining < 0 ? 'Over budget' : 'Available to spend'}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-muted-foreground/50">—</div>
                                <p className="text-xs text-muted-foreground mt-1">Set a budget to track</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Expenses List */}
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                    <CardTitle>Recent Expenses</CardTitle>
                    <CardDescription>A list of your recent transactions.</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="space-y-4">
                        {expenses && expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all shadow-sm hover:shadow-md group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <DollarSign className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{expense.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{format(new Date(expense.date), "PPP")}</span>
                                                <span>•</span>
                                                <Badge variant="secondary" className="text-[10px] h-5 font-normal">
                                                    {expense.category}
                                                </Badge>
                                                {expense.activityId && (
                                                    <Badge variant="outline" className="text-[10px] h-5 font-normal">Activity</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-foreground block whitespace-nowrap">
                                            -{formatMoney(expense.amount, currency)}
                                        </span>
                                        <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <AddExpenseDialog
                                                tripId={tripId}
                                                expense={expense}
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg" aria-label="Edit expense">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                }
                                            />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg" aria-label="Delete expense">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            “{expense.description}” ({formatMoney(expense.amount, currency)}) will be permanently removed. This cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() => deleteExpense.mutate(expense.id, {
                                                                onSuccess: () => toast.success('Expense deleted'),
                                                                onError: () => toast.error('Failed to delete expense'),
                                                            })}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl border-muted bg-muted/5">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                    <DollarSign className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium">No expenses yet</h3>
                                <p className="text-muted-foreground text-sm mb-4">Start tracking your spending by adding an expense.</p>
                                <AddExpenseDialog tripId={tripId} trigger={
                                    <Button variant="outline">Add First Expense</Button>
                                } />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <EditBudgetDialog
                tripId={tripId}
                open={editOpen}
                onOpenChange={setEditOpen}
                currentBudget={trip?.budgetTotal}
                currentCurrency={currency}
            />
        </div>
    );
}

function BudgetSkeleton() {
    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-40 mb-4" />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}
