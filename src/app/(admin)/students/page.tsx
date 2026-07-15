"use client";

import { Typography } from "antd";
import { StudentTable } from "@/components/students/StudentTable";
import { useStudents } from "@/hooks/useStudents";

const { Title } = Typography;

export default function StudentsPage() {
  const { data, isLoading, isError, refetch } = useStudents();

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Students
      </Title>

      <StudentTable
        students={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  );
}
