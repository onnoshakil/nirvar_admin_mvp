"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  Input,
  Space,
  Typography,
  Tooltip,
  Button,
  Modal,
  Empty,
  Alert,
  Skeleton,
  type TableColumnsType,
} from "antd";
import { SearchOutlined, DeleteOutlined, ScanOutlined } from "@ant-design/icons";
import { StatusBadge } from "@/components/StatusBadge";
import type { DeviceListItem } from "@/types";

const { Text } = Typography;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncateId(id: string, maxLength = 14): string {
  if (id.length <= maxLength) return id;
  return `${id.slice(0, maxLength)}…`;
}

interface DeviceTableProps {
  devices: DeviceListItem[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRemove: (device: DeviceListItem) => void;
  removingId?: string | null;
}

export function DeviceTable({
  devices,
  isLoading,
  isError,
  onRetry,
  onRemove,
  removingId,
}: DeviceTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return devices ?? [];
    return (devices ?? []).filter(
      (d) =>
        d.deviceId.toLowerCase().includes(term) ||
        (d.student?.name.toLowerCase().includes(term) ?? false)
    );
  }, [devices, search]);

  const confirmRemove = (device: DeviceListItem) => {
    Modal.confirm({
      title: `Remove device ${device.deviceId}?`,
      content: device.student
        ? `This will unlink the device from the institution and remove ${device.student.name}'s student profile.`
        : "This will unlink the device from the institution.",
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk: () => onRemove(device),
    });
  };

  const columns: TableColumnsType<DeviceListItem> = [
    {
      title: "Device ID",
      dataIndex: "deviceId",
      key: "deviceId",
      render: (deviceId: string) => (
        <Tooltip title={deviceId}>
          <Text code>{truncateId(deviceId)}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Model",
      dataIndex: "deviceModel",
      key: "deviceModel",
      render: (model: string | null) =>
        model ?? <Text type="secondary">—</Text>,
    },
    {
      title: "Student",
      key: "student",
      render: (_, record) =>
        record.student ? (
          record.student.name
        ) : (
          <Text type="secondary">No student</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "onlineStatus",
      key: "onlineStatus",
      width: 150,
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: "Registered",
      dataIndex: "registeredAt",
      key: "registeredAt",
      width: 130,
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime(),
      render: (registeredAt: string) => formatDate(registeredAt),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      render: (_, record) => (
        <Button
          danger
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          loading={removingId === record.id}
          onClick={() => confirmRemove(record)}
        >
          Remove
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <div>
      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Failed to load devices"
          description="Something went wrong while fetching the device list."
          action={
            <Button size="small" onClick={onRetry}>
              Retry
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search by Device ID or student name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
      </Space>

      <Table<DeviceListItem>
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        loading={isLoading}
        scroll={{ x: 760 }}
        pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
        locale={{
          emptyText: isLoading ? (
            " "
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                devices && devices.length > 0
                  ? "No devices match your search"
                  : "No devices registered. Scan your first device."
              }
            >
              {devices && devices.length === 0 ? (
                <Link href="/devices/scan">
                  <Button type="primary" icon={<ScanOutlined />}>
                    Scan Device
                  </Button>
                </Link>
              ) : null}
            </Empty>
          ),
        }}
      />
    </div>
  );
}
