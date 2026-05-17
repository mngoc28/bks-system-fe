import { bookingApi, type CreateBookingUserRequest, type PublicBookingSummary } from "@/api/EU/bookingApi";
import { roomApi } from "@/api/EU/roomApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlainTextarea as Textarea } from "@/components/ui/textarea";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { formatCurrencyInput } from "@/utils/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { ServiceItem } from "@/dataHelper/EU/booking.dataHelper";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Spinner } from "@/components/ui/spinner";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { bookingUserFormSchema } from "@/shared/shema";
import type { z } from "zod";
import { ROUTERS } from "@/constant";
import { useMemo, useState } from "react";
import { 
    Wifi, Tv, Refrigerator, WashingMachine, Utensils, Mountain, Shield, 
    AirVent, Coffee, Sparkles, Eraser, Zap, Stethoscope, Printer, 
    ParkingCircle, Waves, Plane, CheckCircle2, Info, ArrowRight,
    LucideIcon, Users, Clock, AlertCircle, MapPin, Maximize, Check
} from "lucide-react";

const getAmenityIcon = (name: string): LucideIcon => {
    const n = name.toLowerCase();
    if (n.includes("wifi")) return Wifi;
    if (n.includes("ti vi") || n.includes("tv")) return Tv;
    if (n.includes("tủ lạnh") || n.includes("fridge")) return Refrigerator;
    if (n.includes("máy giặt") || n.includes("washing")) return WashingMachine;
    if (n.includes("bếp") || n.includes("kitchen")) return Utensils;
    if (n.includes("ban công") || n.includes("balcony")) return Mountain;
    if (n.includes("bảo vệ") || n.includes("security")) return Shield;
    if (n.includes("điều hòa") || n.includes("máy lạnh") || n.includes("air")) return AirVent;
    return Check;
};

const getServiceIcon = (name: string): LucideIcon => {
    const n = name.toLowerCase();
    if (n.includes("bữa sáng") || n.includes("breakfast")) return Coffee;
    if (n.includes("massage")) return Sparkles;
    if (n.includes("dọn phòng") || n.includes("cleaning")) return Eraser;
    if (n.includes("điện nước") || n.includes("electricity")) return Zap;
    if (n.includes("y tế") || n.includes("medical")) return Stethoscope;
    if (n.includes("in ấn") || n.includes("print")) return Printer;
    if (n.includes("bãi đỗ") || n.includes("parking")) return ParkingCircle;
    if (n.includes("giặt ủi") || n.includes("laundry")) return Waves;
    if (n.includes("đưa đón") || n.includes("airport") || n.includes("shuttle")) return Plane;
    return CheckCircle2;
};

const BookingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { roomId } = useParams<{ roomId: string }>();
    const id = Number(roomId);

    const getNumberOfNights = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMs = end.getTime() - start.getTime();
        const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights : 1;
    };

    const schema = bookingUserFormSchema(t);
    type BookingFormData = z.infer<typeof schema>;

    const today = new Date().toISOString().split('T')[0];
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        getValues,
    } = useForm<BookingFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            start_date: "",
            end_date: "",
            note: "",
            service_ids: [],
        },
    });

    const serviceIds = watch("service_ids") || [];
    const startDate = watch("start_date");
    const endDate = watch("end_date");
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [previewData, setPreviewData] = useState<BookingFormData | null>(null);

    const { data: room, isLoading } = useQuery({
        queryKey: ["room", id],
        queryFn: async () => {
            const res = await roomApi.getRoomDetail(id);
            return res.data;
        },
        enabled: !!id,
    });
    // create booking mutation
    const createBookingMutation = useMutation({
        mutationFn: async (data: CreateBookingUserRequest) => {
            return await bookingApi.createBookingUser(id, data);
        },
        onSuccess: (apiBody, variables) => {
            const payload = apiBody?.data as PublicBookingSummary | undefined;

            if (payload?.booking_id && room) {
                const totalPrice = Number(payload.total_amount ?? 0);
                toastSuccess(t("booking.success"));
                navigate(ROUTERS.BOOKING_SUCCESS, {
                    state: {
                        bookingCode: payload.booking_code,
                        bookingId: payload.booking_id,
                        roomId: id,
                        guestEmail: variables.email,
                        priceId: payload.price_id,
                        roomTitle: payload.room_title || room.title,
                        address: payload.property_address || room.property_address,
                        startDate: payload.start_date,
                        endDate: payload.end_date,
                        totalPrice,
                    },
                });
                return;
            }

            if (room) {
                const numberOfNights = getNumberOfNights(variables.start_date, variables.end_date);
                const totalPrice = Number(room.cheapest_daily_price || 0) * numberOfNights;
                toastSuccess(t("booking.success"));
                navigate(ROUTERS.BOOKING_SUCCESS, {
                    state: {
                        bookingCode: "",
                        roomId: id,
                        guestEmail: variables.email,
                        roomTitle: room.title,
                        address: room.property_address,
                        startDate: variables.start_date,
                        endDate: variables.end_date,
                        totalPrice,
                    },
                });
                return;
            }

            toastSuccess(t("booking.success"));
        },
        onError: (error: any) => {
            console.error(error);
            const serverMessage = error?.response?.data?.message;
            toastError(serverMessage || t("booking.error"));
        },
    });

    // handle form submit
    const onSubmit = (data: BookingFormData) => {
        createBookingMutation.mutate(data);
    };

    const handleContinueToConfirm = handleSubmit((data) => {
        setPreviewData(data);
        setCurrentStep(2);
    });

    const services: ServiceItem[] = useMemo(() => {
        if (!room?.services) return [];

        try {
            const parsedServices = JSON.parse(room.services);
            return parsedServices.map((service: any) => ({
                id: service.id,
                name: service.name,
                price: service.price?.toString() || "0",
            }));
        } catch (error) {
            console.error("Error parsing services:", error);
            return [];
        }
    }, [room?.services]);

    // handle service selection
    const handleServiceChange = (serviceId: number, checked: boolean) => {
        const currentServices = serviceIds;
        if (checked) {
            setValue("service_ids", [...currentServices, serviceId]);
        } else {
            setValue("service_ids", currentServices.filter(id => id !== serviceId));
        }
    };

    const handleSelectAllServices = (checked: boolean) => {
        if (checked) {
            setValue("service_ids", services.map(s => s.id));
        } else {
            setValue("service_ids", []);
        }
    };

    const isAllSelected = services.length > 0 && serviceIds.length === services.length;

    const selectedServices = useMemo(() => {
        return services.filter((service) => serviceIds.includes(service.id));
    }, [services, serviceIds]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Spinner size="lg" spinnerClassName="border-y-sky-600" />
            </div>
        );
    }

    if (!room) return <div className="p-8 text-center text-slate-600">{t("booking.room_not_found")}</div>;

    const roomImage = room.room_image
        ? `${CLOUDINARY_HEADER_IMAGE_URL}/${room.room_image}`
        : (room.images && room.images.length > 0
            ? `${CLOUDINARY_HEADER_IMAGE_URL}${room.images[0].image_url}`
            : "");

    const numberOfNights = startDate && endDate ? getNumberOfNights(startDate, endDate) : 1;
    const roomTotal = Number(room.cheapest_daily_price || 0) * numberOfNights;
    const serviceTotal = selectedServices.reduce((sum, service) => sum + Number(service.price || 0), 0);
    const estimatedTotal = roomTotal + serviceTotal;

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
            <PublicHeader/>

            {/* Booking Header */}
            <div className="relative overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900/80" />
                <div className="relative mx-auto w-full max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
                    {/* Main Title */}
                    <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        {t("booking.title")}
                    </h1>

                    {/* Room Subtitle */}
                    <p className="mx-auto mb-5 max-w-3xl text-xl font-semibold text-sky-200 sm:text-2xl">
                        {room?.title || "Loading..."}
                    </p>

                    {/* Price and Location */}
                    <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-slate-200">
                        <div className="flex items-center gap-2">
                            <MapPin className="size-5 text-sky-300" />
                            <p className="text-base text-slate-100 sm:text-lg">
                                {room?.property_address || "Loading..."}
                            </p>
                        </div>
                    </div>

                    {/* Decorative line */}
                    <div className="mx-auto h-1 w-24 rounded-full bg-sky-300/70"></div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-b border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
                    <Breadcrumb
                        items={[
                            { label: t("breadcrumb.home"), href: "/" },
                            ...(room ? [
                                { label: room.province_name || "Unknown Province", href: room.province_name ? `/${room.province_name.toLowerCase().replace(/\s+/g, '-')}/rooms` : "/" },
                                { label: room.title },
                                { label: t("booking.title") }
                            ] : [])
                        ]}
                        className="text-sm"
                    />
                </div>
            </div>

            <div className="flex flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">

                <div className="mx-auto mb-6 flex w-full max-w-7xl items-center gap-3">
                    <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${currentStep === 1 ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-xs">1</span>
                        Thông tin
                    </div>
                    <div className="h-px flex-1 bg-slate-200" />
                    <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${currentStep === 2 ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-xs">2</span>
                        Xác nhận
                    </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Left Column - Room Info */}
                    <div className="flex flex-col space-y-6">
                        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                                <div className="flex flex-col gap-4 p-4 md:flex-row">
                                    <div className="flex w-full flex-col gap-3 md:w-2/5">
                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-md md:aspect-square">
                                            <img
                                                src={roomImage}
                                                alt={room.title}
                                                className="size-full object-cover transition-transform duration-500 hover:scale-110"
                                            />
                                            <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                                                Ảnh phòng
                                            </div>
                                        </div>
                                        {room.images && room.images.length > 1 && (
                                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                                {room.images.slice(0, 4).map((img: any, idx: number) => (
                                                    <div key={idx} className="size-16 shrink-0 overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-sky-500">
                                                        <img
                                                            src={`${CLOUDINARY_HEADER_IMAGE_URL}${img.image_url}`}
                                                            className="size-full object-cover"
                                                            alt={`Room view ${idx + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                                {room.images.length > 4 && (
                                                    <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500 border border-slate-200">
                                                        +{room.images.length - 4} ảnh
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                <div className="flex w-full flex-col justify-between p-4 pl-6 md:w-3/5">
                                    <CardHeader className="mb-2 p-0">
                                        <CardTitle className="text-2xl text-slate-900">{room.title}</CardTitle>
                                        <p className="mt-2 text-2xl font-bold text-sky-600">
                                            {formatCurrencyInput(room.cheapest_daily_price?.toString() ?? "0")} {t("booking.money_unit")} <span className="text-base font-normal text-slate-500">{t("booking.unit")}</span>
                                        </p>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="mb-3 flex items-center justify-between text-slate-600">
                                            <div className="flex items-center">
                                                <Users className="mr-2 size-4 text-sky-500" />
                                                <span className="text-sm sm:text-base">
                                                    {t("booking.capacity")}: {room.people}
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <Maximize className="mr-2 size-4 text-sky-500" />
                                                <span className="text-sm sm:text-base">
                                                    {t("booking.room_area")}: {room.area} m²
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                                <Info className="size-4 text-sky-500" />
                                                {t("booking.amenities")}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(Array.isArray(room.amenities)
                                                    ? room.amenities.map((a: any) => a.name || a.toString())
                                                    : (room.amenities?.toString().split(',') || [])
                                                ).map((amenity: string, idx: number) => {
                                                    const Icon = getAmenityIcon(amenity);
                                                    return (
                                                        <span key={idx} className="flex items-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-1.5 text-xs font-medium text-sky-700 transition-all hover:bg-sky-100 hover:shadow-sm">
                                                            <Icon className="size-3.5" />
                                                            {amenity.trim()}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            </div>
                        </Card>

                        <Card className="flex-1 border-slate-200/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-xl">{t("booking.services")}</CardTitle>
                                {services.length > 0 && (
                                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-100">
                                        <Checkbox
                                            id="select-all-services"
                                            checked={isAllSelected}
                                            onCheckedChange={(checked) => handleSelectAllServices(checked === true)}
                                            className="size-4"
                                        />
                                        <Label htmlFor="select-all-services" className="text-xs font-semibold cursor-pointer text-slate-600">
                                            {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                        </Label>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="h-full space-y-4">
                                <p className="text-sm italic text-slate-500">
                                    {t("booking.servicesDescription")}
                                </p>
                                {services && services.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                        {services.map((service: ServiceItem) => {
                                            const Icon = getServiceIcon(service.name);
                                            const isSelected = serviceIds.includes(service.id);
                                            return (
                                                <div 
                                                    key={service.id} 
                                                    className={`group flex items-center space-x-3 rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${
                                                        isSelected ? "border-sky-500 bg-sky-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-sky-200"
                                                    }`}
                                                >
                                                    <div className="relative flex items-center justify-center">
                                                        <Checkbox
                                                            id={`service-${service.id}`}
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => handleServiceChange(service.id, checked === true)}
                                                            className="size-5 border-slate-300 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                                                        />
                                                    </div>
                                                    <Label
                                                        htmlFor={`service-${service.id}`}
                                                        className="flex flex-1 cursor-pointer items-center justify-between gap-2"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`flex size-10 items-center justify-center rounded-lg transition-colors ${
                                                                isSelected ? "bg-sky-100 text-sky-600" : "bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-500"
                                                            }`}>
                                                                <Icon className="size-5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900">{service.name}</span>
                                                                <span className="text-xs text-slate-500">Dịch vụ bổ sung</span>
                                                            </div>
                                                        </div>
                                                        <span className={`text-sm font-bold ${isSelected ? "text-sky-700" : "text-slate-600"}`}>
                                                            {parseFloat(service.price) > 0 ? `${formatCurrencyInput(service.price)}đ` : 'Free'}
                                                        </span>
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center">
                                        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-slate-50">
                                            <Info className="size-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-500">{t("booking.noExtraServices")}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="flex-1 border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">{t("booking.policySection.title")}</CardTitle>
                            </CardHeader>
                            <CardContent className="h-full space-y-4">
                                <div className="flex items-start text-sm text-slate-700">
                                    <Clock className="mr-3 mt-0.5 size-5 text-sky-500 shrink-0" />
                                    <span className="font-medium">{t("booking.policySection.time")}</span>
                                </div>
                                <div className="flex items-start text-sm text-emerald-600 font-bold">
                                    <CheckCircle2 className="mr-3 mt-0.5 size-5 shrink-0" />
                                    <span>{t("booking.policySection.cancellation")}</span>
                                </div>
                                <div className="mt-3 border-t pt-4">
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        {(() => {
                                            const rules = t("booking.policySection.rules", { returnObjects: true });
                                            const rulesArray = Array.isArray(rules) ? rules : [];
                                            return rulesArray.map((rule: string, index: number) => (
                                                <li key={index} className="flex items-start">
                                                    <Check className="mr-3 mt-0.5 size-5 shrink-0 text-green-500" />
                                                    {rule}
                                                </li>
                                            ));
                                        })()}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Booking Form */}
                    <div className="flex">
                        <Card className="flex-1 border-slate-200/80 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="mb-2 text-xl flex items-center gap-2">
                                    {currentStep === 1 ? (
                                        <>
                                            <Users className="size-5 text-sky-500" />
                                            {t("booking.customerInfo")}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-5 text-sky-500" />
                                            Xác nhận đặt phòng
                                        </>
                                    )}
                                </CardTitle>
                                <p className="text-sm font-normal italic text-slate-500">
                                    {currentStep === 1 ? t("booking.helperText") : "Kiểm tra lại thông tin trước khi gửi yêu cầu đặt phòng."}
                                </p>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col p-6 pt-0">
                                {/* Real-time Order Summary in Step 1 */}
                                {currentStep === 1 && (
                                    <div className="mb-8 overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/50 shadow-sm transition-all hover:shadow-md">
                                        <div className="bg-sky-600 px-5 py-3 text-sm font-bold uppercase tracking-wider text-white flex items-center justify-between">
                                            <span>Tóm tắt đơn hàng</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">{numberOfNights} đêm</span>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Tiền phòng</span>
                                                    <span className="font-semibold text-slate-900">{formatCurrencyInput(roomTotal.toString())} {t("booking.money_unit")}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Dịch vụ ({selectedServices.length})</span>
                                                    <span className="font-semibold text-slate-900">+{formatCurrencyInput(serviceTotal.toString())} {t("booking.money_unit")}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t border-sky-100 pt-4 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Tổng cộng tạm tính</span>
                                                    <span className="text-2xl font-black text-sky-600">
                                                        {formatCurrencyInput(estimatedTotal.toString())}
                                                        <span className="ml-1 text-sm font-bold uppercase">{t("booking.money_unit")}</span>
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end text-[10px] text-slate-400 italic">
                                                    <span>* Đã bao gồm thuế & phí</span>
                                                    <span>* Thanh toán khi nhận phòng</span>
                                                </div>
                                            </div>

                                            {selectedServices.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {selectedServices.map(s => (
                                                        <span key={s.id} className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {currentStep === 1 ? (
                                    <form className="flex flex-1 flex-col space-y-8" onSubmit={(event) => event.preventDefault()}>
                                        {/* Personal Info */}
                                        <div className="flex-1 space-y-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="name" className="text-sm font-semibold">{t("booking.fields.name")} <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Nguyễn Văn A"
                                                    required
                                                    {...register("name")}
                                                    className={`h-11 text-sm ${errors.name ? "border-red-500" : ""}`}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-3">
                                                    <Label htmlFor="email" className="text-sm font-semibold">{t("booking.fields.email")}  <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="example@gmail.com"
                                                        required
                                                        {...register("email")}
                                                        className={`h-11 text-sm ${errors.email ? "border-red-500" : ""}`}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-sm text-red-500">{errors.email.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="phone" className="text-sm font-semibold">{t("booking.fields.phone")} <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="phone"
                                                        placeholder="0999999999"
                                                        required
                                                        {...register("phone")}
                                                        className={`h-11 text-sm ${errors.phone ? "border-red-500" : ""}`}
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-3">
                                                    <Controller
                                                        name="start_date"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <DatePickerField
                                                                id="start_date"
                                                                label={
                                                                    <>
                                                                        {t("booking.fields.startDate")}{" "}
                                                                        <span className="text-red-500">*</span>
                                                                    </>
                                                                }
                                                                labelClassName="text-sm font-semibold text-slate-900"
                                                                value={field.value}
                                                                onChange={(ymd) => {
                                                                    field.onChange(ymd);
                                                                    const prevEnd = getValues("end_date");
                                                                    if (prevEnd && prevEnd <= ymd) {
                                                                        setValue("end_date", "", { shouldValidate: true });
                                                                    }
                                                                }}
                                                                minDate={today}
                                                                invalid={!!errors.start_date}
                                                            />
                                                        )}
                                                    />
                                                    {errors.start_date && (
                                                        <p className="text-sm text-red-500">{errors.start_date.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    <Controller
                                                        name="end_date"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <DatePickerField
                                                                id="end_date"
                                                                label={
                                                                    <>
                                                                        {t("booking.fields.endDate")}{" "}
                                                                        <span className="text-red-500">*</span>
                                                                    </>
                                                                }
                                                                labelClassName="text-sm font-semibold text-slate-900"
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                minDate={startDate || today}
                                                                invalid={!!errors.end_date}
                                                            />
                                                        )}
                                                    />
                                                    {errors.end_date && (
                                                        <p className="text-sm text-red-500">{errors.end_date.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="note" className="text-sm font-semibold">{t("booking.fields.note")}</Label>
                                                <Textarea
                                                    id="note"
                                                    placeholder="..."
                                                    {...register("note")}
                                                    className="min-h-[120px] resize-none text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-6">
                                            <Button
                                                type="button"
                                                className="group w-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 py-7 text-lg font-bold shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
                                                onClick={handleContinueToConfirm}
                                            >
                                                Tiếp tục xác nhận
                                                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Thông tin khách hàng</h3>
                                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                                <p><span className="font-semibold">Họ tên:</span> {previewData?.name}</p>
                                                <p><span className="font-semibold">Email:</span> {previewData?.email}</p>
                                                <p><span className="font-semibold">Số điện thoại:</span> {previewData?.phone}</p>
                                                <p><span className="font-semibold">Nhận phòng:</span> {previewData?.start_date}</p>
                                                <p><span className="font-semibold">Trả phòng:</span> {previewData?.end_date}</p>
                                                {previewData?.note ? <p><span className="font-semibold">Yêu cầu:</span> {previewData.note}</p> : null}
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                                            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Tạm tính</h3>
                                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                                <div className="flex items-center justify-between">
                                                    <span>Tiền phòng ({numberOfNights} đêm)</span>
                                                    <span className="font-semibold">{formatCurrencyInput(roomTotal.toString())} {t("booking.money_unit")}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Dịch vụ bổ sung</span>
                                                    <span className="font-semibold">{formatCurrencyInput(serviceTotal.toString())} {t("booking.money_unit")}</span>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-base">
                                                    <span className="font-semibold">Tổng cộng</span>
                                                    <span className="font-bold text-sky-600">{formatCurrencyInput(estimatedTotal.toString())} {t("booking.money_unit")}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedServices.length > 0 ? (
                                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Dịch vụ đã chọn</h3>
                                                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                                    {selectedServices.map((service) => (
                                                        <li key={service.id} className="flex items-center justify-between">
                                                            <span>{service.name}</span>
                                                            <span className="font-medium">{formatCurrencyInput(service.price)} {t("booking.money_unit")}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null}
                                        
                                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                                            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                                                <AlertCircle className="size-4" />
                                                Quy trình pháp lý
                                            </h3>
                                            <p className="mt-2 text-xs leading-relaxed text-amber-700">
                                                {room.property_type_id === 2 || room.property_type_id === 3 ? ( // Giả định 2=Căn hộ, 3=Văn phòng/dài hạn
                                                    "Đây là loại hình lưu trú dài hạn. Sau khi đối tác xác nhận, bạn sẽ nhận được thông báo yêu cầu ký Hợp đồng thuê nhà điện tử tại mục 'Hồ sơ lưu trú' để hoàn tất thủ tục."
                                                ) : (
                                                    "Bằng việc xác nhận, bạn đồng ý với các Điều khoản & Điều kiện lưu trú ngắn hạn của hệ thống và đối tác."
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="flex-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                                onClick={() => {
                                                    const latestData = getValues();
                                                    setPreviewData(latestData);
                                                    setCurrentStep(1);
                                                }}
                                            >
                                                Quay lại chỉnh sửa
                                            </Button>
                                            <Button
                                                type="button"
                                                className="flex-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-90"
                                                disabled={createBookingMutation.isPending}
                                                onClick={() => {
                                                    if (previewData) {
                                                        onSubmit(previewData);
                                                    }
                                                }}
                                            >
                                                {createBookingMutation.isPending ? t("common.processing") : t("booking.button")}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <PublicFooter />
        </div>
    );
}

export default BookingPage;

