import Header from "@/components/Header";
import { ROUTERS } from "@/constant";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { MenuItem } from "@/shared/types";
import { BotIcon, Building2, Calendar, Cog, DoorOpen, Handshake, House, MapPinned, Newspaper, Users2, Wrench, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import ClassSidebar from "../ClassSidebar";

// Mock class info
const classInfo = {
  name: "ADMIN",
  acronym: "BKS",
};

const Layout = () => {
  useTokenRefresh();
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Current layout is only for Admin/Manager, so we set all permissions
    setPermissions(new Set([
      "dashboard:view",
      "properties:view",
      "rooms:view",
      "user-management:view",
      "booking:view",
      "amenities:view",
      "province-manage:view",
      "question-management:view",
      "service-management:view",
      "news:view",
      "partner-management:view",
    ]));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const menuItems: MenuItem[] = [
    {
      id: "header-general",
      isHeader: true,
      label: t("menu.header_general"),
      permissionKey: "dashboard:view",
    },
    {
      id: "dashboard",
      permissionKey: "dashboard:view",
      label: t("menu.dashboard"),
      path: ROUTERS.CONTROL,
      icon: <House />,
    },
    {
      id: "header-system",
      isHeader: true,
      label: t("menu.header_system"),
      permissionKey: "partner-management:view",
    },
    {
      id: "partner-information",
      permissionKey: "partner-management:view",
      label: t("menu.partner"),
      path: ROUTERS.PARTNER_MANAGEMENT,
      icon: <Handshake />,
    },
    {
      id: "partner-approval",
      permissionKey: "partner-management:view",
      label: t("menu.partner_approval", { defaultValue: "Duyệt đối tác" }),
      path: ROUTERS.PARTNER_APPROVAL,
      icon: <ShieldCheck />,
    },
    {
      id: "properties",
      permissionKey: "properties:view",
      label: t("menu.properties"),
      path: ROUTERS.PROPERTIES,
      icon: <Building2 />,
    },
    {
      id: "rooms",
      permissionKey: "rooms:view",
      label: t("menu.rooms"),
      path: ROUTERS.ROOMS,
      icon: <DoorOpen />,
    },
    {
      id: "bookings",
      permissionKey: "booking:view",
      label: t("menu.bookings"),
      path: ROUTERS.BOOKING_MANAGE,
      icon: <Calendar />,
    },
    {
      id: "amenities",
      permissionKey: "amenities:view",
      label: t("menu.amenities"),
      path: ROUTERS.AMENITY_MANAGEMENT,
      icon: <Wrench />,
    },
    {
      id: "service-management",
      permissionKey: "service-management:view",
      label: t("menu.service"),
      path: ROUTERS.SERVICE_MANAGEMENT,
      icon: <Cog />,
    },
    {
      id: "news-management",
      permissionKey: "news:view",
      label: t("menu.news"),
      path: ROUTERS.NEWS,
      icon: <Newspaper />,
    },
    {
      id: "province-manage",
      permissionKey: "province-manage:view",
      label: t("menu.province-management"),
      path: ROUTERS.PROVINCE_MANAGE,
      icon: <MapPinned className="size-5" />,
    },
    {
      id: "question-management",
      permissionKey: "question-management:view",
      label: t("menu.chatbot", { defaultValue: "Chatbot" }),
      path: ROUTERS.QUESTION_MANAGEMENT,
      icon: <BotIcon className="size-5" />,
    },
    {
      id: "user-management",
      permissionKey: "user-management:view",
      label: t("menu.user-management"),
      path: ROUTERS.USER_MANAGEMENT,
      icon: <Users2 />,
    },
  ];

  // get page title from path name
  const getpageTitle = (pathName: string) => {
    if (pathName.includes(ROUTERS.CONTROL)) {
      return t("dashboard.title");
    }
    if (pathName.includes(ROUTERS.PROPERTIES)) {
      return t("properties.title");
    }
    if (pathName.includes(ROUTERS.ROOMS)) {
      return t("rooms.title");
    }
    if (pathName.includes(ROUTERS.BOOKING_MANAGE)) {
      return t("menu.bookings");
    }
    if (pathName.includes(ROUTERS.AMENITY_MANAGEMENT)) {
      return t("menu.amenities");
    }
    if (pathName.includes(ROUTERS.QUESTION_MANAGEMENT)) {
      return t("menu.chatbot", { defaultValue: "Questions" });
    }
    if (pathName.includes(ROUTERS.USER_MANAGEMENT)) {
      return t("menu.users");
    }
    if (pathName.includes(ROUTERS.NEWS)) {
      return t("menu.news");
    }
    if (pathName.includes(ROUTERS.PROVINCE_MANAGE) || pathName.includes(ROUTERS.PROVINCE_DETAIL)) {
      return t("menu.province-management");
    }
    if (pathName.includes(ROUTERS.SERVICE_MANAGEMENT)) {
      return t("menu.service");
    }
    if (pathName.includes(ROUTERS.PARTNER_APPROVAL)) {
      return t("menu.partner_approval", { defaultValue: "Phê duyệt đối tác" });
    }
    if (pathName.includes(ROUTERS.PARTNER_MANAGEMENT)  || pathName.includes(ROUTERS.PARTNER_DETAIL) || pathName.includes(ROUTERS.PARTNER_EDIT)) {
      return t("menu.partner");
    }
    return t("menu.dashboard");
  };

  /**
   * Recursively filters menu items based on permissions.
   * @param menuItems The menu items to filter.
   * @param permissions The set of allowed permission keys.
   */
  const filterMenuItemsByPermissions = (menuItems: MenuItem[], permissions: Set<string>): MenuItem[] =>
    menuItems
      .filter((item) => item.permissionKey && permissions.has(item.permissionKey))
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuItemsByPermissions(item.children, permissions) : undefined,
      }))
      .filter((item) => !item.children || item.children.length > 0);
  const filteredMenuItems = filterMenuItemsByPermissions(menuItems, permissions);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <main className="flex flex-1 overflow-hidden">
        <ClassSidebar
          classInfo={classInfo}
          menuItems={filteredMenuItems}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header pageTitle={getpageTitle(location.pathname)} />
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default Layout;

