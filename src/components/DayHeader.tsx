type DayHeaderProps = {
  label: string;
};

export function DayHeader({ label }: DayHeaderProps) {
  const isWeekend = label === "S" || label === "D";
  return (
    <div
      className={`flex items-center justify-center h-8 sm:h-10 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${
        isWeekend
          ? "bg-red-100 text-red-500 border-r border-red-200"
          : "bg-brand-100 text-brand-700 border-r border-brand-200/50"
      }`}
    >
      {label}
    </div>
  );
}
