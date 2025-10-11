import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import morningCity from "@/assets/morning-city.jpg";
import afternoonCity from "@/assets/afternoon-city.jpg";
import eveningCity from "@/assets/evening-city.jpg";

const GreetingPopup = () => {
  const [show, setShow] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(morningCity);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .single();
        
        if (profile) {
          setUserName(profile.full_name);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Update time display
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));

      // Determine greeting based on time
      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning");
        setBackgroundImage(morningCity);
      } else if (hour >= 12 && hour < 18) {
        setGreeting("Good afternoon");
        setBackgroundImage(afternoonCity);
      } else {
        setGreeting("Good evening");
        setBackgroundImage(eveningCity);
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 1000);

    // Show popup
    setShow(true);

    // Hide after 6 seconds
    const timeout = setTimeout(() => {
      setShow(false);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [userName]);

  if (!userName) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
        show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
    >
      <div 
        className="relative rounded-2xl shadow-2xl min-w-[320px] max-w-[420px] h-[180px] overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        
        <div className="relative h-full flex flex-col justify-end p-6">
          <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
            {greeting}, {userName}!
          </h3>
          <p className="text-sm text-white/90 font-mono drop-shadow-md">
            {currentTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GreetingPopup;