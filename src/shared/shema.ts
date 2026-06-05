import { IMAGE_ALLOWED_TYPES, IMAGE_MAX_FILES, IMAGE_MAX_SIZE, MAX_LENGTH_INPUT as MAX_LENGTH, NODE_OPTION_MARGIN as MIN_LENGTH, regexEmail, regexPassword } from "@/constant";
import { z } from "zod";

// Schema validation cho form
export const profileFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, { message: t("validation.register_name_min") }),
    email: z.string().email({ message: t("validation.register_email_invalid") }),
    phone: z.string().regex(/^[0-9]{10,11}$/, { message: t("validation.register_phone_invalid") }),
    avatar: z.string().optional(),
    id_avatar: z.string().optional(),
  });

export const formAdminSchema = z.object({
  first_name: z.string().min(1, { message: "validation.firstName.required" }).max(MAX_LENGTH, { message: "validation.firstName.maxLength" }),
  last_name: z.string().min(1, { message: "validation.lastName.required" }).max(MAX_LENGTH, { message: "validation.lastName.maxLength" }),
  email: z
    .string()
    .min(1, { message: "validation.email.required" })
    .max(MAX_LENGTH, { message: "validation.email.maxLength" })
    .refine((email) => regexEmail.test(email), "validation.email.invalid"),
  avatar: z.string().optional(),
  status: z.enum(["1", "0"]),
  role_id: z.union([z.string(), z.number()]).optional(),
});

export const loginFormSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t("validation.email.required") })
      .max(MAX_LENGTH, { message: t("validation.email.maxLength") })
      .refine((email) => regexEmail.test(email), t("validation.email.invalid")),
    password: z
      .string()
      .min(1, { message: t("validation.password.required") })
      .min(MIN_LENGTH, { message: t("validation.password.invalid") })
      .max(MAX_LENGTH, { message: t("validation.password.maxLength") }),
    rememberMe: z.boolean().optional(),
  });

export const registerFormSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(2, { message: t("validation.register_name_min") }),
      email: z.string().email({ message: t("validation.register_email_invalid") }),
      phone: z.string().regex(/^[0-9]{10,11}$/, { message: t("validation.register_phone_invalid") }),
      company_name: z.string().min(1, { message: t("validation.company_name_required") }),
      province_id: z.number().min(1, { message: t("validation.province_name_required") }),
      ward_id: z.number().min(1, { message: t("validation.ward_name_required") }),
      password: z.string().min(8, { message: t("validation.register_password_min") }),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("validation.register_password_confirmation_mismatch"),
      path: ["password_confirmation"],
    });

export const forgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t("validation.email.required") })
      .max(MAX_LENGTH, { message: t("validation.email.maxLength") })
      .refine((email) => regexEmail.test(email), t("validation.email.invalid")),
  });

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, { message: "account.current_password_required" }),
    new_password: z.string().min(8, { message: "account.new_password_min" }),
    confirm_password: z.string().min(1, { message: "account.confirm_password_required" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "account.confirm_password_not_match",
    path: ["confirm_password"],
  });

// Set Password Schema on the first time
export const setPasswordFormSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z
        .string()
        .min(1, { message: t("validation.password.required") })
        .max(MAX_LENGTH, { message: t("validation.password.maxLength") })
        .refine((password) => regexPassword.test(password), t("validation.password.invalid")),
      confirmPassword: z.string().min(1, { message: t("validation.confirm_password_required") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.register_password_confirmation_mismatch"),
      path: ["confirmPassword"],
    });

/**
 * Check if ReactQuill content is truly empty (ignoring empty HTML tags)
 * @param content HTML string from ReactQuill
 * @returns true if empty, false if has actual content
 */
export const isQuillContentEmpty = (content: string): boolean => {
  if (!content) return true;
  // Remove all HTML tags, whitespace, and newlines
  const text = content.replace(/<(.|\n)*?>/g, "").replace(/\s/g, "");
  return text.length === 0;
};

