import { AlertCircle, Calendar, X } from "lucide-react";
import type React from "react";

interface VacationModalProps {
  startDate: string;
  naturalDays: number;
  calculatedEndDate: string;
  calculatedWorkingDays: number;
  onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNaturalDaysChange: (days: number) => void;
  onSave: () => void;
  onClose: () => void;
}

const VacationModal: React.FC<VacationModalProps> = ({
  startDate,
  naturalDays,
  calculatedEndDate,
  calculatedWorkingDays,
  onStartDateChange,
  onNaturalDaysChange,
  onSave,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-glass max-w-md w-full p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="p-1.5 bg-brand-100 rounded-lg">
              <Calendar size={18} className="text-brand-600" />
            </div>
            Configurar Vacaciones
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de inicio
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={onStartDateChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="natural-days"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Días naturales de vacaciones
            </label>
            <select
              id="natural-days"
              value={naturalDays}
              onChange={(e) => onNaturalDaysChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none transition-all"
            >
              <option value={0}>Selecciona días</option>
              {Array.from({ length: 31 }, (_, i) => {
                const value = i + 1;
                return (
                  <option key={value} value={value}>
                    {value} día{value !== 1 ? "s" : ""}
                  </option>
                );
              })}
            </select>

            <p className="text-xs text-gray-500 mt-1">
              Días totales incluyendo fines de semana y festivos
            </p>
          </div>

          {calculatedEndDate && (
            <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">
                    Resumen de vacaciones:
                  </p>
                  <ul className="mt-2 space-y-1 text-blue-800">
                    <li>
                      • Fecha fin:{" "}
                      {new Date(calculatedEndDate).toLocaleDateString("es-ES")}
                    </li>
                    <li>• Días naturales: {naturalDays}</li>
                    <li>• Días laborables: {calculatedWorkingDays}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onSave}
              disabled={!startDate || naturalDays <= 0}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-emerald-500 text-white rounded-xl font-medium hover:from-brand-600 hover:to-emerald-600 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-soft"
            >
              Añadir período
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationModal;
