import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import type { CalendarioAutoescuela } from "../modelo/CalendarioAutoescuela";
import { DaysContainer } from "./DaysContainer";
import { MonthHeader } from "./MonthHeader";
import WorkingDaysCounter from "./WorkingDaysCounter";

export interface CalendarioAutoescuelaProps {
	calendario: CalendarioAutoescuela;
	onMonthChange?: (date: Date) => void;
	jornada: "media" | "completa";
	setJornada: (value: "media" | "completa") => void;
	vacationNumber: number;
	setVacationNumber: (value: number) => void;
	naturalVacationDays: number;
	vacationDates: string[];
	setVacationDates: (dates: string[]) => void;
	setClassCount?: (day: Date, count: number) => void;
	onSaveVacations: (vacationData: {
		vacationNumber: number;
		naturalDays: number;
		startDate: string;
		endDate: string;
		vacationDates: string[];
	}) => Promise<void>;
}

export function Month(props: CalendarioAutoescuelaProps) {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [clasesDelMes, setClasesDelMes] = useState(0);
	const isMobile = useIsMobile();

	const {
		calendario,
		onMonthChange,
		jornada,
		setJornada,
		vacationNumber,
		setVacationNumber,
		naturalVacationDays,
		vacationDates,
		setVacationDates,
		onSaveVacations,
	} = props;

	useEffect(() => {
		onMonthChange?.(currentDate);
		const clasesMes = calendario.totalNumberOfClassesInMonth(currentDate);
		setClasesDelMes(clasesMes);
	}, [currentDate, calendario, onMonthChange]);

	const handlePreviousMonth = () => {
		const prevMonth = new Date(currentDate);
		prevMonth.setMonth(prevMonth.getMonth() - 1);
		setCurrentDate(prevMonth);
	};

	const handleNextMonth = () => {
		const nextMonth = new Date(currentDate);
		nextMonth.setMonth(nextMonth.getMonth() + 1);
		setCurrentDate(nextMonth);
	};

	const nombreMes = currentDate.toLocaleString("es-ES", { month: "long" });
	const year = currentDate.getFullYear();

	return (
		<div
			className={`
        flex flex-col shadow-glass overflow-hidden
        bg-white text-gray-900
        w-full h-full
        ${isMobile ? "rounded-none" : "rounded-2xl border border-gray-100"}
      `}
		>
			<div
				className={`
          flex justify-between items-center bg-gray-200 text-gray-700
          ${isMobile ? "px-4 py-3" : "px-6 py-4"}
        `}
			>
				<button
					type="button"
					onClick={handlePreviousMonth}
					className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-90"
					title="Mes anterior"
				>
					<ChevronLeft size={isMobile ? 20 : 24} />
				</button>

				<div className="flex items-center gap-2.5 select-none">
					<Calendar size={isMobile ? 18 : 22} className="opacity-90" />
					<h1 className="capitalize tracking-wide text-lg sm:text-xl font-bold">
						{`${nombreMes} ${year}`}
					</h1>
				</div>

				<button
					type="button"
					onClick={handleNextMonth}
					className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-90"
					title="Mes siguiente"
				>
					<ChevronRight size={isMobile ? 20 : 24} />
				</button>
			</div>
			<MonthHeader {...props} />
			<DaysContainer {...props} currentDate={currentDate} />
			<div
				className={`
          bg-gradient-to-b from-gray-50 to-white border-t border-gray-100
          ${isMobile ? "py-4 px-3" : "py-5 px-6"}
        `}
			>
				<WorkingDaysCounter
					year={currentDate.getFullYear()}
					month={currentDate.getMonth()}
					clasesDelMesVisible={clasesDelMes}
					jornada={jornada}
					setJornada={setJornada}
					vacationNumber={vacationNumber}
					setVacationNumber={setVacationNumber}
					naturalVacationDays={naturalVacationDays}
					currentMonth={currentDate.getMonth()}
					currentYear={currentDate.getFullYear()}
					vacationDates={vacationDates}
					setVacationDates={setVacationDates}
					onSaveVacations={onSaveVacations}
				/>
			</div>
		</div>
	);
}
