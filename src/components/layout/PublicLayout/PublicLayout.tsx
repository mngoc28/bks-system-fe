import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { FloatingChatbot } from "@/components/chatbot";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { LoadingScreen } from "@/components/ui/loading-screen";

const PublicLayout = () => {
  return (
    <div className="relative min-h-screen">
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
      <div className="pointer-events-none fixed bottom-6 right-6 z-[9999]">
        <div data-chatbot-stack className="pointer-events-auto flex flex-col items-center gap-4">
          <ScrollToTopButton />
          <FloatingChatbot />
        </div>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default PublicLayout;
