import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { FloatingChatbot } from "@/components/chatbot";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ENABLE_CHATBOT } from "@/constant";

const PublicLayout = () => {
  return (
    <div className="relative min-h-screen">
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
      <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6">
        <div data-chatbot-stack className="pointer-events-auto flex flex-col items-center gap-4">
          <ScrollToTopButton />
          {ENABLE_CHATBOT && <FloatingChatbot />}
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;
