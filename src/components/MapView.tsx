import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Info } from "lucide-react";

const MapView = () => {
  const [mapboxToken, setMapboxToken] = useState("");
  const [tokenSubmitted, setTokenSubmitted] = useState(false);

  const handleSubmitToken = () => {
    if (mapboxToken.trim()) {
      setTokenSubmitted(true);
      // In a real implementation, this would initialize the Mapbox map
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Soil Health Map</h1>
        <p className="text-muted-foreground">Interactive GIS visualization of soil data points</p>
      </div>

      {!tokenSubmitted ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Mapbox Configuration Required
            </CardTitle>
            <CardDescription>
              Enter your Mapbox public token to enable interactive mapping
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                To get your Mapbox token, visit{" "}
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline text-primary hover:text-primary/80"
                >
                  mapbox.com
                </a>{" "}
                and create a free account. Your public token will be available in the Tokens section.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="pk.eyJ1..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="font-mono"
              />
              <Button onClick={handleSubmitToken} className="w-full">
                Initialize Map
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">What you'll see on the map:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Interactive markers for soil sampling locations in Sallapadan, Bucay, and Lagangilang</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Heatmap overlay showing pH distribution and soil fertility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Click on markers to view detailed soil health metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Toggle between different visualization layers (pH, temperature, fertility)</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="relative w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <MapPin className="w-16 h-16 text-primary mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Map Initialization</h3>
                  <p className="text-muted-foreground">
                    The interactive map with Mapbox will be integrated here.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will display soil data points for all three municipalities with interactive features.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
