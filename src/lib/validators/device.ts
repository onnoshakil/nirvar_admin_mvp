import { z } from "zod/v4";

export const registerDeviceSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required").max(50),
  deviceModel: z.string().optional(),
  deviceName: z.string().optional(),
});

export const heartbeatSchema = z.object({
  deviceId: z.string().min(1),
  policyVersionApplied: z.number().int().min(0),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type HeartbeatInput = z.infer<typeof heartbeatSchema>;
