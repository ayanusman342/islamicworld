import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Hijri Calendar — Islamic World" },
      {
        name: "description",
        content:
          "Today's Hijri date, the current Islamic month calendar, and upcoming Islamic events.",
      },
      { property: "og:title", content: "Hijri Calendar — Islamic World" },
    ],
  }),
  component: CalendarPage,
});

type HijriMonth = {
  weekday: { en: string };
  date: string;
  hijri: {
    date: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { en: string; ar: string; number: number };
    year: string;
    holidays: string[];
  };
  gregorian: { date: string };
};

const EVENTS = [
  { name: "1 Muharram", desc: "Islamic New Year" },
  { name: "10 Muharram", desc: "Day of Ashura" },
  { name: "12 Rabi al-Awwal", desc: "Mawlid an-Nabi (observed by many)" },
  { name: "27 Rajab", desc: "Isra & Mi'raj" },
  { name: "15 Sha'ban", desc: "Laylat al-Bara'ah" },
  { name: "1 Ramadan", desc: "Start of Ramadan" },
  { name: "27 Ramadan", desc: "Laylat al-Qadr (commonly observed)" },
  { name: "1 Shawwal", desc: "Eid al-Fitr" },
  { name: "9 Dhul-Hijjah", desc: "Day of Arafah" },
  { name: "10 Dhul-Hijjah", desc: "Eid al-Adha" },
];

function CalendarPage() {
  const today = new Date();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const y = today.getFullYear();

  const { data } = useQuery({
    queryKey: ["hijri-month", y, m],
    queryFn: async () => {
      const r = await fetch(
        `https://api.aladhan.com/v1/gToHCalendar/${m}/${y}`,
      );
      const j = await r.json();
      return j.data as HijriMonth[];
    },
    staleTime: Infinity,
  });

  const todayIso = today.toISOString().slice(0, 10);
  const todayEntry = data?.find((d) => {
    const [dd, mm, yy] = d.gregorian.date.split("-");
    return `${yy}-${mm}-${dd}` === todayIso;
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-widest gold-text">
            At-Taqwīm al-Hijrī
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">
            Hijri Calendar
          </h1>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Today
              </div>
              <div className="font-display text-5xl mt-2 text-primary">
                {todayEntry?.hijri.day ?? "—"}
              </div>
              <div className="font-display text-xl mt-1">
                {todayEntry?.hijri.month.en} {todayEntry?.hijri.year} AH
              </div>
              <div className="font-arabic text-lg mt-1 text-muted-foreground">
                {todayEntry?.hijri.month.ar}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {today.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-widest gold-text mb-3">
                This month
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {data?.map((d, i) => {
                  const [dd, mm, yy] = d.gregorian.date.split("-");
                  const iso = `${yy}-${mm}-${dd}`;
                  const isToday = iso === todayIso;
                  const dow = new Date(iso).getDay();
                  return (
                    <div
                      key={i}
                      style={i === 0 ? { gridColumnStart: dow + 1 } : undefined}
                      className={
                        "aspect-square rounded-lg border p-1.5 text-left flex flex-col " +
                        (isToday
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card")
                      }
                    >
                      <div className="text-[10px] opacity-70">{dd}</div>
                      <div className="text-sm font-medium">{d.hijri.day}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-widest gold-text mb-3">
                Key Islamic events
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {EVENTS.map((e) => (
                  <div
                    key={e.name}
                    className="flex items-baseline justify-between border rounded-xl px-3 py-2"
                  >
                    <span className="font-medium">{e.name}</span>
                    <span className="text-sm text-muted-foreground">{e.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
