"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Email ou senha inválidos. Use email @unicentroma.edu.br — aluno: senha = CPF."
        );
      } else {
        router.refresh();
        // Pegar sessão após login para redirecionar admin ao painel admin
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        const role = session?.user?.role;
        if (
          role === "ADMIN" ||
          role === "SUPER" ||
          role === "ADMINISTRADOR" ||
          role === "SUPER_ADMIN"
        ) {
          router.push("/admin");
        } else {
          router.push("/aluno");
        }
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Esquerda: foto full-height com overlay (dropar public/login-bg.jpg; fallback gradiente da marca) */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-3/5 bg-slate-900 bg-cover bg-center relative flex-col justify-end p-12"
        style={{ backgroundImage: "url('/futu.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-slate-900/80 to-slate-950/90" />
        <div className="relative text-white max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Compromisso com o presente,<br />transformando o futuro.
          </h2>
          <p className="mt-3 text-white/70">
            Plataforma de ensino da UNICENTROMA — aulas, atividades e tutor com IA.
          </p>
        </div>
      </div>

      {/* Direita: form */}
      <div className="flex-1 flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="UNICENTROMA" className="h-52 w-auto" />
            <h1 className="mt-6 text-xl font-semibold text-foreground">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground text-center">
              Acesso com email institucional @unicentroma.edu.br
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@unicentroma.edu.br"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-800 caret-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:caret-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Aluno: CPF · Usuário: sua senha"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-11 text-gray-800 caret-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:caret-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Entrando...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Aluno: email @unicentroma.edu.br e senha = CPF.
            <br />
            Equipe: email institucional e senha cadastrada.
          </p>
        </div>
      </div>
    </div>
  );
}
