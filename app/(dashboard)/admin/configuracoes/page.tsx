"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Save, Loader2, Check } from "lucide-react";

interface SettingsForm {
  baseUrl: string;
  apiKey: string;
  model: string;
}

const defaultForm: SettingsForm = {
  baseUrl: "http://localhost:20128/v1",
  apiKey: "",
  model: "auto",
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
          baseUrl: data.baseUrl || defaultForm.baseUrl,
          apiKey: data.apiKey || "",
          model: data.model || defaultForm.model,
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
          baseUrl: form.baseUrl || null,
          apiKey: form.apiKey || null,
          model: form.model || null,
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
          O Professor Virtual usa o{" "}
          <a
            href="https://github.com/diegosouzapw/OmniRoute"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            OmniRoute
          </a>{" "}
          como motor — um gateway OpenAI-compatible que roteia entre 291+ provedores
          (90+ com free tier). As configs ficam no banco (têm prioridade sobre o .env).
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
              Professor Virtual (OmniRoute)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Base URL do gateway
                </label>
                <input
                  type="text"
                  placeholder="http://localhost:20128/v1"
                  value={form.baseUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, baseUrl: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary/300 font-mono text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint OpenAI-compatible do OmniRoute. Suba com{" "}
                  <code className="rounded bg-muted px-1">npm i -g omniroute</code>{" "}
                  (localhost:20128).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Token de acesso
                </label>
                <input
                  type="password"
                  placeholder="token do dashboard do OmniRoute"
                  value={form.apiKey}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, apiKey: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary/300 font-mono text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pegue no dashboard do OmniRoute. Deixe em branco para não alterar o token atual.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  placeholder="auto"
                  value={form.model}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, model: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary/300 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <code className="rounded bg-muted px-1">auto</code> deixa o OmniRoute
                  rotear sozinho. Para usar só IA grátis, selecione a estratégia
                  <strong> Free</strong> (ou cost-optimized) no dashboard dele.
                </p>
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
