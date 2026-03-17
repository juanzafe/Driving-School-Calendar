import { DayHeader } from "./DayHeader";
import type { CalendarioAutoescuelaProps } from "./Month";

export function MonthHeader(_props: CalendarioAutoescuelaProps) {
	return (
		<div className="w-full grid grid-cols-7 text-xs sm:text-sm font-semibold uppercase">
			{["L", "M", "X", "J", "V", "S", "D"].map((dia) => (
				<DayHeader key={dia} label={dia} />
			))}
		</div>
	);
}
