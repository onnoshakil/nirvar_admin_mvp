"use client";

import { useMemo, useState } from "react";
import {
  Table,
  Input,
  Space,
  Typography,
  Button,
  Empty,
  Alert,
  Skeleton,
  type TableColumnsType,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { StudentListItem } from "@/types";

const { Text } = Typography;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface StudentTableProps {
  students: StudentListItem[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function StudentTable({
  students,
  isLoading,
  isError,
  onRetry,
}: StudentTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students ?? [];
    return (students ?? []).filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
    );
  }, [students, search]);

  const columns: TableColumnsType<StudentListItem> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Device ID",
      dataIndex: "deviceId",
      key: "deviceId",
      render: (deviceId: string) => <Text code>{deviceId}</Text>,
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
          message="Failed to load students"
          description="Something went wrong while fetching the student list."
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
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
      </Space>

      <Table<StudentListItem>
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        loading={isLoading}
        scroll={{ x: 640 }}
        pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
        locale={{
          emptyText: isLoading ? (
            " "
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                students && students.length > 0
                  ? "No students match your search"
                  : "No students yet. Students will appear here after they create their profiles on registered tablets."
              }
            />
          ),
        }}
      />
    </div>
  );
}
