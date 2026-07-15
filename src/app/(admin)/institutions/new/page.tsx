"use client";

import Link from "next/link";
import { Typography, Card, Breadcrumb } from "antd";
import { InstitutionForm } from "@/components/institutions/InstitutionForm";

const { Title } = Typography;

export default function CreateInstitutionPage() {
  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link href="/institutions">Institutions</Link> },
          { title: "Create" },
        ]}
      />
      <Title level={3} style={{ marginTop: 0 }}>
        Create Institution
      </Title>
      <Card>
        <InstitutionForm />
      </Card>
    </div>
  );
}
