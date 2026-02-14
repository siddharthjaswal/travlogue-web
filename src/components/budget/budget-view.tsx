'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Wallet, TrendingUp, CreditCard } from "lucide-react";
import { Trip } from "@/services/trip-service";
import { AddExpenseDialog } from "./add-expense-dialog";
import { useState } from "react";
import { useExpenses } from "@/hooks/use-expenses";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface BudgetViewProps {
    tripId: number;
    trip?: Trip;
}

export function BudgetView({ tripId, trip }: BudgetViewProps) {
    const { data: expenses, isLoading } = useExpenses(tripId);
    
    // Mock budget for now (will be added to trip model later)
    const totalBudget = 5000; 
    
    // Calculate total spent
    const totalSpent = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const progress = Math.min((totalSpent / totalBudget) * 100, 100);
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
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Planned allocation</p>
                    </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            ${totalSpent.toLocaleString()}
                        </div>
                        <Progress value={progress} className="h-2 mt-3" indicatorClassName="bg-orange-500" />
                        <p className="text-xs text-muted-foreground mt-2 text-right">{progress.toFixed(1)}% used</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/10 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${remaining.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Available to spend</p>
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
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-foreground block">
                                            -${expense.amount.toFixed(2)}
                                        </span>
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
