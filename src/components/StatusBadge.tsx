"use client";

import { Tag } from "antd";

/**
 * Shared status pill used across institutions, devices and dashboards.
 * Supports institution statuses (ACTIVE/SUSPENDED) and device online
 * statuses (online/offline/never_connected).
 */
const CONFIG: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: "green", label: "Active" },
  SUSPENDED: { color: "red", label: "Suspended" },
  online: { color: "green", label: "Online" },
  offline: { color: "default", label: "Offline" },
  never_connected: { color: "default", label: "Never connected" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status] ?? { color: "default", label: status };
  return (
    <Tag color={cfg.color} style={{ margin: 0 }}>
      {cfg.label}
    </Tag>
  );
}
