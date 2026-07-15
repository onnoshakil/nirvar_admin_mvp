"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  App,
  Alert,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Table,
  Tabs,
  Tooltip,
  Typography,
  type TableColumnsType,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { StatusBadge } from "@/components/StatusBadge";
import {
  useInstitution,
  useUpdateInstitutionStatus,
  useAddAdmin,
  useRemoveAdmin,
  type ApiError,
} from "@/hooks/useInstitutions";
import type { AddAdminInput } from "@/lib/validators/institution";
import type { InstitutionAdmin } from "@/types";

const { Title, Text } = Typography;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function InstitutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const { message, modal } = App.useApp();

  const { data: inst, isLoading, isError, error, refetch, isFetching } =
    useInstitution(id);
  const updateStatus = useUpdateInstitutionStatus(id);
  const addAdmin = useAddAdmin(id);
  const removeAdmin = useRemoveAdmin(id);

  const [addOpen, setAddOpen] = useState(false);
  const [form] = Form.useForm<AddAdminInput>();

  const notFound = isError && (error as unknown as ApiError)?.status === 404;

  function handleToggleStatus() {
    if (!inst) return;
    const suspending = inst.status === "ACTIVE";
    modal.confirm({
      title: suspending
        ? "Suspend this institution?"
        : "Reactivate this institution?",
      content: suspending
        ? `"${inst.name}" will be suspended. Its ${inst._count.devices} device(s) will stop receiving policy updates and new device registration will be blocked.`
        : `"${inst.name}" will be reactivated and can register devices again.`,
      okText: suspending ? "Suspend" : "Reactivate",
      okButtonProps: { danger: suspending },
      onOk: async () => {
        try {
          await updateStatus.mutateAsync(suspending ? "SUSPENDED" : "ACTIVE");
          message.success(
            suspending ? "Institution suspended." : "Institution reactivated."
          );
        } catch (e) {
          message.error((e as ApiError)?.error || "Failed to update status.");
          throw e;
        }
      },
    });
  }

  function handleAddAdmin(values: AddAdminInput) {
    addAdmin.mutate(values, {
      onSuccess: () => {
        message.success(`Admin "${values.name}" added. Credentials emailed.`);
        setAddOpen(false);
        form.resetFields();
      },
      onError: (err) => {
        const e = err as unknown as ApiError;
        if (e.status === 409) {
          form.setFields([
            {
              name: "email",
              errors: ["An account already exists for this email"],
            },
          ]);
        } else {
          message.error(e.error || "Failed to add admin.");
        }
      },
    });
  }

  function handleRemoveAdmin(admin: InstitutionAdmin) {
    modal.confirm({
      title: `Remove ${admin.name}?`,
      content: `${admin.email} will lose access to this institution.`,
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await removeAdmin.mutateAsync(admin.id);
          message.success("Admin removed.");
        } catch (e) {
          message.error((e as ApiError)?.error || "Failed to remove admin.");
          throw e;
        }
      },
    });
  }

  const breadcrumb = (
    <Breadcrumb
      style={{ marginBottom: 16 }}
      items={[
        { title: <Link href="/institutions">Institutions</Link> },
        { title: inst?.name ?? "Detail" },
      ]}
    />
  );

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        {breadcrumb}
        <Empty description="Institution not found">
          <Link href="/institutions">
            <Button type="primary">Back to institutions</Button>
          </Link>
        </Empty>
      </div>
    );
  }

  if (isError || !inst) {
    return (
      <div>
        {breadcrumb}
        <Alert
          type="error"
          showIcon
          message="Failed to load institution"
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
        />
      </div>
    );
  }

  const adminColumns: TableColumnsType<InstitutionAdmin> = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];
  if (isSuperAdmin) {
    const isLast = inst.admins.length <= 1;
    adminColumns.push({
      title: "",
      key: "actions",
      width: 80,
      align: "right",
      render: (_: unknown, admin: InstitutionAdmin) => (
        <Tooltip title={isLast ? "Cannot remove the last admin" : undefined}>
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            disabled={isLast}
            onClick={() => handleRemoveAdmin(admin)}
          />
        </Tooltip>
      ),
    });
  }

  const overviewTab = (
    <Card>
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Name">{inst.name}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <StatusBadge status={inst.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Address">
          {inst.address || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Contact email">
          {inst.contactEmail || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Contact phone">
          {inst.contactPhone || "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Devices">
          {inst._count.devices}
        </Descriptions.Item>
        <Descriptions.Item label="Students">
          {inst._count.students}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {formatDate(inst.createdAt)}
        </Descriptions.Item>
      </Descriptions>
      {isSuperAdmin && (
        <div style={{ marginTop: 24 }}>
          <Button
            danger={inst.status === "ACTIVE"}
            onClick={handleToggleStatus}
            loading={updateStatus.isPending}
          >
            {inst.status === "ACTIVE"
              ? "Suspend Institution"
              : "Reactivate Institution"}
          </Button>
        </div>
      )}
    </Card>
  );

  const adminsTab = (
    <Card>
      {isSuperAdmin && (
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddOpen(true)}
          >
            Add Admin
          </Button>
        </div>
      )}
      <Table<InstitutionAdmin>
        rowKey="id"
        columns={adminColumns}
        dataSource={inst.admins}
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              description="No admins"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />
    </Card>
  );

  const placeholderTab = (label: string, hint: string) => (
    <Card>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" size={4}>
            <Text strong>{label}</Text>
            <Text type="secondary">{hint}</Text>
          </Space>
        }
      />
    </Card>
  );

  return (
    <div>
      {breadcrumb}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          {inst.name}
        </Title>
        <StatusBadge status={inst.status} />
      </div>

      <Tabs
        defaultActiveKey="overview"
        items={[
          { key: "overview", label: "Overview", children: overviewTab },
          {
            key: "admins",
            label: `Admins (${inst.admins.length})`,
            children: adminsTab,
          },
          {
            key: "devices",
            label: `Devices (${inst._count.devices})`,
            children: placeholderTab(
              "Device list",
              "Embeds Shakil's DeviceTable component."
            ),
          },
          {
            key: "students",
            label: `Students (${inst._count.students})`,
            children: placeholderTab(
              "Student list",
              "Embeds Shakil's StudentTable component."
            ),
          },
        ]}
      />

      <Modal
        title="Add Institution Admin"
        open={addOpen}
        onCancel={() => {
          setAddOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Add Admin"
        confirmLoading={addAdmin.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddAdmin}
          autoComplete="off"
          requiredMark={false}
        >
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            A temporary password will be generated and emailed to this admin.
          </Text>
          <Form.Item
            label="Admin name"
            name="name"
            rules={[
              { required: true, message: "Admin name is required" },
              { max: 100, message: "Name is too long" },
            ]}
          >
            <Input placeholder="e.g. Karim Ahmed" />
          </Form.Item>
          <Form.Item
            label="Admin email"
            name="email"
            rules={[
              { required: true, message: "Admin email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="admin@institution.edu" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
