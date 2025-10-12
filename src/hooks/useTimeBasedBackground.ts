import { useState, useEffect } from 'react';
import morningCity from '@/assets/morning-city.jpg';
import afternoonCity from '@/assets/afternoon-city.jpg';
import eveningCity from '@/assets/evening-city.jpg';

export const useTimeBasedBackground = () => {
  const [background, setBackground] = useState(morningCity);

  useEffect(() => {
    const updateBackground = () => {
      const now = new Date();
      const phtTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      const hour = phtTime.getHours();

      if (hour >= 6 && hour < 12) {
        setBackground(morningCity);
      } else if (hour >= 12 && hour < 18) {
        setBackground(afternoonCity);
      } else {
        setBackground(eveningCity);
      }
    };

    updateBackground();
    const interval = setInterval(updateBackground, 60000);

    return () => clearInterval(interval);
  }, []);

  return background;
};
