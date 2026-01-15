"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Heart, Clock, ChevronRight } from "lucide-react";

interface Child {
  id: string;
  full_name: string;
  birth_date: string;
  classroom: string;
  photo_url: string | null;
  relationship: string;
  is_primary: boolean;
}

export default function ParentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "PARENT" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
        router.push("/dashboard");
      } else {
        fetchChildren();
      }
    }
  }, [status, session, router]);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/parent/children");
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

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    if (years < 1) {
      return `${months + years * 12} meses`;
    }
    return `${years} ano${years > 1 ? "s" : ""}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <nav className="bg-purple-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1 hover:bg-purple-700 rounded">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Portal dos Pais</h1>
              <p className="text-purple-200 text-sm">
                Acompanhe o dia do seu filho
              </p>
            </div>
          </div>
          <Heart className="h-6 w-6 text-purple-200" />
        </div>
      </nav>

      <main className="p-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Olá, {session?.user?.name?.split(" ")[0] || "Responsável"}!
          </h2>
          <p className="text-gray-500">
            Selecione uma criança para ver o relatório do dia
          </p>
        </div>

        {children.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhuma criança vinculada
            </h3>
            <p className="text-gray-500">
              Entre em contato com a administração para vincular seus filhos à sua
              conta.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/parent/child/${child.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-inner">
                    {child.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {child.full_name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {calculateAge(child.birth_date)}
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {child.classroom}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          Dados atualizados em tempo real
        </div>
      </main>
    </div>
  );
}
