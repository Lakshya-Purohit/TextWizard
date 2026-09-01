import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider } from './context/AppContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import ToolRoute from './tools/ToolRoute';
import './styles/global.css';
import './styles/components.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tool/:toolId" element={<ToolRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Analytics />
    </AppProvider>
  );
}

export default App;
