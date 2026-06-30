import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RealtimeNotifyProvider from './components/RealtimeNotifyProvider';
import { useGetUserProfileQuery } from '@/hooks/useUserQuery';
import { useUserStore } from '@/store/useUserStore';
import { Spinner } from '@/components/ui/spinner';

const PartnerLayout: React.FC = () => {
  const setPartnerStatus = useUserStore((state) => state.setPartnerStatus);
  const { data: profileRes, isPending, isError } = useGetUserProfileQuery();
  const user = profileRes?.data;
  const userStatus = user ? Number(user.status) : null;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (userStatus != null) {
      setPartnerStatus(userStatus);
    }
  }, [userStatus, setPartnerStatus]);

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/partner/onboarding" replace />;
  }

  // Redirect only after profile is known — block child routes from firing dashboard APIs.
  // Status: 0 = pending email/profile, 3 = pending approval, 4 = rejected
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
