// app/dashboard/budgets/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BudgetVsActualChart from '@/components/BudgetVsActualChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const categories = ['Food', 'Transportation', 'Housing', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch budgets and transactions for the selected month/year
      const [budgetsRes, transactionsRes] = await Promise.all([
        fetch(`/api/budgets?month=${month}&year=${year}`),
        fetch(`/api/transactions?month=${month}&year=${year}`)
      ]);
      
      const budgetsData = await budgetsRes.json();
      const transactionsData = await transactionsRes.json();
      
      setBudgets(budgetsData);
      setTransactions(transactionsData);
      prepareComparisonData(budgetsData, transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareComparisonData = (budgets, transactions) => {
    // Calculate actual spending per category
    const actualSpending = transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {});

    // Merge with budgets
    const data = categories.map(category => {
      const budget = budgets.find(b => b.category === category);
      return {
        category,
        budget: budget ? budget.amount : 0,
        actual: actualSpending[category] || 0
      };
    });

    setComparisonData(data);
  };

  const handleAddBudget = async (category, amount) => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          amount: parseFloat(amount),
          month,
          year,
          userId: 'temp-user'
        }),
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Budgets</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <Select
                  value={month.toString()}
                  onValueChange={(value) => setMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(2000, m - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2023)}
                  className="w-[120px]"
                />
              </div>
              
              {comparisonData.length > 0 ? (
                <BudgetVsActualChart data={comparisonData} />
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Set Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetForm categories={categories} onSubmit={handleAddBudget} />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              {budgets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((budget) => (
                      <TableRow key={budget._id}>
                        <TableCell>{budget.category}</TableCell>
                        <TableCell className="text-right">
                          ${budget.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500">No budgets set for this period</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingInsights data={comparisonData} />
        </CardContent>
      </Card>
    </div>
  );
}

function BudgetForm({ categories, onSubmit }: { categories: string[], onSubmit: (category: string, amount: string) => void }) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!category || !amount) {
      setError('Category and amount are required');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    onSubmit(category, amount);
    setCategory('');
    setAmount('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div className="grid gap-2">
        <label className="text-sm font-medium">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <label className="text-sm font-medium">Amount</label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save Budget'}
      </Button>
    </form>
  );
}

function SpendingInsights({ data }: { data: any[] }) {
  const overBudgetCategories = data.filter(item => item.actual > item.budget && item.budget > 0);
  
  if (overBudgetCategories.length === 0) {
    return <p className="text-green-500">You're within budget for all categories!</p>;
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Areas over budget:</h3>
      <ul className="list-disc pl-5 space-y-1">
        {overBudgetCategories.map(item => (
          <li key={item.category}>
            {item.category}: Budget ${item.budget.toFixed(2)} vs Actual ${item.actual.toFixed(2)}
            (${(item.actual - item.budget).toFixed(2)} over)
          </li>
        ))}
      </ul>
    </div>
  );
}