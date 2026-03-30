import ReviewsSlider from "@/components/ReviewsSlider";

export default function ReviewsSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-brand text-center mb-12">
          Avis de nos clients
        </h2>
        <ReviewsSlider />
      </div>
    </section>
  );
}
