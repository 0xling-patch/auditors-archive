import { BilingualText } from "@/components/Bilingual";
import VulnerabilitiesTable from "@/components/VulnerabilitiesTable";
import { getSortedReviewsData } from "@/lib/posts";

export default function VulnerabilitiesPage() {
  const reviews = getSortedReviewsData();

  return (
    <div className="content-width">
      <header className="simple-page-header">
        <BilingualText en="VULNERABILITY INDEX" zh="漏洞索引" className="simple-page-title" />
        <BilingualText en="$ query --db auditors-archive --format table" zh="$ query --db auditors-archive --format table" className="terminal-subtitle" />
      </header>
      <VulnerabilitiesTable reviews={reviews} />
    </div>
  );
}
