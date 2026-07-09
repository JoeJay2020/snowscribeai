"use client";

import { useState } from "react";
import Link from "next/link";
import { ExportMenu } from "@/components/export/export-menu";
import {
  Save,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Coins,
  AlertCircle,
} from "lucide-react";
import type { ToolWorkspaceConfig } from "@/lib/tools/definitions";
import { loginHrefForPath } from "@/lib/auth/redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface ToolWorkspaceProps {
  tool: ToolWorkspaceConfig;
  initialCredits?: number;
}

export function ToolWorkspace({ tool, initialCredits }: ToolWorkspaceProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState(initialCredits);
  const [modelUsed, setModelUsed] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInputChange = (fieldId: string, value: string) => {
    setInputs((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleGenerate = async () => {
    setError("");
    setOutput("");

    for (const field of tool.fields) {
      if (field.required && !inputs[field.id]?.trim()) {
        setError(`${field.label} is required.`);
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id, inputs }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError(
            "Your session expired. Please sign in again to use this tool."
          );
          return;
        }
        if (data.code === "INSUFFICIENT_CREDITS") {
          setError(`Not enough credits. This tool requires ${tool.creditCost} credits.`);
        } else if (data.code === "DAILY_LIMIT") {
          setError("Daily limit reached. Upgrade your plan for more requests.");
        } else {
          const base = data.error ?? "Generation failed";
          setError(
            data.refunded
              ? `${base} Your credits were refunded.`
              : base
          );
        }
        return;
      }

      setOutput(data.content);
      setCredits(data.creditsRemaining);
      setModelUsed(data.modelUsed);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Input</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Coins className="h-3 w-3" />
              {tool.creditCost} credits
            </Badge>
          </div>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tool.fields.map((field) =>
            field.type === "textarea" ? (
              <Textarea
                key={field.id}
                id={field.id}
                label={field.label}
                placeholder={field.placeholder}
                value={inputs[field.id] ?? ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              />
            ) : field.type === "select" ? (
              <div key={field.id} className="space-y-1.5">
                <label htmlFor={field.id} className="text-sm font-medium">
                  {field.label}
                </label>
                <select
                  id={field.id}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={inputs[field.id] ?? ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Input
                key={field.id}
                id={field.id}
                label={field.label}
                placeholder={field.placeholder}
                value={inputs[field.id] ?? ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              />
            )
          )}

          {error && (
            <div className="flex flex-col gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
              {error.includes("session expired") && (
                <Link href={loginHrefForPath(`/tools/${tool.id}`)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign in again
                  </Button>
                </Link>
              )}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate ({tool.creditCost} credits)
              </>
            )}
          </Button>

          {credits !== undefined && (
            <p className="text-center text-xs text-muted-foreground">
              Balance: {credits} credits remaining
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Output</CardTitle>
            {output && (
              <div className="flex items-center gap-2">
                <ExportMenu title={tool.name} content={output} />
                <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy">
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/documents", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: tool.name,
                          content: `<p>${output.replace(/\n/g, "</p><p>")}</p>`,
                        }),
                      });
                      const data = await response.json();
                      if (!response.ok) {
                        setError(data.error ?? "Could not save to workspace.");
                        return;
                      }
                      if (data.id) window.location.href = `/workspace/${data.id}`;
                    } catch {
                      setError("Could not save to workspace. Please try again.");
                    }
                  }}
                >
                  <Save className="h-3.5 w-3.5" />
                  Save to Workspace
                </Button>
              </div>
            )}
          </div>
          {modelUsed && (
            <CardDescription>Generated with {modelUsed}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                AI is writing your {tool.name.toLowerCase()}...
              </p>
              <p className="text-xs text-muted-foreground">
                This may take 30-90 seconds for complex outputs.
              </p>
            </div>
          ) : output ? (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed max-h-[600px] overflow-y-auto">
              {output}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 mb-3 opacity-40" />
              <p className="text-sm">Fill in the form and click Generate</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
