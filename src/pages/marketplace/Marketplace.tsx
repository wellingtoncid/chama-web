import React from 'react';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import MarketplaceExplorer from '../../modules/marketplace/MarketplaceExplorer';

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Header />
      
      <main className="flex-grow pt-28 lg:pt-32">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <header className="mb-8 pt-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Portal de <span className="text-emerald-600">Classificados</span>
            </h1>
          </header>

          {/* LISTINGS */}
          <section className="pb-16">
            <MarketplaceExplorer />
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
