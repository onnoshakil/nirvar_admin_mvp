import { z } from "zod/v4";

export const createInstitutionSchema = z.object({
  name: z.string().min(1, "Institution name is required").max(200),
  address: z.string().optional(),
  contactEmail: z.email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  admin: z.object({
    name: z.string().min(1, "Admin name is required").max(100),
    email: z.email("Valid email is required"),
  }),
});

export const updateInstitutionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().optional(),
  contactEmail: z.email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const addAdminSchema = z.object({
  name: z.string().min(1, "Admin name is required").max(100),
  email: z.email("Valid email is required"),
});

export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;
export type UpdateInstitutionInput = z.infer<typeof updateInstitutionSchema>;
export type AddAdminInput = z.infer<typeof addAdminSchema>;
