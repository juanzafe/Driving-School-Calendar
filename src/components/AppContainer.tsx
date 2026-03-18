import { Button } from "@mui/material";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import {
  ArrowLeft,
  BarChart3,
  LogOut as LogOutIcon,
  Mail,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useUser } from "reactfire";
import calendar from "../assets/calendar.png";
import { auth, db } from "../firebase/firebase";
import { useIsMobile } from "../hooks/useIsMobile";
import { useVacationData } from "../hooks/useVacationData";
import { CalendarioAutoescuela } from "../modelo/CalendarioAutoescuela";
import ClasesChart from "./ClasesChart";
import LoadingScreen from "./LoadingScreen";
import { Month } from "./Month";

interface AppContainerProps {
  showOnlyChart?: boolean;
}

export function AppContainer({ showOnlyChart = false }: AppContainerProps) {
  const { data: user } = useUser();
  const isMobile = useIsMobile();
  const [calendario, setCalendario] = useState(new CalendarioAutoescuela());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jornada, setJornada] = useState<"media" | "completa">("completa");
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const {
    vacationNumber,
    setVacationNumber,
    naturalVacationDays,
    vacationDates,
    setVacationDates,
    handleSaveVacations,
    handleDeleteVacationDates,
  } = useVacationData(currentDate);

  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const year = parseInt(params.get("year") ?? "", 10);
    const month = parseInt(params.get("month") ?? "", 10);
    if (!Number.isNaN(year) && !Number.isNaN(month)) {
      setCurrentDate(new Date(year, month, 1));
    }
  }, [params]);

  useEffect(() => {
    if (!user?.email || isLoadingSettings) return;
    const saveJornada = async () => {
      const email = user.email ?? "noemail";
      const docRef = doc(db, "userSettings", email);
      await setDoc(docRef, { jornada }, { merge: true });
    };
    saveJornada();
  }, [jornada, user, isLoadingSettings]);

  useEffect(() => {
    if (!user?.email) return;
    const loadSettings = async () => {
      const email = user.email ?? "noemail";

      const settingsRef = doc(db, "userSettings", email);
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data.jornada === "media" || data.jornada === "completa") {
          setJornada(data.jornada);
        } else {
          await setDoc(settingsRef, { jornada: "completa" }, { merge: true });
          setJornada("completa");
        }
      } else {
        await setDoc(settingsRef, { jornada: "completa" }, { merge: true });
        setJornada("completa");
      }

      setIsLoadingSettings(false);
    };
    loadSettings();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const classesCollectionRef = collection(
      db,
      "classespordia",
      user.email ?? "noemail",
      "dates",
    );
    getDocs(classesCollectionRef).then((querySnapshot) => {
      let newCalendar = calendario;
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        newCalendar = newCalendar.setClassCounter(
          new Date(data.date),
          data.count,
        );
      });
      setCalendario(newCalendar);
    });
  }, [user, calendario]);

  if (isLoadingSettings) {
    return <LoadingScreen message="Cargando aplicación..." logo={calendar} />;
  }

  if (showOnlyChart) {
    const nombreMes = currentDate.toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
    });

    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 text-gray-800 overflow-y-auto px-6 sm:px-12 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-brand-500 to-emerald-500 rounded-xl text-white shadow-soft">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Gráfica de clases – {nombreMes}
            </h1>
          </div>
          <div className="flex flex-row flex-wrap items-center justify-end gap-3 mt-2 sm:mt-0">
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={() => navigate("/admin")}
              sx={{
                textTransform: "none",
                borderRadius: 4,
                fontWeight: 500,
                height: "40px",
                minWidth: "180px",
              }}
            >
              Volver al calendario
            </Button>
          </div>
        </div>
        <ClasesChart />
      </div>
    );
  }

  const LogOut = () => (
    <Button
      variant="outlined"
      color="error"
      startIcon={<LogOutIcon size={16} />}
      onClick={() => auth.signOut()}
      sx={{
        borderRadius: 12,
        textTransform: "none",
        fontWeight: 500,
        height: "36px",
        padding: "0 14px",
        marginTop: 0,
        fontSize: "0.8rem",
        borderColor: "#fca5a5",
        color: "#dc2626",
        "&:hover": {
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.04)",
        },
      }}
    >
      Cerrar sesión
    </Button>
  );

  return (
    <div
      className={`w-screen min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 text-gray-800 overflow-y-auto ${isMobile ? "px-4 pt-5 pb-10 space-y-4" : "px-8 lg:px-16 pt-6 pb-12 space-y-6"}`}
    >
      <header
        className={`flex items-center justify-between animate-fade-in ${isMobile ? "flex-col gap-3 text-sm mb-3" : "flex-row mb-4"}`}
      >
        <div className="flex items-center gap-2.5 text-brand-700 font-semibold">
          <User size={isMobile ? 16 : 18} className="text-brand-600" />
          <span>{user?.displayName || "Invitado"}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <div className="flex items-center gap-1.5">
            <Mail size={isMobile ? 13 : 15} className="opacity-60" />
            <span className="text-sm">{user?.email || "Sin correo"}</span>
          </div>
          <LogOut />
        </div>
      </header>

      <div className="flex justify-center animate-fade-in">
        <img
          src={calendar}
          alt="Logo calendario"
          className={`object-contain ${isMobile ? "max-w-[120px]" : "max-w-[200px]"}`}
        />
      </div>

      <section className="w-full animate-slide-up">
        <Month
          calendario={calendario}
          setClassCount={async (day, count) => {
            const updated = calendario.setClassCounter(day, count);
            setCalendario(updated);
            if (!user?.email) return;
            const email = user.email;
            const docRef = doc(
              db,
              "classespordia",
              email,
              "dates",
              day.toISOString().split("T")[0],
            );
            await setDoc(
              docRef,
              { date: day.toISOString(), count },
              { merge: true },
            );
          }}
          onMonthChange={(date) => setCurrentDate(date)}
          jornada={jornada}
          setJornada={setJornada}
          vacationNumber={vacationNumber}
          setVacationNumber={setVacationNumber}
          naturalVacationDays={naturalVacationDays}
          vacationDates={vacationDates}
          setVacationDates={setVacationDates}
          onSaveVacations={handleSaveVacations}
          onDeleteVacationDates={handleDeleteVacationDates}
        />
      </section>

      <div className="flex justify-center mt-8 animate-slide-up">
        <Button
          variant="contained"
          color="primary"
          startIcon={<BarChart3 size={18} />}
          onClick={() =>
            navigate(
              `/admin/grafica?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`,
            )
          }
          sx={{
            borderRadius: 12,
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            background: "linear-gradient(135deg, #2d9d64, #10b981)",
            boxShadow: "0 4px 14px rgba(45, 157, 100, 0.3)",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(45, 157, 100, 0.4)",
              background: "linear-gradient(135deg, #1f7f4f, #059669)",
            },
          }}
        >
          Ver gráfica de clases
        </Button>
      </div>
    </div>
  );
}
