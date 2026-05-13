import BoundaryStrip from "@/components/case-study/BoundaryStrip";
import CaseRail from "@/components/case-study/CaseRail";
import HeroSection from "@/components/case-study/HeroSection";
import ProblemSection from "@/components/case-study/ProblemSection";
import WorkflowSwimlane from "@/components/case-study/WorkflowSwimlane";

export default function HomePage() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <HeroSection />
        <ProblemSection />
      </div>
      <BoundaryStrip />
      <WorkflowSwimlane />
      <CaseRail />
    </div>
  );
}
