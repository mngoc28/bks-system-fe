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
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const NotificationBell = () => {
    const queryClient = useQueryClient();
    
    const { data: notifications = [], isLoading } = useQuery<NotificationData[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await stayService.getNotifications();
            // Laravel pagination returns { data: { data: [...] } } via our apiService
            return res.data?.data || [];
        },
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const unreadCount = notifications.filter((n: NotificationData) => !n.is_read).length;

    const markReadMutation = useMutation({
        mutationFn: (id: number) => stayService.markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => stayService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Đã đánh dấu tất cả là đã đọc");
        }
    });

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case "error": return <AlertCircle className="h-4 w-4 text-rose-500" />;
            default: return <Info className="h-4 w-4 text-sky-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 relative rounded-xl h-10 w-10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] rounded-[24px] p-0 shadow-2xl border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                        Thông báo 
                        {unreadCount > 0 && <Badge className="bg-rose-500 text-white border-none text-[10px]">{unreadCount}</Badge>}
                    </h3>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[10px] font-black uppercase text-sky-600 hover:bg-sky-50 h-7"
                            onClick={() => markAllReadMutation.mutate()}
                        >
                            Đọc tất cả
                        </Button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-400 text-sm font-medium italic">Đang tải thông báo...</div>
                    ) : notifications.length > 0 ? (
                        notifications.map((n: NotificationData) => (
                            <DropdownMenuItem 
                                key={n.id} 
                                className={`
                                    p-4 rounded-2xl flex items-start gap-4 cursor-pointer transition-all border border-transparent
                                    ${n.is_read ? "opacity-60" : "bg-white border-slate-50 shadow-sm hover:border-sky-100"}
                                `}
                                onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                            >
                                <div className={`mt-1 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${n.is_read ? "bg-slate-100" : "bg-white shadow-sm border border-slate-50"}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className={`text-sm font-bold leading-none ${n.is_read ? "text-slate-500" : "text-slate-900"}`}>{n.title}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                                {!n.is_read && (
                                    <div className="h-2 w-2 rounded-full bg-sky-500 shrink-0 mt-2" />
                                )}
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-12 text-center space-y-4">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                <Bell className="h-8 w-8 text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-bold text-sm">Bạn chưa có thông báo nào</p>
                        </div>
                    )}
                </div>
                <div className="p-3 border-t border-slate-50">
                    <Button variant="ghost" className="w-full text-xs font-black uppercase text-slate-400 hover:text-slate-600 h-10 rounded-xl">
                        Xem tất cả thông báo
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
