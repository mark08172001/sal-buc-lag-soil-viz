import Navigation from "@/components/Navigation";
import MapView from "@/components/MapView";
import Footer from "@/components/Footer";

const MapPage = () => {
  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      <MapView />
      <Footer />
    </div>
  );
};

export default MapPage;
