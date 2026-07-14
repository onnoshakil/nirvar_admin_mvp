"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Layout, Spin } from "antd";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";

const { Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar
        role={session?.user?.role || "INST_ADMIN"}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />
      <Layout>
        <AdminHeader />
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#f5f5f5",
            minHeight: "calc(100vh - 64px - 48px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
