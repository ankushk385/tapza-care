import { z } from "zod";

/**
 * Everything that arrives over the wire is validated at runtime with zod.
 * TypeScript types are *inferred* from these schemas, so there is exactly one
 * source of truth for both runtime safety and compile-time types.
 */

/* -------------------------------------------------------------------------- */
/* Layout config                                                              */
/* -------------------------------------------------------------------------- */

export const sectionBackgroundSchema = z.object({
  kind: z.enum(["color", "gradient", "image"]),
  /** `color`: #RRGGBB · `gradient`: comma separated hex stops · `image`: url */
  value: z.string().min(1),
});
export type SectionBackground = z.infer<typeof sectionBackgroundSchema>;

export const homeSectionSchema = z.object({
  id: z.string().min(1),
  /**
   * Free-form on purpose: the server may ship a section type this build has
   * never heard of. Renderers are looked up by name and unknown types are
   * skipped, never crashed on.
   */
  type: z.string().min(1),
  background: sectionBackgroundSchema,
  title: z.string().optional().default(""),
  items: z.array(z.unknown()).optional().default([]),
});
export type HomeSection = z.infer<typeof homeSectionSchema>;

export const configThemeSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  background: z.string(),
  surface: z.string(),
  textPrimary: z.string(),
  textSecondary: z.string(),
  accent: z.string(),
  festival: z
    .object({
      name: z.string(),
      greeting: z.string(),
      bannerImageUrl: z.string(),
    })
    .nullish(),
});
export type ConfigTheme = z.infer<typeof configThemeSchema>;

export const tabTargetSchema = z.enum([
  "home",
  "bookings",
  "prescriptions",
  "profile",
]);
export type TabTarget = z.infer<typeof tabTargetSchema>;

export const configTabSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  screen: tabTargetSchema,
});
export type ConfigTab = z.infer<typeof configTabSchema>;

export const layoutConfigSchema = z.object({
  version: z.number(),
  theme: configThemeSchema,
  tabs: z.array(configTabSchema).optional().default([]),
  sections: z.array(homeSectionSchema).optional().default([]),
});
export type LayoutConfig = z.infer<typeof layoutConfigSchema>;

/* -------------------------------------------------------------------------- */
/* Section items                                                              */
/* -------------------------------------------------------------------------- */

export const heroItemSchema = z.object({
  id: z.string(),
  imageUrl: z.string().optional(),
  greeting: z.string().optional(),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
});
export type HeroItem = z.infer<typeof heroItemSchema>;

export const chipItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
});
export type ChipItem = z.infer<typeof chipItemSchema>;

export const quickActionItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  target: tabTargetSchema.optional(),
});
export type QuickActionItem = z.infer<typeof quickActionItemSchema>;

export const serviceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceInr: z.number().nonnegative(),
  imageUrl: z.string().optional(),
  badge: z.string().optional(),
  icon: z.string().optional(),
});
export type ServiceItem = z.infer<typeof serviceItemSchema>;

export const doctorRefItemSchema = z.object({
  doctorId: z.string(),
});
export type DoctorRefItem = z.infer<typeof doctorRefItemSchema>;

export const offerItemSchema = z.object({
  id: z.string(),
  message: z.string(),
  icon: z.string().optional(),
});
export type OfferItem = z.infer<typeof offerItemSchema>;

/* -------------------------------------------------------------------------- */
/* Domain models                                                              */
/* -------------------------------------------------------------------------- */

export const doctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  specialty: z.string(),
  photoUrl: z.string(),
  feeInr: z.number().nonnegative(),
  languages: z.array(z.string()),
  clinicName: z.string(),
  nextAvailable: z.string(),
});
export type Doctor = z.infer<typeof doctorSchema>;

export const slotSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  available: z.boolean(),
});
export type Slot = z.infer<typeof slotSchema>;

export const doseTimingSchema = z.enum(["morning", "afternoon", "night"]);
export type DoseTiming = z.infer<typeof doseTimingSchema>;

export const medicineSchema = z.object({
  id: z.string(),
  name: z.string(),
  dose: z.string(),
  days: z.number().int().positive(),
  timing: z.array(doseTimingSchema),
});
export type Medicine = z.infer<typeof medicineSchema>;

export const prescriptionSchema = z.object({
  id: z.string(),
  issuedAt: z.string(),
  doctorName: z.string(),
  clinicName: z.string(),
  medicines: z.array(medicineSchema),
});
export type Prescription = z.infer<typeof prescriptionSchema>;

export const bookingSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  slotId: z.string(),
  status: z.enum(["confirmed", "cancelled"]),
  createdAt: z.string(),
});
export type Booking = z.infer<typeof bookingSchema>;

/** Parses an unknown payload, throwing a readable error instead of `any`. */
export function parseOrThrow<T>(schema: z.ZodType<T>, payload: unknown, label: string): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(
      `Invalid ${label}: ${first ? `${first.path.join(".")} — ${first.message}` : "unknown shape"}`,
    );
  }
  return result.data;
}
