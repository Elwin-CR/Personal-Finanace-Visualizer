// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CategoryPieChart from '@/components/CategoryPieChart';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
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
      prepareCategoryData(data);
      calculateTotalExpenses(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareCategoryData = (transactions) => {
    const categoryTotals = transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      
      if (!acc[category]) {
        acc[category] = 0;
      }
      
      acc[category] += transaction.amount;
      return acc;
    }, {});

    const formattedData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    }));

    setCategoryData(formattedData);
  };

  const calculateTotalExpenses = (transactions) => {
    const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    setTotalExpenses(total);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoryData.length > 0 
                ? categoryData.reduce((a, b) => a.value > b.value ? a : b).name 
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <CategoryPieChart data={categoryData} />
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}