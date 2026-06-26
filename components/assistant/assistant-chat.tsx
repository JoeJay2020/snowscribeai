"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquarePlus, Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type UploadedAttachment = {
  name: string;
  content: string; // base64 payload
  mimeType: string;
  size: number;
};

type AssistantThread = {
  id: string;
  title: string;
  updatedAt: string;
};

const MAX_FILES = 3;
const MAX_FILE_BYTES = 600_000;

function starterMessage(): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content:
      "Hi, I am your SnowScribe Assistant. Ask me anything about your research, methodology, structure, or writing improvements. You can also attach PDF, DOCX, and text files for context.",
  };
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function AssistantChat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [error, setError] = useState("");
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [threads, setThreads] = useState<AssistantThread[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage()]);

  const canSend = useMemo(
    () => prompt.trim().length >= 5 && !loading,
    [prompt, loading]
  );

  useEffect(() => {
    fetch("/api/assistant/threads")
      .then((res) => res.json())
      .then((data) => {
        const loaded = (data.threads ?? []) as AssistantThread[];
        setThreads(loaded);
        if (loaded[0]?.id) {
          void loadThread(loaded[0].id);
        }
      })
      .catch(() => {
        setThreads([]);
      })
      .finally(() => setLoadingThreads(false));
  }, []);

  async function loadThread(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/assistant/threads/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load thread");
      setThreadId(id);
      const loadedMessages = (data.messages ?? []) as ChatMessage[];
      setMessages(
        loadedMessages.length > 0
          ? loadedMessages.map((msg) => ({
              id: msg.id ?? crypto.randomUUID(),
              role: msg.role,
              content: msg.content,
            }))
          : [starterMessage()]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat history.");
    }
  }

  function startNewThread() {
    setThreadId(null);
    setMessages([starterMessage()]);
    setPrompt("");
    setAttachments([]);
    setError("");
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");

    const selected = Array.from(files);
    const availableSlots = MAX_FILES - attachments.length;
    if (availableSlots <= 0) {
      setError(`You can attach up to ${MAX_FILES} files.`);
      return;
    }

    const nextFiles = selected.slice(0, availableSlots);
    const parsed: UploadedAttachment[] = [];

    for (const file of nextFiles) {
      const isSupported =
        file.type.startsWith("text/") ||
        /(pdf|officedocument\.wordprocessingml\.document)/i.test(file.type) ||
        /\.(txt|md|csv|json|tex|rtf|pdf|docx)$/i.test(file.name);

      if (!isSupported) {
        setError("Unsupported file type. Use PDF, DOCX, or text-based files.");
        continue;
      }

      if (file.size > MAX_FILE_BYTES) {
        setError(`"${file.name}" is too large. Max size is 600KB.`);
        continue;
      }

      parsed.push({
        name: file.name,
        content: await fileToBase64(file),
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      });
    }

    if (parsed.length > 0) {
      setAttachments((prev) => [...prev, ...parsed].slice(0, MAX_FILES));
    }
  }

  function removeAttachment(name: string) {
    setAttachments((prev) => prev.filter((item) => item.name !== name));
  }

  async function sendMessage() {
    const message = prompt.trim();
    if (message.length < 5 || loading) return;

    setLoading(true);
    setError("");
    setPrompt("");

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: message },
    ]);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: threadId ?? undefined,
          message,
          attachments: attachments.map((file) => ({
            name: file.name,
            content: file.content,
            mimeType: file.mimeType,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Assistant request failed");
      }

      setCreditsRemaining(data.creditsRemaining ?? null);
      if (data.threadId) {
        setThreadId(data.threadId);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content || "No response received.",
        },
      ]);
      setAttachments([]);

      const threadsRes = await fetch("/api/assistant/threads");
      const threadsData = await threadsRes.json();
      setThreads((threadsData.threads ?? []) as AssistantThread[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chat History</CardTitle>
          <Button variant="outline" size="sm" onClick={startNewThread}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingThreads ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : threads.length === 0 ? (
            <p className="text-xs text-muted-foreground">No saved chats yet.</p>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => void loadThread(thread.id)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                  thread.id === threadId ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <p className="line-clamp-1 font-medium">{thread.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(thread.updatedAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>AI Research Assistant</CardTitle>
            <CardDescription>
              Ask follow-up questions, improve drafts, and get research guidance.
            </CardDescription>
          </div>
          <Badge variant="secondary">12 credits / response</Badge>
        </div>
        {creditsRemaining !== null ? (
          <p className="text-xs text-muted-foreground">Credits remaining: {creditsRemaining}</p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-[420px] overflow-y-auto rounded-lg border border-border bg-muted/20 p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-background border border-border"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            {loading ? (
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a research question or paste a paragraph to improve..."
            className="min-h-[120px]"
          />

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="file"
                className="hidden"
                multiple
                accept=".txt,.md,.csv,.json,.tex,.rtf,.pdf,.docx,text/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => void handleFileUpload(e.target.files)}
              />
              <span className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm">
                <Paperclip className="mr-2 h-4 w-4" />
                Attach files
              </span>
            </label>

            {attachments.map((file) => (
              <Badge key={file.name} variant="outline" className="gap-1">
                {file.name}
                <button
                  type="button"
                  className="inline-flex"
                  onClick={() => removeAttachment(file.name)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-end">
          <Button onClick={() => void sendMessage()} disabled={!canSend}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
