import { bookingApi, type CreateBookingUserRequest } from "@/api/EU/bookingApi";
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
import { Check, Users, Clock, AlertCircle, MapPin, Maximize } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { ServiceItem } from "@/dataHelper/EU/booking.dataHelper";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";
import { bookingUserFormSchema } from "@/shared/shema";
import type { z } from "zod";
import { ROUTERS } from "@/constant";
import { useMemo, useState } from "react";

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

    const {
        register,
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
        onSuccess: (_response, variables) => {
            if (room) {
                const numberOfNights = getNumberOfNights(variables.start_date, variables.end_date);
                const totalPrice = Number(room.cheapest_daily_price || 0) * numberOfNights;

                const bookingRecord = {
                    id: `booking-${Date.now()}`,
                    roomId: room.id,
                    roomTitle: room.title,
                    provinceName: room.province_name,
                    address: room.building_address,
                    startDate: variables.start_date,
                    endDate: variables.end_date,
                    totalPrice,
                    customerName: variables.name,
                    createdAt: new Date().toISOString(),
                    status: "upcoming",
                };

                const storageKey = "publicMyBookings";
                const existingRaw = window.localStorage.getItem(storageKey);
                const existing = existingRaw ? JSON.parse(existingRaw) : [];
                const nextBookings = Array.isArray(existing) ? [bookingRecord, ...existing] : [bookingRecord];
                window.localStorage.setItem(storageKey, JSON.stringify(nextBookings));

                toastSuccess(t("booking.success"));
                navigate(ROUTERS.BOOKING_SUCCESS, {
                    state: {
                        bookingId: bookingRecord.id,
                        roomTitle: bookingRecord.roomTitle,
                        address: bookingRecord.address,
                        startDate: bookingRecord.startDate,
                        endDate: bookingRecord.endDate,
                        totalPrice: bookingRecord.totalPrice,
                    },
                });
                return;
            }

            toastSuccess(t("booking.success"));
            navigate(ROUTERS.MY_BOOKINGS);
        },
        onError: (error) => {
            console.error(error);
            toastError(t("booking.error"));
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

    // handle service selection
    const handleServiceChange = (serviceId: number, checked: boolean) => {
        const currentServices = serviceIds;
        if (checked) {
            setValue("service_ids", [...currentServices, serviceId]);
        } else {
            setValue("service_ids", currentServices.filter(id => id !== serviceId));
        }
    };

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

    const selectedServices = useMemo(() => {
        return services.filter((service) => serviceIds.includes(service.id));
    }, [services, serviceIds]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="size-12 animate-spin rounded-full border-y-2 border-blue-500"></div>
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
                                {room?.building_address || "Loading..."}
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
                            <div className="flex flex-col p-4 md:flex-row">
                                <div className="relative h-64 w-full md:h-auto md:w-2/5">
                                    <img
                                        src={roomImage}
                                        alt={room.title}
                                        className="size-full rounded-lg object-cover"
                                    />
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
                                        <div className="space-y-2">
                                            <h4 className="text-base font-medium text-slate-900">{t("booking.amenities")}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(Array.isArray(room.amenities)
                                                    ? room.amenities.map((a: any) => a.name || a.toString())
                                                    : (room.amenities?.toString().split(',') || [])
                                                ).map((amenity: string, idx: number) => (
                                                    <span key={idx} className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs text-sky-700">
                                                        {amenity.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            </div>
                        </Card>

                        <Card className="flex-1 border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">{t("booking.services")}</CardTitle>
                            </CardHeader>
                            <CardContent className="h-full space-y-4">
                                <p className="mb-4 text-sm italic text-slate-600">
                                    {t("booking.servicesDescription")}
                                </p>
                                {services && services.length > 0 ? (
                                    <div className="space-y-4">
                                        {services.map((service: ServiceItem) => (
                                            <div key={service.id} className="flex items-center space-x-3 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50">
                                                <Checkbox
                                                    id={`service-${service.id}`}
                                                    checked={serviceIds.includes(service.id)}
                                                    onCheckedChange={(checked) => handleServiceChange(service.id, checked === true)}
                                                    className="size-5"
                                                />
                                                <Label
                                                    htmlFor={`service-${service.id}`}
                                                    className="flex flex-1 cursor-pointer justify-between text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    <span className="text-slate-900">{service.name}</span>
                                                    <span className="font-semibold text-slate-600">
                                                        {parseFloat(service.price) > 0 ? `${formatCurrencyInput(service.price)} VNĐ` : 'Free'}
                                                    </span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-slate-500">{t("booking.noExtraServices")}</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="flex-1 border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">{t("booking.policySection.title")}</CardTitle>
                            </CardHeader>
                            <CardContent className="h-full space-y-4">
                                <div className="flex items-start text-sm text-slate-700">
                                    <Clock className="mr-3 mt-0.5 size-5 text-sky-500" />
                                    <span>{t("booking.policySection.time")}</span>
                                </div>
                                <div className="flex items-start text-sm text-rose-600">
                                    <AlertCircle className="mr-3 mt-0.5 size-5" />
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
                                <CardTitle className="mb-2 text-xl">
                                    {currentStep === 1 ? t("booking.customerInfo") : "Xác nhận đặt phòng"}
                                </CardTitle>
                                <p className="text-sm font-normal italic text-slate-500">
                                    {currentStep === 1 ? t("booking.helperText") : "Kiểm tra lại thông tin trước khi gửi yêu cầu đặt phòng."}
                                </p>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col p-6">
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
                                                    <Label htmlFor="start_date" className="text-sm font-semibold">{t("booking.fields.startDate")} <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="start_date"
                                                        type="date"
                                                        required
                                                        {...register("start_date")}
                                                        className={`h-11 text-sm ${errors.start_date ? "border-red-500" : ""}`}
                                                    />
                                                    {errors.start_date && (
                                                        <p className="text-sm text-red-500">{errors.start_date.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="end_date" className="text-sm font-semibold">{t("booking.fields.endDate")} <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="end_date"
                                                        type="date"
                                                        required
                                                        {...register("end_date")}
                                                        className={`h-11 text-sm ${errors.end_date ? "border-red-500" : ""}`}
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
                                        <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50 p-6 text-sm text-sky-800">
                                            <h4 className="flex items-center text-base font-semibold">
                                                <Check className="mr-3 size-5" />
                                                {t("booking.notes.title")}
                                            </h4>
                                            <ul className="list-inside list-disc space-y-2 pl-6">
                                                <li className="text-sm">{t("booking.notes.step1")}</li>
                                                <li className="text-sm">{t("booking.notes.step2")}</li>
                                                <li className="text-sm">{t("booking.notes.step3")}</li>
                                            </ul>
                                            <p className="mt-3 border-t border-sky-200 pt-3 text-xs font-medium">
                                                {t("booking.notes.terms")}
                                            </p>
                                            <p className="mt-2 text-xs italic text-sky-600">
                                                {t("booking.notes.help")}
                                            </p>
                                        </div>
                                        <div className="mt-auto">
                                            <Button
                                                type="button"
                                                className="w-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 py-6 text-base hover:opacity-90"
                                                onClick={handleContinueToConfirm}
                                            >
                                                Tiếp tục xác nhận
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
