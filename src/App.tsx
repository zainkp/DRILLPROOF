import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DataProvider } from './hooks/useData';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
