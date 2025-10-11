import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import GreetingPopup from "@/components/GreetingPopup";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    <div className="min-h-screen bg-background pb-16">
      <Navigation />
      <Hero />
      {isAuthenticated && (
        <>
          <GreetingPopup />
          <Footer />
        </>
      )}
    </div>
  );
};

export default Index;
