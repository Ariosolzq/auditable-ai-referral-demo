import CaseRail from "@/components/case-study/CaseRail";
import ContactFooter from "@/components/case-study/ContactFooter";
import HeroSection from "@/components/case-study/HeroSection";
import LandingCommunicationGuide from "@/components/case-study/LandingCommunicationGuide";
import WorkflowSwimlane from "@/components/case-study/WorkflowSwimlane";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <HeroSection />
      <LandingCommunicationGuide />
      <section id="workflow" className="scroll-mt-20">
        <WorkflowSwimlane />
      </section>
      <section id="cases" className="scroll-mt-20">
        <CaseRail />
      </section>
      <ContactFooter />
    </div>
  );
}
