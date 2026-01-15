import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, Baby, Calendar, FileText } from "lucide-react";
import LeadStatusForm from "./LeadStatusForm";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
  });

  if (!lead) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/leads" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Detalhes do Lead
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-indigo-100 p-3 rounded-full">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {lead.parent_name}
              </h2>
              <p className="text-gray-500">
                Cadastrado em {new Date(lead.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Contato</h3>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:underline">
                  {lead.phone}
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Criança</h3>
              {lead.child_name ? (
                <>
                  <div className="flex items-center gap-3">
                    <Baby className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{lead.child_name}</span>
                  </div>
                  {lead.child_age !== null && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{lead.child_age} anos</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Informações não preenchidas</p>
              )}
            </div>
          </div>

          {lead.notes && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 border-b pb-2 mb-3">Observações</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <FileText className="h-5 w-5 text-gray-400 mb-2" />
                <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Atualizar Status</h3>
            <LeadStatusForm leadId={lead.id} currentStatus={lead.status} />
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/admin/leads"
            className="text-gray-500 hover:text-gray-700"
          >
            ← Voltar para lista de leads
          </Link>
        </div>
      </main>
    </div>
  );
}
