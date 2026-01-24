import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { TrendingUp, Building2, Calendar, Wallet, Download, FileText, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const monthlyData = [
  { month: "ENE", y2024: 650000, y2023: 580000 },
  { month: "FEB", y2024: 720000, y2023: 640000 },
  { month: "MAR", y2024: 850000, y2023: 750000 },
  { month: "ABR", y2024: 780000, y2023: 720000 },
  { month: "MAY", y2024: 690000, y2023: 650000 },
  { month: "JUN", y2024: 820000, y2023: 780000 },
  { month: "JUL", y2024: 950000, y2023: 850000 },
  { month: "AGO", y2024: 920000, y2023: 870000 },
  { month: "SEP", y2024: 760000, y2023: 700000 },
  { month: "OCT", y2024: 880000, y2023: 810000 },
];

const procedencia = [
  { name: "Estados Unidos", value: 45, color: "hsl(193, 86%, 50%)" },
  { name: "Canadá", value: 20, color: "hsl(142, 71%, 45%)" },
  { name: "Colombia", value: 15, color: "hsl(48, 96%, 53%)" },
  { name: "Francia", value: 12, color: "hsl(0, 72%, 51%)" },
  { name: "Otros", value: 8, color: "hsl(195, 15%, 40%)" },
];

const informes = [
  { titulo: "Barómetro Turístico Oct 2024", tipo: "PDF", tamaño: "2.4 MB", fecha: "15 Nov" },
  { titulo: "Data Bruta Llegadas Q3", tipo: "XLSX", tamaño: "4.1 MB", fecha: "10 Nov" },
  { titulo: "Informe de Ocupación Hotelera", tipo: "PDF", tamaño: "1.8 MB", fecha: "05 Nov" },
];

const StatCard = ({ icon: Icon, label, value, change, positive = true }: {
  icon: any;
  label: string;
  value: string;
  change: string;
  positive?: boolean;
}) => (
  <div className="bg-card rounded-xl p-6 border border-border">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <Badge className={`${positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
        <TrendingUp className="w-3 h-3 mr-1" />
        {change}
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
    <p className="text-3xl font-display font-bold text-foreground">{value}</p>
  </div>
);

export default function Estadisticas() {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                  Estadísticas e Indicadores
                </h1>
                <p className="text-muted-foreground">
                  Tablero de control del sector turismo en República Dominicana
                </p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 self-start">
                ● Datos actualizados: Hoy, 09:30 AM
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Select defaultValue="2024">
                <SelectTrigger className="w-[120px] bg-card">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">Año: 2024</SelectItem>
                  <SelectItem value="2023">Año: 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="octubre">
                <SelectTrigger className="w-[140px] bg-card">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="octubre">Mes: Octubre</SelectItem>
                  <SelectItem value="septiembre">Mes: Septiembre</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="todas">
                <SelectTrigger className="w-[140px] bg-card">
                  <SelectValue placeholder="Región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Región: Todas</SelectItem>
                  <SelectItem value="este">Región: Este</SelectItem>
                  <SelectItem value="norte">Región: Norte</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="link" className="text-primary ml-auto">
                Restablecer filtros
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={TrendingUp}
                label="Llegada de Visitantes"
                value="8,540,210"
                change="+12%"
              />
              <StatCard
                icon={Building2}
                label="Ocupación Hotelera"
                value="78.5%"
                change="+2.1%"
              />
              <StatCard
                icon={Calendar}
                label="Estadía Promedio"
                value="8.5 noches"
                change="+0.5%"
              />
              <StatCard
                icon={Wallet}
                label="Gasto Promedio"
                value="$145/día"
                change="+5%"
              />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Monthly Trend */}
              <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-bold text-foreground">Tendencia Mensual de Llegadas</h3>
                    <p className="text-sm text-muted-foreground">Comparativo 2023 vs 2024</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-muted-foreground">2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <span className="text-muted-foreground">2023</span>
                    </div>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorY2024" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(193, 86%, 50%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(193, 86%, 50%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(192, 20%, 70%)' }} />
                      <YAxis hide />
                      <Area type="monotone" dataKey="y2023" stroke="hsl(195, 15%, 40%)" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="y2024" stroke="hsl(193, 86%, 50%)" strokeWidth={2} fill="url(#colorY2024)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Procedencia */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-display font-bold text-foreground mb-6">Procedencia de Visitantes</h3>
                <div className="h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={procedencia}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        stroke="none"
                      >
                        {procedencia.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">TOP MERCADO</span>
                    <span className="text-2xl font-bold text-foreground">EE.UU.</span>
                    <span className="text-primary font-semibold">45%</span>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {procedencia.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Informes */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-foreground">Informes Recientes</h3>
              </div>
              <div className="space-y-3">
                {informes.map((informe) => (
                  <div key={informe.titulo} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        informe.tipo === "PDF" ? "bg-red-500/10" : "bg-emerald-500/10"
                      }`}>
                        {informe.tipo === "PDF" ? (
                          <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                          <Table2 className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{informe.titulo}</p>
                        <p className="text-sm text-muted-foreground">{informe.tipo} • {informe.tamaño} • {informe.fecha}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver biblioteca completa
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
