// app/components/BudgetVsActualChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BudgetVsActualChart({ data }){
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
          <Legend />
          <Bar dataKey="budget" fill="#8884d8" name="Budget" />
          <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}