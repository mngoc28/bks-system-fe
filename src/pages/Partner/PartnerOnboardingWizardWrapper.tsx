import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import PartnerOnboardingWizard from "./components/PartnerOnboardingWizard";
import { Spinner } from "@/components/ui/spinner";

/**
 * Wrapper component for the Partner Onboarding Wizard.
 * Fetches the partner's profile and renders the onboarding wizard.
 * Auto-redirects to /partner/dashboard once the partner becomes active (status === 1).
 */
const PartnerOnboardingWizardWrapper: React.FC = () => {
  const { data: profileRes, isLoading } = useGetUserProfileQuery();
  const navigate = useNavigate();
  const user = profileRes?.data;
  const userStatus = user ? Number(user.status) : null;

  useEffect(() => {
    // Once partner is fully approved (status 1 = active), go to dashboard
    if (!isLoading && userStatus === 1) {
      navigate("/partner/dashboard", { replace: true });
    }
  }, [isLoading, userStatus, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0b0f19]">
        <Spinner size="lg" />
      </div>
    );
  }

  return <PartnerOnboardingWizard user={user} />;
};

export default PartnerOnboardingWizardWrapper;
