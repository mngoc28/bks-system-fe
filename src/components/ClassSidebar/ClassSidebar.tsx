import { ClassSidebarProps, MenuItem } from "@/components/type";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { adminTheme } from "@/lib/adminTheme";
import { cn, isRouteActive } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const { sidebar: s } = adminTheme;
const SIDEBAR_GROUPS_STORAGE_KEY = "admin_sidebar_groups";

const buildDefaultOpenMenus = (items: MenuItem[]): Record<string, boolean> => {
  const defaults: Record<string, boolean> = {};
  items.forEach((item) => {
    if (item.children?.length) {
      defaults[item.id] = item.defaultCollapsed !== true;
    }
  });
  return defaults;
};

const ClassSidebar: React.FC<ClassSidebarProps> = ({ className, classInfo, menuItems, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_GROUPS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as Record<string, boolean>;
      }
    } catch {
      // ignore parse errors
    }
    return buildDefaultOpenMenus(menuItems);
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(!isCollapsed);
  const initRef = React.useRef(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      setShowLabels(!isCollapsed);
      return;
    }

    if (isCollapsed) {
      setShowLabels(false);
      return;
    }

    setShowLabels(false);
    const timer = window.setTimeout(() => setShowLabels(true), 180);

    return () => window.clearTimeout(timer);
  }, [isCollapsed]);

  React.useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_GROUPS_STORAGE_KEY, JSON.stringify(openMenus));
    } catch {
      // ignore quota errors
    }
  }, [openMenus]);

  const handleToggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderBadge = (count?: number, compact?: boolean) => {
    if (count == null || count <= 0) {
      return null;
    }
    const label = count > 99 ? "99+" : String(count);
    if (compact) {
      return (
        <span
          className="absolute right-2 top-2 size-2 rounded-full bg-red-500"
          aria-label={label}
        />
      );
    }
    return (
      <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
        {label}
      </span>
    );
  };

  const handleMobileMenuIconClick = (item: MenuItem) => {
    if (item.children?.length) {
      setIsSheetOpen(true);
    }
  };

  const navRowClasses = (isActive: boolean, compact?: boolean) =>
    cn(
      "relative flex w-full items-center rounded-lg transition-colors",
      compact
        ? cn(s.navItemCompact, "text-white/70 hover:bg-white/10")
        : cn(s.navItem, "min-h-11 gap-3 px-3 py-2.5"),
      isActive && s.navItemActive,
    );

  const resolveGroupOpen = (item: MenuItem): boolean => {
    if (openMenus[item.id] !== undefined) {
      return openMenus[item.id];
    }
    return item.defaultCollapsed !== true;
  };

  const renderMenuItem = (item: MenuItem, options: { isMobileView?: boolean; collapsed?: boolean } = {}) => {
    const isMobileView = options.isMobileView ?? false;
    const collapsed = options.collapsed ?? false;
    const compact = isMobileView || collapsed;
    const isActive = Boolean(item.path && isRouteActive(location.pathname, item.path));
    const hasChildren = !!item.children?.length;
    const isOpen = hasChildren ? resolveGroupOpen(item) : false;

    if (item.isHeader) {
      if (compact) return <div key={item.id} className={s.divider} />;
      return (
        <li
          key={item.id}
          className={cn(s.sectionTitle, showLabels ? "opacity-100" : "opacity-0")}
        >
          {item.label}
        </li>
      );
    }

    if (hasChildren) {
      return (
        <li key={item.id} className="space-y-1">
          <button
            type="button"
            className={cn(
              navRowClasses(isOpen, compact),
              compact && "justify-center",
            )}
            onClick={() => (compact ? handleMobileMenuIconClick(item) : handleToggleMenu(item.id))}
            aria-expanded={isOpen}
            aria-controls={`submenu-${item.id}`}
            title={item.label}
          >
            <span className={cn(s.navItemIcon, isOpen && s.navItemIconActive)}>{item.icon}</span>
            {!compact && (
              <>
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-left transition-all duration-200 ease-out",
                    showLabels ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    s.navChevron,
                    "transition-opacity duration-200",
                    showLabels ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              </>
            )}
          </button>
          {isOpen && !compact && (
            <ul id={`submenu-${item.id}`} className="ml-3 space-y-1 border-l border-white/10 pl-3">
              {item.children!.map((child) => {
                const isChildActive = Boolean(child.path && isRouteActive(location.pathname, child.path));
                return (
                  <li key={child.id}>
                    <Link
                      to={child.path!}
                      className={cn(
                        s.submenuItem,
                        "min-h-9 gap-2.5 py-1.5 pl-2",
                        isChildActive && s.submenuItemActive,
                      )}
                      onClick={() => {
                        if (isMobile) setIsSheetOpen(false);
                      }}
                    >
                      {isChildActive && <span className={s.activeIndicator} aria-hidden />}
                      <span className={cn(s.navItemIcon, isChildActive && s.navItemIconActive)}>{child.icon}</span>
                      <span className="min-w-0 flex-1 truncate">{child.label}</span>
                      {renderBadge(child.badgeCount)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    if (compact) {
      return (
        <li key={item.id} className="relative">
          <Link
            to={item.path!}
            className={navRowClasses(isActive, true)}
            onClick={() => {
              setOpenMenus({});
              if (compact && !isMobile) {
                setIsSheetOpen(false);
              }
            }}
            title={item.label}
          >
            {isActive && <span className={s.activeIndicator} aria-hidden />}
            <span className={cn(s.navItemIcon, isActive && s.navItemIconActive)}>{item.icon}</span>
            {renderBadge(item.badgeCount, true)}
          </Link>
        </li>
      );
    }

    return (
      <li key={item.id}>
        <Link
          to={item.path!}
          className={navRowClasses(isActive, false)}
          onClick={() => {
            setOpenMenus({});
            if (isMobile) setIsSheetOpen(false);
          }}
        >
          {isActive && <span className={s.activeIndicator} aria-hidden />}
          <span className={cn(s.navItemIcon, isActive && s.navItemIconActive)}>{item.icon}</span>
          <span
            className={cn(
              "min-w-0 flex-1 truncate transition-all duration-200 ease-out",
              showLabels ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
            )}
          >
            {item.label}
          </span>
          {showLabels && renderBadge(item.badgeCount)}
        </Link>
      </li>
    );
  };

  const renderSidebarHeader = (collapsedState = isCollapsed) => (
    <div
      className={cn(
        "flex shrink-0",
        collapsedState ? "flex-col items-center gap-4" : "min-h-10 items-center justify-between gap-2",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className={s.logoBox}>
          <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="size-7 object-contain" />
        </div>
        <span
          className={cn(
            s.brandTitle,
            "leading-none",
            collapsedState ? "hidden" : "text-xl",
            !collapsedState && !showLabels ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100",
          )}
        >
          {classInfo.name.toUpperCase()}
        </span>
      </div>
      {!isMobile && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(s.toggleBtn, "shrink-0 self-center")}
          aria-label={collapsedState ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsedState ? <ChevronRight className="size-4 font-semibold" /> : <ChevronLeft className="size-4 font-semibold" />}
        </button>
      )}
    </div>
  );

  const renderFullSidebar = (collapsedState = isCollapsed) => (
    <div
      className={cn(
        s.root,
        "relative",
        collapsedState ? "w-[72px] px-3 py-6" : "w-[260px] p-6",
        className,
      )}
    >
      {renderSidebarHeader(collapsedState)}
      <nav className="scrollbar-hide mt-4 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item, { collapsed: collapsedState }))}
        </ul>
      </nav>
    </div>
  );

  const renderMobileSidebar = () => (
    <div className={cn(s.root, "relative w-[72px] p-4")}>
      <div className="flex items-center justify-center">
        <div className={s.logoBox}>
          <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="size-7 object-contain" />
        </div>
      </div>
      <nav className="mt-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">{menuItems.map((item) => renderMenuItem(item, { isMobileView: true }))}</ul>
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {renderMobileSidebar()}
        <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <DialogContent className="h-full w-[260px] max-w-none border-none bg-transparent p-0 shadow-none">
            {renderFullSidebar(false)}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return renderFullSidebar();
};

export default ClassSidebar;