export const formRoleSchema = z.object({
  name: z.string().min(1, { message: "validation.role.name_required" }).max(MAX_LENGTH, { message: "validation.role.name_max_length" }),
});

export const adminProfileFormSchema = z.object({
  first_name: z.string().min(1, { message: "validation.firstName.required" }).max(MAX_LENGTH, { message: "validation.firstName.maxLength" }),
  last_name: z.string().min(1, { message: "validation.lastName.required" }).max(MAX_LENGTH, { message: "validation.lastName.maxLength" }),
  role_id: z.union([z.string(), z.number()]).optional(),
  avatar: z.string().optional(),
});

export const createUserSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(2, { message: t("validation.user.name_min") }).max(100, { message: t("validation.user.name_max") }),
      email: z.string().min(1, { message: t("validation.user.email_required") }).email({ message: t("validation.user.email_invalid") }).max(255, { message: t("validation.user.email_max") }),
      phone: z.string().optional().refine((val) => !val || /^[0-9]{10,20}$/.test(val), { message: t("validation.user.phone_invalid") }),
      password: z.string().min(8, { message: t("validation.user.password_min") }),
      password_confirmation: z.string().min(1, { message: t("validation.user.password_confirmation_required") }),
      role: z.enum(["partner", "user"]).optional(),
      status: z.enum(["0", "1", "2"]).optional(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("validation.user.password_confirmation_same"),
      path: ["password_confirmation"],
    });

export const resetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z
        .string()
        .min(1, { message: t("validation.password.required") })
        .max(MAX_LENGTH, { message: t("validation.password.maxLength") })
        .refine((password) => regexPassword.test(password), t("validation.password.invalid")),
      password_confirmation: z
        .string()
        .min(1, { message: t("validation.password.required") })
        .max(MAX_LENGTH, { message: t("validation.password.maxLength") }),
      token: z.string(),
      user_type: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("validation.password.confirmPassword"),
      path: ["password_confirmation"],
    });

