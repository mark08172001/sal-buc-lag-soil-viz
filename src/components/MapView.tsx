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
  user_id?: string | null;
}

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [soilData, setSoilData] = useState<SoilDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // color helpers
  const getColorForPh = (ph: number) => {
    if (isNaN(ph)) return '#16A34A';
    if (ph < 4.5) return '#EF4444';
    if (ph < 5.5) return '#F97316';
    if (ph < 6.5) return '#FBBF24';
    if (ph <= 7.5) return '#10B981';
    return '#60A5FA';
  };

  const getColorForTemperature = (t: number) => {
    if (isNaN(t)) return '#60A5FA';
    if (t < 20) return '#60A5FA';
    if (t >= 20 && t <= 25) return '#10B981';
    if (t >= 26 && t <= 30) return '#FBBF24';
    if (t >= 31 && t <= 35) return '#F97316';
    return '#EF4444';
  };

  const getColorForFertility = (f: number) => {
    if (isNaN(f)) return '#FBBF24';
    if (f < 40) return '#F87171';
    if (f < 60) return '#FB923C';
    if (f < 70) return '#FBBF24';
    if (f < 85) return '#10B981';
    return '#16A34A';
  };

  // Fetch soil data from database
  useEffect(() => {
    const fetchSoilData = async () => {
      try {
        const { data, error } = await supabase
          .from('soil_data')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSoilData(data || []);
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
    // get current user id
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
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
            <p style="margin: 0 0 12px 0; font-size: 12px; color: hsl(25 15% 45%);">
              ${point.municipality}
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

        // Build DOM popup so we can include interactive delete and colored dots
        const popupNode = document.createElement('div');
        popupNode.innerHTML = popupContent;

        // Add colored dots beside labels
        const phDot = document.createElement('span');
        phDot.style.display = 'inline-block';
        phDot.style.width = '10px';
        phDot.style.height = '10px';
        phDot.style.borderRadius = '50%';
        phDot.style.background = getColorForPh(point.ph_level as number);
        phDot.style.marginRight = '8px';

        const tempDot = document.createElement('span');
        tempDot.style.display = 'inline-block';
        tempDot.style.width = '10px';
        tempDot.style.height = '10px';
        tempDot.style.borderRadius = '50%';
        tempDot.style.background = getColorForTemperature(point.temperature as number);
        tempDot.style.marginRight = '8px';

        const fertDot = document.createElement('span');
        fertDot.style.display = 'inline-block';
        fertDot.style.width = '10px';
        fertDot.style.height = '10px';
        fertDot.style.borderRadius = '50%';
        fertDot.style.background = getColorForFertility(point.overall_fertility as number);
        fertDot.style.marginRight = '8px';

        // Insert dots before the corresponding labels in popupNode
        try {
          const labels = popupNode.querySelectorAll('span');
          // naive insertion: find the pH, Temperature, Fertility label spans by text
          const labelNodes = Array.from(popupNode.querySelectorAll('div > div > span'));
          labelNodes.forEach((node) => {
            const text = node.textContent?.trim() ?? '';
            if (text.startsWith('pH')) {
              node.prepend(phDot.cloneNode(true));
            } else if (text.startsWith('Temperature')) {
              node.prepend(tempDot.cloneNode(true));
            } else if (text.startsWith('Fertility')) {
              node.prepend(fertDot.cloneNode(true));
            }
          });
        } catch {}

        // Add Delete button for owner
        if ((point as any).user_id && currentUserId && (point as any).user_id === currentUserId) {
          const del = document.createElement('button');
          del.textContent = 'Delete';
          del.style.marginTop = '8px';
          del.style.padding = '6px 10px';
          del.style.background = '#ef4444';
          del.style.color = 'white';
          del.style.border = 'none';
          del.style.borderRadius = '6px';
          del.style.cursor = 'pointer';
          popupNode.appendChild(del);

          del.addEventListener('click', async (ev) => {
            ev.stopPropagation();
            const ok = window.confirm('Delete this soil data entry? This action cannot be undone.');
            if (!ok) return;
            del.disabled = true;
            del.textContent = 'Deleting...';
            try {
              const { error } = await supabase.from('soil_data').delete().eq('id', point.id);
              if (error) throw error;
              setSoilData((prev) => prev.filter((p) => p.id !== point.id));
              toast({ title: 'Deleted', description: 'Soil data entry deleted' });
              if (map.current) { map.current.remove(); map.current = null; }
            } catch (err) {
              console.error(err);
              toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
              del.disabled = false;
              del.textContent = 'Delete';
            }
          });
        }

        const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupNode);

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
