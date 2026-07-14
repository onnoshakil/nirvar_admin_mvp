"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  App,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Space,
  Row,
  Col,
} from "antd";
import {
  useCreateInstitution,
  type CreateInstitutionError,
} from "@/hooks/useInstitutions";
import type { CreateInstitutionInput } from "@/lib/validators/institution";

const { Text } = Typography;

export function InstitutionForm() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm<CreateInstitutionInput>();
  const createInstitution = useCreateInstitution();

  function onFinish(values: CreateInstitutionInput) {
    createInstitution.mutate(values, {
      onSuccess: () => {
        message.success(`Institution "${values.name}" created successfully.`);
        router.push("/institutions");
        router.refresh();
      },
      onError: (err) => {
        const e = err as unknown as CreateInstitutionError;
        if (e.status === 409) {
          form.setFields([
            {
              name: ["admin", "email"],
              errors: ["An account already exists for this email"],
            },
          ]);
        } else if (e.status === 400) {
          message.error("Please check the form for invalid values.");
        } else {
          message.error(
            e.error || "Failed to create institution. Please try again."
          );
        }
      },
    });
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      requiredMark="optional"
      style={{ maxWidth: 640 }}
    >
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        Institution Details
      </Typography.Title>

      <Form.Item
        label="Institution name"
        name="name"
        rules={[
          { required: true, message: "Institution name is required" },
          { max: 200, message: "Name is too long" },
        ]}
      >
        <Input placeholder="e.g. Dhaka Model School" size="large" />
      </Form.Item>

      <Form.Item label="Address" name="address">
        <Input.TextArea placeholder="Street, city, country" rows={2} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Contact email"
            name="contactEmail"
            rules={[{ type: "email", message: "Enter a valid email" }]}
          >
            <Input placeholder="office@institution.edu" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Contact phone" name="contactPhone">
            <Input placeholder="+8801XXXXXXXXX" />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Typography.Title level={5}>Institution Admin</Typography.Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        A temporary password will be generated and emailed to this admin. They
        will be asked to change it on first login.
      </Text>

      <Form.Item
        label="Admin name"
        name={["admin", "name"]}
        rules={[
          { required: true, message: "Admin name is required" },
          { max: 100, message: "Name is too long" },
        ]}
      >
        <Input placeholder="e.g. Rahim Uddin" />
      </Form.Item>

      <Form.Item
        label="Admin email"
        name={["admin", "email"]}
        rules={[
          { required: true, message: "Admin email is required" },
          { type: "email", message: "Enter a valid email" },
        ]}
      >
        <Input placeholder="admin@institution.edu" />
      </Form.Item>

      <Divider />

      <Space>
        <Button
          type="primary"
          htmlType="submit"
          loading={createInstitution.isPending}
        >
          Create Institution
        </Button>
        <Link href="/institutions">
          <Button>Cancel</Button>
        </Link>
      </Space>
    </Form>
  );
}
