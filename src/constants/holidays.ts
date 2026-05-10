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
	"2026-12-24",
	"2026-12-31",
];


export const spanishHolidays2027: string[] = [
	"2027-01-01", // Año Nuevo (viernes)
	"2027-01-06", // Reyes Magos (miércoles)
	"2027-03-01", // Día de Andalucía — trasladado (Feb 28 = domingo)
	"2027-03-25", // Jueves Santo
	"2027-03-26", // Viernes Santo
	"2027-05-01", // Día del Trabajador (sábado)
	"2027-08-16", // Asunción — trasladada (Ago 15 = domingo)
	"2027-08-19", // Feria de Málaga (jueves)
	"2027-09-08", // Virgen de la Victoria (miércoles)
	"2027-10-12", // Día de la Hispanidad (martes)
	"2027-11-01", // Todos los Santos (lunes)
	"2027-12-06", // Día de la Constitución (lunes)
	"2027-12-08", // Inmaculada Concepción (miércoles)
	"2027-12-25",
	"2027-12-24",
	"2027-12-31",
];

export function getHolidaysForYear(year: number): string[] {
	switch (year) {
		case 2025:
			return spanishHolidays2025;
		case 2026:
			return spanishHolidays2026;
		case 2027:
			return spanishHolidays2027;
		default:
			return spanishHolidays2025;
	}
}

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

export function countWorkingDaysInDates(dates: string[], year: number): number {
	const holidays = getHolidaysForYear(year);
	return dates.filter((dateStr) => {
		const d = new Date(dateStr);
		const dayOfWeek = d.getDay();
		if (dayOfWeek === 0 || dayOfWeek === 6) return false;
		return !holidays.includes(dateStr);
	}).length;
}
