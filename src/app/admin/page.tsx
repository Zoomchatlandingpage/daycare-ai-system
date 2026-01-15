"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Baby,
  GraduationCap,
  BookOpen,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

interface Stats {
  children: number;
  teachers: number;
  parents: number;
  newLeads: number;
  todayLogs: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        router.push("/dashboard");
      } else {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              Painel de Administração
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Baby className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.children || 0}
                </p>
                <p className="text-gray-500 text-sm">Crianças</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.teachers || 0}
                </p>
                <p className="text-gray-500 text-sm">Professores</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.parents || 0}
                </p>
                <p className="text-gray-500 text-sm">Pais</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.newLeads || 0}
                </p>
                <p className="text-gray-500 text-sm">Novos Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-3 rounded-lg">
                <ClipboardList className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.todayLogs || 0}
                </p>
                <p className="text-gray-500 text-sm">Registros Hoje</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Gerenciamento
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          <Link
            href="/admin/children"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Baby className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Crianças</h3>
            <p className="text-gray-500 text-sm">
              Cadastrar e gerenciar crianças
            </p>
          </Link>

          <Link
            href="/admin/teachers"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Professores</h3>
            <p className="text-gray-500 text-sm">
              Gerenciar equipe de professores
            </p>
          </Link>

          <Link
            href="/admin/parents"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Pais</h3>
            <p className="text-gray-500 text-sm">
              Gerenciar pais e responsáveis
            </p>
          </Link>

          <Link
            href="/admin/knowledge"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Base de Conhecimento</h3>
            <p className="text-gray-500 text-sm">
              Documentos para os agentes de IA
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
