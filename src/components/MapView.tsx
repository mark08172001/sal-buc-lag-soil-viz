import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';
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
  const markersRef = useRef<Record<string, { marker: any; el: HTMLElement; popupNode: HTMLElement }>>({});
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

  // Export functions
  const exportToCSV = () => {
    if (soilData.length === 0) {
      toast({
        title: "No Data",
        description: "No soil data available to export",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Location",
      "Municipality",
      "Latitude",
      "Longitude",
      "pH Level",
      "Temperature (°C)",
      "Fertility (%)",
      "Nitrogen (%)",
      "Phosphorus (%)",
      "Potassium (%)",
    ];

    const rows = soilData.map((point) => [
      point.specific_location,
      point.municipality,
      point.latitude,
      point.longitude,
      point.ph_level,
      point.temperature,
      point.overall_fertility,
      point.nitrogen_level !== null ? (point.nitrogen_level * 100).toFixed(2) : "N/A",
      point.phosphorus_level !== null ? (point.phosphorus_level * 100).toFixed(2) : "N/A",
      point.potassium_level !== null ? (point.potassium_level * 100).toFixed(2) : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `soil_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Soil data exported as CSV",
    });
  };

  const exportToExcel = () => {
    if (soilData.length === 0) {
      toast({
        title: "No Data",
        description: "No soil data available to export",
        variant: "destructive",
      });
      return;
    }

    const exportData = soilData.map((point) => ({
      Location: point.specific_location,
      Municipality: point.municipality,
      Latitude: point.latitude,
      Longitude: point.longitude,
      "pH Level": point.ph_level,
      "Temperature (°C)": point.temperature,
      "Fertility (%)": point.overall_fertility,
      "Nitrogen (%)": point.nitrogen_level !== null ? (point.nitrogen_level * 100).toFixed(2) : "N/A",
      "Phosphorus (%)": point.phosphorus_level !== null ? (point.phosphorus_level * 100).toFixed(2) : "N/A",
      "Potassium (%)": point.potassium_level !== null ? (point.potassium_level * 100).toFixed(2) : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Soil Data");

    XLSX.writeFile(workbook, `soil_data_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export Successful",
      description: "Soil data exported as Excel file",
    });
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

    // Inject a small style to slightly enlarge the popup close '×' button for our popups
    if (typeof document !== 'undefined' && !document.getElementById('sb-popup-close-style')) {
      const style = document.createElement('style');
      style.id = 'sb-popup-close-style';
      style.innerHTML = `
        /* larger close button for map popups created by this component */
        .sb-popup .maplibregl-popup-close-button {
          font-size: 18px !important;
          width: 30px !important;
          height: 30px !important;
          line-height: 30px !important;
          opacity: 0.95;
        }
      `;
      document.head.appendChild(style);
    }

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
        const createMarker = (p: SoilDataPoint) => {
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
          if (p.ph_level < 4.5) color = "hsl(0 70% 50%)"; // red (extremely acidic)
          else if (p.ph_level < 5.5) color = "hsl(0 70% 50%)"; // red (strongly acidic)
          else if (p.ph_level < 6.0) color = "hsl(25 85% 55%)"; // orange (moderately acidic)
          else if (p.ph_level < 6.5) color = "hsl(45 95% 50%)"; // yellow (slightly acidic)
          else if (p.ph_level > 7.5) color = "hsl(210 80% 50%)"; // blue (alkaline)

          el.style.backgroundColor = color;

          // Create popup content (renders initial view; editable fields will be attached later)
          const npkSection = (p.nitrogen_level !== null && p.phosphorus_level !== null && p.potassium_level !== null) ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid hsl(35 20% 88%);">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: hsl(25 15% 45%);">NPK Levels:</p>
              <div style="display: grid; gap: 3px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: hsl(25 15% 45%);">N:</span>
                  <span style="color: hsl(25 20% 15%);">${(p.nitrogen_level * 100).toFixed(0)}%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: hsl(25 15% 45%);">P:</span>
                  <span style="color: hsl(25 20% 15%);">${(p.phosphorus_level * 100).toFixed(0)}%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: hsl(25 15% 45%);">K:</span>
                  <span style="color: hsl(25 20% 15%);">${(p.potassium_level * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ` : '';

          const popupContent = `
            <div style="font-family: system-ui; padding: 6px; min-width: 210px; font-size: 12px;">
              <h3 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: hsl(25 20% 15%);">
                ${p.specific_location}
              </h3>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: hsl(25 15% 45%);">
                ${p.municipality}
              </p>
              <div style="display: grid; gap: 6px; font-size: 11px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: hsl(25 15% 45%); font-size: 11px;">pH Level:</span>
                  <strong style="color: hsl(25 20% 15%); font-size: 11px;" data-field="ph">${p.ph_level}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: hsl(25 15% 45%); font-size: 11px;">Temperature:</span>
                  <strong style="color: hsl(25 20% 15%); font-size: 11px;" data-field="temp">${p.temperature}°C</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: hsl(25 15% 45%); font-size: 11px;">Fertility:</span>
                  <strong style="color: hsl(25 20% 15%); font-size: 11px;" data-field="fert">${p.overall_fertility}%</strong>
                </div>
                ${npkSection}
              </div>
            </div>
          `;

          const popupNode = document.createElement('div');
          popupNode.innerHTML = popupContent;

          // Add colored dots beside labels
          const phDot = document.createElement('span');
          phDot.style.display = 'inline-block';
          phDot.style.width = '10px';
          phDot.style.height = '10px';
          phDot.style.borderRadius = '50%';
          phDot.style.background = getColorForPh(p.ph_level as number);
          phDot.style.marginRight = '8px';

          const tempDot = document.createElement('span');
          tempDot.style.display = 'inline-block';
          tempDot.style.width = '10px';
          tempDot.style.height = '10px';
          tempDot.style.borderRadius = '50%';
          tempDot.style.background = getColorForTemperature(p.temperature as number);
          tempDot.style.marginRight = '8px';

          const fertDot = document.createElement('span');
          fertDot.style.display = 'inline-block';
          fertDot.style.width = '10px';
          fertDot.style.height = '10px';
          fertDot.style.borderRadius = '50%';
          fertDot.style.background = getColorForFertility(p.overall_fertility as number);
          fertDot.style.marginRight = '8px';

          try {
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

          
          // Add action buttons for owner: Edit & Delete
          if (p.user_id && currentUserId && p.user_id === currentUserId) {
            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '8px';
            actions.style.marginTop = '8px';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.style.padding = '6px 10px';
            editBtn.style.background = '#ecb10fff';
            editBtn.style.color = 'white';
            editBtn.style.border = 'none';
            editBtn.style.borderRadius = '6px';
            editBtn.style.cursor = 'pointer';

            const del = document.createElement('button');
            del.textContent = 'Delete';
            del.style.padding = '6px 10px';
            del.style.background = '#ef4444';
            del.style.color = 'white';
            del.style.border = 'none';
            del.style.borderRadius = '6px';
            del.style.cursor = 'pointer';

            actions.appendChild(editBtn);
            actions.appendChild(del);
            popupNode.appendChild(actions);

            // Edit button behavior: open inline form inside popup
            editBtn.addEventListener('click', (ev) => {
              ev.stopPropagation();
              // build simple form
              const form = document.createElement('div');
              form.style.display = 'grid';
              form.style.gap = '6px';
              form.style.marginTop = '8px';

              const phInput = document.createElement('input');
              phInput.type = 'number';
              phInput.step = '0.1';
              phInput.value = String(p.ph_level);
              phInput.style.padding = '5px';
              phInput.style.border = '2px solid #000000ff';
              phInput.style.borderRadius = '6px';
              phInput.style.fontSize = '12px';
              phInput.style.height = '36px';
              phInput.style.lineHeight = '1';
              phInput.style.display = 'block';
              phInput.style.boxSizing = 'border-box';
              // restrict pH input to 0-14
              phInput.min = '0'; // Ensure min is set to 0
              phInput.max = '14';
              phInput.addEventListener('input', () => { // Add event listener for input
                if (phInput.value === '') return; // Return if input is empty
                const v = parseFloat(phInput.value); // Parse input value as float
                if (Number.isNaN(v)) return; // Return if value is NaN
                if (v < 0) phInput.value = '0'; // Clamp negative values to 0
                if (v > 14) phInput.value = '14'; // Clamp values above 14
              });

              const phLabel = document.createElement('label');
              phLabel.textContent = 'pH Level';
              phLabel.style.fontSize = '11px';
              phLabel.style.marginBottom = '4px';
              phLabel.style.display = 'block';

              const tempInput = document.createElement('input');
              tempInput.type = 'number';
              tempInput.step = '0.1';
              tempInput.value = String(p.temperature);
              // sizing to match other top-row inputs
              tempInput.style.padding = '5px';
              tempInput.style.border = '2px solid #000';
              tempInput.style.borderRadius = '6px';
              tempInput.style.fontSize = '12px';
              tempInput.style.height = '36px';
              tempInput.style.lineHeight = '1';
              tempInput.style.display = 'block';
              tempInput.style.boxSizing = 'border-box';
              // limit temperature input to max 100
              tempInput.max = '100';
              tempInput.addEventListener('input', () => {
                if (tempInput.value === '') return;
                const v = parseFloat(tempInput.value);
                if (Number.isNaN(v)) return;
                if (v > 100) tempInput.value = '100';
              });

              const tempLabel = document.createElement('label');
              tempLabel.textContent = 'Temperature';
              tempLabel.style.fontSize = '11px';
              tempLabel.style.marginBottom = '5.5px';
              tempLabel.style.display = 'block';
              tempLabel.style.lineHeight = '1.7';

              const fertInput = document.createElement('input');
              fertInput.type = 'number';
              fertInput.step = '0.1';
              fertInput.value = String(p.overall_fertility);
              fertInput.style.padding = '5px';
              fertInput.style.border = '2px solid #000';
              fertInput.style.borderRadius = '6px';
              fertInput.style.fontSize = '12px';
              fertInput.style.height = '36px';
              fertInput.style.lineHeight = '1';
              fertInput.style.display = 'block';
              fertInput.style.boxSizing = 'border-box';
              // limit fertility to 0-100 (no negatives)
              fertInput.min = '0'; // Ensure min is set to 0
              fertInput.max = '100'; // Ensure max is set to 100
              fertInput.addEventListener('input', () => { // Add event listener for input
                if (fertInput.value === '') return; // Return if input is empty
                const v = parseFloat(fertInput.value); // Parse input value as float
                if (Number.isNaN(v)) return; // Return if value is NaN
                if (v < 0) fertInput.value = '0'; // Clamp negative values to 0
                if (v > 100) fertInput.value = '100'; // Clamp values above 100
              });

              const fertLabel = document.createElement('label');
              fertLabel.textContent = 'Fertility (%)';
              fertLabel.style.fontSize = '11px';
              fertLabel.style.marginBottom = '4px';
              fertLabel.style.display = 'block';

              // NPK inputs
              const nInput = document.createElement('input'); // Create nitrogen input
              nInput.type = 'number';
              nInput.step = '0.01';
              nInput.min = '0'; // Ensure min is set to 0
              nInput.max = '1'; // Ensure max is set to 1
              nInput.value = p.nitrogen_level !== null ? String(p.nitrogen_level) : '';
              nInput.style.padding = '5px';
              nInput.style.border = '2px solid #000';
              nInput.style.borderRadius = '6px';
              nInput.style.fontSize = '12px';
              // clamp user input to [0,1]
              nInput.addEventListener('input', () => {
                if (nInput.value === '') return;
                const v = parseFloat(nInput.value);
                if (Number.isNaN(v)) return;
                if (v < 0) nInput.value = '0';
                if (v > 1) nInput.value = '1';
              });

              const pInput = document.createElement('input'); // Create phosphorus input
              pInput.type = 'number';
              pInput.step = '0.01';
              pInput.min = '0'; // Ensure min is set to 0
              pInput.max = '1'; // Ensure max is set to 1
              pInput.value = p.phosphorus_level !== null ? String(p.phosphorus_level) : '';
              pInput.style.padding = '5px';
              pInput.style.border = '2px solid #000';
              pInput.style.borderRadius = '6px';
              pInput.style.fontSize = '12px';
              pInput.addEventListener('input', () => {
                if (pInput.value === '') return;
                const v = parseFloat(pInput.value);
                if (Number.isNaN(v)) return;
                if (v < 0) pInput.value = '0';
                if (v > 1) pInput.value = '1';
              });

              const kInput = document.createElement('input'); // Create potassium input
              kInput.type = 'number';
              kInput.step = '0.01';
              kInput.min = '0'; // Ensure min is set to 0
              kInput.max = '1'; // Ensure max is set to 1
              kInput.value = p.potassium_level !== null ? String(p.potassium_level) : '';
              kInput.style.padding = '5px';
              kInput.style.border = '2px solid #000';
              kInput.style.borderRadius = '6px';
              kInput.style.fontSize = '12px';
              kInput.addEventListener('input', () => {
                if (kInput.value === '') return;
                const v = parseFloat(kInput.value);
                if (Number.isNaN(v)) return;
                if (v < 0) kInput.value = '0';
                if (v > 1) kInput.value = '1';
              });

              // helper to normalize input sizing — no dropdown decoration
              const wrapAsDropdown = (inputEl: HTMLInputElement) => {
                inputEl.style.width = '100%';
                inputEl.style.boxSizing = 'border-box';
                inputEl.style.background = 'white';
                // keep small right padding for caret / clear icons
                inputEl.style.paddingRight = '8px';
                inputEl.style.fontSize = '12px';
                return inputEl;
              };

              const saveBtn = document.createElement('button');
              saveBtn.textContent = 'Save';
              saveBtn.style.padding = '5px 8px';
              saveBtn.style.background = '#10b981';
              saveBtn.style.color = 'white';
              saveBtn.style.border = 'none';
              saveBtn.style.borderRadius = '6px';
              saveBtn.style.cursor = 'pointer';
              saveBtn.style.fontSize = '12px';

              const cancelBtn = document.createElement('button');
              cancelBtn.textContent = 'Cancel';
              cancelBtn.style.padding = '5px 8px';
              cancelBtn.style.background = '#6b7280';
              cancelBtn.style.color = 'white';
              cancelBtn.style.border = 'none';
              cancelBtn.style.borderRadius = '6px';
              cancelBtn.style.cursor = 'pointer';
              cancelBtn.style.fontSize = '12px';

              const btnRow = document.createElement('div');
              btnRow.style.display = 'flex';
              btnRow.style.gap = '8px';
              btnRow.appendChild(saveBtn);
              btnRow.appendChild(cancelBtn);

              // layout: ph/temp/fert on top, npk below
              const rowTop = document.createElement('div');
              rowTop.style.display = 'grid';
              rowTop.style.gridTemplateColumns = '1fr 1fr 1fr';
              rowTop.style.gap = '6px';
              // place label + input stacks in each column
              const col1 = document.createElement('div');
              col1.appendChild(phLabel);
              col1.appendChild(wrapAsDropdown(phInput));

              const col2 = document.createElement('div');
              col2.appendChild(tempLabel);
              col2.appendChild(wrapAsDropdown(tempInput));

              const col3 = document.createElement('div');
              col3.appendChild(fertLabel);
              col3.appendChild(wrapAsDropdown(fertInput));

              rowTop.appendChild(col1);
              rowTop.appendChild(col2);
              rowTop.appendChild(col3);

              const rowNpk = document.createElement('div');
              rowNpk.style.display = 'grid';
              rowNpk.style.gridTemplateColumns = '1fr 1fr 1fr';
              rowNpk.style.gap = '6px';
              rowNpk.style.marginTop = '4px';
              // small labels
              const nLabel = document.createElement('div');
              nLabel.textContent = 'N (0-1)';
              nLabel.style.fontSize = '10px';
              nLabel.style.color = 'var(--muted-foreground)';
              const pLabel = document.createElement('div');
              pLabel.textContent = 'P (0-1)';
              pLabel.style.fontSize = '10px';
              pLabel.style.color = 'var(--muted-foreground)';
              const kLabel = document.createElement('div');
              kLabel.textContent = 'K (0-1)';
              kLabel.style.fontSize = '10px';
              kLabel.style.color = 'var(--muted-foreground)';

              const nWrap = document.createElement('div');
              nWrap.appendChild(nLabel);
              nWrap.appendChild(wrapAsDropdown(nInput));
              const pWrap = document.createElement('div');
              pWrap.appendChild(pLabel);
              pWrap.appendChild(wrapAsDropdown(pInput));
              const kWrap = document.createElement('div');
              kWrap.appendChild(kLabel);
              kWrap.appendChild(wrapAsDropdown(kInput));

              rowNpk.appendChild(nWrap);
              rowNpk.appendChild(pWrap);
              rowNpk.appendChild(kWrap);

              form.appendChild(rowTop);
              form.appendChild(rowNpk);
              form.appendChild(btnRow);

              // replace actions with form
              actions.replaceWith(form);

              cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                form.replaceWith(actions);
              });

              saveBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving...';
                const newPh = parseFloat(phInput.value);
                const newTemp = parseFloat(tempInput.value);
                const newFert = parseFloat(fertInput.value);
                const newN = nInput.value === '' ? null : parseFloat(nInput.value);
                const newP = pInput.value === '' ? null : parseFloat(pInput.value);
                const newK = kInput.value === '' ? null : parseFloat(kInput.value);
                // simple validation
                if (Number.isNaN(newPh) || Number.isNaN(newTemp) || Number.isNaN(newFert)) {
                  toast({ title: 'Invalid', description: 'Please enter valid numeric values', variant: 'destructive' });
                  saveBtn.disabled = false;
                  saveBtn.textContent = 'Save';
                  return;
                }

                // validate pH range 0-14
                if (newPh < 0 || newPh > 14) {
                  toast({ title: 'Invalid pH', description: 'pH must be between 0 and 14', variant: 'destructive' });
                  saveBtn.disabled = false;
                  saveBtn.textContent = 'Save';
                  return;
                }

                // validate temperature (<=100)
                if (newTemp > 100) {
                  toast({ title: 'Invalid Temperature', description: 'Temperature must be 100°C or less', variant: 'destructive' });
                  saveBtn.disabled = false;
                  saveBtn.textContent = 'Save';
                  return;
                }

                // validate fertility range 0-100
                if (newFert < 0 || newFert > 100) {
                  toast({ title: 'Invalid Fertility', description: 'Fertility must be between 0 and 100', variant: 'destructive' });
                  saveBtn.disabled = false;
                  saveBtn.textContent = 'Save';
                  return;
                }

                // validate NPK ranges (0-1)
                const invalidNPK = [newN, newP, newK].some((v) => v !== null && (Number.isNaN(v) || v < 0 || v > 1));
                if (invalidNPK) {
                  toast({ title: 'Invalid NPK', description: 'N, P, and K must be between 0 and 1', variant: 'destructive' });
                  saveBtn.disabled = false;
                  saveBtn.textContent = 'Save';
                  return;
                }

                try {
                  const updates: any = { ph_level: newPh, temperature: newTemp, overall_fertility: newFert };
                  updates.nitrogen_level = newN;
                  updates.phosphorus_level = newP;
                  updates.potassium_level = newK;

                  const { error } = await supabase.from('soil_data').update(updates).eq('id', p.id);
                  if (error) throw error;

                  // update local state
                  setSoilData((prev) => prev.map((s) => s.id === p.id ? { ...s, ph_level: newPh, temperature: newTemp, overall_fertility: newFert, nitrogen_level: newN, phosphorus_level: newP, potassium_level: newK } : s));

                  // update marker color and popup DOM
                  const entry = markersRef.current[p.id];
                  if (entry) {
                    // update element background
                    entry.el.style.backgroundColor = getColorForPh(newPh);
                    // update popup text values and dots
                    const phStrong = entry.popupNode.querySelector('[data-field="ph"]');
                    if (phStrong) phStrong.textContent = String(newPh);
                    const tempStrong = entry.popupNode.querySelector('[data-field="temp"]');
                    if (tempStrong) tempStrong.textContent = `${newTemp}°C`;
                    const fertStrong = entry.popupNode.querySelector('[data-field="fert"]');
                    if (fertStrong) fertStrong.textContent = `${newFert}%`;

                    // update NPK displayed section if present
                    try {
                      const npkSec = entry.popupNode.querySelector('p[style*="NPK Levels"]')?.parentElement;
                      if (npkSec) {
                        // rebuild npk display
                        const nNode = npkSec.querySelectorAll('div > div > span')[0];
                        const pNode = npkSec.querySelectorAll('div > div > span')[1];
                        const kNode = npkSec.querySelectorAll('div > div > span')[2];
                        // defensive: update text of the value spans (they are second child in each row)
                        const rows = npkSec.querySelectorAll('div > div');
                        if (rows.length >= 3) {
                          const nVal = rows[0].querySelectorAll('span')[1];
                          const pVal = rows[1].querySelectorAll('span')[1];
                          const kVal = rows[2].querySelectorAll('span')[1];
                          if (nVal) nVal.textContent = newN !== null ? `${(newN * 100).toFixed(0)}%` : '';
                          if (pVal) pVal.textContent = newP !== null ? `${(newP * 100).toFixed(0)}%` : '';
                          if (kVal) kVal.textContent = newK !== null ? `${(newK * 100).toFixed(0)}%` : '';
                        }
                      }
                    } catch {}

                    // update dots
                    const dotPh = entry.popupNode.querySelector('span') as HTMLElement | null;
                    // regenerate colored dots more defensively
                    const phDotNew = getColorForPh(newPh);
                    // find the first dot for ph by looking for a span before the pH label
                    try {
                      const labelNodes = Array.from(entry.popupNode.querySelectorAll('div > div > span'));
                      labelNodes.forEach((node) => {
                        const text = node.textContent?.trim() ?? '';
                        if (text.startsWith('pH')) {
                          const dot = node.querySelector('span');
                          if (dot && dot instanceof HTMLElement) dot.style.background = phDotNew;
                        } else if (text.startsWith('Temperature')) {
                          const dot = node.querySelector('span');
                          if (dot && dot instanceof HTMLElement) dot.style.background = getColorForTemperature(newTemp);
                        } else if (text.startsWith('Fertility')) {
                          const dot = node.querySelector('span');
                          if (dot && dot instanceof HTMLElement) dot.style.background = getColorForFertility(newFert);
                        }
                      });
                    } catch {}
                  }

                  toast({ title: 'Saved', description: 'Soil data updated' });
                  form.replaceWith(actions);
                } catch (err) {
                  console.error(err);
                  toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
                  saveBtn.disabled = false;
                  saveBtn.textContent = 'Save';
                }
              });
            });

            // delete behavior preserved
            del.addEventListener('click', async (ev) => {
              ev.stopPropagation();
              const ok = window.confirm('Delete this soil data entry? This action cannot be undone.');
              if (!ok) return;
              del.disabled = true;
              del.textContent = 'Deleting...';
              try {
                const { error } = await supabase.from('soil_data').delete().eq('id', p.id);
                if (error) throw error;
                setSoilData((prev) => prev.filter((s) => s.id !== p.id));
                toast({ title: 'Deleted', description: 'Soil data entry deleted' });
                // remove marker if exists
                const entry = markersRef.current[p.id];
                if (entry) {
                  entry.marker.remove();
                  delete markersRef.current[p.id];
                }
              } catch (err) {
                console.error(err);
                toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
                del.disabled = false;
                del.textContent = 'Delete';
              }
            });
          }

          const popup = new maplibregl.Popup({ offset: 25, className: 'sb-popup' }).setDOMContent(popupNode);

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([p.longitude, p.latitude])
            .setPopup(popup)
            .addTo(map.current!);

          // store marker reference for later updates
          markersRef.current[p.id] = { marker, el, popupNode };
        };

        // create marker for this point
        createMarker(point);
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
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Soil Health Map</h1>
          <p className="text-muted-foreground">
            Interactive GIS visualization of soil data points across Abra municipalities
            {!isLoading && <span className="ml-2">({soilData.length} data points)</span>}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
