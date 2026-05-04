import { ClassSidebarProps, MenuItem } from "@/components/type";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
    // Skip the initial render
    if (!initRef.current) {
      initRef.current = true;
      setShowLabels(!isCollapsed);
      return;
    }

    // Handle label show/hide with delay on collapse/expand
    if (isCollapsed) {
      setShowLabels(false);
      return;
    }

    // When expanding, wait before showing labels
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

  const renderMenuItem = (item: MenuItem, options: { isMobileView?: boolean; collapsed?: boolean } = {}) => {
    const isMobileView = options.isMobileView ?? false;
    const collapsed = options.collapsed ?? false;
    const compact = isMobileView || collapsed;
    const isActive = item.path && location.pathname.includes(item.path);
    const hasChildren = !!item.children?.length;
    const isOpen = openMenus[item.id];

    if (item.isHeader) {
      if (compact) return <div key={item.id} className="mx-2 my-4 h-px bg-white/10" />;
      return (
        <li
          key={item.id}
          className={cn(
            "px-4 py-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-opacity duration-200",
            showLabels ? "opacity-100" : "opacity-0"
          )}
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
              "flex w-full items-center rounded-md transition-colors",
              compact ? "justify-center px-3 py-3" : "gap-2 px-4 py-3 text-lg",
              isOpen ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5",
            )}
            onClick={() => (compact ? handleMobileMenuIconClick(item) : handleToggleMenu(item.id))}
            aria-expanded={isOpen}
            aria-controls={`submenu-${item.id}`}
            title={item.label}
          >
            <span className={cn("transition-colors", isOpen ? "text-white" : "text-slate-300")}>{item.icon}</span>
            {!compact && (
              <>
                <span
                  className={cn(
                    "ml-2 flex-1 whitespace-nowrap transition-all duration-200 ease-out",
                    showLabels ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    "ml-auto transition-opacity duration-200",
                    showLabels ? "opacity-100" : "opacity-0",
                  )}
                >
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </span>
              </>
            )}
          </button>
          {isOpen && !compact && (
            <ul id={`submenu-${item.id}`} className="ml-8 mt-1 space-y-2">
              {item.children!.map((child) => {
                const isChildActive = child.path && location.pathname.includes(child.path);
                return (
                  <li key={child.id}>
                    <Link
                      to={child.path!}
                      className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-base transition-colors", isChildActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5")}
                      onClick={() => {
                        if (isMobile) setIsSheetOpen(false);
                      }}
                    >
                      <span className={isChildActive ? "text-white" : "text-slate-300"}>{child.icon}</span>
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

    // For mobile icon view, wrap in button to handle click
    if (compact) {
      return (
        <li key={item.id}>
          <Link
            to={item.path!}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-md transition-all duration-200",
              compact ? "px-3 py-3" : "px-4 py-3 text-lg",
              isActive ? "bg-white/10 text-white shadow-inner" : "text-slate-300 hover:bg-white/5",
            )}
            onClick={() => {
              setOpenMenus({});
              if (compact && !isMobile) {
                setIsSheetOpen(false);
              }
            }}
            title={item.label}
          >
            {isActive && (
              <span className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-white transition-all duration-300" />
            )}
            <span className={cn("transition-all duration-200", isActive ? "scale-110 text-white" : "text-slate-300")}>{item.icon}</span>
          </Link>
        </li>
      );
    }

    return (
      <li key={item.id}>
        <Link
          to={item.path!}
          className={cn(
            "relative flex items-center gap-2 rounded-md px-4 py-3 text-lg transition-all duration-200",
            isActive ? "bg-white/10 text-white shadow-inner" : "text-slate-300 hover:bg-white/5",
          )}
          onClick={() => {
            setOpenMenus({});
            if (isMobile) setIsSheetOpen(false);
          }}
        >
          {isActive && (
            <span className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-white transition-all duration-300" />
          )}
          <span className={cn("transition-all duration-200", isActive ? "scale-110 text-white" : "text-slate-300")}>{item.icon}</span>
          <span
            className={cn(
              "flex-1 whitespace-nowrap transition-all duration-200 ease-out",
              showLabels ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
            )}
          >
            {item.label}
          </span>
        </Link>
      </li>
    );
  };

  const renderFullSidebar = () => (
    <div
      className={cn(
        "flex h-full flex-col border-r border-white/10 bg-gradient-to-b from-primary via-[#1e3a8a] to-[#1e40af] transition-[width] duration-200 ease-in-out",
        isCollapsed ? "w-[72px] px-3 py-6" : "w-[260px] p-6",
        className,
      )}
    >
      <div className={cn("flex", isCollapsed ? "flex-col items-center gap-4" : "items-center justify-between gap-3")}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-lg backdrop-blur-sm">
            <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="size-7 object-contain" />
          </div>
          <span
            className={cn(
              "font-extrabold tracking-tight text-white transition-all duration-200 whitespace-nowrap",
              isCollapsed ? "hidden" : "text-xl",
              !isCollapsed && !showLabels ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0",
            )}
          >
            {classInfo.name.toUpperCase()}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "rounded-full bg-white/10 p-1.5 text-white/80 shadow-sm transition hover:bg-white/20 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/20"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="size-4 font-semibold" /> : <ChevronLeft className="size-4 font-semibold" />}
        </button>
      </div>
      <nav className="scrollbar-hide mt-4 flex-1 overflow-y-auto">
        <ul className={cn(isCollapsed ? "space-y-2" : "space-y-3")}>
          {menuItems.map((item) => renderMenuItem(item, { collapsed: isCollapsed }))}
        </ul>
      </nav>
    </div>
  );

  const renderMobileSidebar = () => (
    <div className="flex h-full w-[72px] flex-col border-r border-white/10 bg-gradient-to-b from-primary via-[#1e3a8a] to-[#1e40af] p-4">
      <div className="flex items-center justify-center">
        <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-lg backdrop-blur-sm">
          <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="size-7 object-contain" />
        </div>
      </div>
      <nav className="mt-4 flex-1 overflow-y-auto">
        <ul className="space-y-3">{menuItems.map((item) => renderMenuItem(item, { isMobileView: true }))}</ul>
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {renderMobileSidebar()}
        <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <DialogContent className="h-full w-[260px] max-w-none p-0">{renderFullSidebar()}</DialogContent>
        </Dialog>
      </>
    );
  }

  return renderFullSidebar();
};

export default ClassSidebar;
