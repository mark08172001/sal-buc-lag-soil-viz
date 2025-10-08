import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Thermometer, Droplets, TrendingUp, MapPin } from "lucide-react";
import soilHealthBg from "@/assets/soil-health-bg.jpg";

// Sample data for demonstration
const soilDataByMunicipality = [
  { name: "Sallapadan", pH: 6.5, temperature: 28, fertility: 75, nitrogen: 0.25, phosphorus: 0.15, potassium: 0.20 },
  { name: "Bucay", pH: 6.8, temperature: 26, fertility: 82, nitrogen: 0.28, phosphorus: 0.18, potassium: 0.22 },
  { name: "Lagangilang", pH: 6.3, temperature: 29, fertility: 70, nitrogen: 0.22, phosphorus: 0.14, potassium: 0.18 },
];

const historicalData = [
  { month: "Jan", pH: 6.4, temperature: 25, fertility: 72 },
  { month: "Feb", pH: 6.5, temperature: 26, fertility: 74 },
  { month: "Mar", pH: 6.5, temperature: 27, fertility: 76 },
  { month: "Apr", pH: 6.6, temperature: 28, fertility: 78 },
  { month: "May", pH: 6.5, temperature: 29, fertility: 75 },
  { month: "Jun", pH: 6.4, temperature: 28, fertility: 73 },
];

const Dashboard = () => {
  const avgPH = (soilDataByMunicipality.reduce((acc, item) => acc + item.pH, 0) / soilDataByMunicipality.length).toFixed(2);
  const avgTemp = (soilDataByMunicipality.reduce((acc, item) => acc + item.temperature, 0) / soilDataByMunicipality.length).toFixed(1);
  const avgFertility = (soilDataByMunicipality.reduce((acc, item) => acc + item.fertility, 0) / soilDataByMunicipality.length).toFixed(1);

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${soilHealthBg})` }}
      />
      
      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10">
      <div>
        <h1 className="text-4xl font-bold mb-2">Soil Health Dashboard</h1>
        <p className="text-muted-foreground">Monitoring soil conditions across three municipalities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average pH Level</CardTitle>
            <Droplets className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgPH}</div>
            <p className="text-xs text-muted-foreground mt-1">Slightly acidic - Optimal range</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgTemp}°C</div>
            <p className="text-xs text-muted-foreground mt-1">Good conditions for crops</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Fertility</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgFertility}%</div>
            <p className="text-xs text-muted-foreground mt-1">High fertility across regions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">Municipal Comparison</TabsTrigger>
          <TabsTrigger value="historical">Historical Trends</TabsTrigger>
          <TabsTrigger value="nutrients">Nutrient Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>pH Levels by Municipality</CardTitle>
                <CardDescription>Current soil pH measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={soilDataByMunicipality}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis domain={[0, 14]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Bar dataKey="pH" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Temperature Distribution</CardTitle>
                <CardDescription>Soil temperature across regions (°C)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={soilDataByMunicipality}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Bar dataKey="temperature" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Fertility Comparison</CardTitle>
                <CardDescription>Soil fertility percentage by municipality</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={soilDataByMunicipality}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Bar dataKey="fertility" fill="hsl(130 60% 45%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>6-Month Trend Analysis</CardTitle>
              <CardDescription>Historical soil health indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="pH" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="temperature" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="fertility" stroke="hsl(130 60% 45%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrients" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>NPK Nutrient Profile</CardTitle>
              <CardDescription>Nitrogen, Phosphorus, and Potassium levels by municipality</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={soilDataByMunicipality}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" className="text-xs" />
                  <PolarRadiusAxis angle={90} domain={[0, 0.3]} className="text-xs" />
                  <Radar name="Nitrogen" dataKey="nitrogen" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  <Radar name="Phosphorus" dataKey="phosphorus" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} />
                  <Radar name="Potassium" dataKey="potassium" stroke="hsl(130 60% 45%)" fill="hsl(130 60% 45%)" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Municipality Details */}
      <div className="grid md:grid-cols-3 gap-6">
        {soilDataByMunicipality.map((municipality) => (
          <Card key={municipality.name} className="border-l-4 border-l-primary bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {municipality.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">pH Level</span>
                <span className="font-semibold">{municipality.pH}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Temperature</span>
                <span className="font-semibold">{municipality.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fertility</span>
                <span className="font-semibold">{municipality.fertility}%</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">NPK Levels</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Nitrogen:</span>
                    <span className="font-medium">{(municipality.nitrogen * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phosphorus:</span>
                    <span className="font-medium">{(municipality.phosphorus * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potassium:</span>
                    <span className="font-medium">{(municipality.potassium * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
