import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  fetchPrayerTimes,
  formatCountdown,
  nextPrayer,
  PRAYER_LABELS,
  type PrayerTimes,
} from "@/lib/prayer";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Compass,
  Sparkles,
  ScrollText,
  MapPin,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Star,
} from "lucide-react";
import { HADITHS } from "@/data/hadith";
import { DUAS } from "@/data/duas";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Islamic World — Prayer times, Quran, Hadith & Duas" },
      {
        name: "description",
        content:
          "Your daily Islamic dashboard: next prayer countdown, today's verse, a hadith, a dua, and quick access to the Quran, Qibla, Hijri calendar, and an AI study assistant.",
      },
      { property: "og:title", content: "Islamic World — Daily Dashboard" },
      {
        property: "og:description",
        content:
          "Prayer times, Quran, Hadith and Duas — beautifully organised for your day.",
      },
    ],
  }),
  component: HomePage,
});


const PRAYER_ICONS = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: Moon,
} as const;

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function HomePage() {
  const { coords, city, loading: locLoading } = useGeolocation();
  const now = useNow();

  const query = useQuery({
    queryKey: ["prayer-times", coords?.lat, coords?.lon],
    queryFn: () => fetchPrayerTimes(coords!),
    enabled: !!coords,
    staleTime: 1000 * 60 * 30,
  });

  const verse = useQuery({
    queryKey: ["daily-verse"],
    queryFn: async () => {
      const dayOfYear =
        Math.floor(
          (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
            86400000,
        );
      const ayahNum = (dayOfYear % 6236) + 1;
      const res = await fetch(
        `https://api.alquran.cloud/v1/ayah/${ayahNum}/editions/quran-uthmani,en.sahih`,
      );
      const j = await res.json();
      const ar = j.data?.[0];
      const en = j.data?.[1];
      return {
        arabic: ar?.text as string,
        english: en?.text as string,
        surahName: en?.surah?.englishName as string,
        surahNumber: en?.surah?.number as number,
        ayahNumber: en?.numberInSurah as number,
      };
    },
    staleTime: 1000 * 60 * 60 * 12,
  });

  const timings = query.data?.timings as PrayerTimes | undefined;
  const hijri = query.data?.date.hijri;
  const upcoming = useMemo(
    () => (timings ? nextPrayer(timings, now) : null),
    [timings, now],
  );
  const countdown = upcoming ? formatCountdown(+upcoming.time - +now) : null;

  const dailyHadith = HADITHS[new Date().getDate() % HADITHS.length];
  const dailyDua = DUAS[(new Date().getDate() + 3) % DUAS.length];

  return (
    <AppShell>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-primary-foreground">
              <img
                src={logo.url}
                alt="Islamic World logo"
                className="h-24 w-24 md:h-28 md:w-28 rounded-full shadow-gold ring-1 ring-gold/40 mb-5"
                width={112}
                height={112}
              />
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                <Star className="h-3 w-3" />
                As-salāmu ʿalaykum
              </div>
              <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[1.05] text-white">
                Your daily <span className="italic gold-text">rhythm</span>
                <br />
                of prayer & knowledge.
              </h1>
              <p className="mt-4 text-white/80 max-w-lg">
                Prayer times, Qibla, the Qur'an, authentic Hadith, Duas and an
                AI-assisted study companion — all in one calm, elegant place.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90">
                  <Link to="/quran">
                    <BookOpen className="h-4 w-4" /> Open the Qur'an
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white">
                  <Link to="/assistant">
                    <Sparkles className="h-4 w-4" /> Ask the assistant
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="glass border-white/20 text-primary-foreground bg-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/70">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {locLoading
                      ? "Locating…"
                      : city || (coords ? "Your location" : "Location needed")}
                  </span>
                  <span>
                    {hijri
                      ? `${hijri.day} ${hijri.month.en} ${hijri.year} AH`
                      : ""}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-white/70">Next prayer</div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <div className="font-display text-4xl md:text-5xl text-white">
                      {upcoming?.name ?? "—"}
                    </div>
                    <div className="text-white/80">
                      {upcoming
                        ? upcoming.time.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>
                  </div>
                  <div className="mt-1 text-3xl font-mono tabular-nums gold-text">
                    {countdown ?? "--:--:--"}
                  </div>
                </div>
                  <div className="mt-5 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(
                      ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const
                    ).map((k) => {
                      const Icon = PRAYER_ICONS[k];
                      const isNext = upcoming?.name === k;
                      return (
                        <div
                          key={k}
                          className={
                            "rounded-xl border px-2 py-2 text-center " +
                            (isNext
                              ? "bg-white/25 border-white/40"
                              : "bg-white/5 border-white/10")
                          }
                        >
                          <Icon className="h-4 w-4 mx-auto opacity-80" />
                          <div className="text-[10px] uppercase tracking-widest mt-1 text-white/70">
                            {PRAYER_LABELS[k]}
                          </div>
                          <div className="text-sm font-medium">
                            {timings ? timings[k].slice(0, 5) : "--:--"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!coords && !locLoading && (
                  <div className="mt-4 text-xs text-white/80">
                    Enable location for accurate prayer times.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Content grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest gold-text">
                Verse of the day
              </div>
              <CardTitle className="font-display text-2xl mt-1">
                {verse.data?.surahName
                  ? `${verse.data.surahName} · ${verse.data.surahNumber}:${verse.data.ayahNumber}`
                  : "Today's Verse"}
              </CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/quran">Read Quran →</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-arabic text-2xl md:text-3xl leading-[2] text-right">
              {verse.data?.arabic ??
                "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
            </p>
            <div className="ornate-divider" />
            <p className="text-muted-foreground leading-relaxed">
              {verse.data?.english ??
                "In the name of Allah, the Most Gracious, the Most Merciful."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-xs uppercase tracking-widest gold-text">
              Hadith of the day
            </div>
            <CardTitle className="font-display text-xl">
              {dailyHadith.collection}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-arabic text-xl leading-[2] text-right">
              {dailyHadith.arabic}
            </p>
            <div className="ornate-divider" />
            <p className="text-sm text-muted-foreground">
              {dailyHadith.english}
            </p>
            <p className="text-xs text-muted-foreground/80">
              — {dailyHadith.narrator} · {dailyHadith.collection} #
              {dailyHadith.number}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="text-xs uppercase tracking-widest gold-text">
              Dua of the day
            </div>
            <CardTitle className="font-display text-xl">
              {dailyDua.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-arabic text-2xl leading-[2] text-right">
              {dailyDua.arabic}
            </p>
            <p className="text-muted-foreground italic">
              {dailyDua.transliteration}
            </p>
            <div className="ornate-divider" />
            <p className="text-sm">{dailyDua.translation}</p>
            <p className="text-xs text-muted-foreground/80">
              — {dailyDua.reference}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <QuickCard
            to="/qibla"
            title="Qibla direction"
            desc="Find the direction of the Kaaba from anywhere."
            Icon={Compass}
          />
          <QuickCard
            to="/calendar"
            title="Hijri calendar"
            desc="Today's Islamic date & upcoming events."
            Icon={ScrollText}
          />
          <QuickCard
            to="/assistant"
            title="AI Islamic assistant"
            desc="Ask questions grounded in Qur'an & Hadith."
            Icon={Sparkles}
          />
        </div>
      </section>
    </AppShell>
  );
}

function QuickCard({
  to,
  title,
  desc,
  Icon,
}: {
  to: string;
  title: string;
  desc: string;
  Icon: typeof Compass;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border bg-card p-4 hover:shadow-elegant transition-shadow flex items-start gap-3"
    >
      <div
        className="h-10 w-10 rounded-xl grid place-items-center text-primary-foreground shrink-0"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="font-display text-lg group-hover:text-primary transition-colors">
          {title}
        </div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}
