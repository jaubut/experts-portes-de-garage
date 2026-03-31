import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ServicesGrid from "@/components/ServicesGrid";
import ReviewsSection from "@/components/ReviewsSection";
import CTABanner from "@/components/CTABanner";
import GallerySection from "@/components/GallerySection";
import InspectionBanner from "@/components/InspectionBanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <InspectionBanner />
      <ReviewsSection />
      <ServicesGrid />
      <TrustBar />
      <CTABanner />
      <GallerySection />
    </>
  );
}
