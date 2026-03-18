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

export function getHolidaysForYear(year: number): string[] {
	return year === 2026 ? spanishHolidays2026 : spanishHolidays2025;
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
