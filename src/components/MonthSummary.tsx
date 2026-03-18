import { CalendarDays, ClipboardList, GraduationCap, Sun } from "lucide-react";

interface MonthSummaryProps {
  clasesDelMesVisible: number;
  workingDays: number;
  remainingDays: number;
}

const MonthSummary: React.FC<MonthSummaryProps> = ({
  clasesDelMesVisible,
  workingDays,
  remainingDays,
}) => {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 text-brand-700 font-bold mb-2">
        <ClipboardList size={14} className="text-brand-600" />
        <span>Resumen del mes</span>
      </div>
      <div className="bg-gray-50/80 rounded-lg border border-gray-100 p-3 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="flex items-center gap-1.5 text-gray-600">
            <GraduationCap size={15} className="text-brand-500" /> Clases dadas:
          </span>
          <strong>{clasesDelMesVisible}</strong>
        </div>

        <div className="flex justify-between">
          <span className="flex items-center gap-1.5 text-gray-600">
            <CalendarDays size={15} className="text-brand-500" /> Días
            laborables:
          </span>
          <strong>{workingDays}</strong>
        </div>

        <div className="flex justify-between">
          <span className="flex items-center gap-1.5 text-gray-600">
            <Sun size={15} className="text-brand-500" /> Días restantes:
          </span>
          <strong>{remainingDays}</strong>
        </div>
      </div>
    </div>
  );
};

export default MonthSummary;
