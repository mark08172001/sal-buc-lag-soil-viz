import { useState, useEffect } from "react";
import morningBg from "@/assets/rice-fields-bg.jpg";
import afternoonBg from "@/assets/soil-health-bg.jpg";
import eveningBg from "@/assets/evening-farm.jpg";

export const useTimeBasedBackground = () => {
  const getInitialBackground = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return morningBg;
    } else if (hour >= 12 && hour < 18) {
      return afternoonBg;
    } else {
      return eveningBg;
    }
  };

  const [backgroundImage, setBackgroundImage] = useState(getInitialBackground);

  useEffect(() => {
    const updateBackground = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        setBackgroundImage(morningBg);
      } else if (hour >= 12 && hour < 18) {
        setBackgroundImage(afternoonBg);
      } else {
        // Evening: 6 PM onwards (18:00 - 4:59 AM)
        setBackgroundImage(eveningBg);
      }
    };

    updateBackground();
    const interval = setInterval(updateBackground, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return backgroundImage;
};
