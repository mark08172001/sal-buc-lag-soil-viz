import Navigation from "@/components/Navigation";
import DataInput from "@/components/DataInput";
import Footer from "@/components/Footer";
import { useTimeBasedBackground } from "@/hooks/useTimeBasedBackground";

const DataEntryPage = () => {
  const backgroundImage = useTimeBasedBackground();
  
  return (
    <div 
      className="min-h-screen pb-16 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10">
        <Navigation />
        <DataInput />
        <Footer />
      </div>
    </div>
  );
};

export default DataEntryPage;
