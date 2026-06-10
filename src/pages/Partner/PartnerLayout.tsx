import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RealtimeNotifyProvider from './components/RealtimeNotifyProvider';
import { useGetUserProfileQuery } from '@/hooks/useUserQuery';
import { LoadingScreen } from '@/components/ui/loading-screen';

const PartnerLayout: React.FC = () => {
  const { data: profileRes, isLoading } = useGetUserProfileQuery();
  const user = profileRes?.data;
  const userStatus = user ? Number(user.status) : 1;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  if (isLoading) {
    return <LoadingScreen text="Đang tải dữ liệu đối tác..." />;
  }

  // Redirect to dedicated onboarding page if partner is not yet active
  // Status: 0 = email not verified, 2 = incomplete profile, 3 = pending approval, 4 = rejected
  if (user?.role === 'partner' && userStatus !== 1) {
    return <Navigate to="/partner/onboarding" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        <RealtimeNotifyProvider>
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </RealtimeNotifyProvider>
      </div>
    </div>
  );
};

export default PartnerLayout;
