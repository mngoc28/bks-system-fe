import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoomEditFormProps } from "@/dataHelper/room.dataHelper";
import { useAllAmenitiesQuery } from "@/hooks/useAmenityQuery";
import { useAllPropertiesQuery } from "@/hooks/usePropertyQuery";
import { usePricePackagesQuery } from "@/hooks/usePricePackageQuery";
import { useAllServicesQuery } from "@/hooks/useServiceQuery";
import { roomFormSchema } from "@/shared/shema";
import { formatCurrencyInput, validateCurrencyInput } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ReactSelect from "react-select";
import { z } from "zod";

/**
 * Room Edit Form
 * A comprehensive form for updating room specifications, amenities, and services, pre-populated with existing room data for efficient editing.
 */
const RoomEditForm: React.FC<RoomEditFormProps> = ({ room, onSubmit, isLoading = false, currentUser }) => {
  const { t } = useTranslation();
  const schema = roomFormSchema(t);

  // Property
  const { data: propertiesData, isLoading: isPropertiesLoading } = useAllPropertiesQuery();

  // Amenities, Services, PricePackages
  const { data: amenitiesData, isLoading: isAmenitiesLoading } = useAllAmenitiesQuery();
  const { data: servicesData, isLoading: isServicesLoading } = useAllServicesQuery();
  const { data: pricePackagesData, isLoading: isPricePackagesLoading } = usePricePackagesQuery({ enabled: true });

  const propertyOptions = useMemo(() => {
    const allProperties = propertiesData ?? [];
    let filtered = allProperties;
    if (currentUser?.role === "partner" && currentUser?.partner_id) {
      filtered = allProperties.filter((property: any) => property.staff_id === currentUser.partner_id);
    }
    // add property of the room if not in filtered
    if (room.property && !filtered.find((b: any) => b.id === room.property?.id)) {
      filtered = [...filtered, room.property];
    }
    return filtered;
  }, [propertiesData, currentUser, room.property]);

  const amenities = useMemo(() => {
    const result = amenitiesData ?? [];
    return result;
  }, [amenitiesData]);

  const services = useMemo(() => {
    const result = servicesData ?? [];
    return result;
  }, [servicesData]);
  
  const pricePackages = useMemo(() => {
    const result = pricePackagesData ?? [];
    return result;
  }, [pricePackagesData]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      property_id: room.property_id ?? room.property_id,
      title: room.title,
      room_number: room.room_number || "",
      deposit: room.deposit ? room.deposit.toString() : "",
      area: room.area.toString(),
      floor_number: room.floor_number,
      people: room.people,
      bedrooms_count: room.bedrooms_count ?? 1,
      beds_count: room.beds_count ?? 1,
      room_type: room.room_type,
      status: [true, "true", 1, "1"].includes(room.status),
      description: room.description || "",
      amenities: room.amenities?.map(a => a.id).filter(id => id != null) || [],
      services: room.services?.map(s => s.id).filter(id => id != null) || [],
      prices: room.prices?.map(p => ({
        price_package_id: p.price_package_id,
        unit: p.unit as "night" | "month",
        unit_price: p.price.toString(),
      })) || [{
        price_package_id: 0,
        unit: "month" as "night" | "month",
        unit_price: "",
      }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prices",
  });

  const watchedPrices = form.watch("prices");
  const isFormOptionsLoading = isAmenitiesLoading || isServicesLoading || isPricePackagesLoading;

  const handleSubmit = (data: z.infer<typeof schema>) => {
    onSubmit({
      property_id: data.property_id,
      title: data.title,
      room_number: data.room_number ?? "",
      deposit: data.deposit ?? "",
      area: data.area,
      floor_number: data.floor_number,
      people: data.people,
      bedrooms_count: data.bedrooms_count,
      beds_count: data.beds_count,
      room_type: data.room_type,
      status: data.status,
      description: data.description ?? "",
      amenities: data.amenities,
      services: data.services,
      prices: data.prices.map(p => ({
        price_package_id: p.price_package_id,
        unit: p.unit,
        unit_price: parseFloat(p.unit_price),
      })),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Property */}
          <FormField
            control={form.control}
            name="property_id"
            render={({ field }) => (
              <FormItem >
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.property")} <span className="text-red-500">*</span></FormLabel>
                <ReactSelect
                  options={propertyOptions.map((property: any) => ({ value: property.id, label: property.name }))}
                  value={propertyOptions.find((b: any) => field.value === b.id) ? { value: field.value, label: propertyOptions.find((b: any) => b.id === field.value)?.name } : null}
                  onChange={selected => field.onChange(selected?.value ?? null)}
                  isDisabled={isLoading || isPropertiesLoading || isFormOptionsLoading || propertyOptions.length === 0}
                  placeholder={
                    isPropertiesLoading || isFormOptionsLoading
                      ? t("common.loading")
                      : propertyOptions.length === 0
                        ? t("rooms.no_properties_found")
                        : t("rooms.property_placeholder")
                  }
                  classNamePrefix="react-select"
                  isSearchable
                  isClearable
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.room_title")} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("rooms.room_title_placeholder")} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room Number */}
          <FormField
            control={form.control}
            name="room_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.room_number")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("rooms.room_number_placeholder")} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Area */}
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.area")} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder={t("rooms.area_placeholder")} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Floor Number */}
          <FormField
            control={form.control}
            name="floor_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.floor_number")} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder={t("rooms.floor_number_placeholder")} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* People */}
          <FormField
            control={form.control}
            name="people"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.people")} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder={t("rooms.people_placeholder")} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bedrooms Count */}
          <FormField
            control={form.control}
            name="bedrooms_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.bedrooms_count")} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder={t("rooms.bedrooms_count_placeholder")} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Beds Count */}
          <FormField
            control={form.control}
            name="beds_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.beds_count")} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder={t("rooms.beds_count_placeholder")} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room Type */}
          <FormField
            control={form.control}
            name="room_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.room_type")} <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("rooms.room_type_placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">{t("rooms.room_type_single")}</SelectItem>
                    <SelectItem value="2">{t("rooms.room_type_double")}</SelectItem>
                    <SelectItem value="3">{t("rooms.room_type_mini_apartment")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Deposit */}
          <FormField
            control={form.control}
            name="deposit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.deposit")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder={t("rooms.deposit_placeholder")} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.status")} <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value?.toString()} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("rooms.status_placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                <SelectContent>
                  <SelectItem value="false">{t("rooms.status_private")}</SelectItem>
                  <SelectItem value="true">{t("rooms.status_public")}</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.description")}</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  placeholder={t("rooms.description_placeholder")}
                  disabled={isLoading}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amenities */}
        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.amenities")} <span className="text-red-500">*</span></FormLabel>
              <ReactSelect
                isMulti
                options={amenities.map((amenity: any) => ({value: amenity.id, label: amenity.name}))}
                value={amenities.filter((amenity: any) => field.value?.includes(amenity.id)).map((amenity: any) => ({ value: amenity.id, label: amenity.name }))}
                onChange={(selected) => field.onChange(selected?.map(a => a.value) || [])}
                isDisabled={isLoading || isFormOptionsLoading}
                placeholder={isFormOptionsLoading ? t("common.loading") : t("rooms.amenities_placeholder")}
                classNamePrefix="react-select"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Services */}
        <FormField
          control={form.control}
          name="services"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.services")} <span className="text-red-500">*</span></FormLabel>
              <ReactSelect
                isMulti
                options={services.map((service: any) => ({ value: service.id, label: service.name }))}
                value={services.filter((service: any) => field.value?.includes(service.id)).map((service: any) => ({ value: service.id, label: service.name }))}
                onChange={(selected) => field.onChange(selected?.map(s => s.value) || [])}
                isDisabled={isLoading || isFormOptionsLoading}
                placeholder={isFormOptionsLoading ? t("common.loading") : t("rooms.services_placeholder")}
                classNamePrefix="react-select"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prices */}
        <div className="space-y-4">
          <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.price_package")} <span className="text-red-500">*</span></FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name={`prices.${index}.price_package_id`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.price_package")}</FormLabel>
                    <ReactSelect
                      options={pricePackages.filter(pkg => !watchedPrices.some((p, i) => i !== index && p.price_package_id && p.price_package_id === pkg.id)).map((pkg: any) => ({ value: pkg.id, label: pkg.name }))}
                      value={pricePackages.find((pkg: any) => pkg.id === field.value) ? { value: field.value, label: pricePackages.find((pkg: any) => pkg.id === field.value)?.name } : null}
                      onChange={(selected) => field.onChange(selected?.value ?? 0)}
                      isDisabled={isLoading}
                      placeholder={t("rooms.price_package_placeholder")}
                      classNamePrefix="react-select"
                      isSearchable
                      isClearable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`prices.${index}.unit`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.unit")}</FormLabel>
                    <ReactSelect
                      options={[
                        { value: "night", label: t("rooms.unit_day") },
                        { value: "month", label: t("rooms.unit_month") }
                      ]}
                      value={field.value ? { value: field.value, label: field.value === "night" ? t("rooms.unit_day") : field.value === "month" ? t("rooms.unit_month") : "" } : null}
                      onChange={(selected) => field.onChange(selected?.value || "")}
                      isDisabled={isLoading}
                      placeholder={t("rooms.unit_placeholder")}
                      classNamePrefix="react-select"
                      isClearable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`prices.${index}.unit_price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.unit_price")}</FormLabel>
                    <FormControl>
                      <Input
                        value={formatCurrencyInput(field.value)}
                        onChange={(e) => {
                          const cleaned = validateCurrencyInput(e.target.value);
                          if (cleaned !== null) {
                            field.onChange(cleaned);
                          }
                        }}
                        placeholder={t("rooms.unit_price_placeholder")}
                        disabled={isLoading}
                        className="h-10 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="button" variant="outline" size="sm" onClick={() => remove(index)} className="mt-6 font-bold text-red-600" disabled={fields.length === 1}>
                {t("common.remove")}
              </Button>
            </div>
          ))}
          <Button type="button" onClick={() => append({ price_package_id: 0, unit: "month" as "night" | "month", unit_price: "" })} disabled={fields.length >= 4}>
            {t("rooms.add_price")}
          </Button>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoomEditForm;

