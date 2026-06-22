import { 
  ShieldCheck, 
  User, 
  Lock, 
  Camera, 
  CreditCard, 
  BadgeCheck, 
  Fingerprint,
  Mail,
  Phone,
  MapPin,
  Globe,
  AlignLeft
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlainTextarea as Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import SearchableSelect from "@/components/ui/searchable-select";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "@/hooks/useUserQuery";
import { usePartnerProfileQuery, useUpdatePartnerProfileMutation } from "@/hooks/usePartnerQuery";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetHomeWardsByProvinceId } from "@/hooks/useWardQuery";
import { ProvinceTypes } from "@/dataHelper/province.dataHelper";
import { Ward } from "@/dataHelper/ward.dataHelper";
import { useUserStore } from "@/store/useUserStore";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { resolveImageUrl } from "@/utils/imageUtils";
import PartnerPublicImageDialog, { PARTNER_PUBLIC_IMAGE_SLOTS } from "./components/PartnerPublicImageDialog";
import { PartnerSectionCard, PartnerSectionHeader } from "./components/ResponsiveBlocks";

const Profile = () => {
  const { data: profileResponse, isLoading: isProfileLoading } = useGetUserProfileQuery();
  const { data: partnerResponse, isLoading: isPartnerLoading } = usePartnerProfileQuery();
  
  const updateProfileMutate = useUpdateUserProfileMutation();
  const updatePartnerProfileMutate = useUpdatePartnerProfileMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    companyName: "",
    website: "",
    description: "",
    provinceId: 0,
    wardId: 0
  });
  const [isPublicImageDialogOpen, setIsPublicImageDialogOpen] = useState(false);

  const { t } = useTranslation();
  const { data: provincesData, isLoading: isLoadingProvinces } = useGetAllProvincesTypes();
  const { data: wardsData, isLoading: isLoadingWards } = useGetHomeWardsByProvinceId(formData.provinceId);

  useEffect(() => {
    if (profileResponse?.data) {
      const profile = profileResponse.data;
      setFormData(prev => ({
        ...prev,
        name: profile.name || "",
        phone: profile.phone || ""
      }));
    }
  }, [profileResponse]);

  useEffect(() => {
    if (partnerResponse?.data) {
      const partner = partnerResponse.data;
      setFormData(prev => ({
        ...prev,
        companyName: partner.company_name || "",
        website: partner.website || "",
        description: partner.description || "",
        address: partner.address || "",
        provinceId: partner.province_id || 0,
        wardId: partner.ward_id || 0
      }));
    }
  }, [partnerResponse]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      if (field === "provinceId") {
        newState.wardId = 0; // Reset ward when province changes
      }
      return newState;
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Update User Profile
      await updateProfileMutate.mutateAsync({
        name: formData.name,
        phone: formData.phone
      });

      // Update Partner Profile Info
      await updatePartnerProfileMutate.mutateAsync({
        company_name: formData.companyName,
        website: formData.website,
        description: formData.description,
        address: formData.address,
        province_id: formData.provinceId,
        ward_id: formData.wardId
      });

      toastSuccess("Đã cập nhật thông tin thành công!");
      if (formData.name) {
        useUserStore.setState({ userName: formData.name });
      }
    } catch (error: any) {
      toastError(error?.response?.data?.message || "Cập nhật hồ sơ thất bại.");
    }
  };

  if (isProfileLoading || isPartnerLoading) {
     return (
       <div className="flex min-h-[400px] items-center justify-center">
         <Spinner size="lg" showText text="Đang tải thông tin hồ sơ..." />
       </div>
     );
  }

  const profile = profileResponse?.data;
  const partnerDetail = partnerResponse?.data;

  return (
    <div className="space-y-6">
      <PartnerSectionCard>
        <PartnerSectionHeader
          title="Thông tin cá nhân"
          description="Quản lý thông tin hồ sơ và bảo mật tài khoản đối tác của bạn."
          actions={(
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setIsPublicImageDialogOpen(true)}
            >
              Quản lý ảnh đối tác
            </Button>
          )}
        />
      </PartnerSectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
           <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-24 border-b border-amber-100 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50" />
              <CardContent className="relative z-10 -mt-10 p-6 md:-mt-12 md:p-8">
                 <div className="mb-8 flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-6">
                    <div className="group relative">
                       <div className="size-28 rounded-2xl bg-white p-1 shadow-md ring-1 ring-slate-200 md:size-32">
                          <div className="flex size-full items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-4xl font-bold text-slate-400">
                             <img 
                              src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.name}&background=random`} 
                              alt="Avatar" 
                              className="size-full object-cover" 
                            />
                          </div>
                       </div>
                       <button className="absolute bottom-1 right-1 rounded-lg border border-white bg-amber-600 p-2 text-white shadow-sm transition-colors hover:bg-amber-700">
                          <Camera className="size-4" />
                       </button>
                    </div>
                    <div className="flex-1 pb-2">
                       <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold leading-none text-slate-900">{profile?.name || "Đối tác BKS"}</h2>
                          <Badge className="rounded-full border-amber-100 bg-amber-50 px-3 font-semibold text-amber-700 hover:bg-amber-50 uppercase tracking-wider">
                            {partnerDetail?.company_name || "Đối tác chính thức"}
                          </Badge>
                       </div>
                       <p className="mt-2 text-sm font-medium text-slate-400 flex items-center gap-1">
                        <Mail size={14} /> {profile?.email}
                       </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                       <label htmlFor="name" className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-600">Họ và tên</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
                          <Input 
                            id="name"
                             value={formData.name} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
                            placeholder="Nhập họ và tên"
                            className="h-11 rounded-lg border-slate-200 bg-white pl-12 font-medium transition-all focus:bg-white" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="companyName" className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-600">Tên công ty</label>
                       <div className="relative">
                          <BadgeCheck className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
                          <Input 
                            id="companyName"
                             value={formData.companyName} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("companyName", e.target.value)}
                            placeholder="Nhập tên công ty"
                            className="h-11 rounded-lg border-slate-200 bg-white pl-12 font-medium transition-all focus:bg-white" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="email" className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-600">Email (Không thể thay đổi)</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
                          <Input id="email" value={profile?.email} disabled className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-12 font-medium text-slate-500 cursor-not-allowed" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="phone" className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-600">Số điện thoại</label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
                          <Input 
                            id="phone"
                             value={formData.phone} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("phone", e.target.value)}
                            placeholder="Nhập số điện thoại"
                            className="h-11 rounded-lg border-slate-200 bg-white pl-12 font-medium transition-all focus:bg-white" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label htmlFor="website" className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-600">Website công ty</label>
                       <div className="relative">
                          <Globe className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
                          <Input 
                            id="website"
                             value={formData.website} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("website", e.target.value)}
                            placeholder="https://congty.com"
                            className="h-11 rounded-lg border-slate-200 bg-white pl-12 font-medium transition-all focus:bg-white" 
                          />
                       </div>
                    </div>
                    <div className="col-span-full space-y-2">
                       <label htmlFor="description" className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-600">Mô tả công ty</label>
                       <div className="relative">
                          <AlignLeft className="absolute left-4 top-4 size-4 text-slate-300" />
                          <Textarea 
                            id="description"
                             value={formData.description} 
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                            placeholder="Nhập mô tả ngắn về công ty của bạn..." 
                            className="min-h-[120px] rounded-lg border-slate-200 bg-white pl-12 pt-3 font-medium transition-all focus:bg-white" 
                          />
                       </div>
                    </div>

                    {/* Địa điểm chi tiết */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                       <div className="space-y-2">
                          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-600">{t("register.province_name")}</label>
                          <SearchableSelect
                             value={formData.provinceId?.toString() || ""}
                             onValueChange={(value) => handleInputChange("provinceId", Number(value))}
                             options={provincesData?.data?.map((province: ProvinceTypes) => ({
                               value: province.id.toString(),
                               label: province.name,
                             })) || []}
                             placeholder={t("register.province_name_placeholder")}
                             searchPlaceholder={t("register.province_name_search_placeholder")}
                             emptyMessage={t("register.province_name_empty_message")}
                             disabled={isLoadingProvinces}
                             loading={isLoadingProvinces}
                             icon={<MapPin className="size-4 text-slate-300" />}
                             showSearch={true}
                             triggerClassName="h-11 bg-white border-slate-200 text-slate-700 rounded-lg focus:ring-amber-500/20 font-medium"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-600">{t("register.ward_name")}</label>
                          <SearchableSelect
                             value={formData.wardId?.toString() || ""}
                             onValueChange={(value) => handleInputChange("wardId", Number(value))}
                             options={wardsData?.data?.map((ward: Ward) => ({
                               value: ward.id.toString(),
                               label: ward.name,
                             })) || []}
                             placeholder={t("register.ward_name_placeholder")}
                             searchPlaceholder={t("register.ward_name_search_placeholder")}
                             emptyMessage={t("register.ward_name_empty_message")}
                             disabled={isLoadingWards || !formData.provinceId}
                             loading={isLoadingWards}
                             icon={<MapPin className="size-4 text-slate-300" />}
                             showSearch={true}
                             triggerClassName="h-11 bg-white border-slate-200 text-slate-700 rounded-lg focus:ring-amber-500/20 font-medium"
                          />
                       </div>
                    </div>

                    <div className="col-span-full space-y-2">
                       <label htmlFor="address" className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-600">Địa chỉ cụ thể (Số nhà, tên đường...)</label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
                          <Input 
                            id="address"
                             value={formData.address} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("address", e.target.value)}
                            placeholder="Nhập địa chỉ văn phòng" 
                            className="h-11 rounded-lg border-slate-200 bg-white pl-12 font-medium transition-all focus:bg-white" 
                          />
                       </div>
                    </div>
                 </div>
                 <div className="mt-8 flex justify-end">
                  <Button 
                      className="h-11 rounded-lg bg-amber-600 px-8 font-semibold hover:bg-amber-700" 
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutate.isPending || updatePartnerProfileMutate.isPending}
                    >
                      {updateProfileMutate.isPending || updatePartnerProfileMutate.isPending ? "Đang lưu..." : "Cập nhật hồ sơ"}
                    </Button>
                 </div>
              </CardContent>
           </Card>

           {/* Security Settings */}
           <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                 <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <span className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
                      <Lock className="size-4" />
                    </span>
                    Bảo mật & Mật khẩu
                 </h3>
                 <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                       <div className="rounded-xl bg-white p-3 shadow-sm"><ShieldCheck className="size-6 text-emerald-500" /></div>
                       <div>
                          <p className="font-bold text-slate-900">Mật khẩu tài khoản</p>
                          <p className="text-xs text-slate-400">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
                       </div>
                    </div>
                    <Button variant="outline" className="h-10 rounded-lg border-slate-200 px-5 font-semibold">Thay đổi</Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <PartnerSectionCard className="relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                 <BadgeCheck className="size-20 text-amber-500" />
              </div>
              <h3 className="relative z-10 mb-3 text-lg font-bold text-slate-900">Hợp tác tin cậy</h3>
              <p className="relative z-10 mb-5 text-sm leading-relaxed text-slate-500">
                 BKS cam kết mang lại giải pháp quản lý tài sản tối ưu và minh bạch cho các đối tác.
              </p>
              <div className="relative z-10 space-y-3">
                 {[
                   "Minh bạch dòng tiền",
                   "Hỗ trợ kỹ thuật 24/7",
                   "Báo cáo chi tiết hàng tháng",
                   "Mở rộng mạng lưới khách hàng"
                 ].map((benefit, i) => (
                   <div key={i} className="flex items-center gap-3 text-xs font-semibold text-amber-700">
                      <BadgeCheck className="size-4 shrink-0" /> {benefit}
                   </div>
                 ))}
              </div>
           </PartnerSectionCard>

           <PartnerSectionCard>
                 <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                       <h3 className="text-lg font-bold text-slate-900">Ảnh giới thiệu đối tác</h3>
                       <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          Ba ảnh thương hiệu đối tác hiển thị trên trang chủ và trang chi tiết đối tác. Không trùng với ảnh đại diện tài khoản người quản lý.
                       </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-200"
                      onClick={() => setIsPublicImageDialogOpen(true)}
                    >
                      Chỉnh sửa
                    </Button>
                 </div>

                 <div className="grid grid-cols-3 gap-3">
                    {PARTNER_PUBLIC_IMAGE_SLOTS.map((slot) => {
                      const imageUrl = resolveImageUrl(partnerDetail?.[slot.field], { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });

                      return (
                        <div key={slot.field}>
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt="Ảnh giới thiệu đối tác"
                                className="aspect-[4/3] w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/assets/images/photo_error2.png";
                                }}
                              />
                            ) : (
                              <div className="flex aspect-[4/3] items-center justify-center px-3 text-center text-xs font-semibold text-slate-400">
                                Chưa tải ảnh
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                 </div>
           </PartnerSectionCard>

           <PartnerSectionCard>
                 <div className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                       <span className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
                         <Fingerprint className="size-4" />
                       </span>
                       Xác thực
                    </h3>
                    <Badge variant="outline" className="border-amber-100 bg-amber-50 px-3 text-amber-700">VERIFIED</Badge>
                 </div>
                 <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm text-slate-400">
                       <CreditCard className="size-6" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-900">Thông tin pháp lý</p>
                       <p className="text-xs mt-1 text-slate-500 leading-relaxed">
                          Tài khoản của bạn đã được xác thực thông tin pháp lý doanh nghiệp.
                       </p>
                    </div>
                 </div>
           </PartnerSectionCard>
        </div>
      </div>

      <PartnerPublicImageDialog
        open={isPublicImageDialogOpen}
        onOpenChange={setIsPublicImageDialogOpen}
        partnerDetail={partnerDetail}
      />
    </div>
  );
};

export default Profile;
