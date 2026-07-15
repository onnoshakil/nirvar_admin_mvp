"use client";

import Link from "next/link";
import { Row, Col, Card, Typography, Button, Alert, Space, Empty } from "antd";
import {
  MobileOutlined,
  WifiOutlined,
  TeamOutlined,
  SyncOutlined,
  ReloadOutlined,
  ScanOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { StatCard } from "./StatCard";
import { SyncStatusBar } from "./SyncStatusBar";
import { useDashboard } from "@/hooks/useDashboard";
import type { InstAdminDashboard as InstAdminMetrics } from "@/types";

const { Title, Text } = Typography;

export function InstAdminDashboard() {
  const { data, isLoading, isError, refetch, isFetching } =
    useDashboard<InstAdminMetrics>();

  return (
    <div>
      <Title level={3} style={{ marginTop: 0, marginBottom: 24 }}>
        Institution Dashboard
      </Title>

      {isError && (
        <Alert
          type="error"
          showIcon
          message="Failed to load metrics"
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isFetching}
            >
              Retry
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card loading />
            </Col>
          ))
        ) : (
          <>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Devices"
                value={data.totalDevices}
                prefix={<MobileOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Online"
                value={data.onlineDevices}
                prefix={<WifiOutlined />}
                color="#3f8600"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Students"
                value={data.totalStudents}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Synced"
                value={data.syncedDevices}
                suffix={`/ ${data.totalDevices}`}
                prefix={<SyncOutlined />}
              />
            </Col>
          </>
        )}
      </Row>

      {!isLoading && data && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card
              title="Global Policy"
              style={{ height: "100%" }}
              extra={<SafetyCertificateOutlined />}
            >
              {data.hasPolicyConfigured ? (
                <Space direction="vertical" size="middle">
                  <Text>
                    Policy is configured (version{" "}
                    <Text strong>{data.policyVersion}</Text>).
                  </Text>
                  <Link href="/policy">
                    <Button>Manage policy</Button>
                  </Link>
                </Space>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No policy configured"
                >
                  <Link href="/policy">
                    <Button type="primary">Set up your global policy</Button>
                  </Link>
                </Empty>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Device Sync" style={{ height: "100%" }}>
              {data.totalDevices === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No devices registered yet"
                >
                  <Link href="/devices/scan">
                    <Button type="primary" icon={<ScanOutlined />}>
                      Scan your first device
                    </Button>
                  </Link>
                </Empty>
              ) : (
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <SyncStatusBar
                    synced={data.syncedDevices}
                    total={data.totalDevices}
                  />
                  <Text type="secondary">
                    {data.offlineDevices} device(s) offline · {data.onlineDevices}{" "}
                    online
                  </Text>
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
