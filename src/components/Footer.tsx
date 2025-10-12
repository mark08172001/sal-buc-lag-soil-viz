import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [loginTime, setLoginTime] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [slideUp, setSlideUp] = useState(false);

  const getPageName = () => {
    switch (location.pathname) {
      case "/":
        return "Soil Health Monitoring";
      case "/dashboard":
        return "Soil Health Dashboard";
      case "/map":
        return "Soil Health Map";
      case "/data-entry":
        return "Data Entry";
      default:
        return "Soil Health Monitoring";
    }
  };

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

        // Get login time from localStorage or use current time
        const storedLoginTime = localStorage.getItem('loginTime');
        if (storedLoginTime) {
          setLoginTime(storedLoginTime);
        } else {
          const now = new Date().toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          localStorage.setItem('loginTime', now);
          setLoginTime(now);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSlideUp(true);
    const timer = setTimeout(() => setSlideUp(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!userName) return null;

  return (
    <footer className={`fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border py-3 px-6 z-40 transition-all duration-500 ${
      slideUp ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{userName}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{getPageName()}</span>
        </div>
        
        <div className="flex items-center gap-4 text-muted-foreground font-mono text-xs">
          <div>
            <span className="text-foreground font-medium">Current: </span>
            {currentDateTime}
          </div>
          {loginTime && (
            <div>
              <span className="text-foreground font-medium">Login: </span>
              {loginTime}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;