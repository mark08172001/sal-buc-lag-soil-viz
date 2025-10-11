import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GreetingPopup = () => {
  const [show, setShow] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isNight, setIsNight] = useState(false);

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
        setIsNight(false);
      } else if (hour >= 12 && hour < 18) {
        setGreeting("Good afternoon");
        setIsNight(false);
      } else {
        setGreeting("Good evening");
        setIsNight(true);
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
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-6 min-w-[300px] max-w-[400px]">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {isNight ? (
              <div className="w-16 h-16 bg-gradient-to-b from-indigo-900 to-purple-900 rounded-xl flex items-center justify-center">
                <Moon className="w-8 h-8 text-yellow-200" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-b from-sky-400 to-orange-300 rounded-xl flex items-center justify-center">
                <Sun className="w-8 h-8 text-yellow-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">
              {greeting}, {userName}!
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {currentTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingPopup;