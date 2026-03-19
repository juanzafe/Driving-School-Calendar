import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useUser } from "reactfire";
import {
	countWorkingDaysInDates,
	getHolidaysForYear,
	spanishHolidays2025,
	spanishHolidays2026,
} from "../constants/holidays";
import { db } from "../firebase/firebase";

export function useVacationData(currentDate: Date) {
	const { data: user } = useUser();
	const [vacationNumber, setVacationNumber] = useState(0);
	const [naturalVacationDays, setNaturalVacationDays] = useState(0);
	const [vacationDates, setVacationDates] = useState<string[]>([]);

	useEffect(() => {
		if (!user?.email) return;
		const loadVacationData = async () => {
			const email = user.email ?? "noemail";
			const viewedYear = currentDate.getFullYear();
			const viewedMonth = currentDate.getMonth();
			const key = `${viewedYear}-${viewedMonth}`;
			const docRef = doc(db, "holidaysPerMonth", email);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				if (data && typeof data === "object") {
					const vacationDatesField = data[`${key}-vacationDates`];
					const monthDates: string[] = [
						...((vacationDatesField as string[]) || []),
					];

					// Backward compat: only if the new-format field doesn't exist at all
					if (monthDates.length === 0 && vacationDatesField === undefined) {
						const keysToCheck = [key];
						const prevMonth = new Date(viewedYear, viewedMonth - 1, 1);
						keysToCheck.push(
							`${prevMonth.getFullYear()}-${prevMonth.getMonth()}`,
						);

						for (const checkKey of keysToCheck) {
							const start = data[`${checkKey}-start`] as string | undefined;
							const end = data[`${checkKey}-end`] as string | undefined;
							if (start && end) {
								const startDateObj = new Date(start);
								const endDateObj = new Date(end);
								const tempDate = new Date(startDateObj);
								while (tempDate <= endDateObj) {
									if (
										tempDate.getFullYear() === viewedYear &&
										tempDate.getMonth() === viewedMonth
									) {
										const formatted = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}-${String(tempDate.getDate()).padStart(2, "0")}`;
										monthDates.push(formatted);
									}
									tempDate.setDate(tempDate.getDate() + 1);
								}
							}
						}
					}

					const workingVacDays = countWorkingDaysInDates(
						monthDates,
						viewedYear,
					);
					setVacationNumber(workingVacDays);
					setNaturalVacationDays(monthDates.length);
					setVacationDates(monthDates);
				}
			} else {
				setVacationNumber(0);
				setNaturalVacationDays(0);
				setVacationDates([]);
			}
		};
		loadVacationData();
	}, [user, currentDate]);

	const handleSaveVacations = async (vacationData: {
		vacationNumber: number;
		naturalDays: number;
		startDate: string;
		endDate: string;
		vacationDates: string[];
	}) => {
		if (!user?.email) return;

		const email = user.email ?? "unknown";
		const docRef = doc(db, "holidaysPerMonth", email);
		const viewedYear = currentDate.getFullYear();
		const viewedMonth = currentDate.getMonth();
		const viewedKey = `${viewedYear}-${viewedMonth}`;

		if (vacationData.vacationDates.length === 0) {
			await setDoc(
				docRef,
				{
					[`${viewedKey}-vacationDates`]: [],
					[`${viewedKey}-vacationNumber`]: 0,
					[`${viewedKey}-naturalDays`]: 0,
					[`${viewedKey}-start`]: "",
					[`${viewedKey}-end`]: "",
				},
				{ merge: true },
			);
			setVacationNumber(0);
			setNaturalVacationDays(0);
			setVacationDates([]);
			return;
		}

		const docSnap = await getDoc(docRef);
		const existingData = docSnap.exists() ? docSnap.data() : {};

		const datesByMonth = new Map<string, string[]>();
		for (const dateStr of vacationData.vacationDates) {
			const d = new Date(dateStr);
			const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
			const existing = datesByMonth.get(monthKey) ?? [];
			existing.push(dateStr);
			datesByMonth.set(monthKey, existing);
		}

		const updates: Record<string, string[] | number | string> = {};
		for (const [monthKey, newDates] of datesByMonth) {
			const existingDates: string[] =
				(existingData[`${monthKey}-vacationDates`] as string[]) || [];
			const mergedDatesSet = new Set([...existingDates, ...newDates]);
			const mergedDates = Array.from(mergedDatesSet).sort();

			const [yearStr] = monthKey.split("-");
			const monthHolidays =
				Number(yearStr) === 2026 ? spanishHolidays2026 : spanishHolidays2025;
			const workingDaysInMonth = mergedDates.filter((ds) => {
				const d = new Date(ds);
				const dayOfWeek = d.getDay();
				if (dayOfWeek === 0 || dayOfWeek === 6) return false;
				return !monthHolidays.includes(ds);
			}).length;

			updates[`${monthKey}-vacationDates`] = mergedDates;
			updates[`${monthKey}-vacationNumber`] = workingDaysInMonth;
			updates[`${monthKey}-naturalDays`] = mergedDates.length;
		}

		await setDoc(docRef, updates, { merge: true });

		if (datesByMonth.has(viewedKey)) {
			const existingDates: string[] =
				(existingData[`${viewedKey}-vacationDates`] as string[]) || [];
			const mergedDatesSet = new Set([
				...existingDates,
				...(datesByMonth.get(viewedKey) || []),
			]);
			const mergedDates = Array.from(mergedDatesSet).sort();

			const workingVacDays = countWorkingDaysInDates(mergedDates, viewedYear);
			setVacationDates(mergedDates);
			setVacationNumber(workingVacDays);
			setNaturalVacationDays(mergedDates.length);
		}
	};

	const handleDeleteVacationDates = async (datesToRemove: string[]) => {
		if (!user?.email || datesToRemove.length === 0) return;

		const email = user.email ?? "unknown";
		const docRef = doc(db, "holidaysPerMonth", email);
		const docSnap = await getDoc(docRef);
		const existingData = docSnap.exists() ? docSnap.data() : {};

		const sorted = [...datesToRemove].sort();
		const minDate = new Date(sorted[0]);
		const maxDate = new Date(sorted[sorted.length - 1]);

		const fullDatesToRemove = new Set(datesToRemove);

		// Expand forward to find contiguous dates in next months
		let checkDate = new Date(maxDate);
		checkDate.setDate(checkDate.getDate() + 1);
		while (true) {
			const checkKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}`;
			const monthDates: string[] =
				(existingData[`${checkKey}-vacationDates`] as string[]) || [];
			const formatted = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
			if (monthDates.includes(formatted)) {
				fullDatesToRemove.add(formatted);
				checkDate.setDate(checkDate.getDate() + 1);
			} else {
				break;
			}
		}

		// Expand backward to find contiguous dates in previous months
		checkDate = new Date(minDate);
		checkDate.setDate(checkDate.getDate() - 1);
		while (true) {
			const checkKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}`;
			const monthDates: string[] =
				(existingData[`${checkKey}-vacationDates`] as string[]) || [];
			const formatted = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
			if (monthDates.includes(formatted)) {
				fullDatesToRemove.add(formatted);
				checkDate.setDate(checkDate.getDate() - 1);
			} else {
				break;
			}
		}

		const monthsAffected = new Set<string>();
		for (const dateStr of fullDatesToRemove) {
			const d = new Date(dateStr);
			monthsAffected.add(`${d.getFullYear()}-${d.getMonth()}`);
		}

		const updates: Record<string, string[] | number | string> = {};
		for (const monthKey of monthsAffected) {
			const existingDates: string[] =
				(existingData[`${monthKey}-vacationDates`] as string[]) || [];
			const remaining = existingDates.filter((d) => !fullDatesToRemove.has(d));

			const [yearStr] = monthKey.split("-");
			const monthHolidays = getHolidaysForYear(Number(yearStr));
			const workingDaysInMonth = remaining.filter((ds) => {
				const d = new Date(ds);
				const dayOfWeek = d.getDay();
				if (dayOfWeek === 0 || dayOfWeek === 6) return false;
				return !monthHolidays.includes(ds);
			}).length;

			updates[`${monthKey}-vacationDates`] = remaining;
			updates[`${monthKey}-vacationNumber`] = workingDaysInMonth;
			updates[`${monthKey}-naturalDays`] = remaining.length;
			// Clear old format fields so backward compat doesn't resurrect them
			updates[`${monthKey}-start`] = "";
			updates[`${monthKey}-end`] = "";
		}

		await setDoc(docRef, updates, { merge: true });

		const viewedYear = currentDate.getFullYear();
		const viewedMonth = currentDate.getMonth();
		const viewedKey = `${viewedYear}-${viewedMonth}`;
		if (monthsAffected.has(viewedKey)) {
			const remaining =
				(updates[`${viewedKey}-vacationDates`] as string[]) || [];
			const workingVacDays = countWorkingDaysInDates(remaining, viewedYear);
			setVacationDates(remaining);
			setVacationNumber(workingVacDays);
			setNaturalVacationDays(remaining.length);
		}
	};

	return {
		vacationNumber,
		setVacationNumber,
		naturalVacationDays,
		setNaturalVacationDays,
		vacationDates,
		setVacationDates,
		handleSaveVacations,
		handleDeleteVacationDates,
	};
}
