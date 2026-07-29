import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Islamic Assistant — Islamic World" },
      {
        name: "description",
        content:
          "Ask questions and get answers grounded in the Qur'an and authentic Hadith, with citations.",
      },
      { property: "og:title", content: "AI Islamic Assistant" },
    ],
  }),
  component: AssistantPage,
});

const SUGGESTIONS = [
  "What are the conditions of a valid salah?",
  "Summarise Surah Al-Fatiha with references.",
  "A morning routine of azkar with sources.",
  "What does Islam say about kindness to parents?",
];

function AssistantPage() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => console.error(e),
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const submit = (text: string) => {
    const v = text.trim();
    if (!v || isBusy) return;
    void sendMessage({ text: v });
    setInput("");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-widest gold-text inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI Study Assistant
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">
            Ask, and be guided.
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Answers are grounded in the Qur'an and authentic Hadith. This
            assistant does not issue fatwas — for personal legal or medical
            matters, please consult a qualified scholar.
          </p>
        </header>

        <Card className="glass">
          <CardContent className="p-0">
            <div
              ref={scrollRef}
              className="max-h-[60vh] min-h-[40vh] overflow-y-auto p-5 space-y-4"
            >
              {messages.length === 0 && (
                <div className="grid sm:grid-cols-2 gap-2 py-6">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="text-left rounded-2xl border p-4 hover:border-primary/50 hover:bg-accent/40 transition-colors"
                    >
                      <div className="text-xs uppercase tracking-widest gold-text mb-1">
                        Try
                      </div>
                      <div className="text-sm">{s}</div>
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m: UIMessage) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {isBusy && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="border-t p-3 flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Qur'an, hadith, prayer, duas…"
                className="rounded-full"
                disabled={isBusy}
              />
              <Button
                type="submit"
                className="rounded-full"
                disabled={isBusy || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  const isUser = message.role === "user";
  return (
    <div className={"flex " + (isUser ? "justify-end" : "justify-start")}>
      <div
        className={
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed " +
          (isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border rounded-bl-sm")
        }
      >
        {text}
      </div>
    </div>
  );
}
