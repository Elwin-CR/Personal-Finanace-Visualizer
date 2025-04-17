// app/components/TransactionForm.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { Label } from './ui/label';

export default function TransactionForm({ onSubmit }: { onSubmit: (data: any) => Promise<void> }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!amount || !date) {
      setError('Amount and date are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        date,
        description
      });
      setAmount('');
      setDescription('');
    } catch (err) {
      setError('Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this for?"
          maxLength={100}
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Transaction'}
      </Button>
    </form>
  );
}