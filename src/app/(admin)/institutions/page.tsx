"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Typography,
  Button,
  Table,
  Input,
  Select,
  Space,
  Alert,
  Empty,
  type TableColumnsType,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useInstitutions } from "@/hooks/useInstitutions";
import { StatusBadge } from "@/components/StatusBadge";
import type { InstitutionListItem, InstitutionStatus } from "@/types";

const { Title, Text } = Typography;

type StatusFilter = "ALL" | InstitutionStatus;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function InstitutionsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useInstitutions();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((inst) => {
      const matchesSearch = !term || inst.name.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "ALL" || inst.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const columns: TableColumnsType<InstitutionListItem> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <Link href={`/institutions/${record.id}`}>
          <Text strong style={{ color: "#1E3A5F" }}>
            {name}
          </Text>
        </Link>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: InstitutionStatus) => <StatusBadge status={status} />,
    },
    {
      title: "Devices",
      key: "devices",
      width: 110,
      align: "right",
      sorter: (a, b) => a._count.devices - b._count.devices,
      render: (_, record) => record._count.devices,
    },
    {
      title: "Admin",
      key: "admin",
      render: (_, record) => {
        const primary = record.admins[0];
        if (!primary) return <Text type="secondary">—</Text>;
        const extra = record._count.admins - 1;
        return (
          <Space direction="vertical" size={0}>
            <Text>{primary.name}</Text>
            {extra > 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{extra} more
              </Text>
            ) : null}
          </Space>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt: string) => formatDate(createdAt),
    },
  ];

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
          Institutions
        </Title>
        <Link href="/institutions/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Institution
          </Button>
        </Link>
      </div>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Failed to load institutions"
          description="Something went wrong while fetching the institution list."
          action={
            <Button size="small" onClick={() => refetch()} loading={isFetching}>
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
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 260 }}
        />
        <Select<StatusFilter>
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
          options={[
            { value: "ALL", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "SUSPENDED", label: "Suspended" },
          ]}
        />
      </Space>

      <Table<InstitutionListItem>
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        loading={isLoading}
        pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
        locale={{
          emptyText: isLoading ? (
            " "
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                data && data.length > 0
                  ? "No institutions match your filters"
                  : "No institutions yet"
              }
            >
              {data && data.length === 0 ? (
                <Link href="/institutions/new">
                  <Button type="primary" icon={<PlusOutlined />}>
                    Create your first institution
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
