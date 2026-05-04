import { 
  ShieldCheck, 
  User, 
  Lock, 
  ChevronRight, 
  Camera, 
  CreditCard, 
  BadgeCheck, 
  Fingerprint,
  LogOut,
  Mail,
  Phone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import stayService from "@/services/stayService";
import { useUpdateUserProfileMutation } from "@/hooks/useUserQuery";
import { useUserStore } from "@/store/useUserStore";

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const updateProfileMutate = useUpdateUserProfileMutation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await stayService.getDashboard();
        const userData = response?.data?.user;
        if (userData) {
          setUser(userData);
          setFormData({
            name: userData.name || "",
            phone: userData.phone || "",
            address: userData.address || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch account info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    updateProfileMutate.mutate(formData, {
      onSuccess: () => {
        toast.success("Đã cập nhật thông tin cá nhân!");
        // Update user store
        useUserStore.setState({ userName: formData.name });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Cập nhật hồ sơ thất bại.");
      }
    });
  };

  if (loading) {
     return (
       <div className="flex min-h-[400px] items-center justify-center">
         <div className="size-12 animate-spin rounded-full border-y-2 border-sky-600"></div>
       </div>
     );
  }

  const membershipLevel = user?.membership_level?.toUpperCase() || "MEMBER";

  return (
    <div className="space-y-8 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-slate-900">Cài đặt tài khoản</h1>
           <p className="mt-1 text-sm text-slate-500">Quản lý thông tin cá nhân và bảo mật tài khoản BKS của bạn.</p>
        </div>
        <Button variant="ghost" className="h-12 gap-2 rounded-xl border border-transparent px-6 font-bold text-rose-500 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600">
           <LogOut className="size-4" /> Đăng xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
           {/* Profile Header Card */}
           <Card className="relative overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <div className="h-24 bg-gradient-to-r from-sky-600 to-indigo-600 opacity-90" />
              <CardContent className="relative z-10 -mt-10 p-6 pt-0 md:-mt-12 md:p-8">
                 <div className="mb-8 flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-6">
                    <div className="group relative">
                       <div className="size-32 rounded-[40px] bg-white p-1 shadow-2xl">
                          <div className="flex size-full items-center justify-center overflow-hidden rounded-[38px] bg-slate-100 text-4xl font-black text-slate-400">
                             <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Avatar" className="size-full object-cover" />
                          </div>
                       </div>
                       <button className="absolute bottom-2 right-2 rounded-2xl border-2 border-white bg-slate-900 p-2 text-white shadow-lg transition-transform hover:scale-110">
                          <Camera className="size-4" />
                       </button>
                    </div>
                    <div className="flex-1 pb-2">
                       <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-black leading-none text-slate-900">{user?.name}</h2>
                          <Badge className="rounded-full border-none bg-amber-100 px-3 font-bold text-amber-700 hover:bg-amber-100">{membershipLevel} MEMBER</Badge>
                       </div>
                       <p className="mt-2 text-sm font-medium text-slate-400">Hội viên với {user?.reward_points || 0} điểm thưởng</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                       <label htmlFor="name" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Họ và tên</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
                          <Input 
                            id="name"
                             value={formData.name} 
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="h-12 rounded-2xl border-slate-100 bg-slate-50 pl-12 font-bold transition-all focus:bg-white" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="email" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Email</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
                          <Input id="email" value={user?.email} disabled className="h-12 rounded-2xl border-slate-100 bg-slate-200/50 pl-12 font-bold text-slate-500" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="phone" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Số điện thoại</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
                          <Input 
                            id="phone"
                             value={formData.phone} 
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="h-12 rounded-2xl border-slate-100 bg-slate-50 pl-12 font-bold transition-all focus:bg-white" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="address" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Địa chỉ (Tùy chọn)</label>
                       <Input 
                         id="address"
                          value={formData.address} 
                         onChange={(e) => handleInputChange("address", e.target.value)}
                         placeholder="Nhập địa chỉ thường trú" 
                         className="h-12 rounded-2xl border-slate-100 bg-slate-50 font-bold transition-all focus:bg-white" 
                       />
                    </div>
                 </div>
                 <Button 
                    className="mt-8 h-12 rounded-2xl bg-slate-900 px-8 font-black shadow-xl shadow-slate-900/20 transition-all active:scale-95" 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutate.isPending}
                  >
                    {updateProfileMutate.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
              </CardContent>
           </Card>

           {/* KYC / Identity Verification */}
           <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8">
                 <div className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-bold">
                       <Fingerprint className="size-5 text-sky-600" /> Xác thực danh tính
                    </h3>
                    <Badge variant="outline" className="border-sky-100 bg-sky-50 px-3 text-sky-600">PENDING</Badge>
                 </div>
                 <div className="flex flex-col items-center gap-6 rounded-[28px] border border-slate-100 bg-slate-50 p-6 md:flex-row">
                    <div className="flex h-20 w-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-300">
                       <CreditCard className="size-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <p className="mb-1 font-bold text-slate-900">Cung cấp CMND/CCCD/Passport</p>
                       <p className="text-xs leading-relaxed text-slate-500">
                          Việc xác thực giúp bạn sử dụng được tính năng Digital Key và nhận phòng không cần lễ tân. 
                       </p>
                    </div>
                    <Button onClick={() => toast.info("Tính năng upload tài liệu đang được kích hoạt...")} className="h-12 whitespace-nowrap rounded-2xl bg-sky-600 px-6 font-bold hover:bg-sky-500">Tải lên ngay</Button>
                 </div>
              </CardContent>
           </Card>

           {/* Security Settings */}
           <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8">
                 <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                    <Lock className="size-5 text-sky-600" /> Bảo mật & Mật khẩu
                 </h3>
                 <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-6">
                    <div className="flex items-center gap-4">
                       <div className="rounded-xl bg-white p-3 shadow-sm"><ShieldCheck className="size-6 text-emerald-500" /></div>
                       <div>
                          <p className="font-bold text-slate-900">Mật khẩu của bạn</p>
                          <p className="text-xs text-slate-400">Đã cập nhật lần cuối: 2 tuần trước.</p>
                       </div>
                    </div>
                    <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-6 font-bold transition-all hover:bg-slate-900 hover:text-white" onClick={() => toast.info("Đang chuyển hướng đến trang đổi mật khẩu...")}>Thay đổi</Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Benefits */}
        <div className="space-y-6">
           <Card className="group relative overflow-hidden rounded-[32px] border-none bg-slate-900 p-8 text-white shadow-lg">
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform duration-500 group-hover:scale-125">
                 <BadgeCheck className="size-24 text-sky-400" />
              </div>
              <h3 className="relative z-10 mb-4 text-xl font-bold">Đặc quyền Gold</h3>
              <p className="relative z-10 mb-6 text-sm leading-relaxed text-slate-400">
                 Tận hưởng những dịch vụ ưu tiên chỉ dành riêng cho hội viên BKS Gold như bạn.
              </p>
              <div className="relative z-10 space-y-4">
                 {[
                   "Tích lũy 1.5x điểm thưởng",
                   "Giảm 10% dịch vụ tại phòng",
                   "Check-out muộn miễn phí (đến 14:00)",
                   "Quà tặng chào mừng khi nhận phòng"
                 ].map((benefit, i) => (
                   <div key={i} className="flex items-center gap-3 text-xs font-bold text-sky-400">
                      <ChevronRight className="size-4" /> {benefit}
                   </div>
                 ))}
              </div>
              <Button className="mt-8 h-12 w-full rounded-2xl border-none bg-white/10 font-bold text-white hover:bg-white/20">Xem tất cả đặc quyền</Button>
           </Card>

           <Card className="flex flex-col items-center rounded-[32px] border-none bg-white p-8 text-center shadow-xl shadow-slate-200/50">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                 <ShieldCheck className="size-8" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900 underline decoration-sky-500 underline-offset-4">Quyền riêng tư</h4>
              <p className="mb-6 text-xs leading-relaxed text-slate-500">
                 Dữ liệu của bạn được mã hóa và bảo vệ theo tiêu chuẩn quốc tế ISO/IEC 27001.
              </p>
              <button className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:underline">Chính sách bảo mật</button>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;

