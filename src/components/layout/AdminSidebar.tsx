"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  TabletOutlined,
  TeamOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

interface AdminSidebarProps {
  role: string;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function AdminSidebar({
  role,
  collapsed,
  onCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const superAdminItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "/institutions",
      icon: <BankOutlined />,
      label: <Link href="/institutions">Institutions</Link>,
    },
  ];

  const instAdminItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "/devices",
      icon: <TabletOutlined />,
      label: <Link href="/devices">Devices</Link>,
    },
    {
      key: "/students",
      icon: <TeamOutlined />,
      label: <Link href="/students">Students</Link>,
    },
    {
      key: "/policy",
      icon: <SafetyOutlined />,
      label: <Link href="/policy">Global Policy</Link>,
    },
  ];

  const items = role === "SUPER_ADMIN" ? superAdminItems : instAdminItems;

  const selectedKey =
    items.find((item) => pathname.startsWith(item.key))?.key || "/dashboard";

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      style={{ minHeight: "100vh" }}
      theme="dark"
    >
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: collapsed ? 16 : 18,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {collapsed ? "N" : "Nirvar Admin"}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={items}
        style={{ marginTop: 8 }}
      />
    </Sider>
  );
}
