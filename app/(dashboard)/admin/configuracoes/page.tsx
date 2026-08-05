"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Save, Loader2, Check } from "lucide-react";

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
      <>
        <Header title="Configurações" subtitle="Sistema e integrações" />
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Configurações" subtitle="Sistema e integrações" />
      <div className="space-y-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure o provedor de IA do Professor Virtual. As chaves ficam salvas no banco de dados (não use .env).
        </p>

        {error && (
          <div className="rounded-xl border border-error-500/20 bg-error-50 p-4 text-sm text-error-600">
            {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-success-500/20 bg-success-50 p-4 text-sm text-success-600">
            <Check size={18} />
            Configurações salvas com sucesso.
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">
              Professor Virtual (IA)
            </h2>

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

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
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
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
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
    </>
  );
}
