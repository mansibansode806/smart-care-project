import { Link } from "react-router-dom";
import { Heart, Brain, ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const bedTrendData = [
  { month: "Jan", general: 180, icu: 20 }, { month: "Feb", general: 195, icu: 22 },
  { month: "Mar", general: 210, icu: 18 }, { month: "Apr", general: 225, icu: 24 },
  { month: "May", general: 240, icu: 26 }, { month: "Jun", general: 220, icu: 23 },
  { month: "Jul", general: 235, icu: 28 }, { month: "Aug", general: 250, icu: 30 },
  { month: "Sep", general: 230, icu: 25 }, { month: "Oct", general: 215, icu: 22 },
  { month: "Nov", general: 200, icu: 20 }, { month: "Dec", general: 245, icu: 27 },
];

const icuForecastData = [
  { week: "W1", actual: 20, predicted: 21 }, { week: "W2", actual: 22, predicted: 23 },
  { week: "W3", actual: 18, predicted: 20 }, { week: "W4", actual: 25, predicted: 24 },
  { week: "W5", actual: null, predicted: 26 }, { week: "W6", actual: null, predicted: 28 },
  { week: "W7", actual: null, predicted: 25 }, { week: "W8", actual: null, predicted: 23 },
];

const peakHoursData = [
  { hour: "6AM", demand: 15 }, { hour: "8AM", demand: 45 }, { hour: "10AM", demand: 72 },
  { hour: "12PM", demand: 65 }, { hour: "2PM", demand: 58 }, { hour: "4PM", demand: 50 },
  { hour: "6PM", demand: 68 }, { hour: "8PM", demand: 42 }, { hour: "10PM", demand: 25 },
];

const AIPrediction = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          <span className="font-display text-lg font-bold">AI Bed Prediction</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">AI Bed Availability Prediction</h1>
            <p className="text-sm text-muted-foreground">Regression-based forecasting using historical hospital data</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Bed Usage Trend (12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={bedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="general" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} name="General Beds" />
                  <Area type="monotone" dataKey="icu" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive)/0.1)" strokeWidth={2} name="ICU Beds" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <Brain className="h-4 w-4 text-primary" /> ICU Demand Forecast (8 Weeks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={icuForecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} name="Actual" connectNulls={false} />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "hsl(var(--accent))" }} name="Predicted" />
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-muted-foreground">Dashed line = AI predicted values</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Peak Hospital Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="demand" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.12)" strokeWidth={2} name="Patient Demand" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      <ChatbotWidget />
    </div>
  );
};

export default AIPrediction;
