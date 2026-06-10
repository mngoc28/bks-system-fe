import Header from "@/components/Header";
import { ROUTERS } from "@/constant";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { MenuItem } from "@/shared/types";
import { BotIcon, Building2, Calendar, Cog, DoorOpen, Handshake, House, MapPinned, Newspaper, Users2, Wrench, ShieldCheck, CircleDollarSign, Mail } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { useLocation } from "react-router-dom";
import { isRouteActive } from "@/lib/utils";
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
      "partner-settlement:view",
      "newsletter-management:view",
    ]));
    setIsLoading(false);
  }, []);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        id: "group-operations",
        label: t("menu.group_operations", { defaultValue: "Vận hành" }),
        icon: <House />,
        defaultCollapsed: false,
        children: [
          {
            id: "dashboard",
            permissionKey: "dashboard:view",
            label: t("menu.dashboard"),
            path: ROUTERS.CONTROL,
            icon: <House />,
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
            label: t("menu.partner_approval"),
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
            id: "settlements",
            permissionKey: "partner-settlement:view",
            label: t("menu.settlements"),
            path: ROUTERS.PARTNER_SETTLEMENTS,
            icon: <CircleDollarSign />,
          },
        ],
      },
      {
        id: "group-content",
        label: t("menu.group_content", { defaultValue: "Danh mục & Nội dung" }),
        icon: <Newspaper />,
        defaultCollapsed: true,
        children: [
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
            id: "province-manage",
            permissionKey: "province-manage:view",
            label: t("menu.province-management"),
            path: ROUTERS.PROVINCE_MANAGE,
            icon: <MapPinned className="size-5" />,
          },
          {
            id: "news-management",
            permissionKey: "news:view",
            label: t("menu.news"),
            path: ROUTERS.NEWS,
            icon: <Newspaper />,
          },
          {
            id: "question-management",
            permissionKey: "question-management:view",
            label: t("menu.chatbot"),
            path: ROUTERS.QUESTION_MANAGEMENT,
            icon: <BotIcon className="size-5" />,
          },
          {
            id: "newsletter-management",
            permissionKey: "newsletter-management:view",
            label: t("menu.coupon_registration"),
            path: ROUTERS.NEWSLETTER_MANAGEMENT,
            icon: <Mail />,
          },
        ],
      },
      {
        id: "group-system",
        label: t("menu.group_system", { defaultValue: "Hệ thống" }),
        icon: <Users2 />,
        defaultCollapsed: false,
        children: [
          {
            id: "user-management",
            permissionKey: "user-management:view",
            label: t("menu.user-management"),
            path: ROUTERS.USER_MANAGEMENT,
            icon: <Users2 />,
          },
        ],
      },
    ],
    [t],
  );

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

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
    if (isRouteActive(pathName, ROUTERS.NEWSLETTER_MANAGEMENT)) {
      return t("menu.coupon_registration");
    }
    if (isRouteActive(pathName, ROUTERS.NEWS)) {
      return t("menu.news");
    }
    if (pathName.includes(ROUTERS.PROVINCE_MANAGE) || pathName.includes(ROUTERS.PROVINCE_DETAIL)) {
      return t("menu.province-management");
    }
    if (pathName.includes(ROUTERS.SERVICE_MANAGEMENT)) {
      return t("menu.service");
    }
    if (pathName.includes(ROUTERS.PARTNER_APPROVAL)) {
      return t("menu.partner_approval");
    }
    if (pathName.includes(ROUTERS.PARTNER_SETTLEMENTS)) {
      return t("menu.settlements");
    }
    if (pathName.includes(ROUTERS.PARTNER_MANAGEMENT)  || pathName.includes(ROUTERS.PARTNER_DETAIL) || pathName.includes(ROUTERS.PARTNER_EDIT)) {
      return t("menu.partner");
    }
    return t("menu.dashboard");

  };

  const stripOrphanMenuHeaders = (items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];

      if (!item.isHeader) {
        result.push(item);
        continue;
      }

      const hasFollowingItem = items.slice(index + 1).some((nextItem) => {
        if (nextItem.isHeader) {
          return false;
        }

        return true;
      });

      if (hasFollowingItem) {
        result.push(item);
      }
    }

    return result;
  };

  /**
   * Recursively filters menu items based on permissions.
   * @param menuItems The menu items to filter.
   * @param permissions The set of allowed permission keys.
   */
  const filterMenuItemsByPermissions = (items: MenuItem[], allowed: Set<string>): MenuItem[] => {
    const filteredItems = items
      .map((item) => {
        if (item.isHeader) {
          return item;
        }
        if (item.children?.length) {
          const children = filterMenuItemsByPermissions(item.children, allowed);
          if (children.length === 0) {
            return null;
          }
          return { ...item, children };
        }
        if (!item.permissionKey || !allowed.has(item.permissionKey)) {
          return null;
        }
        return item;
      })
      .filter((item): item is MenuItem => item !== null);

    return stripOrphanMenuHeaders(filteredItems);
  };

  const filteredMenuItems = filterMenuItemsByPermissions(menuItems, permissions);

  return (
    <div className="admin-shell flex h-screen flex-col overflow-hidden">
      <main className="flex flex-1 overflow-hidden">
        <ClassSidebar
          classInfo={classInfo}
          menuItems={filteredMenuItems}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header pageTitle={getpageTitle(location.pathname)} />
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
            <div className="mx-auto w-full max-w-[1600px] space-y-5">
              {/* fallback=null: tránh 2 spinner (suspense + trang con); trang con tự hiển thị loader */}
              <Suspense fallback={null}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

