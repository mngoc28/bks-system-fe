import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RealtimeNotifyProvider from './components/RealtimeNotifyProvider';

const PartnerLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <RealtimeNotifyProvider>
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </RealtimeNotifyProvider>
      </div>
    </div>
  );
};

export default PartnerLayout;
