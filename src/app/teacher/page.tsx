"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Baby,
  Utensils,
  Moon,
  Smile,
  AlertTriangle,
  Star,
  ChevronRight,
  LogOut,
  Sparkles,
  Loader2,
  Check,
  X,
} from "lucide-react";

interface Child {
  id: string;
  full_name: string;
  classroom: string | null;
  allergies: string | null;
}

interface ExtractedData {
  mood: string | null;
  food_intake_pct: number | null;
  sleep_minutes: number | null;
  diaper: string | null;
  notes: string | null;
}

const moodLabels: Record<string, string> = {
  VERY_HAPPY: "Muito Feliz",
  HAPPY: "Feliz",
  NEUTRAL: "Normal",
  SAD: "Triste",
  TIRED: "Cansado",
  SICK: "Doente",
};

const diaperLabels: Record<string, string> = {
  CLEAN: "Limpa",
  WET: "Molhada",
  DIRTY: "Suja",
  NOT_APPLICABLE: "Não aplicável",
};

export default function TeacherPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "actions">("list");
  
  const [magicInput, setMagicInput] = useState("");
  const [interpreting, setInterpreting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "TEACHER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
        router.push("/dashboard");
      } else {
        fetchChildren();
      }
    }
  }, [status, session, router]);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/teacher/children");
      if (res.ok) {
        const data = await res.json();
        setChildren(data);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectChild = (child: Child) => {
    setSelectedChild(child);
    setView("actions");
    setMagicInput("");
    setExtractedData(null);
    setSaveSuccess(false);
  };

  const interpretText = async () => {
    if (!magicInput.trim() || !selectedChild) return;
    
    setInterpreting(true);
    setExtractedData(null);
    
    try {
      const res = await fetch("/api/teacher/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: magicInput,
          child_name: selectedChild.full_name,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setExtractedData(data.extracted);
      }
    } catch (error) {
      console.error("Error interpreting:", error);
    } finally {
      setInterpreting(false);
    }
  };

  const saveExtractedData = async () => {
    if (!extractedData || !selectedChild) return;
    
    setSaving(true);
    
    try {
      const res = await fetch("/api/teacher/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: selectedChild.id,
          mood: extractedData.mood || "NEUTRAL",
          food_intake_pct: extractedData.food_intake_pct || 0,
          sleep_minutes: extractedData.sleep_minutes || 0,
          diaper: extractedData.diaper || "NOT_APPLICABLE",
          notes: extractedData.notes,
        }),
      });
      
      if (res.ok) {
        setSaveSuccess(true);
        setMagicInput("");
        setExtractedData(null);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const cancelExtracted = () => {
    setExtractedData(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-600 text-white sticky top-0 z-10">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {view === "actions" ? (
              <button
                onClick={() => setView("list")}
                className="p-1 hover:bg-green-700 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="p-1 hover:bg-green-700 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <h1 className="text-lg font-bold">
              {view === "actions" && selectedChild
                ? selectedChild.full_name
                : "App do Professor"}
            </h1>
          </div>
          <Link href="/api/auth/signout" className="p-1 hover:bg-green-700 rounded">
            <LogOut className="h-5 w-5" />
          </Link>
        </div>
      </nav>

      <main className="p-4 pb-20">
        {view === "list" && (
          <>
            <p className="text-gray-600 mb-4">
              Selecione uma criança para registrar atividades:
            </p>
            <div className="space-y-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => selectChild(child)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Baby className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {child.full_name}
                      </p>
                      {child.allergies && (
                        <p className="text-xs text-red-500">
                          Alergias: {child.allergies}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
              {children.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma criança encontrada na sua turma
                </div>
              )}
            </div>
          </>
        )}

        {view === "actions" && selectedChild && (
          <div className="space-y-4">
            {selectedChild.allergies && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Atenção - Alergias</p>
                  <p className="text-sm text-red-600">
                    {selectedChild.allergies}
                  </p>
                </div>
              </div>
            )}

            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <p className="font-medium text-green-700">Registro salvo com sucesso!</p>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5" />
                <h2 className="font-semibold">Magic Input</h2>
              </div>
              <p className="text-sm text-purple-100 mb-3">
                Descreva a rotina em texto livre e a IA irá interpretar:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={magicInput}
                  onChange={(e) => setMagicInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && interpretText()}
                  placeholder="Ex: João comeu tudo e dormiu 1h30, estava feliz"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  disabled={interpreting}
                />
                <button
                  onClick={interpretText}
                  disabled={interpreting || !magicInput.trim()}
                  className="px-4 py-3 bg-white/20 rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {interpreting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {extractedData && (
              <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Dados Extraídos
                  </h3>
                  <button onClick={cancelExtracted} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  {extractedData.mood && (
                    <p><span className="text-gray-500">Humor:</span> {moodLabels[extractedData.mood] || extractedData.mood}</p>
                  )}
                  {extractedData.food_intake_pct !== null && (
                    <p><span className="text-gray-500">Alimentação:</span> {extractedData.food_intake_pct}%</p>
                  )}
                  {extractedData.sleep_minutes !== null && (
                    <p><span className="text-gray-500">Sono:</span> {extractedData.sleep_minutes} minutos</p>
                  )}
                  {extractedData.diaper && extractedData.diaper !== "NOT_APPLICABLE" && (
                    <p><span className="text-gray-500">Fralda:</span> {diaperLabels[extractedData.diaper] || extractedData.diaper}</p>
                  )}
                  {extractedData.notes && (
                    <p><span className="text-gray-500">Notas:</span> {extractedData.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={saveExtractedData}
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Confirmar e Salvar
                  </button>
                  <button
                    onClick={cancelExtracted}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h2 className="font-semibold text-gray-900 mb-3">Ou registre manualmente:</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/teacher/routine?child=${selectedChild.id}&type=meal`}
                className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition"
              >
                <div className="bg-orange-100 p-3 rounded-full">
                  <Utensils className="h-6 w-6 text-orange-600" />
                </div>
                <span className="font-medium text-gray-900">Alimentação</span>
              </Link>

              <Link
                href={`/teacher/routine?child=${selectedChild.id}&type=sleep`}
                className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition"
              >
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Moon className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-900">Sono</span>
              </Link>

              <Link
                href={`/teacher/routine?child=${selectedChild.id}&type=mood`}
                className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition"
              >
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Smile className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="font-medium text-gray-900">Humor</span>
              </Link>

              <Link
                href={`/teacher/routine?child=${selectedChild.id}&type=bathroom`}
                className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition"
              >
                <div className="bg-blue-100 p-3 rounded-full">
                  <Baby className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">Banheiro</span>
              </Link>
            </div>

            <h2 className="font-semibold text-gray-900 mt-6">
              Registros Especiais
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/teacher/incident?child=${selectedChild.id}`}
                className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition border-2 border-red-100"
              >
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <span className="font-medium text-gray-900">Incidente</span>
              </Link>

              <Link
                href={`/teacher/learning?child=${selectedChild.id}`}
                className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition border-2 border-green-100"
              >
                <div className="bg-green-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Aprendizado</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
