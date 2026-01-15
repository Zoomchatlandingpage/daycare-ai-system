"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

const moodOptions = [
  { value: "VERY_HAPPY", label: "Muito Feliz", emoji: "😊" },
  { value: "HAPPY", label: "Feliz", emoji: "🙂" },
  { value: "NEUTRAL", label: "Normal", emoji: "😐" },
  { value: "SAD", label: "Triste", emoji: "😢" },
  { value: "TIRED", label: "Cansado", emoji: "😴" },
  { value: "SICK", label: "Doente", emoji: "🤒" },
];

const diaperOptions = [
  { value: "CLEAN", label: "Limpa" },
  { value: "WET", label: "Molhada" },
  { value: "DIRTY", label: "Suja" },
  { value: "NOT_APPLICABLE", label: "Não aplicável" },
];

const foodOptions = [
  { value: 100, label: "Comeu tudo", emoji: "😋" },
  { value: 75, label: "Comeu bem", emoji: "🙂" },
  { value: 50, label: "Comeu parcialmente", emoji: "😐" },
  { value: 25, label: "Comeu pouco", emoji: "😕" },
  { value: 0, label: "Não comeu", emoji: "🙅" },
];

const sleepOptions = [
  { value: 120, label: "2 horas", emoji: "😴" },
  { value: 90, label: "1h30", emoji: "😪" },
  { value: 60, label: "1 hora", emoji: "🙂" },
  { value: 30, label: "30 minutos", emoji: "😐" },
  { value: 0, label: "Não dormiu", emoji: "😳" },
];

function RoutineContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  const [mood, setMood] = useState("");
  const [foodIntake, setFoodIntake] = useState<number | null>(null);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [diaper, setDiaper] = useState("NOT_APPLICABLE");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "TEACHER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async () => {
    if (!childId || !mood) return;

    setSaving(true);
    try {
      const res = await fetch("/api/teacher/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: childId,
          mood,
          food_intake_pct: foodIntake ?? 0,
          sleep_minutes: sleepMinutes ?? 0,
          diaper,
          notes,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          router.push(`/teacher?selected=${childId}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving routine:", error);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-semibold text-green-700">
            Registro salvo com sucesso!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-600 text-white sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href={`/teacher`} className="p-1 hover:bg-green-700 rounded">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold">Registro de Rotina</h1>
        </div>
      </nav>

      <main className="p-4 pb-24">
        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Humor *</h2>
          <div className="grid grid-cols-3 gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setMood(option.value)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition ${
                  mood === option.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Alimentação</h2>
          <div className="space-y-2">
            {foodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFoodIntake(option.value)}
                className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition ${
                  foodIntake === option.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Sono</h2>
          <div className="grid grid-cols-3 gap-2">
            {sleepOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSleepMinutes(option.value)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition ${
                  sleepMinutes === option.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Fralda</h2>
          <div className="grid grid-cols-2 gap-2">
            {diaperOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDiaper(option.value)}
                className={`p-3 rounded-xl border-2 transition ${
                  diaper === option.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Observações</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Adicione observações..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          disabled={saving || !mood}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {saving ? "Salvando..." : "Salvar Registro"}
        </button>
      </div>
    </div>
  );
}

export default function RoutinePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <RoutineContent />
    </Suspense>
  );
}
