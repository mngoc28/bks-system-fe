import React, { Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import AuthImageOutlet from "./components/layout/AuthImageOutlet";
import { ROUTERS } from "./constant";
import { useCheckTokenStore } from "./store/useCheckTokenStore";
import { useUserStore } from "./store/useUserStore";
import { getAccessToken } from "./utils/storage";
import { isTokenExpired } from "./utils/tokenUtils";

const Layout = React.lazy(() => import("./components/layout"));
const AuthLayout = React.lazy(() => import("./components/layout/AuthLayout"));
const Home = React.lazy(() => import("./pages/Admin/Home"));
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
const Login = React.lazy(() => import("./pages/Admin/Login"));
const Register = React.lazy(() => import("./pages/Admin/Register"));
const CompanyHub = React.lazy(() => import("./pages/Admin/CompanyHub"));
const Dashboard = React.lazy(() => import("./pages/Admin/Dashboard"));
const Buildings = React.lazy(() => import("./pages/Admin/BuildingManager"));
const BookingManage = React.lazy(() => import("./pages/Admin/BookingManage"));
const BuildingsAdd = React.lazy(() => import("./pages/Admin/BuildingsAdd"));
const BuildingEdit = React.lazy(() => import("./pages/Admin/BuildingEdit"));
const BuildingDetail = React.lazy(() => import("./pages/Admin/BuildingDetail"));
const BuildingEditImages = React.lazy(() => import("./pages/Admin/BuildingEdit"));
const Rooms = React.lazy(() => import("./pages/Admin/RoomManager"));
const RoomAdd = React.lazy(() => import("./pages/Admin/RoomAdd"));
const RoomDetail = React.lazy(() => import("./pages/Admin/RoomDetail"));
const RoomImageManager = React.lazy(() => import("./pages/Admin/RoomImageManager"));
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
const PartnerManagement = React.lazy(() => import("./pages/Admin/PartnerManagement"));
const PartnerDetailManager = React.lazy(() => import("./pages/Admin/PartnerDetail"));
const PartnerEditManager = React.lazy(() => import("./pages/Admin/PartnerEdit"));
const Booking = React.lazy(() => import("./pages/EndUser/Booking/BookingPage"));

// BKS Stay Portal
const BksStayLayout = React.lazy(() => import("./pages/EndUser/BksStay/BksStayLayout"));
const BksStayDashboard = React.lazy(() => import("./pages/EndUser/BksStay/Dashboard"));
const BksStayHistory = React.lazy(() => import("./pages/EndUser/BksStay/History"));
const BksStayDetail = React.lazy(() => import("./pages/EndUser/BksStay/BookingDetail"));
const BksStayAccount = React.lazy(() => import("./pages/EndUser/BksStay/Account"));
const BksStaySupport = React.lazy(() => import("./pages/EndUser/BksStay/Support"));
const BksStayServices = React.lazy(() => import("./pages/EndUser/BksStay/InStayServices.tsx"));
const BksStayContracts = React.lazy(() => import("./pages/EndUser/BksStay/Contracts.tsx"));
const BksStayContractDetail = React.lazy(() => import("./pages/EndUser/BksStay/ContractDetail.tsx"));
const BksStayLogin = React.lazy(() => import("./pages/EndUser/BksStay/Login"));
const BksStayForceChangePassword = React.lazy(() => import("./pages/EndUser/BksStay/ForceChangePassword"));

// Partner Routes
const PartnerLayout = React.lazy(() => import("./pages/Partner/PartnerLayout"));
const PartnerDashboard = React.lazy(() => import("./pages/Partner/Dashboard"));
const PartnerProperties = React.lazy(() => import("./pages/Partner/Properties"));
const PartnerBookings = React.lazy(() => import("./pages/Partner/Bookings"));
const PartnerServices = React.lazy(() => import("./pages/Partner/Services.tsx"));
const PartnerAmenities = React.lazy(() => import("./pages/Partner/Amenities.tsx"));
const PartnerNews = React.lazy(() => import("./pages/Partner/News.tsx"));
const PartnerMaintenances = React.lazy(() => import("./pages/Partner/Maintenances"));
const PartnerLogin = React.lazy(() => import("./pages/Partner/Login/index"));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="size-12 animate-spin rounded-full border-y-2 border-blue-500"></div>
  </div>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useCheckTokenStore();
  const isAuthenticated = !!token && !isTokenExpired(token);

  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTERS.LOGIN} replace />;
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
      } catch (e) {}
    }
  }

  const isAuthenticated = !!token && !isTokenExpired(token) && role === 'partner';

  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTERS.PARTNER_LOGIN} replace />;
};

const StayPrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAccessToken();
  const isAuthenticated = !!token && !isTokenExpired(token);

  return isAuthenticated ? <>{children}</> : <Navigate to="/bks-stay/login" replace />;
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
    // Get role from store or fallback to localStorage to prevent hydration race condition
    let role = (userRole || '').toLowerCase();
    
    if (!role) {
      const persistedData = localStorage.getItem('user');
      if (persistedData) {
        try {
          const parsed = JSON.parse(persistedData);
          role = (parsed?.state?.userRole || '').toLowerCase();
        } catch (e) {
          console.error("Error parsing user state", e);
        }
      }
    }

    // if is partner and try to access /partner/login -> redirect to /partner/dashboard
    if (role === 'partner' && location.pathname === ROUTERS.PARTNER_LOGIN) {
      return <Navigate to="/partner/dashboard" replace />;
    }
    // if is admin (or other role)  and try to login admin page -> redirect to /admin/dashboard
    if (role !== 'partner' && location.pathname === ROUTERS.LOGIN) {
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
          <Route path="account" element={<BksStayAccount />} />
          <Route path="support" element={<BksStaySupport />} />
          <Route path="services" element={<BksStayServices />} />
          <Route path="contracts" element={<BksStayContracts />} />
          <Route path="contracts/:id" element={<BksStayContractDetail />} />
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
          <Route path={ROUTERS.BUILDINGS} element={<Buildings />} />
          <Route path={ROUTERS.BUILDINGS_ADD} element={<BuildingsAdd />} />
          <Route path={`${ROUTERS.BUILDINGS_EDIT}/:action/:user_id/:building_id`} element={<BuildingEdit />} />
          <Route path={`${ROUTERS.BUILDINGS_EDIT_IMAGES}/:action/:user_id/:building_id`} element={<BuildingEditImages />} />
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
          <Route path={`${ROUTERS.BUILDINGS_DETAIL}/:user_id/:building_id`} element={<BuildingDetail />} />
          <Route path={ROUTERS.SERVICE_MANAGEMENT} element={<ServiceManagement />} />
          <Route path={ROUTERS.NEWS} element={<News />} />
          <Route path={`${ROUTERS.NEWS_DETAIL}/:id`} element={<NewsDetail />} />
          <Route path={ROUTERS.NEWS_EDIT + "/:id"} element={<NewsEdit />} />
          <Route path={ROUTERS.NEWS_ADD} element={<NewsAdd />} />
          <Route path={ROUTERS.PARTNER_MANAGEMENT} element={<PartnerManagement />} />
          <Route path={`${ROUTERS.PARTNER_MANAGEMENT}/detail/:id`} element={<PartnerDetailManager />} />
          <Route path={`${ROUTERS.PARTNER_MANAGEMENT}/edit/:id`} element={<PartnerEditManager />} />
        </Route>

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
          <Route path="properties" element={<PartnerProperties />} />
          <Route path="bookings" element={<PartnerBookings />} />
          <Route path="services" element={<PartnerServices />} />
          <Route path="amenities" element={<PartnerAmenities />} />
          <Route path="news" element={<PartnerNews />} />
          <Route path="maintenances" element={<PartnerMaintenances />} />
        </Route>

        {/* 404 - Redirect to Login */}
        <Route path={ROUTERS.NOT_FOUND} element={<Navigate to={ROUTERS.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTERS.LOGIN} replace />} />
      </Routes>
    </Suspense>
  );
}
