"use client";

import { useState } from "react";
import { analyzeText } from "@/lib/utilities/text-tools";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function WordCounterTool() {
  const [text, setText] = useState("");
  const stats = analyzeText(text);

  const metrics = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading time", value: `${stats.readingTimeMinutes} min` },
    { label: "Readability", value: stats.readabilityLabel },
    { label: "Grade level", value: stats.readabilityGrade },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste or type your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[300px]"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-xl font-bold mt-1">{m.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Free tool — no credits required. Runs locally in your browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
