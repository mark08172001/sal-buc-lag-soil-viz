import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Info, Loader2 } from "lucide-react";
import LocationMapPicker from "@/components/LocationMapPicker";

// Calculate pH and fertility based on temperature using the point scale
const calculateSoilParameters = (temperature: number) => {
  let pH = "";
  let fertility = "";
  let pointScale = 0;

  if (temperature >= 20 && temperature <= 25) {
    // Point 5: Ideal - Optimal pH, Very High Fertility
    pointScale = 5;
    pH = (6.5 + (temperature - 20) * 0.2).toFixed(1); // 6.5 to 7.5
    fertility = (81 + (temperature - 20) * 3.8).toFixed(0); // 81% to 100%
  } else if (temperature >= 26 && temperature <= 30) {
    // Point 4: Good - Slightly Acidic, High Fertility
    pointScale = 4;
    pH = (5.5 + (temperature - 26) * 0.18).toFixed(1); // 5.5 to 6.4
    fertility = (61 + (temperature - 26) * 3.8).toFixed(0); // 61% to 80%
  } else if (temperature >= 31 && temperature <= 35) {
    // Point 3: Warm - Moderately Acidic, Moderate Fertility
    pointScale = 3;
    pH = (4.5 + (temperature - 31) * 0.18).toFixed(1); // 4.5 to 5.4
    fertility = (41 + (temperature - 31) * 3.8).toFixed(0); // 41% to 60%
  } else if (temperature >= 36 && temperature <= 40) {
    // Point 2: Hot - Strongly Acidic, Low Fertility
    pointScale = 2;
    pH = (4.0 + (temperature - 36) * 0.08).toFixed(1); // 4.0 to 4.4
    fertility = (21 + (temperature - 36) * 3.8).toFixed(0); // 21% to 40%
  } else {
    // Point 1: Stressful - Extremely Acidic, Very Low Fertility
    pointScale = 1;
    pH = "3.5"; // Below 4.0
    fertility = "10"; // 0% to 20%
  }

  return { pH, fertility, pointScale };
};

