// app/components/ErrorBoundary.tsx
'use client';

import { useEffect } from 'react';
import { Button } from './ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong!</h2>
        <p className="text-red-700 mb-4">{error.message}</p>
        <Button
          variant="outline"
          onClick={() => reset()}
          className="text-red-800 border-red-300 hover:bg-red-100"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}