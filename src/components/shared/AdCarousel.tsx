import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdCard from "./AdCard";

interface AdCarouselProps {
  searchTerm?: string;
  state?: string;
  city?: string;
}

const AdCarousel = ({ searchTerm, state, city }: AdCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3; 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); 
    return () => clearInterval(timer);
  }, [totalSlides]);

  const next = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prev = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
      {/* Container de Slides */}
      <div 
        className="flex transition-transform duration-700 ease-in-out" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {[...Array(totalSlides)].map((_, i) => (
          <div key={i} className="min-w-full h-[120px] md:h-[110px]">
            <AdCard 
              position="freight_list" 
              variant="horizontal" 
              search={searchTerm} 
              state={state}
              city={city} 
            />
          </div>
        ))}
      </div>

      {/* Controles */}
      <button 
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white text-slate-900 z-20"
      >
        <ChevronLeft size={18} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:text-white text-slate-900 z-20"
      >
        <ChevronRight size={18} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {[...Array(totalSlides)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              currentSlide === i ? "w-4 bg-blue-600" : "w-1 bg-slate-300"
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default AdCarousel;