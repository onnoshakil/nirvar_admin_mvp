"use client";

import { Typography, Button, App } from "antd";
import { ScanOutlined } from "@ant-design/icons";
import Link from "next/link";
import { DeviceTable } from "@/components/devices/DeviceTable";
import { useDevices, useRemoveDevice } from "@/hooks/useDevices";
import type { DeviceListItem } from "@/types";

const { Title } = Typography;

export default function DevicesPage() {
  const { data, isLoading, isError, refetch } = useDevices();
  const removeDevice = useRemoveDevice();
  const { message } = App.useApp();

  const handleRemove = (device: DeviceListItem) => {
    removeDevice.mutate(device.id, {
      onSuccess: () => message.success("Device removed"),
      onError: () => message.error("Failed to remove device. Try again."),
    });
  };

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

      <DeviceTable
        devices={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onRemove={handleRemove}
        removingId={removeDevice.isPending ? removeDevice.variables : null}
      />
    </div>
  );
}
