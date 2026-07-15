"use client";

import { Alert } from "antd";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Alert
      type="warning"
      showIcon
      banner
      message="You're offline — changes won't save until your connection is restored."
      style={{ marginBottom: 16 }}
    />
  );
}
