import { Leaf } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-transparent">
      <div className="relative">
        {/* Animated leaf with forming effect */}
        <div className="relative w-24 h-24">
          {/* Main leaf with scale animation */}
          <div className="absolute inset-0 animate-[scale-grow_0.8s_ease-in-out_infinite]">
            <Leaf className="w-24 h-24 text-primary drop-shadow-lg" />
          </div>
          
          {/* Growing circles effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 animate-[ping_1s_ease-in-out_infinite]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary/50 animate-[ping_1s_ease-in-out_infinite_0.3s]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
