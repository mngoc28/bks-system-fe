import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Input, ReactQuillEditor } from "@/components/ui/input";
import { ArrowLeftIcon, Save, Star, TrashIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildingFormSchema } from "@/shared/shema";
import { CreateBuildingRequest } from "@/dataHelper/building.dataHelper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { ROUTERS } from "@/constant";
import { useGetWardsByProvinceId } from "@/hooks/useWardQuery";
import { Ward } from "@/dataHelper/ward.dataHelper";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useBuildingTypesQuery, useCreateBuildingMutation } from "@/hooks/useBuildingQuery";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import { BuildingType } from "@/dataHelper/building.dataHelper";
import { RENT_CATEGORY } from "@/constant";

const BuildingAddForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: provincesTypes } = useGetAllProvincesTypes();
  const createBuildingMutation = useCreateBuildingMutation();
  const { data: buildingTypes } = useBuildingTypesQuery();
  const { data: profileData } = useGetUserProfileQuery();
  const userId = profileData?.data?.id ?? 0;
  const provincesTypesData = provincesTypes?.data || [];
  // form data
  const [formData, setFormData] = React.useState<CreateBuildingRequest>({
    name: "",
    user_id: userId,
    province_id: 0,
    ward_id: 0,
    address_detail: "",
    number_of_floors: 0,
    number_of_units: 0,
    year_built: 0,
    property_type_id: 0,
    rent_category: 0,
    area: 0,
    description: "",
  });

  const buildingTypesData = buildingTypes?.data || [];

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
    form.setValue('ward_id', 0);
  }, [provinceId, form]);

  // Update form when userId is loaded
  useEffect(() => {
    if (userId && userId > 0) {
      form.setValue('user_id', userId);
      setFormData(prev => ({ ...prev, user_id: userId }));
    }
  }, [userId, form]);

  // handle submit form
  const handleSubmit = async (values: CreateBuildingRequest) => {
    const submitData = {
      ...values,
      user_id: userId || values.user_id,
    };
    await createBuildingMutation.mutateAsync(submitData);
    navigate(ROUTERS.BUILDINGS);
  };
  
  //handle delete form 
  const handleDelete = () =>{
    setFormData({
      name: "",
      user_id: userId,
      province_id: 0,
      ward_id: 0,
      address_detail: "",
      number_of_floors: 0,
      number_of_units: 0,
      year_built: 0,
      property_type_id: 0,
      rent_category: 0,
      area: 0,
      description: "",
    });
    form.reset({
      name: "",
      user_id: userId,
      province_id: 0,
      ward_id: 0,
      address_detail: "",
      number_of_floors: 0,
      number_of_units: 0,
      year_built: 0,
      property_type_id: 0,
      rent_category: 0,
      area: 0,
      description: "",
    });
  }

  // handle back to buildings list
  const handleBack = () =>{
    navigate(ROUTERS.BUILDINGS);
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between gap-6">
        <h2 className="text-2xl font-bold">{t("buildings.create_building")}</h2>
        <div className="flex flex-row items-center justify-center gap-3">
          <Button type="button" className="h-11 w-[90%] bg-red-600 text-[14px] text-white hover:bg-red-500 md:w-full md:text-[16px]" onClick={handleDelete}>
            <TrashIcon className="size-5" />
            <span className="hidden lg:block">{t("common.delete")}</span>
          </Button>
          <Button type="submit" className="h-11 w-[90%] bg-blue-600 text-[14px] text-white hover:bg-blue-500 md:w-full md:text-[16px]" onClick={() => handleSubmit(form.getValues())}>
            <Save className="size-5" />
            <span className="hidden lg:block">{t("common.save")}</span>
          </Button>
          <Button type="button" className="h-11 w-[90%] bg-gray-600 text-[14px] text-white hover:bg-gray-500 md:w-full md:text-[16px]" 
           onClick={() => handleBack()}
          >
            <ArrowLeftIcon className="size-5" />
            <span className="hidden lg:block">{t("common.back")}</span>
          </Button>
        </div>
      </div>
      <Card className="w-full overflow-y-auto">
        <div className="p-6">
          {/* Form */}
          <Form {...form}>
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        <Input {...field} id="name" type="text" placeholder={t("buildings.building_name_placeholder")} value={field.value || ""} />
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
                        <Input {...field} id="area" type="number" step="0.01" placeholder={t("buildings.area_square_meter_placeholder")} value={field.value || 0} />
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
                        <Input {...field} id="number_of_floors" type="number" step="1" placeholder={t("buildings.number_of_floors_placeholder")} value={field.value || 0} />
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
                        <Input {...field} id="number_of_units" type="number" step="1" placeholder={t("buildings.number_of_units_placeholder")} value={field.value || 0} />
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
                        <Input {...field} id="year_built" type="number" step="1" placeholder={t("buildings.year_built_placeholder")} value={field.value || ""} />
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
                        <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.building_type_name")}</FormLabel>
                        <Star fill="#EF4444" className="size-2 text-red-500" />
                      </div>
                      <FormControl>
                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("buildings.building_type_placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              buildingTypesData.map((type: BuildingType) => {
                                return (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
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

                {/* Rent Category */}
                <FormField
                  control={form.control}
                  name="rent_category"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-start gap-1">
                        <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.rent_category_name")}</FormLabel>
                        <Star fill="#EF4444" className="size-2 text-red-500" />
                      </div>
                      <FormControl>
                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("buildings.rent_category_placeholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              Object.entries(RENT_CATEGORY).map(([key, value]) => {
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
                      <div className="flex grid-cols-1 flex-row items-center justify-start gap-1">
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
                      <Input {...field} id="address_detail" className="resize-none" placeholder={t("buildings.address_detail_placeholder")} value={field.value || ""} />
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
                      <FormLabel className="text-sm font-normal text-slate-700">{t("buildings.description")}</FormLabel>
                      {/* <Star fill="#EF4444" className="size-2 text-red-500" /> */}
                    </div>
                    <FormControl>
                      <ReactQuillEditor
                        {...field}
                        placeholder={t("buildings.description_placeholder")}
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
    </>
  );
};

export default BuildingAddForm;
