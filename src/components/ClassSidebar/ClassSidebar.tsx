import { ClassSidebarProps, MenuItem } from "@/components/type";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { adminTheme } from "@/lib/adminTheme";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const { sidebar: s } = adminTheme;

const ClassSidebar: React.FC<ClassSidebarProps> = ({ className, classInfo, menuItems, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
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

  const handleToggleMenu = (id: string) => {
    setOpenMenus((prev) => {
      if (prev[id]) return { ...prev, [id]: false };
      return { [id]: true };
    });
  };

  const handleMobileMenuIconClick = (item: MenuItem) => {
    if (item.children?.length) {
      setIsSheetOpen(true);
    }
  };

  const navLinkClasses = (isActive: boolean, compact: boolean) =>
    cn(
      compact ? cn(s.navItemCompact, compact && "text-white/70 hover:bg-white/10") : cn(s.navItem, "px-4 py-3"),
      isActive && s.navItemActive,
    );

  const renderMenuItem = (item: MenuItem, options: { isMobileView?: boolean; collapsed?: boolean } = {}) => {
    const isMobileView = options.isMobileView ?? false;
    const collapsed = options.collapsed ?? false;
    const compact = isMobileView || collapsed;
    const isActive = Boolean(item.path && location.pathname.includes(item.path));
    const hasChildren = !!item.children?.length;
    const isOpen = openMenus[item.id];

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
        <li key={item.id}>
          <button
            type="button"
            className={cn(
              "flex w-full items-center rounded-lg transition-colors",
              compact ? "justify-center px-3 py-3" : "gap-2 px-4 py-3 text-lg",
              isOpen ? s.navItemActive : cn(s.navItem, "px-4 py-3"),
            )}
            onClick={() => (compact ? handleMobileMenuIconClick(item) : handleToggleMenu(item.id))}
            aria-expanded={isOpen}
            aria-controls={`submenu-${item.id}`}
            title={item.label}
          >
            <span className={cn(s.navItemIcon, (isOpen || isActive) && s.navItemIconActive)}>{item.icon}</span>
            {!compact && (
              <>
                <span
                  className={cn(
                    "ml-2 flex-1 whitespace-nowrap transition-all duration-200 ease-out",
                    showLabels ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                  )}
                >
                  {item.label}
                </span>
                <span className={cn("ml-auto transition-opacity duration-200", showLabels ? "opacity-100" : "opacity-0")}>
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </span>
              </>
            )}
          </button>
          {isOpen && !compact && (
            <ul id={`submenu-${item.id}`} className="ml-8 mt-1 space-y-2">
              {item.children!.map((child) => {
                const isChildActive = Boolean(child.path && location.pathname.includes(child.path));
                return (
                  <li key={child.id}>
                    <Link
                      to={child.path!}
                      className={cn(s.submenuItem, isChildActive && s.submenuItemActive)}
                      onClick={() => {
                        if (isMobile) setIsSheetOpen(false);
                      }}
                    >
                      <span className={cn(s.navItemIcon, isChildActive && s.navItemIconActive)}>{child.icon}</span>
                      {child.label}
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
        <li key={item.id}>
          <Link
            to={item.path!}
            className={navLinkClasses(isActive, true)}
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
          </Link>
        </li>
      );
    }

    return (
      <li key={item.id}>
        <Link
          to={item.path!}
          className={navLinkClasses(isActive, false)}
          onClick={() => {
            setOpenMenus({});
            if (isMobile) setIsSheetOpen(false);
          }}
        >
          {isActive && <span className={s.activeIndicator} aria-hidden />}
          <span className={cn(s.navItemIcon, isActive && s.navItemIconActive)}>{item.icon}</span>
          <span
            className={cn(
              "flex-1 whitespace-nowrap transition-all duration-200 ease-out",
              showLabels ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
            )}
          >
            {item.label}
          </span>
        </Link>
      </li>
    );
  };

  const renderSidebarHeader = () => (
    <div className={cn("flex", isCollapsed ? "flex-col items-center gap-4" : "items-center justify-between gap-3")}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={s.logoBox}>
          <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="size-7 object-contain" />
        </div>
        <span
          className={cn(
            s.brandTitle,
            isCollapsed ? "hidden" : "text-xl",
            !isCollapsed && !showLabels ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100",
          )}
        >
          {classInfo.name.toUpperCase()}
        </span>
      </div>
      <button
        type="button"
        onClick={onToggleCollapse}
        className={s.toggleBtn}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="size-4 font-semibold" /> : <ChevronLeft className="size-4 font-semibold" />}
      </button>
    </div>
  );

  const renderFullSidebar = () => (
    <div
      className={cn(
        s.root,
        "relative",
        isCollapsed ? "w-[72px] px-3 py-6" : "w-[260px] p-6",
        className,
      )}
    >
      {renderSidebarHeader()}
      <nav className="scrollbar-hide mt-4 flex-1 overflow-y-auto">
        <ul className={cn(isCollapsed ? "space-y-2" : "space-y-1")}>
          {menuItems.map((item) => renderMenuItem(item, { collapsed: isCollapsed }))}
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
            {renderFullSidebar()}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return renderFullSidebar();
};

export default ClassSidebar;