export const propertyFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, { message: t("properties.property_name") + " " + t("common.is_required") }),
    user_id: z.preprocess(
      (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
      z.number().min(1, { message: t("properties.address") + " " + t("common.is_required") })
    ),
    province_id: z.preprocess(
      (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
      z.number().min(1, { message: t("properties.table_province") + " " + t("common.is_required") })
    ),
    ward_id: z.preprocess(
      (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
      z.number().min(1, { message: t("properties.table_ward") + " " + t("common.is_required") })
    ),
    address_detail: z.string().min(1, { message: t("properties.address") + " " + t("common.is_required") }),
    number_of_floors: z.preprocess(
      (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
      z.number().min(1, { message: t("properties.table_number_of_floors") + " " + t("common.is_required") })
    ),
    number_of_units: z.preprocess(
      (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
      z.number().min(1, { message: t("properties.table_number_of_units") + " " + t("common.is_required") })
    ),
    year_built: z.preprocess(
      (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v)),
      z.number().nullable()
    ),
    property_type_id: z.preprocess(
      (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
      z.number().min(1, { message: t("properties.property_type_name") + " " + t("common.is_required") })
    ),
    rent_category: z.preprocess(
      (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
      z.number().min(1, { message: t("properties.rent_category_name") + " " + t("common.is_required") })
    ),
    area: z.preprocess(
      (v) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
      z.number().min(1, { message: t("properties.area") + " " + t("common.is_required") })
    ),
    description: z.string(),
  });

export const userFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, { message: t("validation.register_name_min") }),
    email: z.string().email({ message: t("validation.register_email_invalid") }),
    phone: z.string().regex(/^[0-9]{10,11}$/, { message: t("validation.register_phone_invalid") }),
    role: z.string().min(1, { message: t("user.filter_role") + " " + t("common.is_required") }),
  });

export const roomFormSchema = (t: (key: string) => string) =>
  z.object({
    property_id: z.preprocess(
      v => (v === null || v === undefined ? 0 : v),
      z.number().min(1, { message: t("rooms.property") + " " + t("common.is_required") })
    ),
    title: z.string().min(1, { message: t("rooms.room_title") + " " + t("common.is_required") }),
    room_number: z.string().optional(),
    deposit: z.string().optional(),
    area: z.string().min(1, { message: t("rooms.area") + " " + t("common.is_required") }),
    floor_number: z.preprocess(
      v => {
        if (v === null || v === undefined || v === "" || isNaN(Number(v))) return 0;
        return Number(v);
      },
      z.number().min(1, { message: t("rooms.floor_number") + " " + t("common.is_required") })
    ),
    people: z.preprocess(
      v => {
        if (v === null || v === undefined || v === "" || isNaN(Number(v))) return 0;
        return Number(v);
      },
      z.number().min(1, { message: t("rooms.people") + " " + t("common.is_required") })
    ),
    room_type: z.number().min(1, { message: t("rooms.room_type") + " " + t("common.is_required") }),
    status: z.boolean().default(false),
    description: z.string().optional(),
    amenities: z.array(z.number()).min(1, { message: t("rooms.amenities") + " " + t("common.is_required") }),
    services: z.array(z.number()).min(1, { message: t("rooms.services") + " " + t("common.is_required") }),
    prices: z.array(z.object({
      price_package_id: z.preprocess(
        v => (v === null || v === undefined ? 0 : v),
        z.number().min(1, { message: t("rooms.price_package") + " " + t("common.is_required") })
      ),
      unit: z.enum(["day", "month"], { message: t("rooms.unit") + " " + t("common.is_required") }),
      unit_price: z.string().min(1, { message: t("rooms.unit_price") + " " + t("common.is_required") }),
    })).min(1, { message: t("rooms.prices") + " " + t("common.is_required") }),
  });

const chatbotAnswerSchema = (t: (key: string, options?: Record<string, unknown>) => string) =>
  z.object({
    id: z
      .number()
      .int()
      .positive()
      .optional(),
    content: z
      .string()
      .trim()
      .min(1, { message: t("questions.create.errors.answer_content_required") }),
    next_question_id: z
      .union([
        z
          .number({ invalid_type_error: t("questions.create.errors.next_question_invalid") })
          .int({ message: t("questions.create.errors.next_question_invalid") })
          .min(0, { message: t("questions.create.errors.next_question_invalid") }),
        z.null(),
      ])
      .optional()
      .transform((value) => (value === undefined ? null : value)),
    _action: z.enum(["create", "update", "delete"]).optional(),
  });

export const chatbotQuestionCreateSchema = (t: (key: string, options?: Record<string, unknown>) => string) =>
  z
    .object({
      content: z
        .string()
        .trim()
        .min(1, { message: t("questions.create.errors.content_required") }),
      type: z.union([z.literal(0), z.literal(1)], {
        errorMap: () => ({ message: t("questions.create.errors.type_invalid") }),
      }),
      is_start_node: z.union([z.literal(0), z.literal(1)], {
        errorMap: () => ({ message: t("questions.create.errors.is_start_node_invalid") }),
      }),
      answers: z.array(chatbotAnswerSchema(t)).default([]),
    })
    .superRefine((data, ctx) => {
      if (data.type === 0) {
        if (!data.answers || data.answers.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["answers"],
            message: t("questions.create.errors.answers_required"),
          });
        }
      }

      if (data.type === 1) {
        if (data.answers && data.answers.length > 0) {
          const hasNonDeletionEntry = data.answers.some((answer) => answer._action !== "delete");
          if (hasNonDeletionEntry) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["answers"],
              message: t("questions.create.errors.answers_not_allowed"),
            });
          }
        }
      }
    });


export const amenityFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, { message: t("amenities.name_required") }).max(255, { message: t("amenities.name_max") }),
  });

