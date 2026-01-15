import Link from "next/link";
import { School, Users, GraduationCap, Shield } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <School className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Daycare AI</span>
          </div>
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Entrar
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Infraestrutura de Confiança para Creches
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema inteligente que reduz erros, garante segurança e gera
            relatórios sob demanda para pais e professores.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">App do Professor</h3>
            <p className="text-gray-600">
              Interface mobile-first para registrar atividades, humor,
              alimentação e aprendizados das crianças.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Portal dos Pais</h3>
            <p className="text-gray-600">
              Relatórios sob demanda com informações detalhadas sobre o dia do
              seu filho na creche.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Segurança Total</h3>
            <p className="text-gray-600">
              Sistema de 3 strikes, auditoria completa e acesso restrito para
              máxima proteção dos dados.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-gray-600 mb-8">
            Conheça nossa creche e matricule seu filho com a gente.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/enrollment"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              Matricule seu Filho
            </Link>
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Já sou Cliente
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">
          <p>Daycare AI System - Infraestrutura de Confiança</p>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
