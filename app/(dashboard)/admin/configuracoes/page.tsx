"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Settings, Save, Loader2, Check } from "lucide-react";
import Link from "next/link";

type Provider = "anthropic" | "openai" | "";

interface SettingsForm {
  provider: Provider;
  anthropicApiKey: string;
  openaiApiKey: string;
  anthropicModel: string;
  openaiModel: string;
}

const defaultForm: SettingsForm = {
  provider: "",
  anthropicApiKey: "",
  openaiApiKey: "",
  anthropicModel: "claude-sonnet-4-20250514",
  openaiModel: "gpt-4o-mini",
};

export default function ConfiguracoesPage() {
  const [form, setForm] = useState<SettingsForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Não autorizado");
        return res.json();
      })
      .then((data) => {
        setForm({
          provider: data.provider || "",
          anthropicApiKey: data.anthropicApiKey || "",
          openaiApiKey: data.openaiApiKey || "",
          anthropicModel: data.anthropicModel || defaultForm.anthropicModel,
          openaiModel: data.openaiModel || defaultForm.openaiModel,
        });
      })
      .catch(() => setError("Erro ao carregar configurações"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: form.provider || null,
          anthropicApiKey: form.anthropicApiKey || null,
          openaiApiKey: form.openaiApiKey || null,
          anthropicModel: form.anthropicModel || null,
          openaiModel: form.openaiModel || null,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground text-sm">
            Admin
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Configurações</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings size={28} />
          Configurações do sistema
        </h1>
        <p className="text-muted-foreground mt-1 mb-6">
          Configure o provedor de IA do Professor Virtual. As chaves ficam salvas no banco de dados (não use .env).
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <Check size={18} />
            Configurações salvas com sucesso.
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">Professor Virtual (IA)</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Provedor de IA
                </label>
                <select
                  value={form.provider}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, provider: e.target.value as Provider }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary/300"
                >
                  <option value="">Selecione...</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Se não definir, o sistema usa o primeiro provedor com chave preenchida.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Chave API Anthropic (Claude)
                </label>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={form.anthropicApiKey}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, anthropicApiKey: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary/300 font-mono text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Obtenha em{" "}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    console.anthropic.com
                  </a>
                  . Deixe em branco para não alterar a chave atual.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Modelo Anthropic (opcional)
                </label>
                <input
                  type="text"
                  placeholder="claude-sonnet-4-20250514"
                  value={form.anthropicModel}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, anthropicModel: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary/300"
                />
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Chave API OpenAI (GPT)
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={form.openaiApiKey}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, openaiApiKey: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary/300 font-mono text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Obtenha em{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    platform.openai.com/api-keys
                  </a>
                  . Deixe em branco para não alterar a chave atual.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Modelo OpenAI (opcional)
                </label>
                <input
                  type="text"
                  placeholder="gpt-4o-mini"
                  value={form.openaiModel}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, openaiModel: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary/300"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
        </form>
      </div>
    </div>
  );
}
