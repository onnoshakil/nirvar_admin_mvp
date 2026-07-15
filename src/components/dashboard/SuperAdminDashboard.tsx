"use client";

import Link from "next/link";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Table,
  Alert,
  Empty,
  type TableColumnsType,
} from "antd";
import {
  BankOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MobileOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { StatCard } from "./StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useDashboard } from "@/hooks/useDashboard";
import { useInstitutions } from "@/hooks/useInstitutions";
import type {
  SuperAdminDashboard as SuperAdminMetrics,
  InstitutionListItem,
  InstitutionStatus,
} from "@/types";

const { Title } = Typography;

export function SuperAdminDashboard() {
  const { data, isLoading, isError, refetch, isFetching } =
    useDashboard<SuperAdminMetrics>();
  const insts = useInstitutions();

  const columns: TableColumnsType<InstitutionListItem> = [
    {
      title: "Institution",
      dataIndex: "name",
      key: "name",
      render: (name: string, r) => (
        <Link href={`/institutions/${r.id}`}>{name}</Link>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s: InstitutionStatus) => <StatusBadge status={s} />,
    },
    {
      title: "Devices",
      key: "devices",
      width: 110,
      align: "right",
      render: (_, r) => r._count.devices,
    },
  ];

  const noInstitutions =
    !insts.isLoading && (insts.data?.length ?? 0) === 0;

  return (
    <div>
      <Title level={3} style={{ marginTop: 0, marginBottom: 24 }}>
        System Overview
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
                title="Total Institutions"
                value={data.totalInstitutions}
                prefix={<BankOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Active"
                value={data.activeInstitutions}
                prefix={<CheckCircleOutlined />}
                color="#3f8600"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Suspended"
                value={data.suspendedInstitutions}
                prefix={<StopOutlined />}
                color="#cf1322"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Total Devices"
                value={data.totalDevices}
                prefix={<MobileOutlined />}
              />
            </Col>
          </>
        )}
      </Row>

      <Card
        title="Institutions"
        style={{ marginTop: 24 }}
        extra={!noInstitutions ? <Link href="/institutions">View all</Link> : null}
      >
        {noInstitutions ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No institutions yet"
          >
            <Link href="/institutions/new">
              <Button type="primary" icon={<PlusOutlined />}>
                Create your first institution
              </Button>
            </Link>
          </Empty>
        ) : (
          <Table<InstitutionListItem>
            rowKey="id"
            size="small"
            loading={insts.isLoading}
            columns={columns}
            dataSource={insts.data ?? []}
            pagination={{
              pageSize: 5,
              hideOnSinglePage: true,
              showSizeChanger: false,
            }}
          />
        )}
      </Card>
    </div>
  );
}
