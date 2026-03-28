import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PROVINCES } from "@/constant";
import { usePartnerQuery } from "@/hooks/EU/usePartnerQuery";
import { Building2, ChevronRight, Globe, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { PublicHeader, PublicFooter } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";

const PartnerList = () => {
    const { t } = useTranslation();
    const [ searchTerm ] = useState("");
    const [ selectedRegion ] = useState<string>("all");

    const { provinceNameEn } = useParams<{ provinceNameEn: string }>();

    const province = PROVINCES.find(p => p.name_en === provinceNameEn);
    const provinceId = province?.id || 0;
    const { data: partners = [], isLoading, error } = usePartnerQuery(provinceId);
    
    // Province mapping - always get from PROVINCES first
    const provinceName = province?.name || t("common.unknown_province");
    const hasPartners = Array.isArray(partners) && partners.length > 0;

    // Filter partners based on search and ward
    const validPartners = Array.isArray(partners) ? partners.filter(partner => partner && typeof partner === 'object' && partner.id && partner.company_name) : [];
    const filteredPartners = validPartners.filter((partner) => {
        const matchesSearch =
            partner.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            partner.address?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Handle loading and error states
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-lg text-red-600">{t("common.loading_error")}: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
            <PublicHeader />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900/80" />
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            {selectedRegion === "all"
                                ? t("endUserPartners.title") + " " + provinceName
                                : t("endUserPartners.title") + " " + provinceName}
                        </h1>
                        <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-200">
                            {t("endUserPartners.subtitle") + " " + provinceName}
                        </p>

                        {/* Decorative line */}
                        <div className="w-24 h-1 bg-sky-300/70 mx-auto rounded-full mt-6"></div>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-slate-50 border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <Breadcrumb
                        items={[
                            { label: t("endUserPartners.breadcrumb.home"), href: "/" },
                            { label: provinceName },
                            { label: t("endUserPartners.breadcrumb.list") }
                        ]}
                        className="text-sm"
                    />
                </div>
            </div>

            {/* Partners Grid */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">{t("common.loading")}</p>
                    </div>
                ) : !hasPartners ? (
                    <div className="text-center py-12">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                            <Building2 className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {t("endUserPartners.no_partners_title", { province: provinceName })}
                        </h3>
                        <p className="text-slate-600 max-w-md mx-auto">
                            {t("endUserPartners.no_partners_description", { province: provinceName })}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPartners.map((partner) => (
                        <Card
                            key={partner.id}
                            className="h-auto transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-slate-200 hover:border-sky-300 overflow-hidden rounded-3xl"
                        >
                            {/* Bỏ Image section */}

                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2 hover:text-sky-600 group">
                                    <Link
                                        to={`/partner/detail/${partner.id}`}
                                    >
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                                            {partner.company_name}
                                        </h3>
                                    </Link>
                                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-sky-600 transition-colors flex-shrink-0" />
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {/* Address */}
                                <div className="flex items-start gap-2 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-sky-600" />
                                    <span className="line-clamp-2">{partner.address || t("common.not_available")}</span>
                                </div>

                                {/* Description */}
                                {partner.description && (
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {partner.description}
                                    </p>
                                )}

                                {/* Contact Info */}
                                {(partner.phone || partner.user_email || partner.website) && (
                                    <div className="pt-3 border-t border-slate-100 space-y-2">
                                        {partner.phone && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Phone className="h-3.5 w-3.5 text-sky-600" />
                                                <span>{partner.phone}</span>
                                            </div>
                                        )}
                                        {partner.user_email && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Mail className="h-3.5 w-3.5 text-sky-600" />
                                                <span className="truncate">{partner.user_email}</span>
                                            </div>
                                        )}
                                        {partner.website && (
                                            <div className="flex items-center gap-2 text-xs text-sky-600 hover:text-sky-800">
                                                <Globe className="h-3.5 w-3.5" />
                                                <a
                                                    href={partner.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="truncate hover:underline"
                                                >
                                                    {partner.website}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            </div>

            {/* Info Section */}
            {hasPartners && (
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Building2 className="h-6 w-6 text-sky-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                {t("endUserPartners.features.reliable_service")}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600">
                                {t("endUserPartners.features.reliable_description")}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <MapPin className="h-6 w-6 text-sky-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                {t("endUserPartners.features.nationwide_coverage")}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600">
                                {t("endUserPartners.features.nationwide_description")}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Phone className="h-6 w-6 text-sky-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                {t("endUserPartners.features.full_support")}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600">
                                {t("endUserPartners.features.full_description")}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <PublicFooter/>
        </div>
    );
};

export default PartnerList;
