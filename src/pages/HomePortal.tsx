import Header from "../components/shared/Header";
import Hero from "../components/home/Hero";
import FreightList from "../components/home/FreightList";
import CommunityGroups from "../components/groups/CommunityGroups";
import HowItWorks from "../components/home/HowItWorks";
import ForDrivers from "../components/home/ForDrivers";
import ForCompanies from "../components/home/ForCompanies";
import Partners from "../components/home/Partners";
import Supporters from "../components/home/Supporters";
import { AdCard } from "../components/shared/AdCard";
import CTA from "../components/home/CTA";
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
