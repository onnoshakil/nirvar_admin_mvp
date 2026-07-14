"use client";

import { Progress, Typography } from "antd";

const { Text } = Typography;

interface SyncStatusBarProps {
  synced: number;
  total: number;
}

export function SyncStatusBar({ synced, total }: SyncStatusBarProps) {
  const percent = total > 0 ? Math.round((synced / total) * 100) : 0;
  const allSynced = synced === total && total > 0;

  return (
    <div>
      <Text type="secondary">
        {allSynced
          ? `All ${total} devices synced`
          : `${synced}/${total} devices synced`}
      </Text>
      <Progress
        percent={percent}
        status={allSynced ? "success" : "active"}
        size="small"
      />
    </div>
  );
}
