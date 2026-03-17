import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  Flag,
  GraduationCap,
  Sun,
  Target,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useUser } from "reactfire";
import { db } from "../firebase/firebase";
import VacacionesYJornada from "./VacacionesYJornada";

export const spanishHolidays2025: string[] = [
  "2025-01-01",
  "2025-01-06",
  "2025-02-28",
  "2025-04-17",
  "2025-04-18",
  "2025-05-01",
  "2025-08-15",
  "2025-10-13",
  "2025-11-01",
  "2025-12-06",
  "2025-12-08",
  "2025-12-25",
  "2025-08-19",
  "2025-09-08",
  "2025-12-24",
  "2025-12-31",
];

export const spanishHolidays2026: string[] = [
  "2026-01-01",
  "2026-01-06",
  "2026-02-28",
  "2026-04-02",
  "2026-04-03",
  "2026-05-01",
  "2026-08-15",
  "2026-08-19",
  "2026-09-08",
  "2026-10-12",
  "2026-11-02",
  "2026-12-07",
  "2026-12-08",
  "2026-12-25",
];

export function getWorkingDaysWithHolidays(
  year: number,
  month: number,
  holidays: string[] = [],
  vacationDates: string[] = [],
): string[] {
  const workingDays: string[] = [];
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;

    if (
      dayOfWeek !== 0 &&
      dayOfWeek !== 6 &&
      !holidays.includes(formatted) &&
      !vacationDates.includes(formatted)
    ) {
      workingDays.push(formatted);
    }
  }

  return workingDays;
}

interface WorkingDaysCounterProps {
  year: number;
  month: number;
  holidays?: string[];
  clasesDelMesVisible: number;
  jornada: "media" | "completa";
  setJornada: (value: "media" | "completa") => void;
  vacationNumber: number;
  setVacationNumber: (value: number) => void;
  naturalVacationDays: number;
  currentMonth: number;
  currentYear: number;
  vacationDates: string[];
  setVacationDates: (dates: string[]) => void;
  onSaveVacations: (vacationData: {
    vacationNumber: number;
    naturalDays: number;
    startDate: string;
    endDate: string;
    vacationDates: string[];
  }) => Promise<void>;
}

