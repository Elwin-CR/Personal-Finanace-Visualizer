// app/api/transactions/route.js
import { connectToDB } from '@/lib/utils';
import Transaction from '@/lib/models/Transaction';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDB();
    const transactions = await Transaction.find().sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { amount, date, description } = await request.json();
  
  if (!amount || !date) {
    return NextResponse.json(
      { message: 'Amount and date are required' },
      { status: 400 }
    );
  }

  try {
    await connectToDB();
    const newTransaction = new Transaction({
      amount,
      date,
      description,
      userId: 'temp-user' // Replace with actual user ID when auth is added
    });
    await newTransaction.save();
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}