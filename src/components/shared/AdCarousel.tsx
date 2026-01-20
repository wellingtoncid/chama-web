import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdCard } from "./AdCard";

interface AdCarouselProps {
  searchTerm?: string;
  state?: string;
  city?: string;
}

const AdCarousel = ({ searchTerm, city }: AdCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Simulando 3 slots de anúncios. 
  // O componente AdCard buscará anúncios diferentes baseados na posição e index se necessário.
  const totalSlides = 3; 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Troca a cada 5 segundos
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prev = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem]">
      {/* Container de Slides */}
      <div 
        className="flex transition-transform duration-700 ease-in-out" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {[...Array(totalSlides)].map((_, i) => (
          <div key={i} className="min-w-full">
            <AdCard 
              position="freight_list" 
              variant="horizontal" 
              search={searchTerm} 
              city={city} 
            />
          </div>
        ))}
      </div>

      {/* Controles (Só aparecem no Hover) */}
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-slate-900"
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-slate-900"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicadores (Dots) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[...Array(totalSlides)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentSlide === i ? "w-6 bg-[#1f4ead]" : "w-1.5 bg-slate-300"
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default AdCarousel;