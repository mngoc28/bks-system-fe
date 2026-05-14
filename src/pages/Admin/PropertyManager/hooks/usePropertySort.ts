import { SortKey } from "@/dataHelper/property.dataHelper";
import { useState } from "react";

export const usePropertySort = () => {
  const [sort, setSort] = useState<Array<{ key: SortKey; direction: "asc" | "desc" }>>([]);

  const getSortDirection = (key: SortKey): "asc" | "desc" | null => {
    const sortItem = sort.find((s) => s.key === key);
    return sortItem ? sortItem.direction : null;
  };

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      const existingIndex = prev.findIndex((s) => s.key === key);
      if (existingIndex === -1) {
        return [...prev, { key, direction: "asc" }];
      } else {
        const existing = prev[existingIndex];
        if (existing.direction === "asc") {
          return prev.map((s, index) =>
            index === existingIndex ? { ...s, direction: "desc" } : s
          );
        } else {
          return prev.filter((s) => s.key !== key);
        }
      }
    });
  };

  const clearSort = () => {
    setSort([]);
  };

  const getSortParams = () => {
    return sort.length > 0
      ? sort.map((s) => ({ field: s.key as string, order: s.direction as string }))
      : null;
  };

  return {
    sort,
    getSortDirection,
    toggleSort,
    clearSort,
    getSortParams,
  };
};


