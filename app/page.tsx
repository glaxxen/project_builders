import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { StatsStrip } from "@/components/landing/stats-strip";
import { CohortRhythm } from "@/components/landing/cohort-rhythm";
import { CurriculumShowcase } from "@/components/landing/curriculum-showcase";
import { AssessmentSpotlight } from "@/components/landing/assessment-spotlight";
import { FAQSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#102038] font-sans selection:bg-[#EBF7F4] selection:text-[#102038]">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <CohortRhythm />
        <CurriculumShowcase />
        <AssessmentSpotlight />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
