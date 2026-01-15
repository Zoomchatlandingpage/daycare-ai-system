"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";

const severityOptions = [
  { value: "LOW", label: "Baixa", color: "bg-yellow-100 text-yellow-700", description: "Pequenos arranhões, quedas leves" },
  { value: "MEDIUM", label: "Média", color: "bg-orange-100 text-orange-700", description: "Batidas, mordidas, conflitos" },
  { value: "HIGH", label: "Alta", color: "bg-red-100 text-red-700", description: "Ferimentos que precisam de atenção" },
];

function IncidentContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
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
    if (!childId || !severity || !description) return;

    setSaving(true);
    try {
      const res = await fetch("/api/teacher/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: childId,
          severity,
          description,
          action_taken: actionTaken,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          router.push(`/teacher`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving incident:", error);
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
            Incidente registrado!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-600 text-white sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Link href={`/teacher`} className="p-1 hover:bg-red-700 rounded">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold">Registrar Incidente</h1>
        </div>
      </nav>

      <main className="p-4 pb-24">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-red-100">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Severidade *</h2>
          <div className="space-y-2">
            {severityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSeverity(option.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition ${
                  severity === option.value
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${option.color}`}>
                    {option.label}
                  </span>
                  <span className="text-gray-600 text-sm">{option.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">O que aconteceu? *</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Descreva o incidente em detalhes..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <h2 className="font-medium text-gray-700 mb-3">Ação tomada</h2>
          <textarea
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            rows={3}
            placeholder="O que foi feito para resolver?"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          disabled={saving || !severity || !description}
          className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {saving ? "Salvando..." : "Registrar Incidente"}
        </button>
      </div>
    </div>
  );
}

export default function IncidentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <IncidentContent />
    </Suspense>
  );
}