export const addAmenitySchema = (t: (key: string) => string, existingAmenities: string[] = []) =>
  z.object({
    name: z.string()
      .min(1, { message: t("amenities.name_required") })
      .max(255, { message: t("amenities.name_max") })
      .refine(
        (val: string) => val.trim() === val,
        { message: t("amenities.name_trim_required") }
      )
      .transform((val: string) => val.trim())
      .refine(
        (trimmedName: string) => !existingAmenities.some(
          (existing) => existing.toLowerCase() === trimmedName.toLowerCase()
        ),
        { message: t("amenities.name_exists") }
      ),
  });
export const propertyImageFormSchema = (t: (key: string) => string) => {
  return z.object({
    image_url: z.string().min(1, { message: t("property-images.image_url_required") }),
    image_type: z.number().min(1, { message: t("property-images.image_type_required") }),
    id_image_cloudinary: z.string().min(1, { message: t("property-images.id_image_cloudinary_required") }),
  });
}

export const addServiceSchema = (t: (key: string) => string, existingServices: string[] = []) =>
  z.object({
    name: z.string()
      .trim()
      .min(1, { message: t('serviceManagement.name_required') })
      .max(100, { message: t('serviceManagement.name_max') })
      .refine(
        (val: string) => val.trim() === val,
        { message: t('serviceManagement.name_trim_require') }
      )
      .transform((val: string) => val.trim())
      .refine(
        (trimmedName: string) => !existingServices.some(
          (existing) => existing.toLowerCase() === trimmedName.toLowerCase()
        ),
        { message: t('serviceManagement.name_exist') }
      ),
    price: z.string()
      .min(1, { message: t('serviceManagement.price_required') })
      .regex(/^[0-9]+(\.[0-9]+)?$/, { message: t('serviceManagement.price_invalid') }),
    description: z.string().optional(),
  })

export const editServiceSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string()
      .min(1, { message: t('serviceManagement.name_required') })
      .max(100, { message: t('serviceManagement.name_max') })
      .refine(
        (val: string) => val.trim() === val,
        { message: t('serviceManagement.name_trim_require') }
      )
      .transform((val: string) => val.trim()),
    price: z.string()
      .min(1, { message: t('serviceManagement.price_required') })
      .regex(/^\d+(\.\d+)?$/, { message: t('serviceManagement.price_invalid') }),
    description: z.string().optional(),
  })

export const imageFilesSchema = (t: (key: string, options?: any) => string) =>
  z.object({
    files: z.array(z.instanceof(File))
      .min(1, { message: t('room_images.no_valid_files') })
      .refine((files) => files.length <= IMAGE_MAX_FILES, {
        message: t('room_images.max_files_exceeded', { max: IMAGE_MAX_FILES }),
      })
      .refine((files) => files.every(file => IMAGE_ALLOWED_TYPES.includes(file.type)), {
        message: t('room_images.accepted_file_types'),
      })
      .refine((files) => files.every(file => file.size <= IMAGE_MAX_SIZE), {
        message: t('room_images.file_size_limit'),
      }),
  });

export const singleImageSchema = (t: (key: string) => string) =>
  z.object({
    file: z.instanceof(File)
      .refine((file) => IMAGE_ALLOWED_TYPES.includes(file.type), {
        message: t('room_images.accepted_file_types'),
      })
      .refine((file) => file.size <= IMAGE_MAX_SIZE, {
        message: t('room_images.file_size_limit'),
      }),
  });

export const avatarSchema = (t: (key: string) => string) =>
  z.object({
    file: z.instanceof(File)
      .refine((file) => ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/svg+xml", "image/webp"].includes(file.type), {
        message: t("validation.user.avatar_invalid_ext"),
      })
      .refine((file) => file.size <= 2 * 1024 * 1024, {
        message: t("validation.user.avatar_too_large"),
      }),
  });

