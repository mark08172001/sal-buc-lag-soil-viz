import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import { useTimeBasedBackground } from "@/hooks/useTimeBasedBackground";

const DashboardPage = () => {
  const backgroundImage = useTimeBasedBackground();
  
  return (
    <div 
      className="min-h-screen pb-16 relative"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10" />
      <div className="relative z-10">
        <Navigation />
        <Dashboard />
        <Footer />
      </div>
    </div>
  );
};

export default DashboardPage;
