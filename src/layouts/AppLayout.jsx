import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import CommandPalette from '../components/CommandPalette';
import Toast from '../components/Toast';
import './AppLayout.css';

const AppLayout = () => {
  return (
    <div className="dw-app-layout">
      <Sidebar />
      <div className="dw-main-content">
        <TopBar />
        <main className="dw-content-body">
          <Suspense
            fallback={
              <div className="dw-loading-state">
                <div className="dw-spinner" />
                <span>Loading tool...</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
      <CommandPalette />
      <Toast />
    </div>
  );
};

export default AppLayout;
