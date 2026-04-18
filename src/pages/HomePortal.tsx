import Header from "../components/shared/Header";
import Hero from "../components/home/Hero";
import FreightList from "../components/home/FreightList";
import CommunityGroups from "../components/groups/CommunityGroups";
import HowItWorks from "../components/home/HowItWorks";
import ForDrivers from "../components/home/ForDrivers";
import ForCompanies from "../components/home/ForCompanies";
import Partners from "../components/home/Partners";
import Supporters from "../components/home/Supporters";
import AdCard from "../components/shared/AdCard";
import CTA from "../components/home/CTA";
import Footer from "../components/shared/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <Header />
      
      <main className="pt-[96px] lg:pt-[104px]">
        
        <section id="fretes">
          <Hero />
          <FreightList />
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
              <AdCard position="freight_list" variant="ecommerce" />
          </div>
        </div>

        <section id="autoridade">
          <ForDrivers />
          <ForCompanies />
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
              <AdCard position="infeed_wide" variant="ecommerce" />
          </div>
        </div>

        <section>
          <HowItWorks />
        </section>

        <section id="comunidades">
          <div className="max-w-4xl mx-auto">
              <AdCard position="freight_list" variant="ecommerce" />
          </div>
          <CommunityGroups />
          <Supporters />
          <div className="max-w-4xl mx-auto">
              <AdCard position="infeed_wide" variant="ecommerce" />
          </div>
        </section>
        
        <section id="ecossistema" className="bg-slate-50 dark:bg-slate-900/50">
          <Partners />
        </section>
        
        <section id="negocios">
          <CTA />
        </section>
      </main>
      
      <section id="ajuda">
        <Footer />
      </section>
    </div>
  );
};

export default Index;