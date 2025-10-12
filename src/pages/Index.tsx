import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import GreetingPopup from "@/components/GreetingPopup";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useTimeBasedBackground } from "@/hooks/useTimeBasedBackground";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const backgroundImage = useTimeBasedBackground();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        <Hero />
        {isAuthenticated && (
          <>
            <GreetingPopup />
            <Footer />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
