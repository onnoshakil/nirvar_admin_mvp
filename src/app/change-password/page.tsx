"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card, Form, Input, Button, Typography, Alert, Space } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish(values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to change password");
      return;
    }

    await signOut({ redirect: false });
    router.push("/login");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
        padding: 24,
      }}
    >
      <Card style={{ width: 420, maxWidth: "100%" }}>
        <Space
          direction="vertical"
          size="small"
          style={{ width: "100%", textAlign: "center", marginBottom: 24 }}
        >
          <Title level={3} style={{ margin: 0, color: "#1E3A5F" }}>
            Change Your Password
          </Title>
          <Text type="secondary">
            You must set a new password before continuing
          </Text>
        </Space>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: "Enter your current password" }]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Enter a new password" },
              { min: 8, message: "At least 8 characters" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Change Password & Continue
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
