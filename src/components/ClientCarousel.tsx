import React, { useEffect, useMemo } from 'react';

// Import OwlCarousel CSS
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

// Dynamically import OwlCarousel
const OwlCarousel = React.lazy(() => import('react-owl-carousel'));

const ClientCarousel = React.memo(() => {
  // Generate customer image paths dynamically
  const customerImages = useMemo(
    () =>
      Array.from({ length: 68 }, (_, i) => {
        const index = i + 1;
        // Handle mixed extensions (jpeg/png/jpg)
        const extension =
          index === 1 || index === 3 || index === 4 || index === 5 ? "jpeg" :
          index === 6 || index === 9 || index === 13 || index === 18 || index === 19 || index === 20 ? "jpg" :
          index === 2 || index === 7 || index === 8 || index === 10 || index === 11 || index === 12 || index === 14 || index === 16 || index === 17 ? "png" :
          "jpg"; // fallback
        return `/customer/customer-${index}.${extension}`;
      }),
    []
  );

  const carouselOptions = {
    autoplay: true,
    autoplayTimeout: 4000,
    autoplaySpeed: 4000,
    loop: true,
    nav: false,
    dots: false,
    smartSpeed: 4000,
    autoplayHoverPause: false,
    responsive: {
      0: {
        items: 2,
        margin: 20
      },
      768: {
        items: 3,
        margin: 30
      },
      1000: {
        items: 5,
        margin: 40
      }
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            OUR CLIENTS
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <React.Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        }>
          <OwlCarousel className="owl-theme brand-slide" {...carouselOptions}>
            {customerImages.map((image, index) => (
              <div key={index} className="item">
                <div className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group flex items-center justify-center bg-white border border-gray-200">
                  <img
                    src={image}
                    alt={`Client Logo ${index + 1}`}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            ))}
          </OwlCarousel>
        </React.Suspense>
      </div>
    </section>
  );
});

ClientCarousel.displayName = 'ClientCarousel';

export default ClientCarousel;