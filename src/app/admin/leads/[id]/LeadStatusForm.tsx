"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

const statusOptions = [
  { value: "NEW_LEAD", label: "Novo Lead" },
  { value: "CONTACTED", label: "Contatado" },
  { value: "VISIT_SCHEDULED", label: "Visita Agendada" },
  { value: "VISITED", label: "Visitou" },
  { value: "WAITLISTED", label: "Lista de Espera" },
  { value: "ENROLLED", label: "Matriculado" },
  { value: "REJECTED", label: "Não Matriculou" },
];

interface LeadStatusFormProps {
  leadId: string;
  currentStatus: string;
}

export default function LeadStatusForm({
  leadId,
  currentStatus,
}: LeadStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: notes || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar status");
      }

      setSuccess(true);
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <Check className="h-4 w-4" />
          Status atualizado com sucesso!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status do Lead
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adicionar Nota (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
          placeholder="Ex: Ligou em 15/01, interessado na turma de Maternal I..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Atualizando...
          </>
        ) : (
          "Atualizar Status"
        )}
      </button>
    </form>
  );
}
