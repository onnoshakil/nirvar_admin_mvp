"use client";

import { Typography, Button } from "antd";
import { ScanOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title } = Typography;

export default function DevicesPage() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Devices
        </Title>
        <Link href="/devices/scan">
          <Button type="primary" icon={<ScanOutlined />}>
            Scan Device
          </Button>
        </Link>
      </div>
      {/* TODO: Shakil — build DeviceTable component here */}
    </div>
  );
}
