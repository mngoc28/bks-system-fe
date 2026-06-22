import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Zap, Sparkles, type LucideIcon } from 'lucide-react';
import ServicesCatalogTab from './components/ServicesCatalogTab';
import AmenitiesCatalogTab from './components/AmenitiesCatalogTab';
import { usePartnerPropertyNamesQuery } from '@/hooks/Partner/usePartnerPropertyNamesQuery';
import {
  usePartnerAmenitiesCatalogQuery,
  usePartnerServicesCatalogQuery,
} from '@/hooks/Partner/usePartnerCatalogQuery';
import { extractApiRows } from './utils/extractApiRows';
import { ROUTERS } from '@/constant';

type CatalogTab = 'services' | 'amenities';

const CATALOG_TABS: Array<{
  key: CatalogTab;
  label: string;
  icon: LucideIcon;
  path: string;
}> = [
  { key: 'services', label: 'Dịch vụ', icon: Zap, path: ROUTERS.PARTNER_CATALOG_SERVICES },
  { key: 'amenities', label: 'Tiện ích', icon: Sparkles, path: ROUTERS.PARTNER_CATALOG_AMENITIES },
];

const Services: React.FC = () => {
  const navigate = useNavigate();
  const { tab: tabParam } = useParams<{ tab?: string }>();
  const activeTab: CatalogTab = tabParam === 'amenities' ? 'amenities' : 'services';

  const { data: properties = [] } = usePartnerPropertyNamesQuery();
  const { data: servicesRes } = usePartnerServicesCatalogQuery();
  const { data: amenitiesRes } = usePartnerAmenitiesCatalogQuery();

  const servicesCount = useMemo(() => extractApiRows(servicesRes).length, [servicesRes]);
  const amenitiesCount = useMemo(() => extractApiRows(amenitiesRes).length, [amenitiesRes]);

  if (tabParam && tabParam !== 'services' && tabParam !== 'amenities') {
    return <Navigate to={ROUTERS.PARTNER_CATALOG_SERVICES} replace />;
  }

  const handleTabChange = (tab: CatalogTab) => {
    navigate(tab === 'services' ? ROUTERS.PARTNER_CATALOG_SERVICES : ROUTERS.PARTNER_CATALOG_AMENITIES);
  };

  const tabCounts: Record<CatalogTab, number> = {
    services: servicesCount,
    amenities: amenitiesCount,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Dịch vụ & Tiện ích</h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            Danh mục dịch vụ có phí và tiện ích phòng lưu trú.
          </p>
        </div>

        <div
          className="inline-flex w-full shrink-0 rounded-lg border border-gray-200 bg-slate-50 p-0.5 sm:w-auto"
          role="tablist"
          aria-label="Loại danh mục"
        >
          {CATALOG_TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`catalog-panel-${key}`}
                onClick={() => handleTabChange(key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:px-4 sm:text-sm ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-200/70 text-gray-500'
                  }`}
                >
                  {tabCounts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`catalog-panel-${activeTab}`}
        role="tabpanel"
        aria-label={activeTab === 'services' ? 'Danh sách dịch vụ' : 'Danh sách tiện ích'}
      >
        {activeTab === 'services' ? (
          <ServicesCatalogTab properties={properties} />
        ) : (
          <AmenitiesCatalogTab properties={properties} />
        )}
      </div>
    </div>
  );
};

export default Services;
