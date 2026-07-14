"use client";

import { signOut, useSession } from "next-auth/react";
import { Layout, Button, Space, Tag, Typography } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

export function AdminHeader() {
  const { data: session } = useSession();

  const roleLabel =
    session?.user?.role === "SUPER_ADMIN" ? "Super Admin" : "Institution Admin";
  const roleColor =
    session?.user?.role === "SUPER_ADMIN" ? "purple" : "blue";

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Space>
        <UserOutlined />
        <Text>{session?.user?.name}</Text>
        <Tag color={roleColor}>{roleLabel}</Tag>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Logout
        </Button>
      </Space>
    </Header>
  );
}
