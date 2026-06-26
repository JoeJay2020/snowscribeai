"use client";

import { useState } from "react";
import { cleanText, convertCase, type CaseType } from "@/lib/utilities/text-tools";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function TextCleanerTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-lg">Input</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[250px]" placeholder="Paste messy text..." />
          <Button className="mt-3 w-full" onClick={() => setOutput(cleanText(input))}>Clean Text</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-lg">Cleaned Output</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={output} readOnly className="min-h-[250px]" />
        </CardContent>
      </Card>
    </div>
  );
}

export function CaseConverterTool() {
  const [input, setInput] = useState("");
  const [caseType, setCaseType] = useState<CaseType>("title");

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Case Converter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[150px]" placeholder="Enter text..." />
        <div className="flex flex-wrap gap-2">
          {(["upper", "lower", "title", "sentence"] as CaseType[]).map((c) => (
            <Button key={c} variant={caseType === c ? "default" : "outline"} size="sm" onClick={() => setCaseType(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Button>
          ))}
        </div>
        <Textarea value={convertCase(input, caseType)} readOnly className="min-h-[150px]" />
      </CardContent>
    </Card>
  );
}
