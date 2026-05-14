import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input, ReactQuillEditor } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RENT_CATEGORY } from "@/constant";
import { PropertyEditFormProps, PropertyType, CreatePropertyRequest, UpdatePropertyRequest } from "@/dataHelper/property.dataHelper";
import { usePropertyTypesQuery } from "@/hooks/usePropertyQuery";
import { Ward } from "@/dataHelper/ward.dataHelper";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetWardsByProvinceId } from "@/hooks/useWardQuery";
import { propertyFormSchema } from "@/shared/shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const PropertyEditForm: React.FC<PropertyEditFormProps> = ({ property, userId, onSubmit, onCancel, isLoading = false, isError = false }) => {
    const { t } = useTranslation();
    // get all provinces types
    const { data: provincesTypes } = useGetAllProvincesTypes();
    const provincesTypesData = provincesTypes?.data || [];

    // get all property types
    const { data: propertyTypes } = usePropertyTypesQuery();
    const propertyTypesData = propertyTypes?.data || [];

    // form data
    const [formData] = React.useState<UpdatePropertyRequest>({
      name: "",
      user_id: userId || 0,
      province_id: property?.province_id || 0,
      ward_id: property?.ward_id || 0,
      address_detail: "",
      number_of_floors: 0,
      number_of_units: 0,
      year_built: 0,
      property_type_id: 0,
      rent_category: 0,
      area: 0,
      description: "",
    });

    // handle form
    const form = useForm<CreatePropertyRequest>({
      resolver: zodResolver(propertyFormSchema(t)),
      defaultValues: formData,
      mode: "onSubmit",
    });

    // get wards by province id
    const provinceId = form.watch("province_id");
    const { data: wardsData } = useGetWardsByProvinceId(Number(provinceId));
    
    useEffect(() => {
      if (provinceId && provinceId !== property?.province_id) {
        form.setValue('ward_id', 0);
      }
    }, [provinceId, property?.province_id, form]);

    // handle reset form when property data arrives
    useEffect(() => {
      if (property) {
        form.reset({
          name: property.name || "",
          user_id: userId,
          province_id: property.province_id || 0,
          ward_id: property.ward_id || 0,
          address_detail: property.address_detail || "",
          number_of_floors: property.number_of_floors || 0,
          number_of_units: property.number_of_units || 0,
          year_built: (property.year_built as any) || 0,
          property_type_id: property.property_type_id || 0,
          rent_category: property.rent_category || 0,
          area: property.area || 0,
          description: property.description || "",
        });
      }
    }, [property, form, userId]);

    const handleSubmit = (data: CreatePropertyRequest) => {
      onSubmit(data as UpdatePropertyRequest);
    };

    return (
      <>
        {isError && <></>}
        {isLoading && <LoadingScreen text={t("common.loading")} />}
        {property && !isError && (
          <Card className="flex w-full flex-col gap-6 overflow-y-auto p-6">
            <div className="">
              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Property Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-start gap-1">
                            <FormLabel className="text-sm font-normal text-slate-700">{t("properties.property_name")}</FormLabel>
                            <Star fill="#EF4444" className="size-2 text-red-500" />
                          </div>
                          <FormControl>
                            <Input {...field} id="name" placeholder={t("properties.property_name_placeholder")} disabled={isLoading} value={field.value || ""} />
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
                          <FormLabel className="text-sm font-normal text-slate-700">{t("properties.area_square_meter")}</FormLabel>
                          <FormControl>
                            <Input {...field} id="area" type="number" step="0.01" placeholder={t("properties.area_square_meter_placeholder")} disabled={isLoading} value={field.value || 0} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Number of Floors */}
                    <FormField
                      control={form.control}
                      name="number_of_floors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-normal text-slate-700">{t("properties.number_of_floors")}</FormLabel>
                          <FormControl>
                            <Input {...field} id="number_of_floors" type="number" step="1" placeholder={t("properties.number_of_floors_placeholder")} disabled={isLoading} value={field.value || 0} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Number of Units */}
                    <FormField
                      control={form.control}
                      name="number_of_units"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-normal text-slate-700">{t("properties.number_of_units")}</FormLabel>
                          <FormControl>
                            <Input {...field} id="number_of_units" type="number" step="1" placeholder={t("properties.number_of_units_placeholder")} disabled={isLoading} value={field.value || 0} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Year Built */}
                    <FormField
                      control={form.control}
                      name="year_built"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-normal text-slate-700">{t("properties.year_built")}</FormLabel>
                          <FormControl>
                            <Input {...field} id="year_built" type="number" step="1" placeholder={t("properties.year_built_placeholder")} disabled={isLoading} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Property Type */}
                    <FormField
                      control={form.control}
                      name="property_type_id"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-start gap-1">
                            <FormLabel className="text-sm font-normal text-slate-700">{t("properties.property_type_name")}</FormLabel>
                            <Star fill="#EF4444" className="size-2 text-red-500" />
                          </div>
                          <FormControl>
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder={t("properties.property_type_placeholder")} />
                              </SelectTrigger>
                              <SelectContent>
                                {propertyTypesData.map((type: PropertyType) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Rent Category */}
                    <FormField
                      control={form.control}
                      name="rent_category"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-start gap-1">
                            <FormLabel className="text-sm font-normal text-slate-700">{t("properties.rent_category_name")}</FormLabel>
                            <Star fill="#EF4444" className="size-2 text-red-500" />
                          </div>
                          <FormControl>
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder={t("properties.rent_category_placeholder")} />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(RENT_CATEGORY).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {t(value)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* province name */}
                    <FormField
                      control={form.control}
                      name="province_id"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-start gap-1">
                            <FormLabel className="text-sm font-normal text-slate-700">{t("properties.province_name")}</FormLabel>
                            <Star fill="#EF4444" className="size-2 text-red-500" />
                          </div>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder={t("properties.province_name_placeholder")} />
                              </SelectTrigger>
                              <SelectContent>
                                {provincesTypesData.map((province) => (
                                  <SelectItem key={province.id} value={province.id.toString()}>
                                    {province.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* ward name */}
                    <FormField
                      control={form.control}
                      name="ward_id"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex grid-cols-1 flex-row items-center justify-start gap-1">
                            <FormLabel className="text-sm font-normal text-slate-700">{t("properties.ward_name")}</FormLabel>
                            <Star fill="#EF4444" className="size-2 text-red-500" />
                          </div>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder={t("properties.ward_name_placeholder")} />
                              </SelectTrigger>
                              <SelectContent>
                                {wardsData?.data?.map((ward: Ward) => (
                                  <SelectItem key={ward.id} value={ward.id.toString()}>
                                    {ward.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Detail */}
                  <FormField
                    control={form.control}
                    name="address_detail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-slate-700">{t("properties.address_detail")}</FormLabel>
                        <FormControl>
                          <Input {...field} id="address_detail" className="resize-none" placeholder={t("properties.address_detail_placeholder")} disabled={isLoading} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex grid-cols-1 flex-row items-center justify-start gap-1">
                          <FormLabel className="text-sm font-normal text-slate-700">{t("properties.description")}</FormLabel>
                        </div>
                        <FormControl>
                          <ReactQuillEditor
                            {...field}
                            placeholder={t("properties.description_placeholder")}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                      <ArrowLeft className="mr-2 size-4" />
                      {t("common.back")}
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                      {t("common.save")}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </Card>
        )}
      </>
    );
  };

export default PropertyEditForm;

