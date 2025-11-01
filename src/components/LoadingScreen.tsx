import { Leaf } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-transparent">
      <div className="relative">
        {/* Animated leaf with forming effect */}
        <div className="relative w-24 h-24">
          {/* Multiple overlapping leaves to create forming effect */}
          <div className="absolute inset-0 animate-[leaf-form-1_1.5s_ease-in-out_infinite]">
            <Leaf className="w-24 h-24 text-primary/30" strokeWidth={1} />
          </div>
          <div className="absolute inset-0 animate-[leaf-form-2_1.5s_ease-in-out_infinite_0.2s]">
            <Leaf className="w-24 h-24 text-primary/50" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 animate-[leaf-form-3_1.5s_ease-in-out_infinite_0.4s]">
            <Leaf className="w-24 h-24 text-primary" strokeWidth={2} />
          </div>
          
          {/* Growing circles effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-[ping_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
