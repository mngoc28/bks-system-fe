import React, { Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import AuthImageOutlet from "./components/layout/AuthImageOutlet";
import { PERMISSIONS, ROUTERS } from "./constant";
import { useCheckTokenStore } from "./store/useCheckTokenStore";
import { useUserStore } from "./store/useUserStore";
import { getAccessToken } from "./utils/storage";
import { isTokenExpired } from "./utils/tokenUtils";
import { LoadingScreen } from "./components/ui/loading-screen";
import { isBksStayRouteEnabled, isPartnerCalendarEnabled } from "./lib/featureFlags";

const Layout = React.lazy(() => import("./components/layout"));
const AuthLayout = React.lazy(() => import("./components/layout/AuthLayout"));
const Home = React.lazy(() => import("./pages/EndUser/Home"));
const PublicLayout = React.lazy(() => import("./components/layout/PublicLayout/PublicLayout"));
const PartnerList = React.lazy(() => import("./pages/EndUser/PartnerList"));
const PartnerDetail = React.lazy(() => import("./pages/EndUser/PartnerDetail"));
const RoomSearch = React.lazy(() => import("./pages/EndUser/RoomSearch"));
const RoomByProvince = React.lazy(() => import("./pages/EndUser/RoomByProvince"));
const PublicRoomDetail = React.lazy(() => import("./pages/EndUser/RoomDetail"));
const MyBookings = React.lazy(() => import("./pages/EndUser/MyBookings"));
const BookingSuccess = React.lazy(() => import("./pages/EndUser/BookingSuccess"));
const PublicNewsDetail = React.lazy(() => import("./pages/EndUser/NewsDetail"));
const PublicNewsList = React.lazy(() => import("./pages/EndUser/NewsList"));
const PublicFaq = React.lazy(() => import("./pages/EndUser/PublicFaq"));
const Login = React.lazy(() => import("./pages/Admin/Login"));
const Register = React.lazy(() => import("./pages/Partner/Register"));
const BecomeAPartner = React.lazy(() => import("./pages/Partner/BecomeAPartner"));
const CompanyHub = React.lazy(() => import("./pages/EndUser/CompanyHub"));
const Dashboard = React.lazy(() => import("./pages/Admin/Dashboard"));
const Properties = React.lazy(() => import("./pages/Admin/PropertyManager"));
const BookingManage = React.lazy(() => import("./pages/Admin/BookingManage"));
const PropertiesAdd = React.lazy(() => import("./pages/Admin/PropertiesAdd"));
const PropertyEdit = React.lazy(() => import("./pages/Admin/PropertyEdit"));
const PropertyDetail = React.lazy(() => import("./pages/Admin/PropertyDetail"));
const PropertyEditImages = React.lazy(() => import("./pages/Admin/PropertyEdit"));
const Rooms = React.lazy(() => import("./pages/Admin/RoomManager"));
const RoomAdd = React.lazy(() => import("./pages/Admin/RoomAdd"));
const RoomDetail = React.lazy(() => import("./pages/Admin/RoomDetail"));
const RoomImageManager = React.lazy(() => import("./pages/Admin/RoomImageManager"));
const PropertyImageManager = React.lazy(() => import("./pages/Admin/PropertyImageManager"));
const RoomUpdate = React.lazy(() => import("./pages/Admin/RoomUpdate"));
const ResetPassword = React.lazy(() => import("./pages/Admin/ResetPassword"));
const ForgotPassword = React.lazy(() => import("./pages/Admin/ForgotPassword"));
const UserManagement = React.lazy(() => import("./pages/Admin/UserManager"));
const UserDetail = React.lazy(() => import("./pages/Admin/UserDetail"));
const UserEdit = React.lazy(() => import("./pages/Admin/UserEdit"));
const ProvinceManage = React.lazy(() => import("./pages/Admin/ProvinceManage"));
const ProvinceDetail = React.lazy(() => import("./pages/Admin/ProvinceDetail"));
const AmenityManagement = React.lazy(() => import("./pages/Admin/AmenityManager"));
const QuestionDetail = React.lazy(() => import("./pages/Admin/QuestionDetail"));
const QuestionManagement = React.lazy(() => import("./pages/Admin/QuestionManager"));
const QuestionCreate = React.lazy(() => import("./pages/Admin/QuestionCreate"));
const QuestionUpdate = React.lazy(() => import("./pages/Admin/QuestionUpdate"));
const QuestionFlow = React.lazy(() => import("./pages/Admin/QuestionFlow"));
const ServiceManagement = React.lazy(() => import("./pages/Admin/ServiceManagement"));
const VerifyEmailToken = React.lazy(() => import("./pages/Admin/VerifyEmailToken"));
const ResetTokenSuccess = React.lazy(() => import("./pages/Admin/ResetTokenSuccess"));
const SetPassword = React.lazy(() => import("./pages/Admin/SetPassword"));
const News = React.lazy(() => import("./pages/Admin/NewsManager"));
const NewsDetail = React.lazy(() => import("./pages/Admin/NewsDetail"));
const NewsEdit = React.lazy(() => import("./pages/Admin/NewsEdit"));
const NewsAdd = React.lazy(() => import("./pages/Admin/NewsAdd"));
const NewsletterManagement = React.lazy(() => import("./pages/Admin/NewsletterManagement"));
const PartnerManagement = React.lazy(() => import("./pages/Admin/PartnerManagement"));
const PartnerApproval = React.lazy(() => import("./pages/Admin/PartnerApproval"));
const PartnerDetailManager = React.lazy(() => import("./pages/Admin/PartnerDetail"));
const PartnerEditManager = React.lazy(() => import("./pages/Admin/PartnerEdit"));
const Booking = React.lazy(() => import("./pages/EndUser/Booking/BookingPage"));
const SettlementManage = React.lazy(() => import("./pages/Admin/SettlementManage"));
const SettlementDetail = React.lazy(() => import("./pages/Admin/SettlementManage/SettlementDetail"));


// BKS Stay Portal
const BksStayLayout = React.lazy(() => import("./pages/EndUser/BksStay/BksStayLayout"));
const BksStayDashboard = React.lazy(() => import("./pages/EndUser/BksStay/Dashboard"));
const BksStayHistory = React.lazy(() => import("./pages/EndUser/BksStay/History"));
const BksStayDetail = React.lazy(() => import("./pages/EndUser/BksStay/BookingDetail"));
const StayVoucher = React.lazy(() => import("./pages/EndUser/StayVoucher"));
const BksStayAccount = React.lazy(() => import("./pages/EndUser/BksStay/Account"));
const BksStaySupport = React.lazy(() => import("./pages/EndUser/BksStay/Support"));
const BksStayChat = React.lazy(() => import("./pages/EndUser/BksStay/Chat"));
const BksStayServices = React.lazy(() => import("./pages/EndUser/BksStay/InStayServices.tsx"));
const BksStayContracts = React.lazy(() => import("./pages/EndUser/BksStay/Contracts.tsx"));
const BksStayContractDetail = React.lazy(() => import("./pages/EndUser/BksStay/ContractDetail.tsx"));
const BksStayLogin = React.lazy(() => import("./pages/EndUser/BksStay/Login"));
const BksStayForceChangePassword = React.lazy(() => import("./pages/EndUser/BksStay/ForceChangePassword"));
const BksStayGuide = React.lazy(() => import("./pages/EndUser/BksStay/StayGuide"));

// Partner Routes
const PartnerLayout = React.lazy(() => import("./pages/Partner/PartnerLayout"));
const PartnerDashboard = React.lazy(() => import("./pages/Partner/Dashboard"));
const PartnerProperties = React.lazy(() => import("./pages/Partner/Properties"));
const PartnerUnits = React.lazy(() => import("./pages/Partner/Units"));
const PartnerBookings = React.lazy(() => import("./pages/Partner/Bookings"));
const PartnerServices = React.lazy(() => import("./pages/Partner/Services.tsx"));
const PartnerAmenities = React.lazy(() => import("./pages/Partner/Amenities.tsx"));
const PartnerNews = React.lazy(() => import("./pages/Partner/News.tsx"));
const PartnerMaintenances = React.lazy(() => import("./pages/Partner/Maintenances"));
const PartnerFinance = React.lazy(() => import("./pages/Partner/Finance/index.tsx"));
const PartnerPropertyRooms = React.lazy(() => import("./pages/Partner/PropertyRooms"));
const PartnerContracts = React.lazy(() => import("./pages/Partner/Contracts"));
const PartnerContractDetail = React.lazy(() => import("./pages/Partner/ContractDetail"));
const PartnerRoomDetail = React.lazy(() => import("./pages/Partner/RoomDetail"));
const PartnerLogin = React.lazy(() => import("./pages/Partner/Login/index"));
const PartnerStayServices = React.lazy(() => import("./pages/Partner/StayServiceManagement"));
const PartnerCalendar = React.lazy(() => import("./pages/Partner/Calendar"));
const PartnerCancellationRequests = React.lazy(() => import("./pages/Partner/CancellationRequests"));
const PartnerPriceRules = React.lazy(() => import("./pages/Partner/PriceRules"));
const PartnerChat = React.lazy(() => import("./pages/Partner/Chat"));
const PartnerReports = React.lazy(() => import("./pages/Partner/Reports"));
const PartnerNotifications = React.lazy(() => import("./pages/Partner/Notifications"));
const PartnerProfile = React.lazy(() => import("./pages/Partner/Profile"));
const PartnerOnboardingWrapper = React.lazy(() => import("./pages/Partner/PartnerOnboardingWizardWrapper"));

const LoadingFallback = () => (
  <LoadingScreen />
);

const BksStayRouteGuard = ({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) => {
  if (!isBksStayRouteEnabled(path)) {
    return <Navigate to={ROUTERS.BKS_STAY_DASHBOARD} replace />;
  }
  return <>{children}</>;
};

/** Role from zustand or persisted `user` (hydration-safe). */
function getEffectiveRole(userRole: string): string {
  let role = (userRole || "").toLowerCase();
  if (!role) {
    const persistedData = localStorage.getItem("user");
    if (persistedData) {
      try {
        const parsed = JSON.parse(persistedData) as { state?: { userRole?: string } };
        role = (parsed?.state?.userRole || "").toLowerCase();
      } catch {
        // ignore
      }
    }
  }
  return role;
}

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useCheckTokenStore();
  const userRole = useUserStore((state) => state.userRole);
  const isAuthenticated = !!token && !isTokenExpired(token);

  if (!isAuthenticated) {
    return <Navigate to={ROUTERS.LOGIN} replace />;
  }

  const role = getEffectiveRole(userRole);
  if (role === PERMISSIONS.ADMIN) {
    return <>{children}</>;
  }
  if (role === PERMISSIONS.PARTNER) {
    return <Navigate to="/partner/dashboard" replace />;
  }
  if (role === PERMISSIONS.USER) {
    return <Navigate to={ROUTERS.BKS_STAY_DASHBOARD} replace />;
  }
  return <Navigate to={ROUTERS.LOGIN} replace />;
};

const PartnerPrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const userRole = useUserStore((state) => state.userRole);
  const token = getAccessToken();
  
  let role = (userRole || '').toLowerCase();
  if (!role) {
    const persistedData = localStorage.getItem('user');
    if (persistedData) {
      try {
        const parsed = JSON.parse(persistedData);
        role = (parsed?.state?.userRole || '').toLowerCase();
      } catch {
        // ignore error
      }
    }
  }

  const isAuthenticated = !!token && !isTokenExpired(token) && role === 'partner';

  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTERS.PARTNER_LOGIN} replace />;
};

const StayPrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAccessToken();
  const userEmail = useUserStore((state) => state.userEmail);
  const location = useLocation();

  // Fallback to localStorage to prevent redirection during hydration
  let email = userEmail;
  if (!email) {
    const persistedData = localStorage.getItem('user');
    if (persistedData) {
      try {
        const parsed = JSON.parse(persistedData);
        email = parsed?.state?.userEmail || '';
      } catch {
        // ignore
      }
    }
  }

  const isAuthenticated = !!token && !!email && !isTokenExpired(token);

  return isAuthenticated ? <>{children}</> : <Navigate to="/bks-stay/login" state={{ from: location }} replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const userEmail = useUserStore((state) => state.userEmail);
  const userRole = useUserStore((state) => state.userRole);
  const logout = useUserStore((state) => state.logout);
  const [token, setToken] = useState<string | null>(getAccessToken());
  const location = useLocation();

  useEffect(() => {
    const currentToken = getAccessToken();
    setToken(currentToken);

    if (currentToken && isTokenExpired(currentToken)) {
      logout();
      setToken(null);
      return;
    }
  }, [userEmail, logout]);

  const isAuthenticated = !!token && !isTokenExpired(token);

  if (isAuthenticated) {
    const role = getEffectiveRole(userRole);

    if (role === PERMISSIONS.PARTNER && location.pathname === ROUTERS.PARTNER_LOGIN) {
      return <Navigate to="/partner/dashboard" replace />;
    }
    if (
      role === PERMISSIONS.ADMIN &&
      location.pathname === ROUTERS.LOGIN
    ) {
      return <Navigate to={ROUTERS.CONTROL} replace />;
    }
  }

  return <>{children}</>;
};

