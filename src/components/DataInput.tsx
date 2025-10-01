import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus } from "lucide-react";
import LocationMapPicker from "@/components/LocationMapPicker";

const DataInput = () => {
  const { toast } = useToast();
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
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

  const handleLocationSelect = (location: string, coordinates: [number, number]) => {
    setFormData({ ...formData, location, coordinates });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.municipality || !formData.pH || !formData.temperature) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

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
                  <Label htmlFor="location">Specific Location / Barangay</Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      placeholder="e.g., Barangay Central or click map to select"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setMapPickerOpen(true)}
                      title="Select location on map"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.coordinates && (
                    <p className="text-xs text-muted-foreground">
                      Coordinates: {formData.coordinates[1].toFixed(6)}, {formData.coordinates[0].toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              {/* Soil Parameters */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Soil Parameters</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pH">pH Level *</Label>
                    <Input
                      id="pH"
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      placeholder="6.5"
                      value={formData.pH}
                      onChange={(e) => setFormData({ ...formData, pH: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Range: 0-14</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C) *</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="28.5"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fertility">Overall Fertility (%)</Label>
                  <Input
                    id="fertility"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="75"
                    value={formData.fertility}
                    onChange={(e) => setFormData({ ...formData, fertility: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Range: 0-100%</p>
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

              <Button type="submit" className="w-full" size="lg">
                Submit Soil Data
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines and Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Measurement Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">pH Testing</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use calibrated pH meter or test strips</li>
                  <li>• Take measurements from 6-8 inches depth</li>
                  <li>• Average multiple readings for accuracy</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Temperature Measurement</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Measure at consistent time of day</li>
                  <li>• Use soil thermometer at 4-6 inches depth</li>
                  <li>• Wait for reading to stabilize</li>
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
