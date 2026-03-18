import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useUser } from "reactfire";
import {
  getHolidaysForYear,
  getWorkingDaysWithHolidays,
  spanishHolidays2025,
  spanishHolidays2026,
} from "../constants/holidays";
import { db } from "../firebase/firebase";
import MonthGoals from "./MonthGoals";
import MonthSummary from "./MonthSummary";
import VacacionesYJornada from "./VacacionesYJornada";

// Re-export for backward compatibility (used by ClasesChart)
export { spanishHolidays2025, spanishHolidays2026, getWorkingDaysWithHolidays };

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
  onDeleteVacationDates: (datesToRemove: string[]) => Promise<void>;
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
  onDeleteVacationDates,
}) => {
  const { data: user } = useUser();
  const selectedHolidays = holidays ?? getHolidaysForYear(year);

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

        const hols = getHolidaysForYear(y);
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

  return (
    <>
      {showFireworks && <ReactConfetti />}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 w-full justify-between landscape:flex-col"
      >
        <MonthSummary
          clasesDelMesVisible={clasesDelMesVisible}
          workingDays={workingDays}
          remainingDays={remainingDays}
        />

        <MonthGoals
          clasesDelMesVisible={clasesDelMesVisible}
          workingDays={workingDays}
          remainingDays={remainingDays}
          valorPorDia={valorPorDia}
          total6Months={total6Months}
        />

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
            onDeleteVacationDates={onDeleteVacationDates}
          />
        </div>
      </motion.div>
    </>
  );
};

export default WorkingDaysCounter;
