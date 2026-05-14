import BoundaryStrip from "@/components/case-study/BoundaryStrip";
import CaseRail from "@/components/case-study/CaseRail";
import ContactFooter from "@/components/case-study/ContactFooter";
import GovernanceLens from "@/components/case-study/GovernanceLens";
import HeroSection from "@/components/case-study/HeroSection";
import LandingCommunicationGuide from "@/components/case-study/LandingCommunicationGuide";
import ProblemSection from "@/components/case-study/ProblemSection";
import WorkflowSwimlane from "@/components/case-study/WorkflowSwimlane";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <HeroSection />
        <ProblemSection />
        <GovernanceLens />
        <BoundaryStrip />
      </div>
      <LandingCommunicationGuide />
      <WorkflowSwimlane />
      <CaseRail />
      <ContactFooter />
    </div>
  );
}
