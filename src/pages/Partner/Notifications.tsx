import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    Bell, 
    CheckCircle, 
    AlertTriangle, 
    AlertCircle, 
    Info, 
    Check, 
    Trash2, 
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Pagination from "@/components/Pagination";

const Notifications: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const { data: notificationResponse, isLoading } = useQuery({
        queryKey: ["notifications", "partner", "all", currentPage],
        queryFn: () => partnerService.getNotifications(currentPage),
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

    const getIcon = (type: string, isRead: boolean) => {
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section with glassmorphism */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Bell size={22} />
                        </div>
                        {t("notifications.system_notifications")}
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">{t("notifications.subtitle")}</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => markAllReadMutation.mutate()}
                        disabled={unreadCount === 0}
                        className="rounded-xl border-slate-200 font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Check size={16} className="mr-2" />
                        {t("notifications.mark_all_read")}
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white/70 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-50 p-6 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                            <Button 
                                variant={filter === 'all' ? 'default' : 'ghost'} 
                                size="sm" 
                                className={`rounded-xl font-bold px-6 ${filter === 'all' ? 'bg-slate-900 shadow-lg shadow-slate-200' : 'text-slate-500'}`}
                                onClick={() => setFilter('all')}
                            >
                                {t("notifications.all")}
                            </Button>
                            <Button 
                                variant={filter === 'unread' ? 'default' : 'ghost'} 
                                size="sm" 
                                className={`rounded-xl font-bold px-6 ${filter === 'unread' ? 'bg-slate-900 shadow-lg shadow-slate-200' : 'text-slate-500'}`}
                                onClick={() => setFilter('unread')}
                            >
                                {t("notifications.unread")}
                                {unreadCount > 0 && (
                                    <Badge className="ml-2 bg-rose-500 text-white border-none h-5 px-1.5 min-w-5 justify-center">
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
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold italic animate-pulse">{t("notifications.loading")}</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="space-y-3">
                            {filteredNotifications.map((notification: NotificationData) => (
                                <div 
                                    key={notification.id}
                                    className={`
                                        group relative p-5 rounded-[24px] transition-all duration-300 border-2
                                        ${notification.is_read 
                                            ? 'bg-slate-50/30 border-transparent opacity-80' 
                                            : 'bg-white border-blue-50 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5'
                                        }
                                    `}
                                    onClick={() => !notification.is_read && markReadMutation.mutate(notification.id)}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className={`
                                            h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110
                                            ${notification.is_read ? 'bg-slate-100 shadow-inner' : 'bg-white shadow-lg shadow-blue-500/10 border border-blue-50'}
                                        `}>
                                            {getIcon(notification.type, notification.is_read)}
                                        </div>
                                        
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <h3 className={`text-base font-black transition-colors ${notification.is_read ? 'text-slate-600' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-[11px] font-bold text-slate-400 bg-slate-100/50 px-2 py-1 rounded-lg">
                                                    {format(new Date(notification.created_at), "HH:mm, dd/MM/yyyy", { 
                                                        locale: i18n.language === 'vi' ? vi : enUS 
                                                    })}
                                                </span>
                                            </div>
                                            
                                            <p className={`text-sm leading-relaxed max-w-4xl ${notification.is_read ? 'text-slate-500' : 'text-slate-700'}`}>
                                                {notification.message}
                                            </p>
                                            
                                            <div className="flex items-center gap-4 pt-1">
                                                {!notification.is_read && (
                                                    <Badge className="bg-blue-600/10 text-blue-600 border-none text-[10px] font-black uppercase tracking-wider px-2.5 py-1">
                                                        {t("notifications.newest")}
                                                    </Badge>
                                                )}
                                                {notification.link && (
                                                    <Button 
                                                        variant="link" 
                                                        className="p-0 h-auto text-xs font-bold text-blue-500 hover:text-blue-700"
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
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
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
                        <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/20 rounded-[24px]">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
                                <div className="relative h-24 w-24 bg-white rounded-[32px] flex items-center justify-center shadow-2xl border border-slate-100">
                                    <Bell size={40} className="text-slate-200 animate-bounce-subtle" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                                    <Check size={20} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{t("notifications.everything_ready")}</h3>
                                <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto">
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
