import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DUAS, DUA_CATEGORIES } from "@/data/duas";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/duas")({
  head: () => ({
    meta: [
      { title: "Duas & Azkar — Islamic World" },
      {
        name: "description",
        content:
          "Authentic morning & evening azkar, prayer, food, travel and Ramadan duas — with Arabic, transliteration, translation and references.",
      },
      { property: "og:title", content: "Duas & Azkar — Islamic World" },
    ],
  }),
  component: DuasPage,
});

function DuasPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return DUAS.filter((d) => {
      if (cat !== "All" && d.category !== cat) return false;
      if (!s) return true;
      return (
        d.title.toLowerCase().includes(s) ||
        d.translation.toLowerCase().includes(s)
      );
    });
  }, [q, cat]);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-widest gold-text">
            Ad-Duʿāʾ wa'l-Adhkār
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">
            Duas & Azkar
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Prophetic duas for every moment of the day, with Arabic,
            transliteration, translation, and hadith references.
          </p>
        </header>

        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 rounded-full"
            placeholder="Search duas…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Tabs value={cat} onValueChange={setCat} className="mb-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
            <TabsTrigger
              value="All"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All
            </TabsTrigger>
            {DUA_CATEGORIES.map((c) => (
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
          {filtered.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-display text-xl">{d.title}</div>
                  <Badge variant="secondary" className="rounded-full">
                    {d.category}
                  </Badge>
                </div>
                <p className="font-arabic text-2xl leading-[2.2] text-right">
                  {d.arabic}
                </p>
                {d.transliteration && (
                  <p className="text-muted-foreground italic mt-2">
                    {d.transliteration}
                  </p>
                )}
                <div className="ornate-divider my-3" />
                <p className="leading-relaxed">{d.translation}</p>
                <p className="text-xs text-muted-foreground/80 mt-3">
                  — {d.reference}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
