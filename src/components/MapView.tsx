import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

// Sample soil data points for the three municipalities
const soilDataPoints = [
  {
    name: "Sallapadan Central",
    municipality: "Sallapadan",
    coordinates: [120.95, 17.45] as [number, number],
    pH: 6.5,
    temperature: 28,
    fertility: 75,
    nitrogen: 0.25,
    phosphorus: 0.15,
    potassium: 0.20,
  },
  {
    name: "Sallapadan North",
    municipality: "Sallapadan",
    coordinates: [120.96, 17.47] as [number, number],
    pH: 6.4,
    temperature: 27,
    fertility: 73,
    nitrogen: 0.23,
    phosphorus: 0.14,
    potassium: 0.19,
  },
  {
    name: "Bucay Central",
    municipality: "Bucay",
    coordinates: [120.73, 17.55] as [number, number],
    pH: 6.8,
    temperature: 26,
    fertility: 82,
    nitrogen: 0.28,
    phosphorus: 0.18,
    potassium: 0.22,
  },
  {
    name: "Bucay East",
    municipality: "Bucay",
    coordinates: [120.75, 17.56] as [number, number],
    pH: 6.7,
    temperature: 26,
    fertility: 80,
    nitrogen: 0.27,
    phosphorus: 0.17,
    potassium: 0.21,
  },
  {
    name: "Lagangilang Central",
    municipality: "Lagangilang",
    coordinates: [120.80, 17.63] as [number, number],
    pH: 6.3,
    temperature: 29,
    fertility: 70,
    nitrogen: 0.22,
    phosphorus: 0.14,
    potassium: 0.18,
  },
  {
    name: "Lagangilang West",
    municipality: "Lagangilang",
    coordinates: [120.78, 17.62] as [number, number],
    pH: 6.4,
    temperature: 28,
    fertility: 72,
    nitrogen: 0.23,
    phosphorus: 0.15,
    potassium: 0.19,
  },
];

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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
      soilDataPoints.forEach((point) => {
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
        if (point.pH < 5.5) color = "hsl(0 70% 50%)"; // red (strongly acidic)
        else if (point.pH < 6.0) color = "hsl(25 85% 55%)"; // orange (moderately acidic)
        else if (point.pH < 6.5) color = "hsl(45 95% 50%)"; // yellow (slightly acidic)
        else if (point.pH > 7.5) color = "hsl(210 80% 50%)"; // blue (alkaline)

        el.style.backgroundColor = color;

        // Create popup content
        const popupContent = `
          <div style="font-family: system-ui; padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: hsl(25 20% 15%);">
              ${point.name}
            </h3>
            <p style="margin: 0 0 12px 0; font-size: 12px; color: hsl(25 15% 45%);">
              ${point.municipality}
            </p>
            <div style="display: grid; gap: 6px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(25 15% 45%);">pH Level:</span>
                <strong style="color: hsl(25 20% 15%);">${point.pH}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(25 15% 45%);">Temperature:</span>
                <strong style="color: hsl(25 20% 15%);">${point.temperature}°C</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(25 15% 45%);">Fertility:</span>
                <strong style="color: hsl(25 20% 15%);">${point.fertility}%</strong>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid hsl(35 20% 88%);">
                <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: hsl(25 15% 45%);">NPK Levels:</p>
                <div style="display: grid; gap: 3px; font-size: 12px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: hsl(25 15% 45%);">N:</span>
                    <span style="color: hsl(25 20% 15%);">${(point.nitrogen * 100).toFixed(0)}%</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: hsl(25 15% 45%);">P:</span>
                    <span style="color: hsl(25 20% 15%);">${(point.phosphorus * 100).toFixed(0)}%</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: hsl(25 15% 45%);">K:</span>
                    <span style="color: hsl(25 20% 15%);">${(point.potassium * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

        new maplibregl.Marker({ element: el })
          .setLngLat(point.coordinates)
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Soil Health Map</h1>
        <p className="text-muted-foreground">Interactive GIS visualization of soil data points across Abra municipalities</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div
            ref={mapContainer}
            className="w-full h-[600px] rounded-lg"
            style={{ minHeight: "600px" }}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
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
        <Card>
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

        <Card>
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

        <Card>
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
  );
};

export default MapView;
