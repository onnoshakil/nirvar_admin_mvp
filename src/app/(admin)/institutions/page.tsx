"use client";

import { Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title } = Typography;

export default function InstitutionsPage() {
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
      {/* TODO: Nahid — build institution list table here */}
    </div>
  );
}
