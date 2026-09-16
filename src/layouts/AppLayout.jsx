import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import CommandPalette from '../components/CommandPalette';
import Toast from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';
import './AppLayout.css';

const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="dw-app-layout">
      <Sidebar />
      <div className="dw-main-content">
        <TopBar />
        <main className="dw-content-body">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="dw-loading-state">
                  <div className="dw-spinner" />
                  <span>Loading utility suite...</span>
                </div>
              }
            >
              <div key={location.pathname} className="dw-page-transition">
                <Outlet />
              </div>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <CommandPalette />
      <Toast />
    </div>
  );
};

export default AppLayout;
