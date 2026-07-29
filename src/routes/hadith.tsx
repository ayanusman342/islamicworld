import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HADITHS, HADITH_COLLECTIONS } from "@/data/hadith";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/hadith")({
  head: () => ({
    meta: [
      { title: "Authentic Hadith — Islamic World" },
      {
        name: "description",
        content:
          "Selected authentic hadith from Sahih al-Bukhari, Sahih Muslim, Nawawi's 40, and Tirmidhi — with Arabic, English and full references.",
      },
      { property: "og:title", content: "Authentic Hadith — Islamic World" },
    ],
  }),
  component: HadithPage,
});

function HadithPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<string>("All");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return HADITHS.filter((h) => {
      if (tab !== "All" && h.collection !== tab) return false;
      if (!s) return true;
      return (
        h.english.toLowerCase().includes(s) ||
        h.narrator.toLowerCase().includes(s) ||
        h.collection.toLowerCase().includes(s)
      );
    });
  }, [q, tab]);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-widest gold-text">
            Al-Hadīth ash-Sharīf
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">
            Authentic Hadith
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            A curated selection of authentic narrations with full references.
            Every hadith cites its collection and number so you can verify.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 rounded-full"
              placeholder="Search hadith…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
            {HADITH_COLLECTIONS.map((c) => (
              <TabsTrigger
                key={c}
                value={c}
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filtered.map((h) => (
            <Card key={h.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="rounded-full">
                    {h.collection} #{h.number}
                  </Badge>
                  <Badge className="rounded-full bg-gold text-gold-foreground hover:bg-gold">
                    {h.grade}
                  </Badge>
                </div>
                <p className="font-arabic text-2xl leading-[2.2] text-right">
                  {h.arabic}
                </p>
                <div className="ornate-divider my-3" />
                <p className="text-muted-foreground leading-relaxed">
                  {h.english}
                </p>
                <p className="text-xs text-muted-foreground/80 mt-3">
                  Narrated by {h.narrator} · {h.book}
                </p>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              No hadith found.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