export default function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public landing page wrapped with public layout */}
        <Route
          element={
            <Suspense fallback={<LoadingFallback />}>
              <PublicLayout />
            </Suspense>
          }
        >
          <Route path={ROUTERS.HOME} element={<Home />} />
          <Route path={ROUTERS.PARTNERS} element={<PartnerList />} />
          <Route path={ROUTERS.PARTNER_DETAIL} element={<PartnerDetail />} />
          <Route path={ROUTERS.SEARCH_ROOMS} element={<RoomSearch />} />
          <Route path={ROUTERS.SEARCH_ROOMS_BY_PROVINCE} element={<RoomByProvince />} />
          <Route path={ROUTERS.PUBLIC_ROOM_DETAIL} element={<PublicRoomDetail />} />
          <Route path={ROUTERS.MY_BOOKINGS} element={<MyBookings />} />
          <Route path={ROUTERS.BOOKING_SUCCESS} element={<BookingSuccess />} />
          <Route path={`${ROUTERS.BOOKING}/:roomId`} element={<Booking />} />
          <Route path={ROUTERS.COMPANY_HUB} element={<CompanyHub />} />
          <Route path={ROUTERS.PUBLIC_NEWS_DETAIL} element={<PublicNewsDetail />} />
          <Route path={ROUTERS.PUBLIC_NEWS_LIST} element={<PublicNewsList />} />
          <Route path={ROUTERS.PUBLIC_FAQ} element={<PublicFaq />} />
        </Route>

        {/* BKS Stay Standalone Portal */}
        <Route
          path={ROUTERS.BKS_STAY}
          element={
            <StayPrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <BksStayLayout />
              </Suspense>
            </StayPrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BksStayDashboard />} />
          <Route path="bookings" element={<BksStayHistory />} />
          <Route path="bookings/:id" element={<BksStayDetail />} />
          <Route path="bookings/:id/voucher" element={<StayVoucher />} />
          <Route path="account" element={<BksStayAccount />} />
          <Route path="support" element={<BksStayRouteGuard path={ROUTERS.BKS_STAY_SUPPORT}><BksStaySupport /></BksStayRouteGuard>} />
          <Route path="chat" element={<BksStayChat />} />
          <Route path="services" element={<BksStayRouteGuard path={ROUTERS.BKS_STAY_SERVICES}><BksStayServices /></BksStayRouteGuard>} />
          <Route path="contracts" element={<BksStayRouteGuard path={ROUTERS.BKS_STAY_CONTRACTS}><BksStayContracts /></BksStayRouteGuard>} />
          <Route path="contracts/:id" element={<BksStayRouteGuard path={ROUTERS.BKS_STAY_CONTRACTS}><BksStayContractDetail /></BksStayRouteGuard>} />
          <Route path="guide" element={<BksStayRouteGuard path={ROUTERS.BKS_STAY_GUIDE}><BksStayGuide /></BksStayRouteGuard>} />
        </Route>

        {/* Guest Auth Routes - Standalone */}
        <Route path="/bks-stay/login" element={<BksStayLogin />} />
        <Route path="/bks-stay/force-change-password" element={<BksStayForceChangePassword />} />

        {/* Public Routes */}
        <Route
          path={ROUTERS.LOGIN}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTERS.REGISTER}
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTERS.BECOME_PARTNER}
          element={
            <PublicRoute>
              <BecomeAPartner />
            </PublicRoute>
          }
        />

        <Route
          path={`${ROUTERS.VERIFY_EMAIL}/:token`}
          element={
            <PublicRoute>
              <VerifyEmailToken />
            </PublicRoute>
          }
        />

        <Route
          path={`${ROUTERS.SET_PASSWORD}/:token`}
          element={<SetPassword />}
        />

        <Route
          path={ROUTERS.RESET_TOKEN_SUCCESS}
          element={
            <PublicRoute>
              <ResetTokenSuccess />
            </PublicRoute>
          }
        />

        {/* Forgot & Reset Password */}
        <Route element={<AuthImageOutlet imageSrc="/assets/images/stxtjmyzfkmfm4vmodcg.webp" />}>
          <Route
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AuthLayout />
              </Suspense>
            }
          >
            <Route path={ROUTERS.FORGOT_PASSWORD} element={<ForgotPassword />} />
          </Route>
        </Route>
        <Route element={<AuthImageOutlet imageSrc="/assets/images/djyak3u4uxpho4rm4lig.webp" />}>
          <Route
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AuthLayout />
              </Suspense>
            }
          >
            <Route path={`${ROUTERS.RESET_PASSWORD}/:token`} element={<ResetPassword />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route
          element={
            <PrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Layout />
              </Suspense>
            </PrivateRoute>
          }
        >
          <Route path={ROUTERS.CONTROL} element={<Dashboard />} />
          <Route path={ROUTERS.BOOKING_MANAGE} element={<BookingManage />} />
          <Route path={ROUTERS.PROPERTIES} element={<Properties />} />
          <Route path={ROUTERS.PROPERTIES_ADD} element={<PropertiesAdd />} />
          <Route path={`${ROUTERS.PROPERTIES_EDIT}/:action/:property_id`} element={<PropertyEdit />} />
          <Route path={`${ROUTERS.PROPERTIES_EDIT_IMAGES}/:action/:property_id`} element={<PropertyEditImages />} />
          <Route path={`${ROUTERS.PROPERTIES_DETAIL}/:propertyId/images`} element={<PropertyImageManager />} />
          <Route path={ROUTERS.ROOMS} element={<Rooms />} />
          <Route path={ROUTERS.ROOMS_ADD} element={<RoomAdd />} />
          <Route path={`${ROUTERS.ROOMS_DETAIL}/:id`} element={<RoomDetail />} />
          <Route path={`${ROUTERS.ROOMS_DETAIL}/:roomId/images`} element={<RoomImageManager />} />
          <Route path={`${ROUTERS.ROOMS_EDIT}/:id`} element={<RoomUpdate />} />
          <Route path={ROUTERS.USER_MANAGEMENT} element={<UserManagement />} />
          <Route path={`${ROUTERS.USER_DETAIL}/:id`} element={<UserDetail />} />
          <Route path={`${ROUTERS.USER_EDIT}/:id`} element={<UserEdit />} />
          <Route path={ROUTERS.PROVINCE_MANAGE} element={<ProvinceManage />} />
          <Route path={`${ROUTERS.PROVINCE_DETAIL}/:id`} element={<ProvinceDetail />} />
          <Route path={ROUTERS.AMENITY_MANAGEMENT} element={<AmenityManagement />} />
          <Route path={ROUTERS.QUESTION_MANAGEMENT} element={<QuestionManagement />} />
          <Route path={ROUTERS.QUESTION_CREATE} element={<QuestionCreate />} />
          <Route path={ROUTERS.QUESTION_UPDATE} element={<QuestionUpdate />} />
          <Route path={ROUTERS.QUESTION_DETAIL} element={<QuestionDetail />} />
          <Route path={ROUTERS.QUESTION_FLOW} element={<QuestionFlow />} />
          <Route path={`${ROUTERS.PROPERTIES_DETAIL}/:property_id`} element={<PropertyDetail />} />
          <Route path={ROUTERS.SERVICE_MANAGEMENT} element={<ServiceManagement />} />
          <Route path={ROUTERS.NEWS} element={<News />} />
          <Route path={`${ROUTERS.NEWS_DETAIL}/:id`} element={<NewsDetail />} />
          <Route path={ROUTERS.NEWS_EDIT + "/:id"} element={<NewsEdit />} />
          <Route path={ROUTERS.NEWS_ADD} element={<NewsAdd />} />
          <Route path={ROUTERS.NEWSLETTER_MANAGEMENT} element={<NewsletterManagement />} />
          <Route path={ROUTERS.PARTNER_MANAGEMENT} element={<PartnerManagement />} />
          <Route path={ROUTERS.PARTNER_APPROVAL} element={<PartnerApproval />} />
          <Route path={`${ROUTERS.PARTNER_MANAGEMENT}/detail/:id`} element={<PartnerDetailManager />} />
          <Route path={`${ROUTERS.PARTNER_MANAGEMENT}/edit/:id`} element={<PartnerEditManager />} />
          <Route path={ROUTERS.PARTNER_SETTLEMENTS} element={<SettlementManage />} />
          <Route path={ROUTERS.PARTNER_SETTLEMENT_DETAIL} element={<SettlementDetail />} />
        </Route>


        {/* Partner Onboarding - Standalone (for status 3: pending approval, 4: rejected) */}
        <Route
          path="/partner/onboarding"
          element={
            <PartnerPrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <PartnerOnboardingWrapper />
              </Suspense>
            </PartnerPrivateRoute>
          }
        />

        {/* Partner Login */}
        <Route
          path={ROUTERS.PARTNER_LOGIN}
          element={
            <PublicRoute>
              <PartnerLogin />
            </PublicRoute>
          }
        />

        {/* Partner Protected Routes */}
        <Route
          path="/partner"
          element={
            <PartnerPrivateRoute>
              <Suspense fallback={<LoadingFallback />}>
                <PartnerLayout />
              </Suspense>
            </PartnerPrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route path="units" element={<PartnerUnits />} />
          <Route path="properties" element={<PartnerProperties />} />
          <Route path="bookings" element={<PartnerBookings />} />
          <Route path="cancellation-requests" element={<PartnerCancellationRequests />} />
          <Route path="catalog" element={<Navigate to={ROUTERS.PARTNER_CATALOG_SERVICES} replace />} />
          <Route path="catalog/:tab" element={<PartnerServices />} />
          <Route path="services" element={<Navigate to={ROUTERS.PARTNER_CATALOG_SERVICES} replace />} />
          <Route path="amenities" element={<PartnerAmenities />} />
          <Route path="finance" element={<PartnerFinance />} />
          <Route path="news" element={<PartnerNews />} />
          <Route path="maintenances" element={<PartnerMaintenances />} />
          <Route path="contracts" element={<PartnerContracts />} />
          <Route path="contracts/:id" element={<PartnerContractDetail />} />
          <Route path="stay-services" element={<PartnerStayServices />} />
          <Route
            path="calendar"
            element={
              isPartnerCalendarEnabled() ? (
                <PartnerCalendar />
              ) : (
                <Navigate to={ROUTERS.PARTNER_BOOKINGS} replace />
              )
            }
          />
          <Route path="price-rules" element={<PartnerPriceRules />} />
          <Route path="chat" element={<PartnerChat />} />
          <Route path="reports" element={<PartnerReports />} />
          <Route path="notifications" element={<PartnerNotifications />} />
          <Route path="profile" element={<PartnerProfile />} />
          <Route path="properties/:propertyId/rooms" element={<PartnerPropertyRooms />} />
          <Route path="rooms/:roomId" element={<PartnerRoomDetail />} />
        </Route>

        {/* 404 - Redirect to Login */}
        <Route path={ROUTERS.NOT_FOUND} element={<Navigate to={ROUTERS.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTERS.LOGIN} replace />} />
      </Routes>
    </Suspense>
  );
}

