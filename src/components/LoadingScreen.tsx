import { CircularProgress } from "@mui/material";
import type React from "react";
import calendar from "../assets/calendar.png";

interface LoadingScreenProps {
	message?: string;

	logo?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
	message = "Cargando...",
	logo = calendar,
}) => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-gray-800">
			{logo && (
				<img
					src={logo}
					alt="Logo"
					className="mb-8 animate-float opacity-95"
					style={{ maxWidth: "260px", height: "auto" }}
				/>
			)}

			<CircularProgress size={44} thickness={4} color="success" />

			<p className="mt-5 text-sm font-medium text-gray-500 animate-pulse tracking-wide">
				{message}
			</p>
		</div>
	);
};

export default LoadingScreen;
