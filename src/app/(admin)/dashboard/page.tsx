"use client";

import { useSession } from "next-auth/react";
import { Typography } from "antd";

const { Title } = Typography;

export default function DashboardPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  return (
    <div>
      <Title level={3}>
        {isSuperAdmin ? "System Overview" : "Institution Dashboard"}
      </Title>
      {/* TODO: Nahid — build dashboard stat cards and metrics here */}
    </div>
  );
}
