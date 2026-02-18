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
        {/* ID: Fretes (Hero já contém a busca) */}
        <section id="fretes">
          <Hero />
          <FreightList />
        </section>
        
        {/* AD POS 1: Logo após a lista de fretes (Alta conversão para Pneus/Seguros) */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
             <AdCard position="freight_list" variant="horizontal" />
          </div>
        </div>
        
        {/* ID: Números (Podemos envolver ForDrivers/Companies que mostram as vantagens) */}
        <section id="autoridade">
          <ForDrivers />
          <ForCompanies />
        </section>

        {/* AD POS 2: Banner Vertical ou Especial entre seções de autoridade */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
             <AdCard position="in-feed" variant="horizontal" />
          </div>
        </div>

        <HowItWorks />

        {/* ID: Comunidades */}
        <section id="comunidades">
          <CommunityGroups />
          <Supporters />
        </section>
        
        {/* ID: Ecossistema (Onde as empresas parceiras aparecem) */}
        <section id="ecossistema" className="bg-slate-50 dark:bg-slate-900/50">
          <Partners />
          {/* AD POS 3: Um "Spotlight" para um parceiro Master aqui seria ideal */}
        </section>
        
        {/* ID: Negócios (O seu novo CTA Enterprise) */}
        <section id="negocios">
          <CTA />
        </section>
      </main>
      
      {/* ID: Ajuda (No Footer) */}
      <section id="ajuda">
        <Footer />
      </section>
    </div>
  );
};

export default Index;