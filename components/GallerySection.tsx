const GALLERY_PHOTOS = [
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-18_10_58-1024x683.webp",
    alt: "Remplacement de ressort de porte de garage",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-21_00_24-1024x683.webp",
    alt: "Remplacement de câbles de porte de garage",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-21_26_35-1024x683.webp",
    alt: "Remplacement de roulettes de porte de garage",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-18_17_46-1024x683.webp",
    alt: "Remplacement de panneau de porte de garage",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-28-oct.-2025-16_30_47-1024x683.webp",
    alt: "Installation de porte de garage résidentielle",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-18_19_16-1024x683.webp",
    alt: "Réparation de rails de porte de garage",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-24-oct.-2025-18_22_10-1024x683.webp",
    alt: "Remplacement de tambour de porte de garage",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-31-oct.-2025-14_02_30-1024x683.webp",
    alt: "Installation d'ouvre-porte de garage",
  },
  {
    src: "https://expertsportesdegarage.ca/wp-content/uploads/2025/10/ChatGPT-Image-13-oct.-2025-14_30_28-1024x683.webp",
    alt: "Installation de coupe-froid de porte de garage",
  },
];

export default function GallerySection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-brand text-center mb-3">
          Galerie — Nos réalisations
        </h2>
        <p className="text-gray-500 text-center text-sm mb-10">
          Découvrez l&apos;exceptionnel savoir-faire de nos techniciens — style et fonctionnalité pour votre maison.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY_PHOTOS.map((photo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={photo.src}
              alt={photo.alt}
              className="w-full h-48 md:h-60 object-cover rounded-xl shadow-sm hover:shadow-md transition-shadow"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
