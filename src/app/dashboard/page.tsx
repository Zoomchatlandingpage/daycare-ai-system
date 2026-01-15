import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { GraduationCap, Users, Settings, LogOut } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Daycare AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session.user.name}</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm font-medium">
              {role}
            </span>
            <Link
              href="/api/auth/signout"
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Bem-vindo ao Dashboard
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {(role === "TEACHER" || role === "ADMIN" || role === "SUPER_ADMIN") && (
            <Link
              href="/teacher"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">App do Professor</h3>
              <p className="text-gray-500 text-sm">
                Registrar atividades e rotina das crianças
              </p>
            </Link>
          )}

          {(role === "PARENT" || role === "ADMIN" || role === "SUPER_ADMIN") && (
            <Link
              href="/parent"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Portal dos Pais</h3>
              <p className="text-gray-500 text-sm">
                Ver relatórios dos seus filhos
              </p>
            </Link>
          )}

          {(role === "ADMIN" || role === "SUPER_ADMIN") && (
            <Link
              href="/admin"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Administração</h3>
              <p className="text-gray-500 text-sm">
                Gerenciar usuários e configurações
              </p>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