const WorkingDaysCounter: React.FC<WorkingDaysCounterProps> = ({
  year,
  month,
  holidays,
  clasesDelMesVisible,
  jornada,
  setJornada,
  vacationNumber,
  setVacationNumber,
  naturalVacationDays,
  currentMonth,
  currentYear,
  vacationDates,
  setVacationDates,
  onSaveVacations,
}) => {
  const { data: user } = useUser();
  const selectedHolidays =
    holidays ?? (year === 2026 ? spanishHolidays2026 : spanishHolidays2025);

  const [workingDays, setWorkingDays] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [total6Months, setTotal6Months] = useState<number | null>(null);

  useEffect(() => {
    const loadTotal6Months = async () => {
      if (!user?.email) return;
      const userEmail = user.email;
      const classesRef = collection(db, "classespordia", userEmail, "dates");
      const querySnapshot = await getDocs(classesRef);

      const settingsRef = doc(db, "userSettings", userEmail);
      const settingsSnap = await getDoc(settingsRef);
      const jornadaValue =
        settingsSnap.exists() && settingsSnap.data().jornada
          ? settingsSnap.data().jornada
          : "completa";

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
      let totalDiff = 0;
      let hasData = false;

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = date.getFullYear();
        const m = date.getMonth();
        const key = `${y}-${m}`;
        const clasesMes = monthlyCounts[key] || 0;
        if (clasesMes === 0) continue;
        hasData = true;

        const holidaysRef = doc(db, "holidaysPerMonth", userEmail);
        const holidaysSnap = await getDoc(holidaysRef);
        const vacDates: string[] = [];
        if (holidaysSnap.exists()) {
          const hData = holidaysSnap.data();
          const start = hData[`${key}-start`];
          const end = hData[`${key}-end`];
          if (start && end) {
            const startDate = new Date(start as string);
            const endDate = new Date(end as string);
            const tempDate = new Date(startDate);
            while (tempDate <= endDate) {
              vacDates.push(
                `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}-${String(tempDate.getDate()).padStart(2, "0")}`,
              );
              tempDate.setDate(tempDate.getDate() + 1);
            }
          }
        }

        const hols = y === 2026 ? spanishHolidays2026 : spanishHolidays2025;
        const allWorking = getWorkingDaysWithHolidays(y, m, hols, vacDates);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pastWorking = allWorking.filter((dayStr) => {
          const d = new Date(dayStr);
          d.setHours(0, 0, 0, 0);
          return d <= today;
        });

        const vpd = jornadaValue === "media" ? 7.8125 : 12.5;
        const shouldHave = Math.round(pastWorking.length * vpd);
        totalDiff += clasesMes - shouldHave;
      }

      setTotal6Months(hasData ? Math.round(totalDiff * 10) / 10 : null);
    };

    loadTotal6Months();
  }, [user]);

  useEffect(() => {
    const allWorkingDays = getWorkingDaysWithHolidays(
      year,
      month,
      selectedHolidays,
      vacationDates,
    );
    setWorkingDays(allWorkingDays.length);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const remaining = allWorkingDays.filter((dayStr) => {
      const dayDate = new Date(dayStr);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate > today;
    });

    setRemainingDays(remaining.length);
  }, [year, month, selectedHolidays, vacationDates]);

  const valorPorDia = jornada === "media" ? 7.8125 : 12.5;

  const adjustedClassesNeeded =
    Math.round(workingDays * valorPorDia) - clasesDelMesVisible;
  const adjustedClassesPerDay =
    remainingDays > 0
      ? (adjustedClassesNeeded / remainingDays).toFixed(2)
      : "0";

  useEffect(() => {
    if (adjustedClassesNeeded <= 0 && workingDays > 0) {
      setShowFireworks(true);
      const timer = setTimeout(() => setShowFireworks(false), 5000);
      return () => {
        setShowFireworks(false);
        clearTimeout(timer);
      };
    }
    return () => setShowFireworks(false);
  }, [adjustedClassesNeeded, workingDays]);

  const pastWorkingDays = workingDays - remainingDays;
  const classesShouldHaveByToday = Math.round(pastWorkingDays * valorPorDia);
  const differenceWithToday = clasesDelMesVisible - classesShouldHaveByToday;

  return (
    <>
      {showFireworks && <ReactConfetti />}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 w-full justify-between landscape:flex-col"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 text-brand-700 font-bold mb-2">
            <ClipboardList size={14} className="text-brand-600" />
            <span>Resumen del mes</span>
          </div>
          <div className="bg-gray-50/80 rounded-lg border border-gray-100 p-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <GraduationCap size={15} className="text-brand-500" /> Clases
                dadas:
              </span>
              <strong>{clasesDelMesVisible}</strong>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <CalendarDays size={15} className="text-brand-500" /> Días
                laborables:
              </span>
              <strong>{workingDays}</strong>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Sun size={15} className="text-brand-500" /> Días restantes:
              </span>
              <strong>{remainingDays}</strong>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 text-brand-700 font-bold mb-2">
            <Target size={14} className="text-brand-600" />
            <span>Objetivos</span>
          </div>
          <div className="bg-gray-50/80 rounded-lg border border-gray-100 p-3 text-sm space-y-2">
            <div className="flex justify-between border-gray-200">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Flag size={15} className="text-brand-500" /> ¿Cómo vas?:
              </span>
              <strong
                className={
                  differenceWithToday > 0
                    ? "text-green-600"
                    : differenceWithToday < 0
                      ? "text-red-600"
                      : "text-gray-700"
                }
              >
                {clasesDelMesVisible === 0
                  ? "-"
                  : differenceWithToday > 0
                    ? `+${differenceWithToday} ${differenceWithToday === 1 ? "clase" : "clases"} por encima`
                    : differenceWithToday < 0
                      ? `${differenceWithToday} ${differenceWithToday === -1 ? "clase" : "clases"} por debajo`
                      : `al día`}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Target size={15} className="text-brand-500" /> Clases objetivo:
              </span>
              <strong>{Math.round(workingDays * valorPorDia)}</strong>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <CalendarDays size={15} className="text-brand-500" /> Faltan:
              </span>
              <strong>
                {adjustedClassesNeeded > 0
                  ? adjustedClassesNeeded
                  : "¡Ya llegaste!"}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <Clock size={15} className="text-brand-500" /> Clases por día
                necesarias:
              </span>
              <strong>
                {Number(adjustedClassesPerDay) > 0
                  ? adjustedClassesPerDay
                  : "-"}
              </strong>
            </div>

            {total6Months !== null && (
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <TrendingUp size={15} className="text-brand-500" /> Total
                  últimos 6 meses:
                </span>
                <strong
                  className={
                    total6Months >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {total6Months > 0 ? "+" : ""}
                  {total6Months.toFixed(1)}
                </strong>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <VacacionesYJornada
            workingDays={workingDays}
            jornada={jornada}
            setJornada={setJornada}
            vacationNumber={vacationNumber}
            setVacationNumber={setVacationNumber}
            naturalVacationDays={naturalVacationDays}
            currentMonth={currentMonth}
            currentYear={currentYear}
            vacationDates={vacationDates}
            setVacationDates={setVacationDates}
            onSaveVacations={onSaveVacations}
          />
        </div>
      </motion.div>
    </>
  );
};

export default WorkingDaysCounter;
