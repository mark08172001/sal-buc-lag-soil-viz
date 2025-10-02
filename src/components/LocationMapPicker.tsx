import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationMapPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: string, coordinates: [number, number]) => void;
  municipality?: string;
}

const LocationMapPicker = ({ open, onOpenChange, onLocationSelect, municipality }: LocationMapPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();

  // Municipality center coordinates
  const municipalityCoords: Record<string, [number, number]> = {
    sallapadan: [120.95, 17.46],
    bucay: [120.74, 17.55],
    lagangilang: [120.79, 17.62],
  };

  useEffect(() => {
    if (!open || !mapContainer.current) return;

    // Small delay to ensure container has dimensions
    const initializeMap = () => {
      if (!mapContainer.current) return;

      // Initialize map if not already initialized
      if (!map.current) {
        const center: [number, number] = municipality ? municipalityCoords[municipality] || [120.8, 17.55] : [120.8, 17.55];
        
        try {
          map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
              version: 8,
              sources: {
                'openfreemap': {
                  type: 'raster',
                  tiles: [
                    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  ],
                  tileSize: 256,
                  attribution: '© OpenStreetMap contributors'
                }
              },
              layers: [
                {
                  id: 'openfreemap',
                  type: 'raster',
                  source: 'openfreemap',
                  minzoom: 0,
                  maxzoom: 19
                }
              ]
            },
            center: center,
            zoom: 12,
          });

          map.current.addControl(new maplibregl.NavigationControl(), "top-right");

          // Add click handler
          map.current.on("click", async (e) => {
            const { lng, lat } = e.lngLat;
            const coords: [number, number] = [lng, lat];
            setSelectedCoords(coords);

            // Remove existing marker
            if (marker.current) {
              marker.current.remove();
            }

            // Add new marker
            marker.current = new maplibregl.Marker({ color: "#22c55e" })
              .setLngLat(coords)
              .addTo(map.current!);

            // Reverse geocode to get location name
            setIsGeocoding(true);
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
              );
              const data = await response.json();
              
              // Extract location name (prefer village/suburb/town/city)
              const location = 
                data.address?.village || 
                data.address?.suburb || 
                data.address?.town || 
                data.address?.city || 
                data.address?.municipality ||
                data.display_name?.split(",")[0] ||
                `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
              
              setLocationName(location);
            } catch (error) {
              console.error("Geocoding error:", error);
              setLocationName(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
              toast({
                title: "Geocoding Error",
                description: "Could not fetch location name, using coordinates instead",
                variant: "destructive",
              });
            } finally {
              setIsGeocoding(false);
            }
          });

          map.current.on('load', () => {
            console.log('Map loaded successfully');
          });

          map.current.on('error', (e) => {
            console.error('Map error:', e);
            toast({
              title: "Map Error",
              description: "There was an issue loading the map. Please try again.",
              variant: "destructive",
            });
          });
        } catch (error) {
          console.error("Map initialization error:", error);
          toast({
            title: "Initialization Error",
            description: "Could not initialize map. Please refresh and try again.",
            variant: "destructive",
          });
        }
      } else {
        // Reset map center based on municipality
        const center: [number, number] = municipality ? municipalityCoords[municipality] || [120.8, 17.55] : [120.8, 17.55];
        map.current.setCenter(center);
        map.current.setZoom(12);
      }
    };

    // Delay initialization to ensure DOM is ready
    const timeoutId = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [open, municipality, toast]);

  const handleConfirm = () => {
    if (selectedCoords && locationName) {
      onLocationSelect(locationName, selectedCoords);
      onOpenChange(false);
      
      // Reset state
      setSelectedCoords(null);
      setLocationName("");
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedCoords(null);
    setLocationName("");
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Select Location on Map
          </DialogTitle>
          <DialogDescription>
            Click anywhere on the map to select the specific location for your soil sample
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 relative min-h-[500px]">
          <div
            ref={mapContainer}
            className="w-full h-full rounded-lg border min-h-[500px]"
          />
          
          {isGeocoding && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/95 px-4 py-2 rounded-lg shadow-lg border flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Getting location name...</span>
            </div>
          )}
          
          {selectedCoords && locationName && !isGeocoding && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/95 px-4 py-2 rounded-lg shadow-lg border">
              <p className="text-sm font-medium">{locationName}</p>
              <p className="text-xs text-muted-foreground">
                {selectedCoords[1].toFixed(6)}, {selectedCoords[0].toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedCoords || !locationName || isGeocoding}
          >
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationMapPicker;
