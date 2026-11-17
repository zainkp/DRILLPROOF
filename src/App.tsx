import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DataProvider } from './hooks/useData';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
