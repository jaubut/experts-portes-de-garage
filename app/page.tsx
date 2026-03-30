import HeroSection from "@/components/HeroSection";
import ReviewsSection from "@/components/ReviewsSection";
import ServicesGrid from "@/components/ServicesGrid";
import TrustBar from "@/components/TrustBar";
import CTABanner from "@/components/CTABanner";
import GallerySection from "@/components/GallerySection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ReviewsSection />
      <ServicesGrid />
      <TrustBar />
      <CTABanner />
      <GallerySection />
    </>
  );
}
