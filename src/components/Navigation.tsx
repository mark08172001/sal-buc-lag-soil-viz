import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, BarChart3, Map, Plus, Home, LogOut, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/");
    }
  };
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">Soil Health Monitor</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
          
          <Link to="/dashboard">
            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          
          <Link to="/map">
            <Button
              variant={isActive("/map") ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </Button>
          </Link>
          
          <Link to="/data-entry">
            <Button
              variant={isActive("/data-entry") ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Data</span>
            </Button>
          </Link>

          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
