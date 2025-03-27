import { useState } from 'react';
import TestConnection from '../components/TestConnection';
import { Button } from '../components/ui/button';

export default function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <div className="container-wrapper">
      <TestConnection />

      <div className="mt-8 p-4 border rounded-lg">
        <p className="mb-4">Count: {count}</p>
        <div className="flex gap-2">
          <Button onClick={() => setCount(count + 1)} variant="default">
            Up
          </Button>
          <Button onClick={() => setCount(count - 1)} variant="outline">
            Down
          </Button>
          <Button onClick={() => setCount(0)} variant="destructive">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
