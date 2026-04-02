import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input, ReactQuillEditor } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUILDING_TYPE } from "@/constant";
import { BuildingEditFormProps, BuildingEditFormRef, CreateBuildingRequest, UpdateBuildingRequest } from "@/dataHelper/building.dataHelper";
import { Ward } from "@/dataHelper/ward.dataHelper";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetWardsByProvinceId } from "@/hooks/useWardQuery";
import { buildingFormSchema } from "@/shared/shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";




const BuildingEditForm = React.forwardRef<BuildingEditFormRef, BuildingEditFormProps>(
  ({ building, userId, isLoading = false, isError = false }, ref) => {
    const { t } = useTranslation();
    // get all provinces types
    const { data: provincesTypes } = useGetAllProvincesTypes();
    const provincesTypesData = provincesTypes?.data || [];

    // get all building types
    const buildingTypesData = Object.entries(BUILDING_TYPE);

    // form data
    const [formData, setFormData] = React.useState<UpdateBuildingRequest>({
      name: "",
      user_id: userId || 0,
      province_id: building?.province_id || 0,
      ward_id: building?.ward_id || 0,
      address_detail: "",
      number_of_floors: 0,
      number_of_units: 0,
      year_built: 0,
      building_type: null,
      area: 0,
      description: "",
    } );

    // handle form
    const form = useForm<CreateBuildingRequest>({
      resolver: zodResolver(buildingFormSchema(t)),
      defaultValues: formData,
      mode: "onSubmit",
    });

    // get wards by province id
    const provinceId = form.watch("province_id");
    const { data: wardsData } = useGetWardsByProvinceId(Number(provinceId));
    useEffect(() => {
      form.setValue('ward_id', Number(building?.province_id));
    }, [provinceId]);

    // handle form data
    React.useImperativeHandle(ref, () => ({
      getFormData: () => form.getValues() as UpdateBuildingRequest,
      resetForm: () => {
        setFormData({
          name: "",
          user_id: userId,
          province_id: 0,
          ward_id: 0,
          address_detail: "",
          number_of_floors: 0,
          number_of_units: 0,
          year_built: 0,
          building_type: null,
          area: 0,
          description: "",
        } as UpdateBuildingRequest);
      }
    }));

    // handle reset form
    useEffect(() => {
      if (building) {
        form.reset({
          name: building.name || "",
          user_id: userId,
          province_id: building.province_id || 0,
          ward_id: building.ward_id || 0,
          address_detail: building.address_detail || "",
          number_of_floors: building.number_of_floors || 0,
          number_of_units: building.number_of_units || 0,
          year_built: building.year_built || 0,
          building_type: building.building_type || null,
          area: building.area || 0,
          description: building.description || "",
        });
      }
    }, [building, form]);

    return (
      <>
        {isError && <></>}
        {isLoading && <LoadingScreen text={t("common.loading")} />}
        {building && !isError && <Card className="w-full overflow-y-auto p-6 flex flex-col gap-6">
          <div className="">
            {/* Form */}
            <Form {...form}>
              <form className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Building Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-start gap-1">
                          <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.building_name")}</FormLabel>
                          <Star fill="#EF4444" className="size-2 text-red-500" />
                        </div>
                        <FormControl>
                          <Input {...field} id="name" placeholder={t("buildings.building_name_placeholder")} disabled={isLoading} value={field.value || ""} />
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
                        <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.area_square_meter")}</FormLabel>
                        <FormControl>
                          <Input {...field} id="area" type="number" step="0.01" placeholder={t("buildings.area_square_meter_placeholder")} disabled={isLoading} value={field.value || 0} />
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
                        <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.number_of_floors")}</FormLabel>
                        <FormControl>
                          <Input {...field} id="number_of_floors" type="number" step="1" placeholder={t("buildings.number_of_floors_placeholder")} disabled={isLoading} value={field.value || 0} />
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
                        <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.number_of_units")}</FormLabel>
                        <FormControl>
                          <Input {...field} id="number_of_units" type="number" step="1" placeholder={t("buildings.number_of_units_placeholder")} disabled={isLoading} value={field.value || 0} />
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
                        <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.year_built")}</FormLabel>
                        <FormControl>
                          <Input {...field} id="year_built" type="number" step="1" placeholder={t("buildings.year_built_placeholder")} disabled={isLoading} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Building Type */}
                  <FormField
                    control={form.control}
                    name="building_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.building_type_name")}</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("buildings.building_type_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                buildingTypesData.map(([key, value]) => {
                                  return (
                                    <SelectItem key={key} value={key}>
                                      {t(value)}
                                    </SelectItem>
                                  );
                                })
                              }
                            </SelectContent>
                          </Select>
                        </FormControl>
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
                          <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.province_name")}</FormLabel>
                          <Star fill="#EF4444" className="size-2 text-red-500" />
                        </div>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("buildings.province_name_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                provincesTypesData.map((province) => {
                                  return (
                                    <SelectItem key={province.id} value={province.id.toString()}> 
                                      {province.name}
                                    </SelectItem>
                                  );
                                })
                              }
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
                        <div className="flex flex-row grid-cols-1 items-center justify-start gap-1">
                          <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.ward_name")}</FormLabel>
                          <Star fill="#EF4444" className="size-2 text-red-500" />
                        </div>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("buildings.ward_name_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                wardsData?.data?.map((ward: Ward) => {
                                  return (
                                    <SelectItem key={ward.id} value={ward.id.toString()}>
                                      {ward.name}
                                    </SelectItem>
                                  );
                                })
                              }
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
                      <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.address_detail")}</FormLabel>
                      <FormControl>
                        <Input {...field} id="address_detail" className="resize-none" placeholder={t("buildings.address_detail_placeholder")} disabled={isLoading} value={field.value || ""} />
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
                      <div className="flex flex-row grid-cols-1 items-center justify-start gap-1">
                        <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.description")}</FormLabel>
                        {/* <Star fill="#EF4444" className="size-2 text-red-500" /> */}
                      </div>
                      <FormControl>
                        <ReactQuillEditor
                          {...field}
                          placeholder={t("buildings.description_placeholder")}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Area */}
              </form>
            </Form>
          </div>
        </Card>
        }
      </>
    );
  });

export default BuildingEditForm;
