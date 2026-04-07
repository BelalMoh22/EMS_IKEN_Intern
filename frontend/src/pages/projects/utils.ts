import type { ProjectStatus } from "@/types/project";

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; color: "warning" | "info" | "success" | "default"; bgAlpha?: string }
> = {
  Open: { label: "Open", color: "info", bgAlpha: "rgba(59,130,246,0.1)" },
  Closed: { label: "Closed", color: "default", bgAlpha: "rgba(100,116,139,0.1)" },
};

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
