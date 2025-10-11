import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";

const DashboardPage = () => {
  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      <Dashboard />
      <Footer />
    </div>
  );
};

export default DashboardPage;
