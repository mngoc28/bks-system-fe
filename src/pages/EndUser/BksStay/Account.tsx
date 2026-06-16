import { 
  ShieldCheck, 
  User, 
  Lock, 
  ChevronRight, 
  Camera, 
  CreditCard, 
  Fingerprint,
  LogOut,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";

import { useEffect, useRef, useState } from "react";
import stayService from "@/services/stayService";
import { useUpdateUserProfileMutation } from "@/hooks/useUserQuery";
import { useUserStore } from "@/store/useUserStore";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "@/constant";

const Account = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  
  // KYC states
  const [kycStatus, setKycStatus] = useState("PENDING");
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [kycUploading, setKycUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cccdFrontName, setCccdFrontName] = useState("");
  const [cccdBackName, setCccdBackName] = useState("");
  
  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  
  // Privileges state
  const [isPrivilegesOpen, setIsPrivilegesOpen] = useState(false);

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
          setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`);
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
        toastSuccess("Đã cập nhật thông tin cá nhân!");
        useUserStore.setState({ userName: formData.name });
      },
      onError: (error: any) => {
        toastError(error?.response?.data?.message || "Cập nhật hồ sơ thất bại.");
      }
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      toastSuccess("Đã cập nhật ảnh đại diện mới thành công!");
    }
  };

  const handleKycUpload = () => {
    if (!cccdFrontName || !cccdBackName) {
      toastError("Vui lòng chọn đầy đủ ảnh mặt trước và mặt sau CCCD.");
      return;
    }
    setKycUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setKycUploading(false);
          setKycStatus("SUBMITTED");
          setIsKycDialogOpen(false);
          toastSuccess("Tài liệu xác thực danh tính đã được tải lên thành công. Vui lòng chờ đối tác phê duyệt!");
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const handleLogout = () => {
    useUserStore.getState().logout();
    navigate(ROUTERS.BKS_STAY_LOGIN);
  };

  if (loading) {
     return (
       <div className="flex min-h-[400px] items-center justify-center">
         <Spinner size="lg" />
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
        <Button onClick={handleLogout} variant="ghost" className="h-12 gap-2 rounded-xl border border-transparent px-6 font-bold text-rose-500 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600">
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
                             <img src={avatarUrl} alt="Avatar" className="size-full object-cover" />
                          </div>
                       </div>
                       <button onClick={handleAvatarClick} className="absolute bottom-2 right-2 rounded-2xl border-2 border-white bg-slate-900 p-2 text-white shadow-lg transition-transform hover:scale-110">
                          <Camera className="size-4" />
                       </button>
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleAvatarChange} 
                         accept="image/*" 
                         className="hidden" 
                       />
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
                    <Badge variant="outline" className={
                      kycStatus === "PENDING" 
                        ? "border-sky-100 bg-sky-50 px-3 text-sky-600"
                        : "border-amber-100 bg-amber-50 px-3 text-amber-600"
                    }>
                      {kycStatus}
                    </Badge>
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
                    <Button 
                      onClick={() => setIsKycDialogOpen(true)} 
                      disabled={kycStatus === "SUBMITTED"}
                      className="h-12 whitespace-nowrap rounded-2xl bg-sky-600 px-6 font-bold hover:bg-sky-500"
                    >
                      {kycStatus === "SUBMITTED" ? "Đã gửi hồ sơ" : "Tải lên ngay"}
                    </Button>
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
                    <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-6 font-bold transition-all hover:bg-slate-900 hover:text-white" onClick={() => navigate(ROUTERS.BKS_STAY_FORCE_CHANGE_PASSWORD)}>Thay đổi</Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Benefits */}
        <div className="space-y-6">
           <Card className="group relative overflow-hidden rounded-[32px] border-none bg-slate-900 p-8 text-white shadow-lg">
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform duration-500 group-hover:scale-125">
                 <ShieldCheck className="size-24 text-sky-400" />
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
              <Button onClick={() => setIsPrivilegesOpen(true)} className="mt-8 h-12 w-full rounded-2xl border-none bg-white/10 font-bold text-white hover:bg-white/20">Xem tất cả đặc quyền</Button>
           </Card>

           <Card className="flex flex-col items-center rounded-[32px] border-none bg-white p-8 text-center shadow-xl shadow-slate-200/50">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                 <ShieldCheck className="size-8" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900 underline decoration-sky-500 underline-offset-4">Quyền riêng tư</h4>
              <p className="mb-6 text-xs leading-relaxed text-slate-500">
                 Dữ liệu của bạn được mã hóa và bảo vệ theo tiêu chuẩn quốc tế ISO/IEC 27001.
              </p>
              <button onClick={() => navigate(ROUTERS.PUBLIC_FAQ + "?category=Tài%20khoản%20%26%20Bảo%20mật")} className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:underline">Chính sách bảo mật</button>
           </Card>
        </div>
      </div>

      {/* KYC Upload Dialog */}
      <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
        <DialogContent className="rounded-[32px] border-none bg-white p-8 max-w-md shadow-2xl">
          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="text-2xl font-black text-slate-900">Xác thực tài khoản (KYC)</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Vui lòng tải lên ảnh chụp 2 mặt CMND/CCCD hoặc Passport của bạn để kích hoạt quyền nhận phòng tự động.
            </DialogDescription>
          </DialogHeader>

          {kycUploading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <LoaderSpinner className="size-10 animate-spin text-sky-600" />
              <p className="font-bold text-slate-600">Đang tải tài liệu lên hệ thống... ({uploadProgress}%)</p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="space-y-4 my-2">
              <div className="space-y-2">
                <label htmlFor="cccd-front" className="text-xs font-bold uppercase tracking-wider text-slate-400">Mặt trước CCCD</label>
                <div className="flex items-center gap-3">
                  <Input 
                    id="cccd-front"
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setCccdFrontName(e.target.files?.[0]?.name || "")}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="cccd-back" className="text-xs font-bold uppercase tracking-wider text-slate-400">Mặt sau CCCD</label>
                <div className="flex items-center gap-3">
                  <Input 
                    id="cccd-back"
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setCccdBackName(e.target.files?.[0]?.name || "")}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {!kycUploading && (
            <DialogFooter className="mt-6 gap-2">
              <Button onClick={handleKycUpload} className="flex-1 rounded-2xl bg-sky-600 font-bold text-white hover:bg-sky-500">Gửi hồ sơ</Button>
              <DialogClose asChild>
                <Button variant="ghost" className="rounded-2xl font-bold text-slate-400">Hủy</Button>
              </DialogClose>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Privileges Modal */}
      <Dialog open={isPrivilegesOpen} onOpenChange={setIsPrivilegesOpen}>
        <DialogContent className="rounded-[32px] border-none bg-white p-8 max-w-md shadow-2xl">
          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="text-2xl font-black text-slate-900">Quyền lợi hội viên BKS</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Chi tiết đặc quyền dành riêng cho từng hạng thẻ.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100">
              <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2">⭐ Hạng Vàng (Gold Member)</h4>
              <ul className="mt-2 text-xs text-amber-700/90 space-y-1 list-disc pl-4 font-semibold">
                <li>Tích lũy 1.5x điểm thưởng</li>
                <li>Giảm 10% dịch vụ tại phòng</li>
                <li>Check-out muộn miễn phí (đến 14:00)</li>
                <li>Quà tặng chào mừng khi nhận phòng</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-sky-50/50 p-4 border border-sky-100">
              <h4 className="font-bold text-sky-800 text-sm flex items-center gap-2">💎 Hạng Kim Cương (Diamond Member)</h4>
              <ul className="mt-2 text-xs text-sky-700/90 space-y-1 list-disc pl-4 font-semibold">
                <li>Tích lũy 2.0x điểm thưởng</li>
                <li>Giảm 15% dịch vụ tại phòng & Giá phòng</li>
                <li>Check-in sớm & Check-out muộn miễn phí</li>
                <li>Ưu tiên nâng hạng phòng khi còn trống</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={() => setIsPrivilegesOpen(false)} className="w-full rounded-2xl bg-slate-900 font-bold text-white">Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Simple loader helper inside file to avoid extra imports
const LoaderSpinner = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default Account;
