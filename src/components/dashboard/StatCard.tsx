"use client";

import { Card, Statistic } from "antd";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: ReactNode;
  suffix?: string;
  color?: string;
}

export function StatCard({ title, value, prefix, suffix, color }: StatCardProps) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={color ? { color } : undefined}
      />
    </Card>
  );
}
