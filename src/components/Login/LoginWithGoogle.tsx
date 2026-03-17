import {
	GoogleAuthProvider,
	getRedirectResult,
	signInWithPopup,
	signInWithRedirect,
	type UserCredential,
} from "firebase/auth";
import { useEffect } from "react";
import { useAuth } from "reactfire";
import calendar from "../../assets/calendar.png";

const LoginWithGoogle: React.FC = () => {
	const auth = useAuth();

	useEffect(() => {
		const checkRedirect = async () => {
			try {
				const result: UserCredential | null = await getRedirectResult(auth);
				if (result) {
				}
			} catch (error) {
				console.error("❌ Error en getRedirectResult:", error);
			}
		};
		checkRedirect();
	}, [auth]);

	const handleLogin = async (): Promise<void> => {
		const provider = new GoogleAuthProvider();

		try {
			await signInWithPopup(auth, provider);
		} catch (popupError) {
			console.warn("⚠️ Popup bloqueado, usando redirect:", popupError);
			try {
				await signInWithRedirect(auth, provider);
			} catch (_redirectError) {}
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
			{/* Decorative background circles */}
			<div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/30 blur-3xl" />
			<div className="absolute bottom-[-100px] left-[-60px] w-[250px] h-[250px] rounded-full bg-gradient-to-tr from-green-200/30 to-emerald-100/40 blur-3xl" />

			<img
				width={420}
				src={calendar}
				alt="calendario"
				className="relative z-10 mb-8 rounded-3xl animate-float"
			/>

			<h1 className="relative z-10 text-2xl font-bold text-gray-800 mb-2 tracking-tight">
				Calendario Autoescuela
			</h1>
			<p className="relative z-10 text-gray-500 mb-8 text-sm">
				Controla tus clases y objetivos fácilmente
			</p>

			<button
				type="button"
				onClick={handleLogin}
				className="relative z-10 group flex items-center gap-4 rounded-2xl shadow-glass hover:shadow-card-hover transition-all duration-300 cursor-pointer px-8 py-4 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] animate-fade-in"
			>
				<img
					width={36}
					src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000.png"
					alt="google icon"
					className="rounded-xl group-hover:rotate-6 transition-transform duration-300"
				/>
				<span className="text-gray-700 font-semibold text-base">
					Iniciar sesión con Google
				</span>
			</button>
		</div>
	);
};

export default LoginWithGoogle;
