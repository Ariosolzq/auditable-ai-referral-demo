type CaseDetailPageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { caseId } = await params;
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Case Detail</h1>
      <p className="text-slate-600">
        Phase 0 placeholder for case <code>{caseId}</code>. The workflow
        workspace is built in a later phase.
      </p>
    </section>
  );
}
