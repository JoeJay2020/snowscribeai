"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { DEFAULT_MODELS } from "@/lib/ai/models";
import type { ModelConfig } from "@/types/ai";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AdminModelsPanel() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/models")
      .then((res) => res.json())
      .then((data) => setModels(data.models ?? DEFAULT_MODELS))
      .catch(() => setModels(DEFAULT_MODELS))
      .finally(() => setLoading(false));
  }, []);

  const toggleModel = (id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/models", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models }),
      });
      if (response.ok) {
        setMessage("Models saved successfully");
      } else {
        setMessage("Failed to save — admin access required");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const tiers = ["simple", "medium", "complex"] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Model Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Enable/disable models and set routing priorities per tier
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {message && (
        <p className="text-sm text-center text-muted-foreground">{message}</p>
      )}

      {tiers.map((tier) => (
        <Card key={tier}>
          <CardHeader>
            <CardTitle className="text-base capitalize flex items-center gap-2">
              {tier} Tier
              <Badge variant="secondary">
                {models.filter((m) => m.tier === tier && m.enabled).length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {models
                .filter((m) => m.tier === tier)
                .sort((a, b) => a.priority - b.priority)
                .map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{model.displayName}</p>
                      <p className="text-xs text-muted-foreground">{model.modelId}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Priority {model.priority} · ${model.costPer1kInput}/1k in · ${model.costPer1kOutput}/1k out
                      </p>
                    </div>
                    <button
                      onClick={() => toggleModel(model.id)}
                      className="text-primary"
                      aria-label={`Toggle ${model.displayName}`}
                    >
                      {model.enabled ? (
                        <ToggleRight className="h-6 w-6" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
