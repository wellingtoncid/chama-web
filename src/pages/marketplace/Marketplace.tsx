import React from 'react';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import MarketplaceExplorer from '../../modules/marketplace/MarketplaceExplorer';

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Header />
      
      <main className="flex-grow pt-32">
        <div className="max-w-7xl mx-auto px-4">
          
          <header className="mb-8">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.85]">
              Portal de <span className="text-emerald-600">Classificados</span>
            </h1>
          </header>

          {/* LISTINGS */}
          <section className="pb-24">
            <MarketplaceExplorer />
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
