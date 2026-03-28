import { cn } from "@/lib/utils";
import { useState } from "react";

type TabOption = {
  id: string;
  label: string;
};

type SortOption = {
  id: string;
  label: string;
};

interface TablistProps {
  tabs: TabOption[];
  sortOptions: SortOption[];
  defaultTabId?: string;
  defaultSortId?: string;
  onTabChange?: (tabId: string) => void;
  onSortChange?: (sortId: string) => void;
  className?: string;
}

const Tablist = ({
  tabs,
  sortOptions,
  defaultTabId,
  defaultSortId,
  onTabChange,
  onSortChange,
  className,
}: TablistProps) => {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);
  const [activeSortId, setActiveSortId] = useState(
    defaultSortId || sortOptions[0]?.id
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    onTabChange?.(tabId);
  };

  const handleSortClick = (sortId: string) => {
    setActiveSortId(sortId);
    setIsDropdownOpen(false);
    onSortChange?.(sortId);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center border-b border-slate-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "px-6 py-4 text-base font-normal transition-colors relative",
                activeTabId === tab.id
                  ? "text-blue-500 border-b-4 border-blue-500"
                  : "text-slate-900 hover:text-blue-500"
              )}
              onClick={() => handleTabClick(tab.id)}
              aria-label={tab.label}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleTabClick(tab.id);
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            className="flex items-center justify-between px-4 py-3 text-base border border-slate-200 rounded-md w-[200px]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Sắp xếp theo"
            aria-expanded={isDropdownOpen}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsDropdownOpen(!isDropdownOpen);
              }
            }}
          >
            <span>
              {sortOptions.find((option) => option.id === activeSortId)?.label}
            </span>
            <svg
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={cn(
                "transition-transform duration-200",
                isDropdownOpen ? "rotate-180" : ""
              )}
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-[200px] bg-white border border-slate-200 rounded-md shadow-lg z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  className={cn(
                    "w-full text-left px-4 py-2 text-base hover:bg-slate-50",
                    activeSortId === option.id
                      ? "text-blue-500"
                      : "text-slate-900"
                  )}
                  onClick={() => handleSortClick(option.id)}
                  aria-label={option.label}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSortClick(option.id);
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tablist;
