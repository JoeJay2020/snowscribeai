"use client";

import { FileDown, FileText, FileType } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExportMenuProps {
  title: string;
  content: string;
  disabled?: boolean;
}

export function ExportMenu({ title, content, disabled }: ExportMenuProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: "pdf" | "docx" | "markdown") => {
    setLoading(format);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, format }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "markdown" ? "md" : format;
      a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || !!loading}
        onClick={() => handleExport("markdown")}
        className="gap-1 text-xs"
      >
        <FileText className="h-3.5 w-3.5" />
        {loading === "markdown" ? "..." : "MD"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || !!loading}
        onClick={() => handleExport("docx")}
        className="gap-1 text-xs"
      >
        <FileType className="h-3.5 w-3.5" />
        {loading === "docx" ? "..." : "DOCX"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || !!loading}
        onClick={() => handleExport("pdf")}
        className="gap-1 text-xs"
      >
        <FileDown className="h-3.5 w-3.5" />
        {loading === "pdf" ? "..." : "PDF"}
      </Button>
    </div>
  );
}
