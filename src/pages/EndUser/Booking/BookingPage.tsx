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

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="size-12 animate-spin rounded-full border-y-2 border-blue-500"></div>
            </div>
        );
    }

    if (!room) return <div className="p-8 text-center text-slate-600">{t("booking.room_not_found")}</div>;

    // Parse services from comma-separated strings
    const services: ServiceItem[] = (() => {
    if (!room.services) return [];
    
    try {
        // Parse JSON string to array
        const parsedServices = JSON.parse(room.services);
        
        // Map to ServiceItem format
        return parsedServices.map((service: any) => ({
            id: service.id,
            name: service.name,
            price: service.price?.toString() || '0'
        }));
    } catch (error) {
        console.error('Error parsing services:', error);
        return [];
    }
})();

    const roomImage = room.room_image
        ? `${CLOUDINARY_HEADER_IMAGE_URL}/${room.room_image}`
        : (room.images && room.images.length > 0
            ? `${CLOUDINARY_HEADER_IMAGE_URL}${room.images[0].image_url}`
            : "");

    const selectedServices = useMemo(() => {
        return services.filter((service) => serviceIds.includes(service.id));
    }, [services, serviceIds]);

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
                <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full text-center">
                    {/* Main Title */}
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-3">
                        {t("booking.title")}
                    </h1>

                    {/* Room Subtitle */}
                    <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-sky-200 font-semibold mb-5">
                        {room?.title || "Loading..."}
                    </p>

                    {/* Price and Location */}
                    <div className="flex items-center justify-center gap-4 mb-4 flex-wrap text-slate-200">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-sky-300" />
                            <p className="text-base sm:text-lg text-slate-100">
                                {room?.building_address || "Loading..."}
                            </p>
                        </div>
                    </div>

                    {/* Decorative line */}
                    <div className="w-24 h-1 bg-sky-300/70 mx-auto rounded-full"></div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-slate-50 border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
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

            <div className="py-10 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">

                <div className="mx-auto mb-6 flex w-full max-w-7xl items-center gap-3">
                    <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${currentStep === 1 ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">1</span>
                        Thong tin
                    </div>
                    <div className="h-px flex-1 bg-slate-200" />
                    <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${currentStep === 2 ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">2</span>
                        Xac nhan
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                    {/* Left Column - Room Info */}
                    <div className="space-y-6 flex flex-col">
                        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                            <div className="flex flex-col md:flex-row p-4">
                                <div className="relative w-full md:w-2/5 h-64 md:h-auto">
                                    <img
                                        src={roomImage}
                                        alt={room.title}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>
                                <div className="w-full md:w-3/5 p-4 flex flex-col justify-between pl-6">
                                    <CardHeader className="p-0 mb-2">
                                        <CardTitle className="text-2xl text-slate-900">{room.title}</CardTitle>
                                        <p className="text-2xl font-bold text-sky-600 mt-2">
                                            {formatCurrencyInput(room.cheapest_daily_price?.toString() ?? "0")} {t("booking.money_unit")} <span className="text-base text-slate-500 font-normal">{t("booking.unit")}</span>
                                        </p>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="flex items-center justify-between text-slate-600 mb-3">
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-2 text-sky-500" />
                                                <span className="text-sm sm:text-base">
                                                    {t("booking.capacity")}: {room.people}
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <Maximize className="h-4 w-4 mr-2 text-sky-500" />
                                                <span className="text-sm sm:text-base">
                                                    {t("booking.room_area")}: {room.area} m²
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-slate-900 text-base">{t("booking.amenities")}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(Array.isArray(room.amenities)
                                                    ? room.amenities.map((a: any) => a.name || a.toString())
                                                    : (room.amenities?.toString().split(',') || [])
                                                ).map((amenity: string, idx: number) => (
                                                    <span key={idx} className="bg-sky-50 text-sky-700 text-xs px-2 py-1 rounded-md border border-sky-100">
                                                        {amenity.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-slate-200/80 shadow-sm flex-1">
                            <CardHeader>
                                <CardTitle className="text-xl">{t("booking.services")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 h-full">
                                <p className="text-sm text-slate-600 italic mb-4">
                                    {t("booking.servicesDescription")}
                                </p>
                                {services && services.length > 0 ? (
                                    <div className="space-y-4">
                                        {services.map((service: ServiceItem) => (
                                            <div key={service.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                                <Checkbox
                                                    id={`service-${service.id}`}
                                                    checked={serviceIds.includes(service.id)}
                                                    onCheckedChange={(checked) => handleServiceChange(service.id, checked === true)}
                                                    className="h-5 w-5"
                                                />
                                                <Label
                                                    htmlFor={`service-${service.id}`}
                                                    className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex justify-between"
                                                >
                                                    <span className="text-slate-900">{service.name}</span>
                                                    <span className="text-slate-600 font-semibold">
                                                        {parseFloat(service.price) > 0 ? `${formatCurrencyInput(service.price)} VNĐ` : 'Free'}
                                                    </span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm italic">{t("booking.noExtraServices")}</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/80 shadow-sm flex-1">
                            <CardHeader>
                                <CardTitle className="text-xl">{t("booking.policySection.title")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 h-full">
                                <div className="flex items-start text-sm text-slate-700">
                                    <Clock className="h-5 w-5 mr-3 mt-0.5 text-sky-500" />
                                    <span>{t("booking.policySection.time")}</span>
                                </div>
                                <div className="flex items-start text-sm text-rose-600">
                                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5" />
                                    <span>{t("booking.policySection.cancellation")}</span>
                                </div>
                                <div className="border-t pt-4 mt-3">
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        {(() => {
                                            const rules = t("booking.policySection.rules", { returnObjects: true });
                                            const rulesArray = Array.isArray(rules) ? rules : [];
                                            return rulesArray.map((rule: string, index: number) => (
                                                <li key={index} className="flex items-start">
                                                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
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
                        <Card className="border-slate-200/80 shadow-sm flex-1">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl mb-2">
                                    {currentStep === 1 ? t("booking.customerInfo") : "Xac nhan dat phong"}
                                </CardTitle>
                                <p className="text-sm text-slate-500 italic font-normal">
                                    {currentStep === 1 ? t("booking.helperText") : "Kiem tra lai thong tin truoc khi gui yeu cau dat phong."}
                                </p>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col p-6">
                                {currentStep === 1 ? (
                                    <form className="space-y-8 flex-1 flex flex-col" onSubmit={(event) => event.preventDefault()}>
                                        {/* Personal Info */}
                                        <div className="space-y-6 flex-1">
                                            <div className="space-y-3">
                                                <Label htmlFor="name" className="text-sm font-semibold">{t("booking.fields.name")} <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Nguyen Van A"
                                                    required
                                                    {...register("name")}
                                                    className={`h-11 text-sm ${errors.name ? "border-red-500" : ""}`}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-red-500">{errors.name.message}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                    className="min-h-[120px] text-sm resize-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-sky-50 p-6 rounded-xl border border-sky-100 text-sm text-sky-800 space-y-3">
                                            <h4 className="font-semibold flex items-center text-base">
                                                <Check className="h-5 w-5 mr-3" />
                                                {t("booking.notes.title")}
                                            </h4>
                                            <ul className="list-disc list-inside space-y-2 pl-6">
                                                <li className="text-sm">{t("booking.notes.step1")}</li>
                                                <li className="text-sm">{t("booking.notes.step2")}</li>
                                                <li className="text-sm">{t("booking.notes.step3")}</li>
                                            </ul>
                                            <p className="text-xs pt-3 border-t border-sky-200 mt-3 font-medium">
                                                {t("booking.notes.terms")}
                                            </p>
                                            <p className="text-xs text-sky-600 mt-2 italic">
                                                {t("booking.notes.help")}
                                            </p>
                                        </div>
                                        <div className="mt-auto">
                                            <Button
                                                type="button"
                                                className="w-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-90 text-base py-6"
                                                onClick={handleContinueToConfirm}
                                            >
                                                Tiep tuc xac nhan
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Thong tin khach hang</h3>
                                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                                <p><span className="font-semibold">Ho ten:</span> {previewData?.name}</p>
                                                <p><span className="font-semibold">Email:</span> {previewData?.email}</p>
                                                <p><span className="font-semibold">So dien thoai:</span> {previewData?.phone}</p>
                                                <p><span className="font-semibold">Nhan phong:</span> {previewData?.start_date}</p>
                                                <p><span className="font-semibold">Tra phong:</span> {previewData?.end_date}</p>
                                                {previewData?.note ? <p><span className="font-semibold">Yeu cau:</span> {previewData.note}</p> : null}
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                                            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Tam tinh</h3>
                                            <div className="mt-3 space-y-2 text-sm text-slate-700">
                                                <div className="flex items-center justify-between">
                                                    <span>Tien phong ({numberOfNights} dem)</span>
                                                    <span className="font-semibold">{formatCurrencyInput(roomTotal.toString())} {t("booking.money_unit")}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Dich vu bo sung</span>
                                                    <span className="font-semibold">{formatCurrencyInput(serviceTotal.toString())} {t("booking.money_unit")}</span>
                                                </div>
                                                <div className="border-t border-slate-200 pt-2 mt-2 flex items-center justify-between text-base">
                                                    <span className="font-semibold">Tong cong</span>
                                                    <span className="font-bold text-sky-600">{formatCurrencyInput(estimatedTotal.toString())} {t("booking.money_unit")}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedServices.length > 0 ? (
                                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">Dich vu da chon</h3>
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
                                                Quay lai chinh sua
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
