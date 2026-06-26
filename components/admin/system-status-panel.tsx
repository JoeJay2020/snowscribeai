"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ServiceState = "healthy" | "degraded" | "down" | "not_configured";

interface ServiceStatus {
  name: string;
  state: ServiceState;
  details: string;
}

interface SystemStatusResponse {
  overall: ServiceState;
  timestamp: string;
  services: ServiceStatus[];
}

export function AdminSystemStatusPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);

  async function loadStatus() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/system-status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load status");
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load status.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">System Status</CardTitle>
        <Button variant="outline" size="sm" onClick={() => void loadStatus()} disabled={loading}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : status ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusIcon state={status.overall} />
              <Badge variant={status.overall === "healthy" ? "success" : "secondary"}>
                Overall: {status.overall}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated {new Date(status.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              {status.services.map((service) => (
                <div key={service.name} className="rounded-md border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <StatusIcon state={service.state} />
                    <p className="font-medium capitalize">{service.name}</p>
                    <Badge variant={service.state === "healthy" ? "success" : "secondary"}>
                      {service.state}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{service.details}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Status unavailable.</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusIcon({ state }: { state: ServiceState }) {
  if (state === "healthy") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (state === "down") return <XCircle className="h-4 w-4 text-destructive" />;
  return <AlertTriangle className="h-4 w-4 text-amber-500" />;
}
