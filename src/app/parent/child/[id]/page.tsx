"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Smile,
  Utensils,
  Moon,
  Baby,
  AlertTriangle,
  Star,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Report {
  child: {
    id: string;
    full_name: string;
    classroom: string;
    photo_url: string | null;
  };
  date: string;
  summary: {
    mood: string | null;
    food_intake_pct: number | null;
    sleep_minutes: number | null;
    diaper: string | null;
    notes: string | null;
    recorded_at: string | null;
    teacher: string | null;
  };
  routine_logs: Array<{
    id: string;
    mood: string;
    food_intake_pct: number;
    sleep_minutes: number;
    diaper: string;
    notes: string | null;
    logged_at: string;
    teacher: string;
  }>;
  incidents: Array<{
    id: string;
    severity: string;
    description: string;
    action_taken: string | null;
    occurred_at: string;
    teacher: string;
  }>;
  learning: Array<{
    id: string;
    activity: string;
    description: string;
    skills: string[];
    is_group: boolean;
    notes: string | null;
    logged_at: string;
    teacher: string;
  }>;
}

const moodEmojis: Record<string, { emoji: string; label: string; color: string }> = {
  VERY_HAPPY: { emoji: "😊", label: "Muito Feliz", color: "text-green-600" },
  HAPPY: { emoji: "🙂", label: "Feliz", color: "text-green-500" },
  NEUTRAL: { emoji: "😐", label: "Normal", color: "text-yellow-500" },
  SAD: { emoji: "😢", label: "Triste", color: "text-blue-500" },
  TIRED: { emoji: "😴", label: "Cansado", color: "text-purple-500" },
  SICK: { emoji: "🤒", label: "Doente", color: "text-red-500" },
};

const diaperLabels: Record<string, string> = {
  CLEAN: "Limpa",
  WET: "Molhada",
  DIRTY: "Suja",
  NOT_APPLICABLE: "Não aplicável",
};

const severityColors: Record<string, string> = {
  LOW: "bg-yellow-100 text-yellow-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  HIGH: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-200 text-red-800",
};

export default function ChildReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const childId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "PARENT" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
        router.push("/dashboard");
      } else {
        fetchReport();
      }
    }
  }, [status, session, router, childId, selectedDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await fetch(
        `/api/parent/children/${childId}/report?date=${dateStr}`
      );
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        router.push("/parent");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return "Hoje";
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (compareDate.getTime() === yesterday.getTime()) {
      return "Ontem";
    }
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const hasData =
    report.routine_logs.length > 0 ||
    report.incidents.length > 0 ||
    report.learning.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-8">
      <nav className="bg-purple-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/parent" className="p-1 hover:bg-purple-700 rounded">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{report.child.full_name}</h1>
              <p className="text-purple-200 text-sm">{report.child.classroom}</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-purple-700/50 rounded-xl px-3 py-2">
            <button
              onClick={() => changeDate(-1)}
              className="p-1 hover:bg-purple-600 rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium capitalize">
                {formatDate(selectedDate)}
              </span>
            </div>
            <button
              onClick={() => changeDate(1)}
              disabled={
                selectedDate.toDateString() === new Date().toDateString()
              }
              className="p-1 hover:bg-purple-600 rounded disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4 max-w-2xl mx-auto">
        {!hasData ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-gray-500">
              Ainda não há informações registradas para este dia.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {report.summary.mood && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Smile className="h-5 w-5 text-purple-500" />
                  Resumo do Dia
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <span className="text-3xl block mb-1">
                      {moodEmojis[report.summary.mood]?.emoji || "😐"}
                    </span>
                    <span className="text-sm text-gray-600">
                      {moodEmojis[report.summary.mood]?.label || "Normal"}
                    </span>
                  </div>
                  {report.summary.food_intake_pct !== null && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Utensils className="h-5 w-5 text-orange-500" />
                        <span className="text-xl font-bold text-gray-800">
                          {report.summary.food_intake_pct}%
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">Alimentação</span>
                    </div>
                  )}
                  {report.summary.sleep_minutes !== null &&
                    report.summary.sleep_minutes > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Moon className="h-5 w-5 text-indigo-500" />
                          <span className="text-xl font-bold text-gray-800">
                            {report.summary.sleep_minutes} min
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">Sono</span>
                      </div>
                    )}
                  {report.summary.diaper &&
                    report.summary.diaper !== "NOT_APPLICABLE" && (
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Baby className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {diaperLabels[report.summary.diaper]}
                        </span>
                      </div>
                    )}
                </div>
                {report.summary.notes && (
                  <div className="mt-4 bg-purple-50 rounded-xl p-3">
                    <p className="text-gray-700 text-sm">
                      {report.summary.notes}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      - {report.summary.teacher}
                    </p>
                  </div>
                )}
              </div>
            )}

            {report.incidents.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Ocorrências
                </h2>
                <div className="space-y-3">
                  {report.incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="border border-gray-100 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            severityColors[incident.severity]
                          }`}
                        >
                          {incident.severity === "LOW" && "Baixa"}
                          {incident.severity === "MEDIUM" && "Média"}
                          {incident.severity === "HIGH" && "Alta"}
                          {incident.severity === "CRITICAL" && "Crítica"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(incident.occurred_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {incident.description}
                      </p>
                      {incident.action_taken && (
                        <p className="text-gray-500 text-sm mt-2">
                          <strong>Ação tomada:</strong> {incident.action_taken}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Registrado por {incident.teacher}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.learning.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Aprendizados
                </h2>
                <div className="space-y-3">
                  {report.learning.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-100 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">
                          {event.activity}
                        </h4>
                        <span className="text-xs text-gray-400">
                          {formatTime(event.logged_at)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {event.description}
                      </p>
                      {event.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {event.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {event.is_group && (
                        <span className="text-xs text-purple-500">
                          Atividade em grupo
                        </span>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Registrado por {event.teacher}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.routine_logs.length > 1 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  Histórico de Registros
                </h2>
                <div className="space-y-3">
                  {report.routine_logs.map((log) => (
                    <div
                      key={log.id}
                      className="border-l-4 border-purple-200 pl-3 py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {moodEmojis[log.mood]?.emoji || "😐"}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatTime(log.logged_at)} - {log.teacher}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-500 mt-1">{log.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
