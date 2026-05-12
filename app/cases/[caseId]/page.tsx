import { notFound } from "next/navigation";
import CaseWorkspaceClient from "@/components/workflow/CaseWorkspaceClient";
import { cases } from "@/data/cases";

export function generateStaticParams() {
  return cases.map((c) => ({ caseId: c.id }));
}

type CaseDetailPageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { caseId } = await params;
  const caseData = cases.find((c) => c.id === caseId);
  if (!caseData) notFound();

  return <CaseWorkspaceClient caseData={caseData} />;
}
