import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { BOOKING_STATUS_ORDER } from "@/constant";
import { BookingCreateDialogProps } from "@/dataHelper/booking.dataHelper";
import { useCreateBookingMutation } from "@/hooks/useBookingQuery";
import { useAllPropertiesQuery } from "@/hooks/usePropertyQuery";
import { usePricePackagesByRoomQuery } from "@/hooks/usePricePackageQuery";
import { useRoomsByPropertyQuery } from "@/hooks/useRoomQuery";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import { bookingCreateSchema } from "@/shared/shema";
import { getStatusClass, mapBookingStatus, mapStatusToNumber } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

/**
 * Booking Create Dialog
 * Handles the creation of new bookings by selecting a property, room, price package, and duration.
 */
const BookingCreateDialog: React.FC<BookingCreateDialogProps> = ({ open, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const schema = bookingCreateSchema(t);
  
  // Initialize the form
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      selectedProperty: "",
      selectedRoom: "",
      selectedPricePackage: "",
      startDate: "",
      endDate: "",
      selectedStatus: "",
      note: "",
    },
  });

  const selectedProperty = form.watch("selectedProperty");
  const selectedRoom = form.watch("selectedRoom");

  const { data: properties, isLoading } = useAllPropertiesQuery();
  const { data: rooms, isLoading: roomsLoading } = useRoomsByPropertyQuery(
    selectedProperty ? parseInt(selectedProperty) : 0,
    { enabled: !!selectedProperty }
  );
  const { data: pricePackages, isLoading: pricePackagesLoading } = usePricePackagesByRoomQuery(
    selectedRoom ? parseInt(selectedRoom) : undefined,
    { enabled: !!selectedRoom }
  );

  const createBookingMutation = useCreateBookingMutation();
  const { data: userProfile } = useGetUserProfileQuery();

  // Handle form submission
  const handleSubmit = async (data: z.infer<typeof schema>) => {
    const payload = {
      user_id: userProfile?.data?.id || 1,
      room_id: parseInt(data.selectedRoom),
      price_id: parseInt(data.selectedPricePackage),
      start_date: data.startDate,
      end_date: data.endDate,
      status: mapStatusToNumber(data.selectedStatus),
      note: data.note || "",
    };

    try {
      const result = await createBookingMutation.mutateAsync(payload);
      toastSuccess(t("bookings.booking_created_successfully"));
      if (onSuccess) onSuccess((result.data as { id: number }).id);
      form.reset();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t("bookings.error_creating_booking");
      toastError(errorMessage);
    }
  };
  // Reset selected room when property changes
  useEffect(() => {
    if (selectedProperty) {
      form.setValue("selectedRoom", "");
      form.setValue("selectedPricePackage", "");
    }
  }, [selectedProperty, form]);

  // Reset selected price package when room changes
  useEffect(() => {
    if (selectedRoom) {
      form.setValue("selectedPricePackage", "");
    }
  }, [selectedRoom, form]);

  const handleReset = () => {
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("bookings.add.title")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/** Form content */}
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="selectedProperty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("bookings.add.property")} <span className="text-red-500">*</span></FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("bookings.add.property_placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {properties?.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="selectedRoom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("bookings.add.room_name")} <span className="text-red-500">*</span></FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={roomsLoading || !selectedProperty}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("bookings.add.room_name_placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {rooms?.map((room, index) => (
                            <SelectItem key={room.id || index} value={room.id?.toString() || ""}>
                              {room.room_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="selectedPricePackage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("bookings.add.price")} <span className="text-red-500">*</span></FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={pricePackagesLoading || !selectedRoom}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={pricePackagesLoading ? "Loading..." : t("bookings.add.price_placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {pricePackages?.map((pkg, index) => (
                          <SelectItem key={pkg.room_price_id || index} value={pkg.room_price_id?.toString() || index.toString()}>
                            {pkg.name} - {pkg.price} VND/{pkg.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePickerField
                          id="booking-create-start-date"
                          label={
                            <>
                              {t("bookings.add.start_time")} <span className="text-red-500">*</span>
                            </>
                          }
                          value={field.value}
                          onChange={field.onChange}
                          maxDate={form.watch("endDate") || undefined}
                          invalid={!!form.formState.errors.startDate}
                          triggerClassName="h-10 min-h-0 w-full text-sm font-normal shadow-none hover:shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePickerField
                          id="booking-create-end-date"
                          label={
                            <>
                              {t("bookings.add.end_time")} <span className="text-red-500">*</span>
                            </>
                          }
                          value={field.value}
                          onChange={field.onChange}
                          minDate={form.watch("startDate") || undefined}
                          invalid={!!form.formState.errors.endDate}
                          triggerClassName="h-10 min-h-0 w-full text-sm font-normal shadow-none hover:shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="selectedStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("bookings.add.status")} <span className="text-red-500">*</span></FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("bookings.add.status_placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BOOKING_STATUS_ORDER.map((status) => (
                          <SelectItem
                            key={status}
                            value={mapBookingStatus(status)}
                            className={getStatusClass(status)}
                          >
                            {t(`bookings.status_${mapBookingStatus(status)}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("bookings.add.note")}</FormLabel>
                    <FormControl>
                      <textarea
                        className="min-h-[96px] w-full rounded-md border px-3 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
              <Button type="button" variant="destructive" onClick={handleReset}>{t("common.reset")}</Button>
              <Button
                type="submit"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingCreateDialog;
