"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Star } from "lucide-react";

const areaOptions = [
  { value: "motor", label: "Motor", emoji: "🏃" },
  { value: "cognitive", label: "Cognitivo", emoji: "🧠" },
  { value: "language", label: "Linguagem", emoji: "💬" },
  { value: "social", label: "Social", emoji: "🤝" },
  { value: "emotional", label: "Emocional", emoji: "❤️" },
  { value: "creative", label: "Criativo", emoji: "🎨" },
];

function LearningContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  const [area, setArea] = useState("");
  const [milestone, setMilestone] = useState("");
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
    if (!childId || !area || !milestone) return;

    setSaving(true);
    try {
      const res = await fetch("/api/teacher/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: childId,
          area,
          milestone,
          notes,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          router.push(`/teacher`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving learning event:", error);
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
            Aprendizado registrado!
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
          <h1 className="text-lg font-bold">Registrar Aprendizado</h1>
        </div>
      </nav>

      <main className="p-4 pb-24">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-green-100">
            <Star className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Área de Desenvolvimento *</h2>
          <div className="grid grid-cols-2 gap-2">
            {areaOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setArea(option.value)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${
                  area === option.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="font-medium text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Marco/Conquista *</h2>
          <input
            type="text"
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            placeholder="Ex: Aprendeu a contar até 10"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Observações</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Detalhes sobre o contexto, como demonstrou, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          disabled={saving || !area || !milestone}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {saving ? "Salvando..." : "Registrar Aprendizado"}
        </button>
      </div>
    </div>
  );
}

export default function LearningPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <LearningContent />
    </Suspense>
  );
}
