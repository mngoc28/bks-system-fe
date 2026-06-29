import React, { useMemo, useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePartnerPropertyNamesQuery } from "@/hooks/Partner/usePartnerPropertyNamesQuery";

interface PropertyOption {
  id: number | string;
  name: string;
}

interface PropertySelectorProps {
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  className?: string;
  placeholder?: string;
  allowAll?: boolean;
  properties?: Array<PropertyOption | { id: number | string; name?: string; title?: string }>;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  onSelect,
  selectedId,
  className = "",
  placeholder = "Chọn tòa nhà",
  allowAll = true,
  properties: passedProperties,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const shouldFetchProperties = !passedProperties && (isOpen || selectedId !== null);

  const { data: fetchedProperties = [], isLoading: loading } = usePartnerPropertyNamesQuery(shouldFetchProperties);

  const properties = useMemo(() => {
    if (passedProperties) {
      return passedProperties.map((p) => {
        const item = p as { id: number | string; name?: string; title?: string };
        return {
          id: item.id,
          name: item.name || item.title || "",
        };
      });
    }
    return fetchedProperties;
  }, [passedProperties, fetchedProperties]);

  const selectedProperty = properties.find((p) => String(p.id) === String(selectedId));

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`group flex h-11 items-center gap-3 rounded-xl border-gray-200 bg-white px-4 shadow-sm transition-all hover:border-blue-300 hover:bg-slate-50 ${className}`}
        >
          <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 transition-colors group-hover:bg-blue-100">
            <Building2 size={18} />
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-widest text-gray-400">Tài sản</p>
            <p className="truncate text-sm font-bold text-gray-700">
              {selectedProperty
                ? selectedProperty.name
                : allowAll && selectedId === null
                  ? "Tất cả tòa nhà"
                  : placeholder}
            </p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="flex max-h-[min(20rem,70vh)] w-72 flex-col overflow-hidden rounded-xl border-gray-100 p-0 shadow-xl"
      >
        {allowAll && (
          <DropdownMenuItem
            onClick={() => onSelect(null)}
            className="mx-2 mt-2 flex shrink-0 cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="text-sm font-medium">Tất cả tòa nhà</span>
            {selectedId === null && <Check size={16} className="shrink-0 text-blue-600" />}
          </DropdownMenuItem>
        )}
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {properties.map((property) => (
            <DropdownMenuItem
              key={property.id}
              onClick={() => onSelect(String(property.id))}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-lg p-3 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              <span className="min-w-0 truncate text-sm font-medium">{property.name}</span>
              {String(selectedId) === String(property.id) && (
                <Check size={16} className="shrink-0 text-blue-600" />
              )}
            </DropdownMenuItem>
          ))}
          {properties.length === 0 && !loading && (
            <div className="p-3 text-center text-xs italic text-gray-400">Chưa có tòa nhà nào</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PropertySelector;