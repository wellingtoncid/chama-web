import Header from "../components/shared/Header";
import Hero from "../components/Hero";
import FreightList from "../components/FreightList";
import CommunityGroups from "../components/home/CommunityGroups";
import HowItWorks from "../components/HowItWorks";
import ForDrivers from "../components/ForDrivers";
import ForCompanies from "../components/ForCompanies";
import Partners from "../components/Partners";
import Supporters from "../components/Supporters";
import { AdCard } from "../components/shared/AdCard";
import CTA from "../components/CTA";
import Footer from "../components/shared/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FreightList />
        
        {/* Banner publicitário após lista de fretes */}
        <div className="container mx-auto px-4 py-6">
          <AdCard position={"sidebar"} />
        </div>
        
        <CommunityGroups />
        <HowItWorks />
        
        {/* Banner publicitário após como funciona */}
        <div className="container mx-auto px-4 py-6">
          <AdCard position={"sidebar"} />
        </div>
        
        <ForDrivers />
        <ForCompanies />
        <Partners />
        <Supporters />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
