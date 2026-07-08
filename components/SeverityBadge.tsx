import { ReviewData } from "@/lib/posts";

type Severity = ReviewData["severity"];

const severityConfig: Record<
  Severity,
  { label: string; className: string; dotClass: string }
> = {
  CRITICAL: {
    label: "CRITICAL",
    className: "severity-badge severity-critical",
    dotClass: "severity-dot-critical",
  },
  HIGH: {
    label: "HIGH",
    className: "severity-badge severity-high",
    dotClass: "severity-dot-high",
  },
  MEDIUM: {
    label: "MEDIUM",
    className: "severity-badge severity-medium",
    dotClass: "severity-dot-medium",
  },
  LOW: {
    label: "LOW",
    className: "severity-badge severity-low",
    dotClass: "severity-dot-low",
  },
  PRIVATE: {
    label: "[PRIVATE]",
    className: "severity-badge severity-private",
    dotClass: "severity-dot-low",
  },
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity] || severityConfig.LOW;

  return (
    <span className={config.className}>
      <span className={config.dotClass} />
      {config.label}
    </span>
  );
}
