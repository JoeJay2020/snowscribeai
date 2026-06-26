"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Severity = "info" | "warning" | "error" | "critical";

interface IncidentEvent {
  id: string;
  type: string;
  source: string;
  severity: Severity;
  message: string;
  createdAt: string;
  userId?: string | null;
}

export function AdminIncidentFeedPanel() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/observability/events");
      const data = await res.json();
      setEvents((data.events ?? []) as IncidentEvent[]);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchSeverity =
        severityFilter === "all" || event.severity === severityFilter;
      const matchQuery =
        q.length === 0 ||
        event.type.toLowerCase().includes(q) ||
        event.source.toLowerCase().includes(q) ||
        event.message.toLowerCase().includes(q);
      return matchSeverity && matchQuery;
    });
  }, [events, query, severityFilter]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base">Incident Feed</CardTitle>
        <Button variant="outline" size="sm" onClick={() => void loadEvents()} disabled={loading}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search incidents by type/source/message..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "critical", "error", "warning", "info"] as const).map((level) => (
              <Button
                key={level}
                size="sm"
                variant={severityFilter === level ? "default" : "outline"}
                onClick={() => setSeverityFilter(level)}
                className="capitalize"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No incidents found for current filters.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((event) => (
              <div key={event.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium">{event.type}</p>
                  <Badge variant={severityToBadge(event.severity)}>{event.severity}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Source: {event.source}</p>
                <p className="mt-1 text-sm">{event.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function severityToBadge(severity: Severity): "success" | "destructive" | "secondary" {
  if (severity === "info") return "success";
  if (severity === "warning") return "secondary";
  return "destructive";
}
