import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Bell, 
    CheckCircle, 
    AlertTriangle, 
    AlertCircle, 
    Info, 
    Check, 
    Filter,
    ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import partnerService from "@/services/partnerService";
import { NotificationData } from "@/services/stayService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";
import { Spinner } from "@/components/ui/spinner";

const Notifications: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const { data: notificationResponse, isLoading } = useQuery({
        queryKey: ["notifications", "partner", "all", currentPage],
        queryFn: ({ signal }) => partnerService.getNotifications(currentPage, { signal }),
    });

    const notifications = (notificationResponse as any)?.data?.data || [];
    const paginationData = (notificationResponse as any)?.data;

    const unreadCount = notifications.filter((n: NotificationData) => !n.is_read).length;

    const markReadMutation = useMutation({
        mutationFn: (id: number) => partnerService.markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", "partner"] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => partnerService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", "partner"] });
            toast.success(t("notifications.mark_all_read_success"));
        }
    });

    const getIcon = (type: string) => {
        const iconClass = "h-5 w-5";
        switch (type) {
            case "success": return <CheckCircle className={`${iconClass} text-emerald-500`} />;
            case "warning": return <AlertTriangle className={`${iconClass} text-amber-500`} />;
            case "error": return <AlertCircle className={`${iconClass} text-rose-500`} />;
            default: return <Info className={`${iconClass} text-sky-500`} />;
        }
    };

    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter((n: NotificationData) => !n.is_read);

    return (
        <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
            {/* Header section with glassmorphism */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-black text-slate-900">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                            <Bell size={22} />
                        </div>
                        {t("notifications.system_notifications")}
                    </h1>
                    <p className="mt-1 font-medium text-slate-500">{t("notifications.subtitle")}</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => markAllReadMutation.mutate()}
                        disabled={unreadCount === 0}
                        className="rounded-xl border-slate-200 font-bold transition-all hover:bg-slate-50 active:scale-95"
                    >
                        <Check size={16} className="mr-2" />
                        {t("notifications.mark_all_read")}
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden rounded-[32px] border-none bg-white/70 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
                            <Button 
                                variant={filter === 'all' ? 'default' : 'ghost'} 
                                size="sm" 
                                className={`rounded-xl px-6 font-bold ${filter === 'all' ? 'bg-slate-900 shadow-lg shadow-slate-200' : 'text-slate-500'}`}
                                onClick={() => setFilter('all')}
                            >
                                {t("notifications.all")}
                            </Button>
                            <Button 
                                variant={filter === 'unread' ? 'default' : 'ghost'} 
                                size="sm" 
                                className={`rounded-xl px-6 font-bold ${filter === 'unread' ? 'bg-slate-900 shadow-lg shadow-slate-200' : 'text-slate-500'}`}
                                onClick={() => setFilter('unread')}
                            >
                                {t("notifications.unread")}
                                {unreadCount > 0 && (
                                    <Badge className="ml-2 h-5 min-w-5 justify-center border-none bg-rose-500 px-1.5 text-white">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 text-slate-400">
                            <Filter size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">{t("notifications.filter_notifications")}</span>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-20">
                            <Spinner 
                                size="lg" 
                                showText 
                                text={t("notifications.loading")} 
                                className="text-slate-400 italic font-bold"
                            />
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="space-y-3">
                            {filteredNotifications.map((notification: NotificationData) => (
                                <div 
                                    key={notification.id}
                                    className={`
                                        group relative rounded-[24px] border-2 p-5 transition-all duration-300
                                        ${notification.is_read 
                                            ? 'border-transparent bg-slate-50/30 opacity-80' 
                                            : 'border-blue-50 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/5'
                                        }
                                    `}
                                    onClick={() => !notification.is_read && markReadMutation.mutate(notification.id)}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className={`
                                            flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110
                                            ${notification.is_read ? 'bg-slate-100 shadow-inner' : 'border border-blue-50 bg-white shadow-lg shadow-blue-500/10'}
                                        `}>
                                            {getIcon(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <h3 className={`text-base font-black transition-colors ${notification.is_read ? 'text-slate-600' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="rounded-lg bg-slate-100/50 px-2 py-1 text-[11px] font-bold text-slate-400">
                                                    {format(new Date(notification.created_at), "HH:mm, dd/MM/yyyy", { 
                                                        locale: i18n.language === 'vi' ? vi : enUS 
                                                    })}
                                                </span>
                                            </div>
                                            
                                            <p className={`max-w-4xl text-sm leading-relaxed ${notification.is_read ? 'text-slate-500' : 'text-slate-700'}`}>
                                                {notification.message}
                                            </p>
                                            
                                            <div className="flex items-center gap-4 pt-1">
                                                {!notification.is_read && (
                                                    <Badge className="border-none bg-blue-600/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600">
                                                        {t("notifications.newest")}
                                                    </Badge>
                                                )}
                                                {notification.link && (
                                                    <Button 
                                                        variant="link" 
                                                        className="h-auto p-0 text-xs font-bold text-blue-500 hover:text-blue-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(notification.link!);
                                                        }}
                                                    >
                                                        {t("notifications.details")} →
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {!notification.is_read && (
                                            <div className="absolute right-6 top-1/2 flex -translate-y-1/2 translate-x-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="size-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markReadMutation.mutate(notification.id);
                                                    }}
                                                >
                                                    <Check size={18} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-6 rounded-[24px] bg-slate-50/20 py-32 text-center">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl"></div>
                                <div className="relative flex size-24 items-center justify-center rounded-[32px] border border-slate-100 bg-white shadow-2xl">
                                    <Bell size={40} className="animate-bounce-subtle text-slate-200" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-2xl border-4 border-white bg-emerald-500 text-white shadow-lg">
                                    <Check size={20} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{t("notifications.everything_ready")}</h3>
                                <p className="mx-auto mt-2 max-w-sm font-medium text-slate-400">
                                    {t("notifications.no_pending")}
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                onClick={() => navigate(-1)}
                                className="rounded-xl border-slate-200 font-bold"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                {t("notifications.back")}
                            </Button>
                        </div>
                    )}

                    {paginationData && paginationData.last_page > 1 && (
                        <div className="mt-8 flex justify-center pb-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={paginationData.last_page}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Notifications;
