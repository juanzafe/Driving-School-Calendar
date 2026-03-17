import { motion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  Flag,
  GraduationCap,
  Sun,
  Target,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
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
  const selectedHolidays =
    holidays ?? (year === 2026 ? spanishHolidays2026 : spanishHolidays2025);

  const [workingDays, setWorkingDays] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);

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
