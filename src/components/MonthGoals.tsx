import { CalendarDays, Clock, Flag, Target, TrendingUp } from "lucide-react";

interface MonthGoalsProps {
	clasesDelMesVisible: number;
	workingDays: number;
	remainingDays: number;
	valorPorDia: number;
	total6Months: number | null;
}

const MonthGoals: React.FC<MonthGoalsProps> = ({
	clasesDelMesVisible,
	workingDays,
	remainingDays,
	valorPorDia,
	total6Months,
}) => {
	const adjustedClassesNeeded =
		Math.round(workingDays * valorPorDia) - clasesDelMesVisible;
	const adjustedClassesPerDay =
		remainingDays > 0
			? (adjustedClassesNeeded / remainingDays).toFixed(2)
			: "0";

	const pastWorkingDays = workingDays - remainingDays;
	const classesShouldHaveByToday = Math.round(pastWorkingDays * valorPorDia);
	const differenceWithToday = clasesDelMesVisible - classesShouldHaveByToday;

	return (
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
						{Number(adjustedClassesPerDay) > 0 ? adjustedClassesPerDay : "-"}
					</strong>
				</div>

				{total6Months !== null && (
					<div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
						<span className="flex items-center gap-1.5 text-gray-600">
							<TrendingUp size={15} className="text-brand-500" /> Total últimos
							6 meses:
						</span>
						<strong
							className={total6Months >= 0 ? "text-green-600" : "text-red-600"}
						>
							{total6Months > 0 ? "+" : ""}
							{total6Months.toFixed(1)}
						</strong>
					</div>
				)}
			</div>
		</div>
	);
};

export default MonthGoals;
