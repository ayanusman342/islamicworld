import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/quran/")({
  head: () => ({
    meta: [
      { title: "The Qur'an — Islamic World" },
      {
        name: "description",
        content:
          "Read the full Qur'an with Arabic text, English translation and audio recitation from authentic sources.",
      },
      { property: "og:title", content: "The Qur'an — Islamic World" },
    ],
  }),
  component: QuranIndex,
});

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
};

function QuranIndex() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["surahs"],
    queryFn: async () => {
      const r = await fetch("https://api.alquran.cloud/v1/surah");
      const j = await r.json();
      return j.data as Surah[];
    },
    staleTime: Infinity,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(
      (x) =>
        x.englishName.toLowerCase().includes(s) ||
        x.englishNameTranslation.toLowerCase().includes(s) ||
        String(x.number).includes(s),
    );
  }, [data, q]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-widest gold-text">
            Al-Qur'an al-Karīm
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">The Noble Qur'an</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            114 Surahs · Arabic text with English translation. Tap a surah to
            begin reading. Source: <a className="underline" href="https://alquran.cloud" target="_blank" rel="noreferrer">alquran.cloud</a>.
          </p>
        </header>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 rounded-full"
            placeholder="Search surah…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl border animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((s) => (
              <Link
                key={s.number}
                to="/quran/$surah"
                params={{ surah: String(s.number) }}
                className="group"
              >
                <Card className="hover:shadow-elegant transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className="h-11 w-11 rotate-45 rounded-md grid place-items-center text-primary-foreground shrink-0"
                      style={{ backgroundImage: "var(--gradient-primary)" }}
                    >
                      <span className="-rotate-45 text-sm font-medium">
                        {s.number}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-display text-lg group-hover:text-primary transition-colors">
                          {s.englishName}
                        </div>
                        <div className="font-arabic text-xl">{s.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between mt-0.5">
                        <span>{s.englishNameTranslation}</span>
                        <span>
                          {s.revelationType} · {s.numberOfAyahs} ayahs
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
