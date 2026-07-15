"use client";

import { useState } from "react";
import Link from "next/link";
import { Typography, Button, List, Space, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { QRScanner, type ScanResult } from "@/components/devices/QRScanner";

const { Title, Text } = Typography;

const RESULT_TAG: Record<ScanResult["type"], { color: string; label: string }> = {
  success: { color: "green", label: "Registered" },
  info: { color: "blue", label: "Already registered" },
  error: { color: "red", label: "Failed" },
};

export default function ScanDevicePage() {
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  const handleResult = (result: ScanResult) => {
    setRecentScans((prev) => [result, ...prev].slice(0, 5));
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link href="/devices">
          <Button icon={<ArrowLeftOutlined />}>Back to Devices</Button>
        </Link>
      </Space>

      <Title level={3}>Scan Device QR Code</Title>
      <Text
        type="secondary"
        style={{ display: "block", marginBottom: 24, maxWidth: 480 }}
      >
        Point your camera at the QR code on the Dishari tablet to register it
        to your institution.
      </Text>

      <QRScanner onResult={handleResult} />

      {recentScans.length > 0 ? (
        <div style={{ marginTop: 32, maxWidth: 480 }}>
          <Title level={5}>Recent Scans</Title>
          <List
            size="small"
            bordered
            dataSource={recentScans}
            renderItem={(item, index) => {
              const tag = RESULT_TAG[item.type];
              return (
                <List.Item key={index}>
                  <Space wrap>
                    <Tag color={tag.color} style={{ margin: 0 }}>
                      {tag.label}
                    </Tag>
                    <Text strong>{item.deviceId ?? "Unknown device"}</Text>
                    <Text type="secondary">{item.message}</Text>
                  </Space>
                </List.Item>
              );
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
