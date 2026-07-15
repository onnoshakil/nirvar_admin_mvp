"use client";

import { useState } from "react";
import {
  Typography,
  Input,
  Button,
  Space,
  Tag,
  Switch,
  InputNumber,
  Card,
} from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { APP_CATEGORIES } from "@/types";
import type { UpdatePolicyInput } from "@/lib/validators/policy";

const { Text } = Typography;

function categoryLabel(category: string): string {
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

interface PackageListEditorProps {
  title: string;
  placeholder: string;
  packages: string[];
  onAdd: (pkg: string) => void;
  onRemove: (pkg: string) => void;
}

function PackageListEditor({
  title,
  placeholder,
  packages,
  onAdd,
  onRemove,
}: PackageListEditorProps) {
  const [input, setInput] = useState("");

  const submit = () => {
    const pkg = input.trim();
    if (!pkg) return;
    onAdd(pkg);
    setInput("");
  };

  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <Text strong>{title}</Text>
      <Space.Compact style={{ display: "flex", marginTop: 8, marginBottom: 8 }}>
        <Input
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={submit}
        />
        <Button icon={<PlusOutlined />} onClick={submit}>
          Add
        </Button>
      </Space.Compact>
      {packages.length === 0 ? (
        <Text type="secondary" style={{ fontSize: 13 }}>
          No packages added
        </Text>
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size={4}>
          {packages.map((pkg) => (
            <Tag key={pkg} style={{ margin: 0, width: "fit-content" }}>
              {pkg}
              <CloseOutlined
                style={{ marginLeft: 8, cursor: "pointer" }}
                onClick={() => onRemove(pkg)}
              />
            </Tag>
          ))}
        </Space>
      )}
    </div>
  );
}

interface PolicyEditorProps {
  value: UpdatePolicyInput;
  onChange: (next: UpdatePolicyInput) => void;
}

export function PolicyEditor({ value, onChange }: PolicyEditorProps) {
  const screenTimeEnabled = value.screenTimeLimitMin != null;
  const screenTimeHours = value.screenTimeLimitMin
    ? value.screenTimeLimitMin / 60
    : 2;

  const addPackage = (list: "appWhitelist" | "appBlacklist", pkg: string) => {
    if (value[list].includes(pkg)) return;
    onChange({ ...value, [list]: [...value[list], pkg] });
  };

  const removePackage = (
    list: "appWhitelist" | "appBlacklist",
    pkg: string
  ) => {
    onChange({ ...value, [list]: value[list].filter((p) => p !== pkg) });
  };

  const toggleCategory = (category: string) => {
    const next = value.categoryFilters.includes(category)
      ? value.categoryFilters.filter((c) => c !== category)
      : [...value.categoryFilters, category];
    onChange({ ...value, categoryFilters: next });
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Card title="App Whitelist &amp; Blacklist">
        <Space
          direction="horizontal"
          size={24}
          style={{ width: "100%", display: "flex", flexWrap: "wrap" }}
        >
          <PackageListEditor
            title="Allowed Apps"
            placeholder="e.g. com.google.android.apps.docs"
            packages={value.appWhitelist}
            onAdd={(pkg) => addPackage("appWhitelist", pkg)}
            onRemove={(pkg) => removePackage("appWhitelist", pkg)}
          />
          <PackageListEditor
            title="Blocked Apps"
            placeholder="e.g. com.facebook.katana"
            packages={value.appBlacklist}
            onAdd={(pkg) => addPackage("appBlacklist", pkg)}
            onRemove={(pkg) => removePackage("appBlacklist", pkg)}
          />
        </Space>
      </Card>

      <Card title="Category Filters">
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          Toggle a category on to block it for all devices.
        </Text>
        <Space wrap size={8}>
          {APP_CATEGORIES.map((category) => (
            <Tag.CheckableTag
              key={category}
              checked={value.categoryFilters.includes(category)}
              onChange={() => toggleCategory(category)}
            >
              {categoryLabel(category)}
            </Tag.CheckableTag>
          ))}
        </Space>
      </Card>

      <Card title="Screen Time Limit">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space align="center">
            <Switch
              checked={screenTimeEnabled}
              onChange={(checked) =>
                onChange({
                  ...value,
                  screenTimeLimitMin: checked ? Math.round(2 * 60) : null,
                })
              }
            />
            <Text>Enable screen time limit</Text>
          </Space>
          {screenTimeEnabled ? (
            <Space align="center">
              <InputNumber
                min={1}
                max={24}
                step={0.5}
                value={screenTimeHours}
                onChange={(hours) =>
                  onChange({
                    ...value,
                    screenTimeLimitMin: Math.round((hours ?? 1) * 60),
                  })
                }
              />
              <Text type="secondary">
                hours/day ({value.screenTimeLimitMin ?? 0} minutes)
              </Text>
            </Space>
          ) : (
            <Text type="secondary">Unlimited screen time</Text>
          )}
        </Space>
      </Card>

      <Card title="DNS Safe Browsing">
        <Space align="center">
          <Switch
            checked={value.dnsSafeBrowsing}
            onChange={(checked) =>
              onChange({ ...value, dnsSafeBrowsing: checked })
            }
          />
          <Text type="secondary">
            Block access to unsafe and adult content via DNS filtering
          </Text>
        </Space>
      </Card>

      <Card title="Install Restriction">
        <Space align="center">
          <Switch
            checked={value.installRestriction}
            onChange={(checked) =>
              onChange({ ...value, installRestriction: checked })
            }
          />
          <Text type="secondary">
            Prevent students from installing new apps on the device
          </Text>
        </Space>
      </Card>
    </Space>
  );
}
