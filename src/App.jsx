import React from 'react';
import { ConstructaProvider } from './context/ConstructaContext';
import AppRoutes from './routes/routes';

export default function App() {
  return (
    <ConstructaProvider>
      <AppRoutes />
    </ConstructaProvider>
  );
}
