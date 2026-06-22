import { useEffect, useMemo, useState } from "react";
import { Bell, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import stayService, { NotificationData } from "@/services/stayService";
import partnerService from "@/services/partnerService";
import { toastSuccess } from "@/components/ui/toast";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import { Link, useNavigate } from "react-router-dom";
import { ROUTERS } from "@/constant";

interface NotificationBellProps {
    portalType?: 'stay' | 'partner';
    /** Partner header: nút lớn hơn, màu đậm hơn để đồng bộ với avatar. */
    triggerSize?: 'default' | 'partner';
}

const NotificationBell = ({ portalType = 'stay', triggerSize = 'default' }: NotificationBellProps) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const service = portalType === 'stay' ? stayService : partnerService;
    const queryKey = useMemo(() => ["notifications", portalType], [portalType]);
    const [canLoadNotifications, setCanLoadNotifications] = useState(false);

    useEffect(() => {
        const id = window.setTimeout(() => setCanLoadNotifications(true), portalType === 'partner' ? 1500 : 0);
        return () => window.clearTimeout(id);
    }, [portalType]);
    
    const { data: notifications = [], isLoading } = useQuery<NotificationData[]>({
        queryKey: queryKey,
        queryFn: async ({ signal }) => {
            const res = await service.getNotifications(1, { signal });
            // Laravel pagination returns { data: { data: [...] } } via our apiService
            return (res as any).data?.data || [];
        },
        enabled: canLoadNotifications,
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 20_000,
    });

    const { data: cancellationCount = 0 } = useQuery({
        queryKey: ["notifications", portalType, "cancellation-pending"],
        queryFn: async ({ signal }) => {
            if (portalType !== 'partner') return 0;
            const res = await partnerService.getCancellationRequests({ status: 'pending', per_page: 1 }, { signal });
            return (res as any)?.data?.meta?.total ?? 0;
        },
        enabled: portalType === 'partner' && canLoadNotifications,
        refetchInterval: 60000,
    });

    // Real-time listener for Partner portal
    useEffect(() => {
        if (portalType !== 'partner') return;

        const handleRealtime = () => {
            // Refetch both notifications and cancellation count
            queryClient.invalidateQueries({ queryKey: queryKey });
            queryClient.invalidateQueries({ queryKey: ["notifications", portalType, "cancellation-pending"] });
        };

        window.addEventListener("partner:realtime-booking", handleRealtime);
        window.addEventListener("partner:realtime-cancellation-request", handleRealtime);

        return () => {
            window.removeEventListener("partner:realtime-booking", handleRealtime);
            window.removeEventListener("partner:realtime-cancellation-request", handleRealtime);
        };
    }, [portalType, queryKey, queryClient]);

    const unreadCount = notifications.filter((n: NotificationData) => !n.is_read).length + (cancellationCount > 0 ? 1 : 0);

    const markReadMutation = useMutation({
        mutationFn: (id: number) => service.markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => service.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
            toastSuccess(t("notifications.mark_all_read_success"));
        }
    });

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle className="size-4 text-emerald-500" />;
            case "warning": return <AlertTriangle className="size-4 text-amber-500" />;
            case "error": return <AlertCircle className="size-4 text-rose-500" />;
            case "system": return <Bell className="size-4 text-sky-600" />;
            default: return <Info className="size-4 text-sky-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={
                        triggerSize === 'partner'
                            ? 'relative size-11 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                            : 'relative size-10 rounded-xl text-slate-400 hover:text-slate-900'
                    }
                >
                    <Bell className={triggerSize === 'partner' ? 'size-6 stroke-[2px]' : 'size-5'} />
                    {unreadCount > 0 && (
                        <span
                            className={`absolute animate-pulse rounded-full bg-rose-500 ring-2 ring-white ${
                                triggerSize === 'partner' ? 'right-2.5 top-2 size-3' : 'right-2 top-2 size-2.5'
                            }`}
                        />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] overflow-hidden rounded-[24px] border-slate-100 p-0 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 p-4">
                    <h3 className="flex items-center gap-2 font-black text-slate-900">
                        {t("notifications.title")} 
                        {unreadCount > 0 && <Badge className="border-none bg-rose-500 text-[10px] text-white">{unreadCount}</Badge>}
                    </h3>
                    {unreadCount > 0 && notifications.length > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] font-black uppercase text-sky-600 hover:bg-sky-50"
                            onClick={() => markAllReadMutation.mutate()}
                        >
                            {t("notifications.mark_all_read")}
                        </Button>
                    )}
                </div>
                <div className="max-h-[400px] space-y-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="p-8 text-center text-sm font-medium italic text-slate-400">{t("notifications.loading")}</div>
                    ) : (notifications.length > 0 || cancellationCount > 0) ? (
                        <>
                            {portalType === 'partner' && cancellationCount > 0 && (
                                <DropdownMenuItem 
                                    className="flex cursor-pointer items-start gap-4 rounded-2xl border border-sky-100 bg-sky-50/50 p-4 shadow-sm transition-all hover:bg-sky-50"
                                    onClick={() => navigate(ROUTERS.PARTNER_CANCELLATION_REQUESTS)}
                                >
                                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-white shadow-sm">
                                        {getIcon("system")}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-bold leading-none text-sky-900">Yêu cầu hủy cần xử lý</p>
                                        <p className="line-clamp-2 text-xs leading-relaxed text-sky-700">
                                            Bạn có {cancellationCount} yêu cầu hủy từ khách hàng đang chờ phản hồi.
                                        </p>
                                        <p className="text-[10px] font-medium text-sky-500">Hành động ngay</p>
                                    </div>
                                    <div className="mt-2 size-2 shrink-0 rounded-full bg-sky-500" />
                                </DropdownMenuItem>
                            )}
                            {notifications.map((n: NotificationData) => (
                                <DropdownMenuItem 
                                    key={n.id} 
                                    className={`
                                        flex cursor-pointer items-start gap-4 rounded-2xl border border-transparent p-4 transition-all
                                        ${n.is_read ? "opacity-60" : "border-slate-50 bg-white shadow-sm hover:border-sky-100"}
                                    `}
                                    onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                                >
                                    <div className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl ${n.is_read ? "bg-slate-100" : "border border-slate-50 bg-white shadow-sm"}`}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={`text-sm font-bold leading-none ${n.is_read ? "text-slate-500" : "text-slate-900"}`}>{n.title}</p>
                                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{n.message}</p>
                                        <p className="text-[10px] font-medium text-slate-400">
                                            {formatDistanceToNow(new Date(n.created_at), { 
                                                addSuffix: true, 
                                                locale: i18n.language === 'vi' ? vi : enUS 
                                            })}
                                        </p>
                                    </div>
                                    {!n.is_read && (
                                        <div className="mt-2 size-2 shrink-0 rounded-full bg-sky-500" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </>
                    ) : (
                        <div className="space-y-4 p-12 text-center">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-50">
                                <Bell className="size-8 text-slate-200" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">{t("notifications.empty")}</p>
                        </div>
                    )}
                </div>
                <div className="border-t border-slate-50 p-3">
                    <Button variant="ghost" asChild className="h-10 w-full rounded-xl text-xs font-black uppercase text-slate-400 hover:text-slate-600">
                        <Link to={portalType === 'partner' ? ROUTERS.PARTNER_NOTIFICATIONS : ROUTERS.BKS_STAY_HISTORY}>
                            {t("notifications.view_all")}
                        </Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
