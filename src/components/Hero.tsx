import { Button } from "@/components/ui/button";
import { Leaf, Map, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import soilHealthBg from "@/assets/soil-health-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${soilHealthBg})` }}
      />
      
      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Leaf className="w-4 h-4" />
            Soil Health Monitoring System
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
            Empowering Agriculture Through
            <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Data-Driven Insights
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive soil health visualization for Sallapadan, Bucay, and Lagangilang municipalities
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <BarChart3 className="w-5 h-5" />
                View Dashboard
              </Button>
            </Link>
            <Link to="/map">
              <Button size="lg" variant="outline" className="gap-2">
                <Map className="w-5 h-5" />
                Explore Map
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">GIS Mapping</h3>
              <p className="text-sm text-muted-foreground">
                Interactive maps showing soil health distribution across municipalities
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Data Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive charts and statistics for informed decision-making
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Soil Health</h3>
              <p className="text-sm text-muted-foreground">
                Monitor pH, temperature, and fertility indicators in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