export const bookingCreateSchema = (t: (key: string) => string) =>
  z.object({
    selectedProperty: z.string().min(1, { message: t("bookings.add.property_required") }),
    selectedRoom: z.string().min(1, { message: t("bookings.add.room_required") }),
    selectedPricePackage: z.string().min(1, { message: t("bookings.add.price_required") }),
    startDate: z.string().min(1, { message: t("bookings.add.start_date_required") }),
    endDate: z.string().min(1, { message: t("bookings.add.end_date_required") }),
    selectedStatus: z.string().min(1, { message: t("bookings.add.status_required") }),
    note: z.string().optional(),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
  }, {
    message: t("bookings.add.end_date_must_after_start"),
    path: ["endDate"],
  });
// news schema
export const newsFormSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, { message: t("validation.news.title_required") }),
    summary: z.string().optional(),
    content: z.string().min(1, { message: t("validation.news.content_required") }),
    status: z.number().min(0, { message: t("validation.news.status_required") }),
    published_at: z.date().min(new Date(), { message: t("validation.news.published_at_required") }),
    image_url: z.string().min(1, { message: t("validation.news.image_url_required") }),
    id_image_cloudinary: z.string().min(1, { message: t("validation.news.id_image_cloudinary_required") }),
  });
export const editPartnerSchema = (t: (key: string) => string) => z.object({
  company_name: z.string()
    .max(255, { message: t("partner.company_name") + " " + t("partner.max_length_255") })
    .optional(),
  province_id: z.preprocess(
    (v) => (v === null || v === undefined || v === "" ? 0 : Number(v)),
    z.number().min(1, { message: t("validation.province_name_required") })
  ).optional(),
  ward_id: z.preprocess(
    (v) => (v === null || v === undefined || v === "" ? 0 : Number(v)),
    z.number().min(1, { message: t("validation.ward_name_required") })
  ).optional(),
  phone: z
    .string()
    .regex(/^$|^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    .optional(),
  address: z.string().max(255, { message: t("partner.address") + " " + t("partner.max_length_255") }).optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  image_1: z.union([z.instanceof(File), z.literal('delete'), z.null()]).optional()
    .refine((file) => !file || file === 'delete' || IMAGE_ALLOWED_TYPES.includes(file.type), {
      message: t('partner.accepted_file_types'),
    })
    .refine((file) => !file || file === 'delete' || file.size <= IMAGE_MAX_SIZE, {
      message: t('partner.file_size_limit'),
    }),
  image_2: z.union([z.instanceof(File), z.literal('delete'), z.null()]).optional()
    .refine((file) => !file || file === 'delete' || IMAGE_ALLOWED_TYPES.includes(file.type), {
      message: t('partner.accepted_file_types'),
    })
    .refine((file) => !file || file === 'delete' || file.size <= IMAGE_MAX_SIZE, {
      message: t('partner.file_size_limit'),
    }),
  image_3: z.union([z.instanceof(File), z.literal('delete'), z.null()]).optional()
    .refine((file) => !file || file === 'delete' || IMAGE_ALLOWED_TYPES.includes(file.type), {
      message: t('partner.accepted_file_types'),
    })
    .refine((file) => !file || file === 'delete' || file.size <= IMAGE_MAX_SIZE, {
      message: t('partner.file_size_limit'),
    }),
})

// user booking form schema
export const bookingUserFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, { message: t("booking.validation.name.required") }).min(2, { message: t("booking.validation.name.minLength") }),
    email: z.string().min(1, { message: t("booking.validation.email.required") }).email({ message: t("booking.validation.email.invalid") }),
    phone: z.string().min(1, { message: t("booking.validation.phone.required") }).regex(/^[0-9]{10,11}$/, { message: t("booking.validation.phone.invalid") }),
    start_date: z.string().min(1, { message: t("booking.validation.startDate.required") }),
    end_date: z.string().min(1, { message: t("booking.validation.endDate.required") }),
    note: z.string().max(500, { message: t("booking.validation.note.maxLength") }).optional(),
    service_ids: z.array(z.number()).optional(),
    payment_method: z.string().min(1, { message: "Vui lòng chọn phương thức thanh toán" }),
  }).refine((data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) < new Date(data.end_date);
    }
    return true;
  }, {
    message: t("booking.validation.endDate.afterStart"),
    path: ["end_date"],
  });

