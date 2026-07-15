"use client";

import { useEffect, useRef, useState } from "react";
import { Typography, Button, Space, Alert, Skeleton, App, Modal } from "antd";
import { PolicyEditor } from "@/components/policy/PolicyEditor";
import { SyncStatusBar } from "@/components/dashboard/SyncStatusBar";
import { usePolicy, useUpdatePolicy } from "@/hooks/usePolicy";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import type { UpdatePolicyInput } from "@/lib/validators/policy";

const { Title, Text } = Typography;

const DEFAULT_POLICY: UpdatePolicyInput = {
  appWhitelist: [],
  appBlacklist: [],
  categoryFilters: [],
  screenTimeLimitMin: null,
  dnsSafeBrowsing: false,
  installRestriction: false,
};

const SYNC_TIMEOUT_MS = 2 * 60 * 1000;

export default function PolicyPage() {
  const { data: policy, isLoading, isError, refetch } = usePolicy();
  const updatePolicy = useUpdatePolicy();
  const { message } = App.useApp();

  const [draft, setDraft] = useState<UpdatePolicyInput>(DEFAULT_POLICY);
  const initializedRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [syncActive, setSyncActive] = useState(false);
  const syncStatus = useSyncStatus(syncActive);

  useEffect(() => {
    if (initializedRef.current || isLoading) return;
    initializedRef.current = true;
    setDraft(policy ?? DEFAULT_POLICY);
  }, [policy, isLoading]);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  const startSyncTracking = () => {
    setSyncActive(true);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setSyncActive(false);
    }, SYNC_TIMEOUT_MS);
  };

  const handleSave = () => {
    updatePolicy.mutate(draft, {
      onSuccess: () => {
        message.success("Policy saved. Pushing to devices...");
        startSyncTracking();
      },
      onError: () => {
        message.error("Failed to save policy. Try again.");
      },
    });
  };

  const handleClear = () => {
    Modal.confirm({
      title: "Clear global policy?",
      content:
        "All devices will return to defaults: no blocked apps or categories, no screen time limit, DNS filtering and install restriction turned off.",
      okText: "Clear Policy",
      okButtonProps: { danger: true },
      onOk: () => {
        updatePolicy.mutate(DEFAULT_POLICY, {
          onSuccess: () => {
            setDraft(DEFAULT_POLICY);
            message.success("Policy cleared. Pushing defaults to devices...");
            startSyncTracking();
          },
          onError: () => {
            message.error("Failed to clear policy. Try again.");
          },
        });
      },
    });
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Global Policy
      </Title>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Failed to load policy"
          description="Something went wrong while fetching the global policy."
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <PolicyEditor value={draft} onChange={setDraft} />

          <Space style={{ marginTop: 24 }}>
            <Button
              type="primary"
              onClick={handleSave}
              loading={updatePolicy.isPending}
            >
              Save Policy
            </Button>
            <Button danger onClick={handleClear} loading={updatePolicy.isPending}>
              Clear Policy
            </Button>
          </Space>

          {syncActive || syncStatus.data ? (
            <div style={{ marginTop: 24, maxWidth: 480 }}>
              {syncStatus.data ? (
                <>
                  <SyncStatusBar
                    synced={syncStatus.data.syncedDevices}
                    total={syncStatus.data.totalDevices}
                  />
                  {syncStatus.data.pendingDevices > 0 ? (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {syncStatus.data.pendingDevices} device
                      {syncStatus.data.pendingDevices === 1 ? "" : "s"} pending
                      — will sync when they next report in.
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text type="secondary">Checking sync status...</Text>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
