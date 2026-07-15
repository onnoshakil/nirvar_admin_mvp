"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Space, Spin, Typography } from "antd";
import { CameraOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRegisterDevice } from "@/hooks/useDevices";

const { Text } = Typography;

const DEVICE_ID_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9_-]{1,48})[A-Za-z0-9]$/;

type ResultType = "success" | "info" | "error";

export interface ScanResult {
  type: ResultType;
  message: string;
  deviceId?: string;
}

interface QRScannerProps {
  onResult?: (result: ScanResult) => void;
}

type CameraState = "starting" | "scanning" | "denied" | "unavailable";

export function QRScanner({ onResult }: QRScannerProps) {
  const router = useRouter();
  const rawId = useId();
  const elementId = `qr-reader-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const html5QrcodeRef = useRef<import("html5-qrcode").Html5Qrcode | null>(
    null
  );
  const processingRef = useRef(false);
  const [cameraState, setCameraState] = useState<CameraState>("starting");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [generation, setGeneration] = useState(0);
  const registerDevice = useRegisterDevice();

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (processingRef.current) return;
      processingRef.current = true;

      const instance = html5QrcodeRef.current;
      try {
        if (instance?.isScanning) await instance.stop();
        instance?.clear();
      } catch {
        // ignore — camera may already be stopped/torn down
      }

      const deviceId = decodedText.trim();

      if (!DEVICE_ID_PATTERN.test(deviceId)) {
        const invalid: ScanResult = {
          type: "error",
          message: "This QR code does not appear to be a Dishari device ID",
        };
        setResult(invalid);
        onResult?.(invalid);
        return;
      }

      try {
        const res = await registerDevice.mutateAsync({ deviceId });
        const outcome: ScanResult =
          res.statusCode === 201
            ? {
                type: "success",
                message: `Device ${deviceId} registered`,
                deviceId,
              }
            : {
                type: "info",
                message: "Device already registered",
                deviceId,
              };
        setResult(outcome);
        onResult?.(outcome);
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        let message = "Registration failed. Check your connection and try again.";
        if (status === 409) {
          message = "Device registered to another institution";
        } else if (status === 403) {
          message = "Institution is suspended";
        } else if (status === 400) {
          message = "This QR code does not appear to be a Dishari device ID";
        }
        const outcome: ScanResult = { type: "error", message, deviceId };
        setResult(outcome);
        onResult?.(outcome);
      }
    },
    [onResult, registerDevice]
  );

  useEffect(() => {
    if (result) return;

    let cancelled = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const instance = new Html5Qrcode(elementId);
      html5QrcodeRef.current = instance;

      instance
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // decode failure on a frame — expected while searching, ignore
          }
        )
        .then(() => {
          if (!cancelled) setCameraState("scanning");
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const message = String(err);
          if (/permission|denied|NotAllowedError/i.test(message)) {
            setCameraState("denied");
          } else {
            setCameraState("unavailable");
          }
        });
    });

    return () => {
      cancelled = true;
      const instance = html5QrcodeRef.current;
      const safeClear = () => {
        try {
          instance?.clear();
        } catch {
          // ignore — container may already be unmounted
        }
      };
      if (instance?.isScanning) {
        instance.stop().catch(() => {}).finally(safeClear);
      } else {
        safeClear();
      }
      html5QrcodeRef.current = null;
    };
  }, [elementId, generation, result, handleScanSuccess]);

  const scanAnother = () => {
    processingRef.current = false;
    setResult(null);
    setCameraState("starting");
    setGeneration((g) => g + 1);
  };

  const retryCamera = () => {
    setCameraState("starting");
    setGeneration((g) => g + 1);
  };

  if (result) {
    return (
      <Alert
        type={result.type}
        showIcon
        message={result.message}
        style={{ marginBottom: 16 }}
        action={
          <Space>
            <Button size="small" onClick={scanAnother}>
              Scan Another
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => router.push("/devices")}
            >
              Done
            </Button>
          </Space>
        }
      />
    );
  }

  return (
    <div>
      {cameraState === "denied" ? (
        <Alert
          type="error"
          showIcon
          message="Camera access is required to scan QR codes."
          description="Please enable camera access for this site in your browser settings, then retry."
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={retryCamera}
            >
              Retry
            </Button>
          }
        />
      ) : cameraState === "unavailable" ? (
        <Alert
          type="error"
          showIcon
          message="No camera available"
          description="We couldn't access a camera on this device. Try a different device or browser."
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={retryCamera}
            >
              Retry
            </Button>
          }
        />
      ) : (
        <div>
          {cameraState === "starting" ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Spin
                size="large"
                indicator={<CameraOutlined style={{ fontSize: 32 }} spin />}
              />
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">Starting camera...</Text>
              </div>
            </div>
          ) : null}
          <div
            id={elementId}
            style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}
          />
          {cameraState === "scanning" ? (
            <Text
              type="secondary"
              style={{ display: "block", textAlign: "center", marginTop: 12 }}
            >
              Point your camera at the QR code on the Dishari tablet
            </Text>
          ) : null}
        </div>
      )}
    </div>
  );
}
