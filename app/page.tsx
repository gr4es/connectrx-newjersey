import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ActionCenter from "@/components/ActionCenter";
import Pillars from "@/components/Pillars";
import StateLaws from "@/components/StateLaws";
import Workflow from "@/components/Workflow";
import CoalitionMarquee from "@/components/CoalitionMarquee";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";

export default function HomePage() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <ActionCenter />
        <Pillars />
        <StateLaws />
        <Workflow />
        <CoalitionMarquee />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
