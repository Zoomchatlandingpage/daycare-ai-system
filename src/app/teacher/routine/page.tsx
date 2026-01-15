"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Utensils, Moon, Smile, Baby } from "lucide-react";

const routineTypes = {
  meal: {
    title: "Alimentação",
    icon: Utensils,
    color: "orange",
    options: [
      { value: "breakfast", label: "Café da manhã" },
      { value: "lunch", label: "Almoço" },
      { value: "snack", label: "Lanche" },
      { value: "dinner", label: "Jantar" },
    ],
    levels: [
      { value: "full", label: "Comeu tudo", emoji: "😋" },
      { value: "partial", label: "Comeu parcialmente", emoji: "😐" },
      { value: "little", label: "Comeu pouco", emoji: "😕" },
      { value: "refused", label: "Recusou", emoji: "🙅" },
    ],
  },
  sleep: {
    title: "Sono",
    icon: Moon,
    color: "indigo",
    options: [
      { value: "nap", label: "Soneca" },
      { value: "rest", label: "Descanso" },
    ],
    levels: [
      { value: "deep", label: "Dormiu bem", emoji: "😴" },
      { value: "light", label: "Sono leve", emoji: "😪" },
      { value: "restless", label: "Agitado", emoji: "😫" },
      { value: "refused", label: "Não dormiu", emoji: "😳" },
    ],
  },
  mood: {
    title: "Humor",
    icon: Smile,
    color: "yellow",
    options: [],
    levels: [
      { value: "happy", label: "Feliz", emoji: "😊" },
      { value: "calm", label: "Calmo", emoji: "😌" },
      { value: "tired", label: "Cansado", emoji: "😔" },
      { value: "upset", label: "Irritado", emoji: "😤" },
      { value: "sad", label: "Triste", emoji: "😢" },
    ],
  },
  bathroom: {
    title: "Banheiro",
    icon: Baby,
    color: "blue",
    options: [
      { value: "diaper_wet", label: "Fralda molhada" },
      { value: "diaper_dirty", label: "Fralda suja" },
      { value: "potty", label: "Usou o penico" },
      { value: "toilet", label: "Usou o banheiro" },
    ],
    levels: [],
  },
};

function RoutineContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");
  const type = searchParams.get("type") as keyof typeof routineTypes;

  const [selectedOption, setSelectedOption] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const routineConfig = routineTypes[type] || routineTypes.meal;
  const IconComponent = routineConfig.icon;

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
    if (!childId) return;

    setSaving(true);
    try {
      const res = await fetch("/api/teacher/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: childId,
          log_type: type,
          details: {
            option: selectedOption,
            level: selectedLevel,
            notes: notes,
          },
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

  const colorClasses = {
    orange: "bg-orange-100 text-orange-600",
    indigo: "bg-indigo-100 text-indigo-600",
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-600 text-white sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link
            href={`/teacher`}
            className="p-1 hover:bg-green-700 rounded"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold">{routineConfig.title}</h1>
        </div>
      </nav>

      <main className="p-4 pb-24">
        <div className="flex justify-center mb-6">
          <div
            className={`p-4 rounded-full ${colorClasses[routineConfig.color as keyof typeof colorClasses]}`}
          >
            <IconComponent className="h-12 w-12" />
          </div>
        </div>

        {routineConfig.options.length > 0 && (
          <div className="mb-6">
            <h2 className="font-medium text-gray-700 mb-3">Tipo</h2>
            <div className="grid grid-cols-2 gap-2">
              {routineConfig.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedOption(option.value)}
                  className={`p-3 rounded-xl border-2 transition ${
                    selectedOption === option.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {routineConfig.levels.length > 0 && (
          <div className="mb-6">
            <h2 className="font-medium text-gray-700 mb-3">Como foi?</h2>
            <div className="space-y-2">
              {routineConfig.levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition ${
                    selectedLevel === level.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <span className="text-2xl">{level.emoji}</span>
                  <span className="font-medium">{level.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">
            Observações (opcional)
          </h2>
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
          disabled={
            saving ||
            (routineConfig.options.length > 0 && !selectedOption) ||
            (routineConfig.levels.length > 0 && !selectedLevel)
          }
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
