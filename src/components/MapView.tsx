import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import soilHealthBg from "@/assets/soil-health-bg.jpg";

interface SoilDataPoint {
  id: string;
  specific_location: string;
  municipality: string;
  latitude: number;
  longitude: number;
  ph_level: number;
  temperature: number;
  overall_fertility: number;
  nitrogen_level: number | null;
  phosphorus_level: number | null;
  potassium_level: number | null;
  user_name?: string;
}

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [soilData, setSoilData] = useState<SoilDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch soil data from database
  useEffect(() => {
    const fetchSoilData = async () => {
      try {
        const { data: soilDataRaw, error: soilError } = await supabase
          .from('soil_data')
          .select('*')
          .order('created_at', { ascending: false });

        if (soilError) throw soilError;

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name');

        if (profilesError) throw profilesError;

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        const mappedData = soilDataRaw?.map((item: any) => ({
          ...item,
          user_name: profileMap.get(item.user_id) || 'Unknown User'
        })) || [];

        setSoilData(mappedData);
      } catch (error) {
        console.error('Error fetching soil data:', error);
        toast({
          title: "Error",
          description: "Failed to load soil data from database",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSoilData();
  }, [toast]);

  // Initialize map and add markers
  useEffect(() => {
    if (!mapContainer.current || map.current || isLoading) return;

    // Initialize MapLibre map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [120.8, 17.55], // Centered on Abra province
      zoom: 10.5,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add scale control
    map.current.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      }),
      "bottom-left"
    );

    // Wait for map to load before adding markers
    map.current.on("load", () => {
      // Add markers for each soil data point
      soilData.forEach((point) => {
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

        // Color based on pH level
        let color = "hsl(130 45% 40%)"; // default green (optimal)
        if (point.ph_level < 5.5) color = "hsl(0 70% 50%)"; // red (strongly acidic)
        else if (point.ph_level < 6.0) color = "hsl(25 85% 55%)"; // orange (moderately acidic)
        else if (point.ph_level < 6.5) color = "hsl(45 95% 50%)"; // yellow (slightly acidic)
        else if (point.ph_level > 7.5) color = "hsl(210 80% 50%)"; // blue (alkaline)

        el.style.backgroundColor = color;

        // Create popup content
        const npkSection = (point.nitrogen_level !== null && point.phosphorus_level !== null && point.potassium_level !== null) ? `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid hsl(35 20% 88%);">
            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: hsl(25 15% 45%);">NPK Levels:</p>
            <div style="display: grid; gap: 3px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(25 15% 45%);">N:</span>
                <span style="color: hsl(25 20% 15%);">${(point.nitrogen_level * 100).toFixed(0)}%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(25 15% 45%);">P:</span>
                <span style="color: hsl(25 20% 15%);">${(point.phosphorus_level * 100).toFixed(0)}%</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(25 15% 45%);">K:</span>
                <span style="color: hsl(25 20% 15%);">${(point.potassium_level * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        ` : '';

        const popupContent = `
          <div style="font-family: system-ui; padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: hsl(25 20% 15%);">
              ${point.specific_location}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: hsl(25 15% 45%);">
              ${point.municipality}
            </p>
            <p style="margin: 0 0 12px 0; font-size: 11px; color: hsl(130 45% 35%); font-weight: 600;">
              Added by: ${point.user_name || 'Unknown User'}
            </p>
            <div style="display: grid; gap: 6px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(25 15% 45%);">pH Level:</span>
                <strong style="color: hsl(25 20% 15%);">${point.ph_level}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(25 15% 45%);">Temperature:</span>
                <strong style="color: hsl(25 20% 15%);">${point.temperature}°C</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(25 15% 45%);">Fertility:</span>
                <strong style="color: hsl(25 20% 15%);">${point.overall_fertility}%</strong>
              </div>
              ${npkSection}
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

        new maplibregl.Marker({ element: el })
          .setLngLat([point.longitude, point.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [soilData, isLoading]);

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${soilHealthBg})` }}
      />
      {/* Overlay for content readability */}
      <div className="fixed inset-0 bg-gradient-to-br from-background/60 via-background/50 to-background/40 -z-10" />
      
      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10">
      <div>
        <h1 className="text-4xl font-bold mb-2">Soil Health Map</h1>
        <p className="text-muted-foreground">
          Interactive GIS visualization of soil data points across Abra municipalities
          {!isLoading && <span className="ml-2">({soilData.length} data points)</span>}
        </p>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="w-full h-[600px] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading soil data...</p>
              </div>
            </div>
          ) : soilData.length === 0 ? (
            <div className="w-full h-[600px] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">No soil data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Add data from the Data Entry page to see it on the map.</p>
              </div>
            </div>
          ) : (
            <div
              ref={mapContainer}
              className="w-full h-[600px] rounded-lg"
              style={{ minHeight: "600px" }}
            />
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            How to Use the Map
          </CardTitle>
          <CardDescription>Interactive features and controls</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Click on colored markers to view detailed soil health data for that location</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use mouse wheel or pinch to zoom in/out</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Click and drag to pan across the map</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Use navigation controls (top-right) for zoom and compass orientation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Marker colors indicate pH levels: Green (optimal), Yellow (slightly acidic), Orange/Red (acidic), Blue (alkaline)</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">pH Scale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm">Extremely Acidic (pH &lt; 4.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-sm">Strongly Acidic (pH 4.5-5.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Moderately Acidic (pH 5.5-6.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
              <span className="text-sm">Optimal (pH 6.5-7.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm">Alkaline (pH &gt; 7.5)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Temperature Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-400" />
              <span className="text-sm">Cool (&lt; 20°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
              <span className="text-sm">Ideal (20-25°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Good (26-30°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-sm">Warm (31-35°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm">Hot (&gt; 35°C)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Fertility Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-400" />
              <span className="text-sm">Very Low (&lt; 40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-400" />
              <span className="text-sm">Low (40-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400" />
              <span className="text-sm">Moderate (60-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
              <span className="text-sm">High (70-85%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600" />
              <span className="text-sm">Very High (&gt; 85%)</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default MapView;
