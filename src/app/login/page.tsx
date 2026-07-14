"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Typography, Alert, Space } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish(values: { email: string; password: string }) {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: values.email.toLowerCase(),
      password: values.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error.includes("ACCOUNT_LOCKED")) {
        setError("Account temporarily locked. Try again in 30 minutes.");
      } else {
        setError("Invalid email or password.");
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
      <Card style={{ width: 400, maxWidth: "100%" }}>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", textAlign: "center", marginBottom: 24 }}
        >
          <Title level={3} style={{ margin: 0, color: "#1E3A5F" }}>
            Nirvar Admin Panel
          </Title>
          <Text type="secondary">Sign in to manage your institution</Text>
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
            name="email"
            rules={[
              { required: true, message: "Enter your email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
