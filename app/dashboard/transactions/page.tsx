// app/dashboard/transactions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import TransactionForm from '@/components/TransactionForm';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
      prepareMonthlyData(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareMonthlyData = (transactions) => {
    const monthlyTotals = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      
      acc[monthYear] += transaction.amount;
      return acc;
    }, {});

    const formattedData = Object.entries(monthlyTotals).map(([monthYear, total]) => ({
      month: new Date(monthYear).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      total
    })).sort((a, b) => new Date(a.month) - new Date(b.month));

    setMonthlyData(formattedData);
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (res.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
            {monthlyData.length > 0 ? (
              <MonthlyExpensesChart data={monthlyData} />
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            {transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">No transactions yet</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
          <TransactionForm onSubmit={handleAddTransaction} />
        </div>
      </div>
    </div>
  );
}