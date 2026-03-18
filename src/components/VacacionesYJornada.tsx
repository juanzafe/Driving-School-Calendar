import { Briefcase, Plane, Trash2 } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { getHolidaysForYear } from "../constants/holidays";
import VacationModal from "./VacationModal";

interface VacacionesYJornadaProps {
	workingDays: number;
	jornada: "media" | "completa";
	setJornada: (value: "media" | "completa") => void;
	vacationNumber: number;
	setVacationNumber: (value: number) => void;
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
	naturalVacationDays: number;
}

const VacacionesYJornada: React.FC<VacacionesYJornadaProps> = ({
	jornada,
	setJornada,
	setVacationNumber,
	currentYear,
	setVacationDates,
	onSaveVacations,
	onDeleteVacationDates,
	vacationDates,
}) => {
	const [showModal, setShowModal] = useState(false);
	const [startDate, setStartDate] = useState("");
	const [naturalDays, setNaturalDays] = useState(0);
	const [calculatedEndDate, setCalculatedEndDate] = useState("");
	const [calculatedWorkingDays, setCalculatedWorkingDays] = useState(0);

	const holidays = getHolidaysForYear(currentYear);

	const isWorkingDay = (date: Date) => {
		const dayOfWeek = date.getDay();
		if (dayOfWeek === 0 || dayOfWeek === 6) return false;
		const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		return !holidays.includes(formatted);
	};

	const calculateEndDateAndWorkingDays = (start: string, daysCount: number) => {
		if (!start || daysCount <= 0) {
			setCalculatedEndDate("");
			setCalculatedWorkingDays(0);
			return;
		}

		const startDateObj = new Date(start);
		let workingDaysCount = 0;
		const currentDate = new Date(startDateObj);

		// Contar días laborables en el rango de días naturales
		for (let i = 0; i < daysCount; i++) {
			if (isWorkingDay(currentDate)) {
				workingDaysCount++;
			}
			if (i < daysCount - 1) {
				currentDate.setDate(currentDate.getDate() + 1);
			}
		}

		const endFormatted = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

		setCalculatedEndDate(endFormatted);
		setCalculatedWorkingDays(workingDaysCount);
	};

	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newStartDate = e.target.value;
		setStartDate(newStartDate);
		calculateEndDateAndWorkingDays(newStartDate, naturalDays);
	};

	const handleNaturalDaysChange = (days: number) => {
		setNaturalDays(days);
		calculateEndDateAndWorkingDays(startDate, days);
	};

	const handleSaveVacations = async () => {
		if (!startDate || naturalDays <= 0) return;

		const startDateObj = new Date(startDate);
		const endDateObj = new Date(calculatedEndDate);
		const dates: string[] = [];
		const tempDate = new Date(startDateObj);

		while (tempDate <= endDateObj) {
			const formatted = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}-${String(tempDate.getDate()).padStart(2, "0")}`;
			dates.push(formatted);
			tempDate.setDate(tempDate.getDate() + 1);
		}

		setVacationDates(dates);
		setVacationNumber(calculatedWorkingDays);

		await onSaveVacations({
			vacationNumber: calculatedWorkingDays,
			naturalDays: naturalDays,
			startDate,
			endDate: calculatedEndDate,
			vacationDates: dates,
		});

		setShowModal(false);
	};

	// Group consecutive vacation dates into periods
	const vacationPeriods = useMemo(() => {
		if (vacationDates.length === 0) return [];
		const sorted = [...vacationDates].sort();
		const periods: { start: string; end: string; dates: string[] }[] = [];
		let currentPeriod = {
			start: sorted[0],
			end: sorted[0],
			dates: [sorted[0]],
		};

		for (let i = 1; i < sorted.length; i++) {
			const prevDate = new Date(sorted[i - 1]);
			const currDate = new Date(sorted[i]);
			const diffDays =
				(currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
			if (diffDays <= 1) {
				currentPeriod.end = sorted[i];
				currentPeriod.dates.push(sorted[i]);
			} else {
				periods.push(currentPeriod);
				currentPeriod = {
					start: sorted[i],
					end: sorted[i],
					dates: [sorted[i]],
				};
			}
		}
		periods.push(currentPeriod);
		return periods;
	}, [vacationDates]);

	const formatDateShort = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("es-ES", {
			day: "numeric",
			month: "short",
		});
	};

	return (
		<>
			<div className="flex flex-col text-sm">
				<div className="flex items-center gap-2 text-brand-700 font-bold mb-2">
					<Briefcase size={14} className="text-brand-600" />
					<span>Configuración</span>
				</div>
				<div className="bg-gray-50/80 rounded-lg border border-gray-100 p-3 text-sm space-y-2">
					<div className="flex justify-between items-center">
						<span className="flex items-center gap-1.5 text-gray-600">
							<Briefcase size={15} className="text-brand-500" /> Tipo de
							jornada:
						</span>
						<select
							value={jornada}
							onChange={(e) =>
								setJornada(e.target.value as "media" | "completa")
							}
							className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
						>
							<option value="completa">Completa</option>
							<option value="media">Media</option>
						</select>
					</div>

					<div className="flex justify-between items-center pt-2 border-t border-gray-100">
						<span className="flex items-center gap-1.5 text-gray-600">
							<Plane size={15} className="text-brand-500" /> Vacaciones:
						</span>
						<button
							type="button"
							onClick={() => setShowModal(true)}
							className="px-4 py-1.5 bg-gradient-to-r from-brand-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-brand-600 hover:to-emerald-600 transition-all shadow-soft hover:shadow-md"
						>
							Añadir
						</button>
					</div>
				</div>

				{vacationPeriods.length > 0 && (
					<div className="mt-2 space-y-1.5">
						{vacationPeriods.map((period) => (
							<div
								key={period.start}
								className="flex items-center justify-between bg-amber-50/80 border border-amber-100 rounded-lg px-3 py-1.5"
							>
								<span className="flex items-center gap-1.5 text-amber-800 text-xs font-medium">
									<Plane size={13} className="text-amber-500" />
									{period.start === period.end
										? formatDateShort(period.start)
										: `${formatDateShort(period.start)} → ${formatDateShort(period.end)}`}
									<span className="text-amber-500 font-normal">
										({period.dates.length}d)
									</span>
								</span>
								<button
									type="button"
									onClick={() => onDeleteVacationDates(period.dates)}
									className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
									title="Eliminar período"
								>
									<Trash2 size={13} />
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			{showModal && (
				<VacationModal
					startDate={startDate}
					naturalDays={naturalDays}
					calculatedEndDate={calculatedEndDate}
					calculatedWorkingDays={calculatedWorkingDays}
					onStartDateChange={handleStartDateChange}
					onNaturalDaysChange={handleNaturalDaysChange}
					onSave={handleSaveVacations}
					onClose={() => setShowModal(false)}
				/>
			)}
		</>
	);
};

export default VacacionesYJornada;
