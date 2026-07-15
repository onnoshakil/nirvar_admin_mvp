"use client";

import { useSession } from "next-auth/react";
import { Spin } from "antd";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { InstAdminDashboard } from "@/components/dashboard/InstAdminDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  return session.user.role === "SUPER_ADMIN" ? (
    <SuperAdminDashboard />
  ) : (
    <InstAdminDashboard />
  );
}
