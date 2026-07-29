import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Play, Pause } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/quran/$surah")({
  head: ({ params }) => ({
    meta: [
      { title: `Surah ${params.surah} — Islamic World` },
      {
        name: "description",
        content: `Read Surah ${params.surah} with Arabic text, English translation, and audio recitation.`,
      },
    ],
  }),
  component: SurahPage,
});

type Ayah = {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
};

function SurahPage() {
  const { surah } = Route.useParams();
  const num = Number(surah);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["surah", num],
    queryFn: async () => {
      const r = await fetch(
        `https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih,ar.alafasy`,
      );
      const j = await r.json();
      return {
        arabic: j.data[0] as { name: string; englishName: string; ayahs: Ayah[] },
        english: j.data[1] as { ayahs: Ayah[] },
        audio: j.data[2] as { ayahs: Ayah[] },
      };
    },
    enabled: !!num && num >= 1 && num <= 114,
  });

  const play = (idx: number, url: string) => {
    if (!audioRef.current) return;
    if (playing === idx) {
      audioRef.current.pause();
      setPlaying(null);
      return;
    }
    audioRef.current.src = url;
    audioRef.current.play().then(() => setPlaying(idx));
    audioRef.current.onended = () => setPlaying(null);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/quran">
              <ArrowLeft className="h-4 w-4" /> All Surahs
            </Link>
          </Button>
          <div className="flex gap-1">
            {num > 1 && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/quran/$surah" params={{ surah: String(num - 1) }}>
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Link>
              </Button>
            )}
            {num < 114 && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/quran/$surah" params={{ surah: String(num + 1) }}>
                  Next <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <header className="text-center mb-6">
          <div className="text-xs uppercase tracking-widest gold-text">
            Surah {num}
          </div>
          <h1 className="font-display text-4xl mt-1">
            {data?.arabic.englishName ?? "…"}
          </h1>
          <div className="font-arabic text-3xl mt-2">{data?.arabic.name}</div>
          {num !== 1 && num !== 9 && (
            <p className="font-arabic text-2xl mt-6 text-primary">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          )}
        </header>

        <audio ref={audioRef} preload="none" />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {data?.arabic.ayahs.map((a, i) => {
              const en = data.english.ayahs[i];
              const audio = data.audio.ayahs[i]?.audio;
              return (
                <Card key={a.number}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs grid place-items-center font-medium">
                        {a.numberInSurah}
                      </div>
                      {audio && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => play(i, audio!)}
                          className="rounded-full"
                        >
                          {playing === i ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="font-arabic text-2xl md:text-3xl leading-[2.2] text-right">
                      {a.text}
                    </p>
                    <div className="ornate-divider my-3" />
                    <p className="text-muted-foreground leading-relaxed">
                      {en?.text}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
