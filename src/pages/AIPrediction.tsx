import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Brain, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Prediction = {
  hospital_id: number;
  predicted_icu_demand: number;
  prediction_method: string;
  prediction_for: string;
};

type ForecastItem = {
  date: string;
  predicted_icu_demand: number;
};

type ForecastResponse = {
  hospital_id: number;
  prediction_method: string;
  forecast_period: string;
  predictions: ForecastItem[];
};


const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const AIPrediction = () => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  const [hospitalName, setHospitalName] = useState("");

  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(true);

  const [error, setError] = useState("");
  const [forecastError, setForecastError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setForecastLoading(true);

        // Get logged-in hospital session
        const session = localStorage.getItem(
          "smartcare_hospital_session"
        );

        if (!session) {
          setError("Hospital login session not found.");
          setForecastError("Hospital login session not found.");
          return;
        }

        const hospitalSession = JSON.parse(session);

        const hospitalId = hospitalSession?.hospital_id;

        const loggedInHospitalName =
          hospitalSession?.hospital_name;

        if (!hospitalId) {
          setError("Hospital ID not found.");
          setForecastError("Hospital ID not found.");
          return;
        }

        setHospitalName(loggedInHospitalName || "Hospital");

        // Fetch prediction for logged-in hospital
        const [predictionResponse, forecastResponse] =
          await Promise.all([
            fetch(
              `http://localhost:5001/api/bed-demand/${hospitalId}`
            ),
            fetch(
              `http://localhost:5001/api/bed-demand-forecast/${hospitalId}`
            ),
          ]);

        if (!predictionResponse.ok) {
          throw new Error("Failed to fetch AI prediction.");
        }

        if (!forecastResponse.ok) {
          throw new Error("Failed to fetch ICU forecast.");
        }

        const predictionData: Prediction =
          await predictionResponse.json();

        const forecastData: ForecastResponse =
          await forecastResponse.json();

        setPrediction(predictionData);
        setForecast(forecastData);
      } catch (err) {
        console.error(err);

        setError("Unable to load AI prediction.");
        setForecastError("Unable to load ICU forecast.");
      } finally {
        setLoading(false);
        setForecastLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">

          <Button variant="ghost" size="icon" asChild>
            <Link to="/hospital-dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <Heart
            className="h-6 w-6 text-primary"
            fill="currentColor"
          />

          <span className="font-display text-lg font-bold">
            AI Bed Prediction
          </span>

        </div>
      </header>

      <div className="container mx-auto px-4 py-6">

        {/* Page Heading */}
        <div className="mb-8 flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>

          <div>

            <h1 className="font-display text-2xl font-bold text-foreground">
              AI Bed Availability Prediction
            </h1>

            <p className="text-sm text-muted-foreground">
              Random Forest based forecasting using hospital demand data
            </p>

            {hospitalName && (
              <p className="mt-1 text-sm font-medium text-primary">
                {hospitalName}
              </p>
            )}

          </div>

        </div>

        {/* AI Prediction Card */}
        <Card className="mb-6 border-primary/20">

          <CardHeader>

            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Brain className="h-4 w-4 text-primary" />
              AI ICU Demand Prediction
            </CardTitle>

          </CardHeader>

          <CardContent>

            {loading ? (

              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                <Loader2 className="h-4 w-4 animate-spin" />

                Loading AI prediction...

              </div>

            ) : error ? (

              <p className="text-sm text-destructive">
                {error}
              </p>

            ) : prediction ? (

              <div className="grid gap-4 sm:grid-cols-3">

                {/* Predicted ICU Demand */}
                <div className="rounded-xl bg-primary/5 p-4">

                  <p className="text-sm text-muted-foreground">
                    Predicted ICU Demand
                  </p>

                  <p className="mt-1 font-display text-3xl font-bold text-primary">
                    {prediction.predicted_icu_demand}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    beds
                  </p>

                </div>

                {/* Prediction Period */}
                <div className="rounded-xl bg-muted/50 p-4">

                  <p className="text-sm text-muted-foreground">
                    Prediction Period
                  </p>

                  <p className="mt-1 font-display text-xl font-bold">
                    {prediction.prediction_for}
                  </p>

                </div>

                {/* Prediction Method */}
                <div className="rounded-xl bg-muted/50 p-4">

                  <p className="text-sm text-muted-foreground">
                    Prediction Method
                  </p>

                  <p className="mt-1 font-display text-xl font-bold">
                    Random Forest
                  </p>

                </div>

              </div>

            ) : null}

            <p className="mt-4 text-xs text-muted-foreground">
              Demo prediction generated using synthetic training data.
            </p>

          </CardContent>

        </Card>

        {/* 7-Day ICU Forecast */}
        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Brain className="h-4 w-4 text-primary" />
              ICU Demand Forecast (Next 7 Days)
            </CardTitle>

          </CardHeader>

          <CardContent>

            {forecastLoading ? (

              <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">

                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Loading AI forecast...

              </div>

            ) : forecastError ? (

              <p className="text-sm text-destructive">
                {forecastError}
              </p>

            ) : forecast ? (

              <>

                <ResponsiveContainer
                  width="100%"
                  height={350}
                >

                  <LineChart data={forecast.predictions}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={formatDate}
                    />

                    <YAxis
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                    />

                    <Tooltip
                      labelFormatter={(value) =>
                        `Date: ${formatDate(String(value))}`
                      }
                      formatter={(value) => [
                        `${value} beds`,
                        "Predicted ICU Demand",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="predicted_icu_demand"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{
                        fill: "hsl(var(--primary))",
                      }}
                      name="Predicted ICU Demand"
                    />

                  </LineChart>

                </ResponsiveContainer>

                <p className="mt-2 text-xs text-muted-foreground">
                  AI prediction generated using Random Forest ML.
                </p>

              </>

            ) : null}

          </CardContent>

        </Card>

      </div>

      <ChatbotWidget />

    </div>
  );
};

export default AIPrediction;