import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoomAddFormProps } from "@/dataHelper/room.dataHelper";
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
 * Room Add Form
 * A complex, dynamic form for entering room details, including specifications, amenities, services, and multiple pricing packages.
 */
export const RoomAddForm: React.FC<RoomAddFormProps> = ({ onSubmit, onCancel, isLoading = false, currentUser }) => {
  const { t } = useTranslation();
  const schema = roomFormSchema(t);

  // Property
  const { data: propertiesData, isLoading: isPropertiesLoading } = useAllPropertiesQuery();

  // Amenities, Services
  const { data: amenitiesData, isLoading: isAmenitiesLoading } = useAllAmenitiesQuery();
  const { data: servicesData, isLoading: isServicesLoading } = useAllServicesQuery();
  const { data: pricePackagesData } = usePricePackagesQuery({ enabled: true });

  const propertyOptions = useMemo(() => {
    const allProperties = propertiesData ?? [];
    let filtered = allProperties;
    if (currentUser?.role === "partner" && currentUser?.partner_id) {
      filtered = allProperties.filter((property: any) => property.staff_id === currentUser.partner_id);
    }
    return filtered;
  }, [propertiesData, currentUser]);

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
      property_id: undefined,
      title: "",
      room_number: "",
      area: "",
      floor_number: 1,
      people: 1,
      room_type: 1,
      status: false,
      deposit: "",
      description: "",
      amenities: [],
      services: [],
      prices: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "prices",
    });


  const watchedPrices = form.watch("prices");

  const handleSubmit = (data: z.infer<typeof schema>) => {
      onSubmit({
        property_id: data.property_id,
        title: data.title,
        room_number: data.room_number ?? "",
        deposit: data.deposit ?? "",
        area: data.area,
        floor_number: data.floor_number,
        people: data.people,
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
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.property")} <span className="text-red-500">*</span></FormLabel>
                <ReactSelect
                options={propertyOptions.map((property: any) => ({ value: property.id, label: property.name }))}
                  value={propertyOptions.find((b: any) => field.value === b.id) ? { value: field.value, label: propertyOptions.find((b: any) => b.id === field.value)?.name } : null}
                  onChange={selected => field.onChange(selected?.value ?? null)}
                  isDisabled={isLoading || isPropertiesLoading || propertyOptions.length === 0}
                  placeholder={isPropertiesLoading ? t("common.loading") : propertyOptions.length === 0 ? t("rooms.no_properties_found") : t("rooms.property_placeholder")}
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
                  <Input placeholder={t("rooms.room_title_placeholder")} {...field} />
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
                  <Input placeholder={t("rooms.room_number_placeholder")} {...field} />
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
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.area")} (m²) <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                  <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
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
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("rooms.select_room_type")} />
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

          {/* People */}
          <FormField
            control={form.control}
            name="people"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">{t("rooms.people")} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                </FormControl>
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
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                    <SelectItem value="false">{t("rooms.status_public")}</SelectItem>
                    <SelectItem value="true">{t("rooms.status_private")}</SelectItem>
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={t("rooms.description_placeholder")}
                      {...field}
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
                  <FormControl>
                    <ReactSelect
                      isMulti
                      options={amenities.map((amenity: any) => ({ value: amenity.id, label: amenity.name }))}
                      value={amenities
                        .filter((amenity: any) => field.value?.includes(amenity.id))
                        .map((amenity: any) => ({ value: amenity.id, label: amenity.name }))}
                      onChange={(selected) => field.onChange(selected?.map((s) => s.value) || [])}
                      placeholder={t("rooms.amenities_placeholder")}
                      isLoading={isAmenitiesLoading}
                    />
                  </FormControl>
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
                  <FormControl>
                    <ReactSelect
                      isMulti
                      options={services.map((service: any) => ({ value: service.id, label: service.name }))}
                      value={services
                        .filter((service: any) => field.value?.includes(service.id))
                        .map((service: any) => ({ value: service.id, label: service.name }))}
                      onChange={(selected) => field.onChange(selected?.map((s) => s.value) || [])}
                      placeholder={t("rooms.services_placeholder")}
                      isLoading={isServicesLoading}
                    />
                  </FormControl>
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
                          { value: "day", label: t("rooms.unit_day") },
                          { value: "month", label: t("rooms.unit_month") }
                        ]}
                        value={field.value ? { value: field.value, label: field.value === "day" ? t("rooms.unit_day") : field.value === "month" ? t("rooms.unit_month") : "" } : null}
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

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  className="mt-6 font-bold text-red-600"
                  disabled={fields.length === 1}
                >
                  {t("common.remove")}
                </Button>
              </div>
            ))}
            <Button type="button" onClick={() => append({ price_package_id: 0, unit: "month" as "day" | "month", unit_price: "" })}>
              {t("rooms.add_price")}
            </Button>
          </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("rooms.create_room")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
