// DaysContainer.tsx
import { useIsMobile } from "../hooks/useIsMobile";
import { Day } from "./Day";
import type { CalendarioAutoescuelaProps } from "./Month";

interface DaysContainerProps extends CalendarioAutoescuelaProps {
	currentDate: Date;
}

export function DaysContainer(props: DaysContainerProps) {
	const { currentDate } = props;
	const isMobile = useIsMobile();

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstDay = new Date(year, month, 1);
	const startDay = (firstDay.getDay() + 6) % 7;
	const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

	const cells = Array.from({ length: totalCells }, (_, index) => {
		const dayNumber = index - startDay + 1;
		if (dayNumber >= 1 && dayNumber <= daysInMonth) {
			return { date: new Date(year, month, dayNumber), type: "current" };
		}
		if (dayNumber < 1) {
			const prevMonthDate = new Date(year, month, dayNumber);
			return { date: prevMonthDate, type: "prev" };
		}
		const nextMonthDate = new Date(year, month, dayNumber);
		return { date: nextMonthDate, type: "next" };
	});

	return (
		<div className="grid grid-cols-7 gap-[2px] w-full bg-gray-100/80 p-[2px]">
			{cells.map(({ date, type }) =>
				type === "current" ? (
					<div
						key={date.toISOString()}
						className={`flex flex-col items-center justify-center text-center 
            bg-white 
            ${isMobile ? "h-[74px]" : "h-[68px]"}
            transition-all duration-200`}
					>
						<Day num={date} calendarioAutoescuelaProps={props} />
					</div>
				) : (
					<div
						key={date.toISOString()}
						className={`flex flex-col items-center justify-center text-center 
            ${isMobile ? "h-[74px]" : "h-[68px]"} 
            bg-gray-50/60 text-gray-300 text-xs sm:text-sm select-none font-medium`}
					>
						{date.getDate()}
					</div>
				),
			)}
		</div>
	);
}
