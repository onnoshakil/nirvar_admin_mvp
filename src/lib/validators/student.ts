import { z } from "zod/v4";

export const registerStudentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Valid email is required"),
  deviceId: z.string().min(1, "Device ID is required"),
});

export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
