import { Leaf } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="relative">
        {/* Animated leaf with forming effect */}
        <div className="relative w-24 h-24">
          {/* Main leaf */}
          <div className="absolute inset-0 animate-[spin_2s_ease-in-out_infinite]">
            <Leaf className="w-24 h-24 text-primary animate-pulse" />
          </div>
          
          {/* Growing circles effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 animate-[ping_2s_ease-in-out_infinite]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary/50 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
          </div>
        </div>
        
        {/* Loading text */}
        <p className="mt-6 text-center text-sm font-medium text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
