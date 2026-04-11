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
       <div className="flex items-center justify-center min-h-[400px]">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
       </div>
     );
  }

  const membershipLevel = user?.membership_level?.toUpperCase() || "MEMBER";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cài đặt tài khoản</h1>
           <p className="text-slate-500 text-sm mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản BKS của bạn.</p>
        </div>
        <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold gap-2 rounded-xl h-12 px-6 border border-transparent hover:border-rose-100">
           <LogOut className="h-4 w-4" /> Đăng xuất
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           {/* Profile Header Card */}
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white overflow-hidden relative">
              <div className="h-24 bg-gradient-to-r from-sky-600 to-indigo-600 opacity-90" />
              <CardContent className="p-6 md:p-8 pt-0 -mt-10 md:-mt-12 relative z-10">
                 <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 mb-8">
                    <div className="relative group">
                       <div className="h-32 w-32 rounded-[40px] bg-white p-1 shadow-2xl">
                          <div className="h-full w-full rounded-[38px] bg-slate-100 flex items-center justify-center text-4xl font-black text-slate-400 overflow-hidden">
                             <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                          </div>
                       </div>
                       <button className="absolute bottom-2 right-2 p-2 bg-slate-900 text-white rounded-2xl shadow-lg border-2 border-white hover:scale-110 transition-transform">
                          <Camera className="h-4 w-4" />
                       </button>
                    </div>
                    <div className="flex-1 pb-2">
                       <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-black text-slate-900 leading-none">{user?.name}</h2>
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold border-none rounded-full px-3">{membershipLevel} MEMBER</Badge>
                       </div>
                       <p className="text-slate-400 text-sm font-medium mt-2">Hội viên với {user?.reward_points || 0} điểm thưởng</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <Input 
                            value={formData.name} 
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <Input value={user?.email} disabled className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-200/50 text-slate-500 font-bold" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <Input 
                            value={formData.phone} 
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ (Tùy chọn)</label>
                       <Input 
                         value={formData.address} 
                         onChange={(e) => handleInputChange("address", e.target.value)}
                         placeholder="Nhập địa chỉ thường trú" 
                         className="h-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold" 
                       />
                    </div>
                 </div>
                 <Button 
                    className="mt-8 rounded-2xl h-12 bg-slate-900 px-8 font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all" 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutate.isPending}
                  >
                    {updateProfileMutate.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
              </CardContent>
           </Card>

           {/* KYC / Identity Verification */}
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white overflow-hidden">
              <CardContent className="p-8">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                       <Fingerprint className="h-5 w-5 text-sky-600" /> Xác thực danh tính
                    </h3>
                    <Badge variant="outline" className="text-sky-600 border-sky-100 bg-sky-50 px-3">PENDING</Badge>
                 </div>
                 <div className="p-6 bg-slate-50 border border-slate-100 rounded-[28px] flex flex-col md:flex-row items-center gap-6">
                    <div className="h-20 w-32 bg-white rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                       <CreditCard className="h-8 w-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <p className="font-bold text-slate-900 mb-1">Cung cấp CMND/CCCD/Passport</p>
                       <p className="text-xs text-slate-500 leading-relaxed">
                          Việc xác thực giúp bạn sử dụng được tính năng Digital Key và nhận phòng không cần lễ tân. 
                       </p>
                    </div>
                    <Button onClick={() => toast.info("Tính năng upload tài liệu đang được kích hoạt...")} className="rounded-2xl h-12 bg-sky-600 hover:bg-sky-500 font-bold px-6 whitespace-nowrap">Tải lên ngay</Button>
                 </div>
              </CardContent>
           </Card>

           {/* Security Settings */}
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white overflow-hidden">
              <CardContent className="p-8">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-sky-600" /> Bảo mật & Mật khẩu
                 </h3>
                 <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white rounded-xl shadow-sm"><ShieldCheck className="h-6 w-6 text-emerald-500" /></div>
                       <div>
                          <p className="font-bold text-slate-900">Mật khẩu của bạn</p>
                          <p className="text-xs text-slate-400">Đã cập nhật lần cuối: 2 tuần trước.</p>
                       </div>
                    </div>
                    <Button variant="outline" className="rounded-xl border-slate-200 font-bold px-6 h-11 hover:bg-slate-900 hover:text-white transition-all" onClick={() => toast.info("Đang chuyển hướng đến trang đổi mật khẩu...")}>Thay đổi</Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Benefits */}
        <div className="space-y-6">
           <Card className="border-none shadow-lg rounded-[32px] bg-slate-900 text-white p-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                 <BadgeCheck className="h-24 w-24 text-sky-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 relative z-10">Đặc quyền Gold</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 relative z-10">
                 Tận hưởng những dịch vụ ưu tiên chỉ dành riêng cho hội viên BKS Gold như bạn.
              </p>
              <div className="space-y-4 relative z-10">
                 {[
                   "Tích lũy 1.5x điểm thưởng",
                   "Giảm 10% dịch vụ tại phòng",
                   "Check-out muộn miễn phí (đến 14:00)",
                   "Quà tặng chào mừng khi nhận phòng"
                 ].map((benefit, i) => (
                   <div key={i} className="flex items-center gap-3 text-xs font-bold text-sky-400">
                      <ChevronRight className="h-4 w-4" /> {benefit}
                   </div>
                 ))}
              </div>
              <Button className="w-full mt-8 rounded-2xl h-12 bg-white/10 hover:bg-white/20 text-white border-none font-bold">Xem tất cả đặc quyền</Button>
           </Card>

           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mb-6">
                 <ShieldCheck className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2 underline underline-offset-4 decoration-sky-500">Quyền riêng tư</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                 Dữ liệu của bạn được mã hóa và bảo vệ theo tiêu chuẩn quốc tế ISO/IEC 27001.
              </p>
              <button className="text-[10px] font-black uppercase text-sky-600 tracking-widest hover:underline">Chính sách bảo mật</button>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