const DataInput = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    municipality: "",
    location: "",
    coordinates: null as [number, number] | null,
    pH: "",
    temperature: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    fertility: "",
  });

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLocationSelect = (location: string, coordinates: [number, number]) => {
    setFormData({ ...formData, location, coordinates });
  };

  const handleTemperatureChange = (value: string) => {
    const temp = parseFloat(value);
    
    if (!isNaN(temp) && value !== "") {
      const { pH, fertility } = calculateSoilParameters(temp);
      setFormData({ 
        ...formData, 
        temperature: value,
        pH,
        fertility
      });
      
      toast({
        title: "Auto-calculated",
        description: `pH: ${pH}, Fertility: ${fertility}% (based on temperature ${temp}°C)`,
      });
    } else {
      setFormData({ ...formData, temperature: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.municipality || !formData.pH || !formData.temperature || !formData.coordinates) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including location coordinates",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit data",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);

    const { pointScale } = calculateSoilParameters(parseFloat(formData.temperature));
    
    const { error } = await supabase.from("soil_data").insert({
      user_id: userId,
      municipality: formData.municipality,
      specific_location: formData.location || "Not specified",
      latitude: formData.coordinates[1],
      longitude: formData.coordinates[0],
      temperature: parseFloat(formData.temperature),
      ph_level: parseFloat(formData.pH),
      overall_fertility: parseFloat(formData.fertility),
      point_scale: pointScale,
      nitrogen_level: formData.nitrogen ? parseFloat(formData.nitrogen) : null,
      phosphorus_level: formData.phosphorus ? parseFloat(formData.phosphorus) : null,
      potassium_level: formData.potassium ? parseFloat(formData.potassium) : null,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Data Submitted Successfully",
        description: `Soil data for ${formData.municipality} has been recorded.`,
      });

      // Reset form
      setFormData({
        municipality: "",
        location: "",
        coordinates: null,
        pH: "",
        temperature: "",
        nitrogen: "",
        phosphorus: "",
        potassium: "",
        fertility: "",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Data Entry</h1>
        <p className="text-muted-foreground">Record new soil health measurements</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              New Soil Sample
            </CardTitle>
            <CardDescription>
              Enter soil test data from field measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Location Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="municipality">Municipality *</Label>
                  <Select
                    value={formData.municipality}
                    onValueChange={(value) => setFormData({ ...formData, municipality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select municipality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sallapadan">Sallapadan</SelectItem>
                      <SelectItem value="bucay">Bucay</SelectItem>
                      <SelectItem value="lagangilang">Lagangilang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Specific Location / Barangay *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      placeholder="Click here to select location on map"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      onClick={() => setMapPickerOpen(true)}
                      onFocus={() => setMapPickerOpen(true)}
                      readOnly
                      className="flex-1 cursor-pointer"
                    />
                    <Button
                      type="button"
                      variant={formData.coordinates ? "outline" : "default"}
                      size="icon"
                      onClick={() => setMapPickerOpen(true)}
                      title="Select location on map (Required)"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.coordinates ? (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ Coordinates: {formData.coordinates[1].toFixed(6)}, {formData.coordinates[0].toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-xs text-destructive">
                      * Click the input field to open map and select location
                    </p>
                  )}
                </div>
              </div>

              {/* Soil Parameters */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Soil Parameters</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="flex items-center gap-2">
                    Temperature (°C) *
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="28.5"
                    value={formData.temperature}
                    onChange={(e) => handleTemperatureChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    pH and fertility will be auto-calculated based on temperature
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pH">pH Level * (Auto-calculated)</Label>
                    <Input
                      id="pH"
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      placeholder="6.5"
                      value={formData.pH}
                      onChange={(e) => setFormData({ ...formData, pH: e.target.value })}
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Range: 0-14 (editable)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fertility">Overall Fertility (%) (Auto-calculated)</Label>
                    <Input
                      id="fertility"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="75"
                      value={formData.fertility}
                      onChange={(e) => setFormData({ ...formData, fertility: e.target.value })}
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Range: 0-100% (editable)</p>
                  </div>
                </div>
              </div>

              {/* NPK Levels */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">NPK Nutrient Levels</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="nitrogen">Nitrogen (N) %</Label>
                  <Input
                    id="nitrogen"
                    type="number"
                    step="0.01"
                    placeholder="0.25"
                    value={formData.nitrogen}
                    onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phosphorus">Phosphorus (P) %</Label>
                  <Input
                    id="phosphorus"
                    type="number"
                    step="0.01"
                    placeholder="0.15"
                    value={formData.phosphorus}
                    onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="potassium">Potassium (K) %</Label>
                  <Input
                    id="potassium"
                    type="number"
                    step="0.01"
                    placeholder="0.20"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Soil Data
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines and Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Calculation Scale</CardTitle>
              <CardDescription>pH and Fertility calculated based on Temperature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Point 5: Ideal</span>
                  <span className="text-xs text-muted-foreground">20-25°C</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>pH: 6.5-7.5 (Optimal)</div>
                  <div>Fertility: 81-100% (Very High)</div>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-green-500/5 rounded-lg border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Point 4: Good</span>
                  <span className="text-xs text-muted-foreground">26-30°C</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>pH: 5.5-6.4 (Slightly Acidic)</div>
                  <div>Fertility: 61-80% (High)</div>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-yellow-500/5 rounded-lg border-l-4 border-yellow-500">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Point 3: Warm</span>
                  <span className="text-xs text-muted-foreground">31-35°C</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>pH: 4.5-5.4 (Moderately Acidic)</div>
                  <div>Fertility: 41-60% (Moderate)</div>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-orange-500/5 rounded-lg border-l-4 border-orange-500">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Point 2: Hot</span>
                  <span className="text-xs text-muted-foreground">36-40°C</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>pH: 4.0-4.4 (Strongly Acidic)</div>
                  <div>Fertility: 21-40% (Low)</div>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-red-500/5 rounded-lg border-l-4 border-red-500">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Point 1: Stressful</span>
                  <span className="text-xs text-muted-foreground">&lt;20°C or &gt;40°C</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>pH: &lt;4.0 (Extremely Acidic)</div>
                  <div>Fertility: 0-20% (Very Low)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Measurement Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Temperature Measurement</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Measure at consistent time of day</li>
                  <li>• Use soil thermometer at 4-6 inches depth</li>
                  <li>• Wait for reading to stabilize</li>
                  <li>• pH and fertility will auto-calculate</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Nutrient Analysis</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Collect samples from multiple points</li>
                  <li>• Send to certified laboratory for NPK testing</li>
                  <li>• Record exact values from lab report</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimal Ranges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                <span className="text-sm font-medium">pH Level</span>
                <span className="text-sm text-muted-foreground">6.0 - 7.5</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                <span className="text-sm font-medium">Temperature</span>
                <span className="text-sm text-muted-foreground">20 - 30°C</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                <span className="text-sm font-medium">Nitrogen</span>
                <span className="text-sm text-muted-foreground">0.2 - 0.3%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                <span className="text-sm font-medium">Phosphorus</span>
                <span className="text-sm text-muted-foreground">0.15 - 0.25%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                <span className="text-sm font-medium">Potassium</span>
                <span className="text-sm text-muted-foreground">0.18 - 0.28%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LocationMapPicker
        open={mapPickerOpen}
        onOpenChange={setMapPickerOpen}
        onLocationSelect={handleLocationSelect}
        municipality={formData.municipality}
      />
    </div>
  );
};

export default DataInput;
