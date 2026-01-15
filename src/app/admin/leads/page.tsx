import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Users, Phone, Mail, Baby, Clock } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string }> = {
  NEW_LEAD: { label: "Novo Lead", color: "bg-blue-100 text-blue-800" },
  CONTACTED: { label: "Contatado", color: "bg-yellow-100 text-yellow-800" },
  VISIT_SCHEDULED: { label: "Visita Agendada", color: "bg-purple-100 text-purple-800" },
  VISITED: { label: "Visitou", color: "bg-green-100 text-green-800" },
  WAITLISTED: { label: "Lista de Espera", color: "bg-orange-100 text-orange-800" },
  ENROLLED: { label: "Matriculado", color: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Não Matriculou", color: "bg-gray-100 text-gray-800" },
};

export default async function AdminLeadsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const leads = await prisma.lead.findMany({
    orderBy: { created_at: "desc" },
  });

  const stats = {
    total: leads.length,
    newLeads: leads.filter((l) => l.status === "NEW_LEAD").length,
    contacted: leads.filter((l) => l.status === "CONTACTED").length,
    enrolled: leads.filter((l) => l.status === "ENROLLED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Leads de Matrícula
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total de Leads</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Novos (aguardando)</p>
            <p className="text-2xl font-bold text-blue-600">{stats.newLeads}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Contatados</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Matriculados</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.enrolled}</p>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum lead ainda
            </h3>
            <p className="text-gray-500">
              Os leads aparecerão aqui quando famílias se cadastrarem pela página de matrícula.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Responsável
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Contato
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Criança
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Data
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => {
                  const statusInfo = statusLabels[lead.status] || {
                    label: lead.status,
                    color: "bg-gray-100 text-gray-800",
                  };

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {lead.parent_name}
                        </p>
                        {lead.source && (
                          <p className="text-xs text-gray-500">{lead.source}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
                          >
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
                          >
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {lead.child_name ? (
                          <div className="flex items-center gap-1">
                            <Baby className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {lead.child_name}
                              {lead.child_age !== null && ` (${lead.child_age} anos)`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
