import { ReviewData } from "@/lib/posts";
import { BilingualText } from "./Bilingual";

type Severity = ReviewData["severity"];

const severityConfig: Record<Severity, { en: string; zh: string; className: string; dotClass: string }> = {
  CRITICAL: { en: "CRITICAL", zh: "嚴重", className: "severity-badge severity-critical", dotClass: "severity-dot-critical" },
  HIGH: { en: "HIGH", zh: "高風險", className: "severity-badge severity-high", dotClass: "severity-dot-high" },
  MEDIUM: { en: "MEDIUM", zh: "中風險", className: "severity-badge severity-medium", dotClass: "severity-dot-medium" },
  LOW: { en: "LOW", zh: "低風險", className: "severity-badge severity-low", dotClass: "severity-dot-low" },
  PRIVATE: { en: "PRIVATE", zh: "私人", className: "severity-badge severity-private", dotClass: "severity-dot-low" },
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity] || severityConfig.LOW;

  return (
    <span className={config.className}>
      <span className={config.dotClass} />
      <BilingualText en={config.en} zh={config.zh} className="badge-bilingual" />
    </span>
  );
}
