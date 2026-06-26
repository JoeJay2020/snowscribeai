"use client";

import { useState } from "react";
import {
  formatAPA,
  formatHarvard,
  formatIEEE,
  formatChicago,
  type CitationInput,
} from "@/lib/utilities/text-tools";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CitationFormatterTool() {
  const [citation, setCitation] = useState<CitationInput>({
    authors: "",
    year: "",
    title: "",
    source: "",
    url: "",
  });
  const [style, setStyle] = useState<"APA" | "Harvard" | "IEEE" | "Chicago">("APA");
  const [output, setOutput] = useState("");

  const handleFormat = () => {
    const formatters = { APA: formatAPA, Harvard: formatHarvard, IEEE: formatIEEE, Chicago: formatChicago };
    setOutput(formatters[style](citation));
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Citation Formatter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Author(s)" value={citation.authors} onChange={(e) => setCitation({ ...citation, authors: e.target.value })} placeholder="Smith, J. & Jones, A." />
          <Input label="Year" value={citation.year} onChange={(e) => setCitation({ ...citation, year: e.target.value })} placeholder="2024" />
          <Input label="Title" value={citation.title} onChange={(e) => setCitation({ ...citation, title: e.target.value })} placeholder="Article or book title" className="sm:col-span-2" />
          <Input label="Source (journal, publisher)" value={citation.source ?? ""} onChange={(e) => setCitation({ ...citation, source: e.target.value })} placeholder="Journal of Research" />
          <Input label="URL or DOI" value={citation.url ?? ""} onChange={(e) => setCitation({ ...citation, url: e.target.value })} placeholder="https://..." />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["APA", "Harvard", "IEEE", "Chicago"] as const).map((s) => (
            <Button key={s} variant={style === s ? "default" : "outline"} size="sm" onClick={() => setStyle(s)}>{s}</Button>
          ))}
        </div>
        <Button onClick={handleFormat} className="w-full">Format Citation</Button>
        {output && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">{output}</div>
        )}
        <p className="text-xs text-muted-foreground">Free tool — no credits required.</p>
      </CardContent>
    </Card>
  );
}
