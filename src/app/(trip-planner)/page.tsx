import HeroSection from "@/components/landingPage/hero-section";
import HowItWorks from "@/components/landingPage/how-rsl-works";
import Features from "@/components/landingPage/organize";
import CTA from "@/components/landingPage/cta";
import Navbar from "@/components/landingPage/navbar";
import HowItWorksVisual from "@/components/landingPage/hero-below";
import DestinationGallery from "@/components/landingPage/dest";
import Footer from "@/components/landingPage/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
        <Navbar />
      <HeroSection />
      <HowItWorksVisual />
      <HowItWorks />
      <DestinationGallery />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}