import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useUser } from "reactfire";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "../firebase/firebase";
import { useIsMobile } from "../hooks/useIsMobile";
import {
  getWorkingDaysWithHolidays,
  spanishHolidays2025,
  spanishHolidays2026,
} from "../constants/holidays";

interface DailyData {
  dia: number;
  clases: number;
}

interface MonthlyData {
  mes: string;
  difference: number;
  fill: string;
}

const chartTheme = {
  gridColor: "#f0f0f0",
  axisFont: { fontSize: 12, fontFamily: "Inter, system-ui, sans-serif" },
  legendFont: { fontSize: 13, fontFamily: "Inter, system-ui, sans-serif" },
  tooltipStyle: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  },
};

const ClasesChart: React.FC = () => {
  const isMobile = useIsMobile();
  const { data: user } = useUser();
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;

      try {
        const userEmail = user.email;
        const classesCollectionRef = collection(
          db,
          "classespordia",
          userEmail,
          "dates",
        );
        const querySnapshot = await getDocs(classesCollectionRef);
        const settingsRef = doc(db, "userSettings", userEmail);
        const settingsSnap = await getDoc(settingsRef);

        const jornada =
          settingsSnap.exists() && settingsSnap.data().jornada
            ? settingsSnap.data().jornada
            : "completa";

        const urlParams = new URLSearchParams(window.location.search);
        const year = parseInt(
          urlParams.get("year") ?? new Date().getFullYear().toString(),
          10,
        );
        const month = parseInt(
          urlParams.get("month") ?? new Date().getMonth().toString(),
          10,
        );
        const currentDate = new Date(year, month, 1);

        setCurrentMonth(
          currentDate.toLocaleString("es-ES", {
            month: "long",
            year: "numeric",
          }),
        );

        const diasDelMes = new Date(year, month + 1, 0).getDate();
        const dailyClasses: DailyData[] = [];

        for (let dia = 1; dia <= diasDelMes; dia++) {
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const dayDoc = querySnapshot.docs.find((doc) => {
            const data = doc.data();
            const docDate = data.date.toDate
              ? data.date.toDate()
              : new Date(data.date);
            return docDate.toISOString().split("T")[0] === dateKey;
          });

          dailyClasses.push({
            dia,
            clases: dayDoc ? dayDoc.data().count : 0,
          });
        }

        setDailyData(dailyClasses);

        const monthlyCounts: Record<string, number> = {};

        querySnapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.date || typeof data.count !== "number") return;

          const date = data.date.toDate
            ? data.date.toDate()
            : new Date(data.date);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          monthlyCounts[key] = (monthlyCounts[key] || 0) + data.count;
        });

        const now = new Date();
        const months: MonthlyData[] = [];

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const yearMonth = date.getFullYear();
          const monthMonth = date.getMonth();
          const key = `${yearMonth}-${monthMonth}`;
          const nombreMes = date
            .toLocaleString("es-ES", { month: "short" })
            .replace(".", "");

          const clasesMes = monthlyCounts[key] || 0;

          if (clasesMes === 0) continue;

          const holidaysRef = doc(db, "holidaysPerMonth", userEmail);
          const holidaysSnap = await getDoc(holidaysRef);
          let vacationDates: string[] = [];

          if (holidaysSnap.exists()) {
            const data = holidaysSnap.data();
            const start = data[`${key}-start`];
            const end = data[`${key}-end`];

            if (start && end) {
              const startDateObj = new Date(start as string);
              const endDateObj = new Date(end as string);
              const dates: string[] = [];
              const tempDate = new Date(startDateObj);
              while (tempDate <= endDateObj) {
                const formatted = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}-${String(tempDate.getDate()).padStart(2, "0")}`;
                dates.push(formatted);
                tempDate.setDate(tempDate.getDate() + 1);
              }
              vacationDates = dates;
            }
          }

          const selectedHolidays =
            yearMonth === 2026 ? spanishHolidays2026 : spanishHolidays2025;
          const allWorkingDays = getWorkingDaysWithHolidays(
            yearMonth,
            monthMonth,
            selectedHolidays,
            vacationDates,
          );

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const pastWorkingDays = allWorkingDays.filter((dayStr) => {
            const dayDate = new Date(dayStr);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate <= today;
          });

          const valorPorDia = jornada === "media" ? 7.8125 : 12.5;
          const classesShouldHaveByToday = Math.round(
            pastWorkingDays.length * valorPorDia,
          );
          const difference = clasesMes - classesShouldHaveByToday;

          months.push({
            mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
            difference: Math.round(difference * 10) / 10,
            fill: difference >= 0 ? "#10b981" : "#ef4444",
          });
        }

        setMonthlyData(months);
      } catch (error) {
        console.error("Error cargando datos de gráficas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass p-5 border border-gray-100 text-center">
        <p className="text-gray-500 animate-pulse text-sm">
          Cargando gráficas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-glass p-6 border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-center text-gray-800">
          Clases por día —{" "}
          <span className="text-brand-600">{currentMonth}</span>
        </h2>
        <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
          <ComposedChart
            data={dailyData}
            margin={
              isMobile
                ? { left: -15, right: 5, top: 5, bottom: 20 }
                : { bottom: 20 }
            }
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartTheme.gridColor}
            />
            <XAxis dataKey="dia" tick={chartTheme.axisFont} />
            <YAxis tick={chartTheme.axisFont} width={isMobile ? 30 : 60} />
            <Tooltip
              contentStyle={chartTheme.tooltipStyle}
              formatter={(value: number) => [`${value} clases`, "Clases"]}
            />
            {!isMobile && <Legend wrapperStyle={chartTheme.legendFont} />}
            <Line
              type="monotone"
              dataKey="clases"
              stroke="#10b981"
              strokeWidth={2}
              name="Clases del día"
              dot={{ fill: "#10b981", r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-glass p-6 border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-center text-gray-800">
            Diferencia vs objetivo{" "}
            <span className="text-brand-600">(últimos 6 meses)</span>
          </h2>
          <div className="relative">
            <div
              className={`absolute top-2 right-2 z-10 px-2.5 py-1 rounded-lg text-xs font-bold ${
                monthlyData.reduce((sum, m) => sum + m.difference, 0) >= 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {(() => {
                const total =
                  Math.round(
                    monthlyData.reduce((sum, m) => sum + m.difference, 0) * 10,
                  ) / 10;
                return isMobile
                  ? `${total > 0 ? "+" : ""}${total.toFixed(1)}`
                  : `Resultado total: ${total > 0 ? "+" : ""}${total.toFixed(1)}`;
              })()}
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
              <ComposedChart
                data={monthlyData}
                margin={
                  isMobile
                    ? { left: -15, right: 5, top: 20, bottom: 30 }
                    : { top: 20, bottom: 15 }
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartTheme.gridColor}
                />
                <XAxis dataKey="mes" tick={chartTheme.axisFont} />
                <YAxis
                  tick={chartTheme.axisFont}
                  width={isMobile ? 30 : 60}
                  domain={[
                    (dataMin: number) => Math.floor(dataMin) - 1,
                    "auto",
                  ]}
                />
                <Tooltip
                  contentStyle={chartTheme.tooltipStyle}
                  formatter={(value: number) => [
                    `${value > 0 ? "+" : ""}${value.toFixed(1)} clases`,
                    "Diferencia",
                  ]}
                />
                {!isMobile && <Legend wrapperStyle={chartTheme.legendFont} />}
                <Bar
                  dataKey="difference"
                  name="Diferencia vs objetivo"
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="difference"
                    position="top"
                    content={(props) => {
                      const x = Number(props.x);
                      const y = Number(props.y);
                      const barWidth = Number(props.width);
                      const value = props.value as number | undefined;
                      if (
                        value == null ||
                        Number.isNaN(x) ||
                        Number.isNaN(y) ||
                        Number.isNaN(barWidth)
                      )
                        return null;
                      const isNegative = value < 0;
                      const label = `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
                      return (
                        <text
                          x={x + barWidth / 2}
                          y={isNegative ? y + 16 : y - 6}
                          textAnchor="middle"
                          style={{ fontSize: 11, fill: "#374151" }}
                        >
                          {label}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClasesChart;
