// Day.tsx
import { Check, ChevronDown, Plane } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import type { CalendarioAutoescuelaProps } from "./Month";
import { spanishHolidays2025, spanishHolidays2026 } from "./WorkingDaysCounter";

type DayProps = {
	num: Date;
	calendarioAutoescuelaProps: CalendarioAutoescuelaProps & {
		setClassCount?: (day: Date, count: number) => void;
	};
};

export function Day({ num, calendarioAutoescuelaProps }: DayProps) {
	const { calendario, jornada, setClassCount, vacationDates } =
		calendarioAutoescuelaProps;
	const [isEditing, setIsEditing] = useState(false);
	const isMobile = useIsMobile();
	const containerRef = useRef<HTMLDivElement | null>(null);

	const clasesDelDia = calendario.calculateClassesForDate(num);

	const formatted = `${num.getFullYear()}-${String(num.getMonth() + 1).padStart(
		2,
		"0",
	)}-${String(num.getDate()).padStart(2, "0")}`;

	const isHoliday =
		spanishHolidays2025.includes(formatted) ||
		spanishHolidays2026.includes(formatted);

	const isVacation = vacationDates.includes(formatted);
	const isWeekend = num.getDay() === 0 || num.getDay() === 6;

	const shouldShowCheck =
		(jornada === "completa" && clasesDelDia >= 13) ||
		(jornada === "media" && clasesDelDia >= 8);

	const getClassByCantidad = (): string => {
		if (isVacation)
			return "bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200/60 text-amber-800";
		if (isWeekend)
			return "bg-gradient-to-br from-red-50 to-rose-50 border border-red-100/60 text-red-500";
		if (shouldShowCheck)
			return "bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200/60 text-emerald-700";
		if (clasesDelDia > 0)
			return "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 text-green-700";
		return "bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200/50 text-slate-600";
	};

	const handleSelectChange = (value: number) => {
		setClassCount?.(num, value);
		setIsEditing(false);
	};

	useEffect(() => {
		if (!isEditing) return;

		const handleClickOutside = (e: MouseEvent | TouchEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsEditing(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [isEditing]);

	return (
		<div
			ref={containerRef}
			className={`relative flex flex-col items-center justify-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${getClassByCantidad()} w-full h-full px-[4px] sm:px-[6px]`}
		>
			<div className="flex items-center justify-center gap-[3px] font-bold text-[12px] sm:text-[14px]">
				<span
					className={
						isHoliday
							? "text-red-600 underline decoration-red-600 decoration-4 underline-offset-4 font-bold"
							: ""
					}
				>
					{num.getDate()}
				</span>
				{isVacation && (
					<Plane size={13} className="text-yellow-700" strokeWidth={2.5} />
				)}
				{shouldShowCheck && !isVacation && (
					<Check size={13} className="text-green-600" strokeWidth={3} />
				)}
			</div>

			{!isEditing ? (
				<button
					type="button"
					onClick={() => setIsEditing(true)}
					className="text-[13px] sm:text-[13px] font-medium flex items-center gap-1 mt-1 bg-transparent"
				>
					{clasesDelDia > 0 &&
						(isMobile
							? `${clasesDelDia} cls`
							: `${clasesDelDia} clase${clasesDelDia !== 1 ? "s" : ""}`)}
					<ChevronDown size={12} className="opacity-70 ml-[2px]" />
				</button>
			) : (
				<div
					className={`absolute z-50 mt-10 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-glass p-1.5 w-[90%] max-h-40 overflow-y-auto 
            transform transition-all duration-200 ease-out origin-top
            ${isEditing ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
				>
					{Array.from({ length: 19 }, (_, i) => {
						const value = i;
						return (
							<button
								key={value}
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									handleSelectChange(value);
								}}
								className={`w-full text-left px-3 py-1.5 text-[12px] rounded-lg cursor-pointer hover:bg-brand-100 transition-colors ${
									value === clasesDelDia
										? "bg-brand-200 font-semibold text-brand-800"
										: "text-gray-600"
								}`}
							>
								{value} clase{value !== 1 ? "s" : ""}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
