import { Suspense } from "react";
import { Navigate, Outlet } from "react-router";
import { useSigninCheck, useUser } from "reactfire";
import calendar from "../../assets/calendar.png";
import LoadingScreen from "../LoadingScreen";

const AdminLayout: React.FC = () => {
	const { status, data: signInCheckResult, hasEmitted } = useSigninCheck();

	if (status === "loading" || !hasEmitted) {
		return <LoadingScreen message="Cargando aplicación..." logo={calendar} />;
	}

	if (!signInCheckResult?.signedIn) {
		return <Navigate to="/" replace />;
	}

	return (
		<Suspense
			fallback={
				<LoadingScreen message="Cargando aplicación..." logo={calendar} />
			}
		>
			<AuthenticatedLayout />
		</Suspense>
	);
};

export default AdminLayout;

const AuthenticatedLayout: React.FC = () => {
	useUser({ suspense: true });

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20">
			<Outlet />
		</div>
	);
};
